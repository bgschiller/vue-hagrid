import findGetter from './findGetter';

function shallowEquals(obj1, obj2) {
  const keys = Object.keys(obj1);
  if (Object.keys(obj2).length !== keys.length) return false;
  return keys.every(k => obj1[k] === obj2[k]);
}
export class Hagrid {
  constructor() {
    this.subscribers = {}; // { actionName: [vm._uid] }
    this.watchers = {}; // { actionName: unsubscribe() }
    this.getterValues = {};
    this.promises = {};
    this.unknownPromises = {};
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
        this.setPromise(actionName, this.store.dispatch(actionName, val));
      },
    );
    this.watchers[actionName] = removeWatcher;

    const getterVal = this.store.getters[getterName];
    if (
      !(getterName in this.getterValues) ||
      !shallowEquals(getterVal, this.getterValues[getterName])
    ) {
      this.store.dispatch(actionName, getterVal);
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

    Object.defineProperty(Vue.prototype, 'hagridPromise', {
      get() { return _this.getPromise.bind(_this); },
    });
  }
}

const install = (...args) => {
  const hag = new Hagrid();
  hag.install(...args);
};

export default { install };
