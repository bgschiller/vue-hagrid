import findGetter from './findGetter';
import forEachModule from './forEachModule';
import shallowEquals from 'shallow-equals';

export default class Hagrid {
  constructor() {
    this.subscribers = {}; // { actionName: [vm._uid] }
    this.watchers = {}; // { actionName: unsubscribe() }
    this.getterValues = {};
    this.promises = {};
    this.unknownPromises = {};
    this.eventCallbacks = [];
  }
  subscribe(uid, _actionNames) {
    const actionNames = typeof _actionNames === typeof '' ? [_actionNames] : _actionNames;
    actionNames.forEach((actionName) => {
      if (this.subscribers[actionName]) {
        if (this.subscribers[actionName].indexOf(uid) > -1) {
          throw new Error(`Uh oh, the component with id ${uid} is already subscribed to action "${actionName}"...`);
        }
        this.subscribers[actionName].push(uid);
      } else {
        this.subscribers[actionName] = [uid];
        this.addWatcher(actionName);
      }
    });
  }
  unsubscribe(uid) {
    Object.keys(this.subscribers).forEach((actionName) => {
      const newSubs = this.subscribers[actionName].filter(u => u !== uid);
      if (!newSubs.length) {
        delete this.subscribers[actionName];
        this.removeWatcher(actionName);
      } else {
        this.subscribers[actionName] = newSubs;
      }
    });
  }
  addWatcher(actionName) {
    if (this.watchers[actionName]) {
      throw new Error(`Uh oh, the action "${actionName}" is already being watched. Something has gone wrong...`);
    }

    const getterName = findGetter(this.store, actionName);
    const removeWatcher = this.store.watch(
      (_state, getters) => getters[getterName],
      (val) => {
        this.getterValues[getterName] = val;
        if (val) {
          this.setPromise(actionName, this.store.dispatch(actionName, val));
        }
      },
    );
    this.watchers[actionName] = removeWatcher;

    const getterVal = this.store.getters[getterName];
    if (
      (!(getterName in this.getterValues) ||
       !shallowEquals(getterVal, this.getterValues[getterName])) &&
      getterVal
    ) {
      this.setPromise(actionName, this.store.dispatch(actionName, getterVal));
    }
  }
  removeWatcher(actionName) {
    if (!this.watchers[actionName]) {
      throw new Error(`uh oh, no watcher for action "${actionName}". Something has gone wrong...`);
    }
    this.watchers[actionName]();
    delete this.watchers[actionName];
    delete this.promises[actionName];
    delete this.unknownPromises[actionName];
  }
  getPromise(actionName) {
    if (this.promises[actionName]) {
      return this.promises[actionName];
    }
    if (this.unknownPromises[actionName]) {
      return this.unknownPromises[actionName];
    }
    let res;
    this.unknownPromises[actionName] = new Promise((resolve) => { res = resolve; });
    this.unknownPromises[actionName]._res = res;
    return this.unknownPromises[actionName];
  }
  setPromise(actionName, p) {
    if (this.unknownPromises[actionName]) {
      // the promise we've already handed out will follow this new (real) one.
      this.unknownPromises[actionName]._res(p);
      delete this.unknownPromises[actionName];
    }
    this.promises[actionName] = p;
  }
  install(Vue, options) {
    this.store = options && options.store;
    const _this = this;
    Vue.mixin({
      mounted() {
        if (!_this.store) {
          _this.store = this.$store;
        }
        if (!this.$options.hagridActions) {
          return;
        }
        _this.subscribe(this._uid, this.$options.hagridActions);
      },
      beforeDestroy() {
        if (!this.$options.hagridActions) {
          return;
        }
        _this.unsubscribe(this._uid, this.$options.hagridActions);
      },
    });

    Object.defineProperties(Vue.prototype, {
      // deprecate this in favor of `this.hagrid.getPromise`
      hagridPromise: {
        get() { return _this.getPromise.bind(_this); },
      },
      hagrid: {
        get() {
          return {
            on: _this.on.bind(_this),
            emit: _this.on.bind(_this),
            getPromise: _this.on.bind(_this),
          };
        },
      },
    });

    this.initEventBus(Vue);
  }

  initEventBus(Vue) {
    this._eventBus = new Vue();
  }

  assertEventBusExists() {
    if (!this._eventBus) {
      throw new Error('[vue-hagrid]: Error, please run Vue.use(hagrid) before using hagrid.vuexPlugin, hagrid.on, or hagrid.emit');
    }
  }
  on(evt, cb) {
    this.assertEventBusExists();
    this._eventBus.$on(evt, cb);
    return () => this._eventBus.$off(evt, cb);
  }

  emit(evt, ...args) {
    this._eventBus.$emit(evt, ...args);
  }

  addListenersFromModule(store, modul, prefix) {
    const events = modul._rawModule.hagridOn;
    if (!events) return;
    Object.keys(events).forEach((evtName) => {
      const localActionName = events[evtName];
      const actionName = prefix && modul.namespaced ? `${prefix}/${localActionName}` : localActionName;
      const callback = store.dispatch.bind(store, actionName);

      const unregister = this.on(evtName, callback);
      this.eventCallbacks.push({ event: evtName, actionName, unregister });
    });
  }

  addListenersFromModules(store) {
    forEachModule(store, this.addListenersFromModule.bind(this, store));
  }

  clearModuleEvents() {
    this.eventCallbacks.forEach(({ unregister }) => unregister());
    this.eventCallbacks = [];
  }

  _vuexPlugin(store) {
    this.store = store;
    this.addListenersFromModules(store);

    const hagrid = this;
    const oldRegisterModule = store.registerModule;
    // eslint-disable-next-line no-param-reassign
    store.registerModule = function replacementRegisterModule(...args) {
      oldRegisterModule.apply(this, args);

      // a module has been added, so we may need to add some hagridOn listeners.
      // in the future, it may be worthwhile to pick out specifically the new module.
      // For now, we'll just remove all of them, then replace all of them.

      // clear listeners that were registered via hagridOn so we don't have duplicates
      hagrid.clearModuleEvents();
      hagrid.addListenersFromModules(store);
    };

    const oldUnregisterModule = store.unregisterModule;
    // eslint-disable-next-line no-param-reassign
    store.unregisterModule = function replacementUnregisterModule(...args) {
      oldUnregisterModule.apply(this, args);

      // a module has been removed, so we may need to clear some hagridOn listeners.
      // in the future, it may be worthwhile to pick out specifically which events
      // were created by that module. For now, we'll just remove all of them, then replace
      // the ones that still exist.

      // clear listeners that were registered via hagridOn so we don't have duplicates
      hagrid.clearModuleEvents();
      hagrid.addListenersFromModules(store);
    };

    // eslint-disable-next-line no-param-reassign
    store.hagrid = {
      emit: this.emit.bind(this),
    };
  }

  get vuexPlugin() {
    return this._vuexPlugin.bind(this);
  }
}
