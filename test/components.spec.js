import Vue from 'vue';
import Vuex from 'vuex';
import Hagrid from '../src/index';
import { counterModule } from './fixtures';

const counter = { ...counterModule, namespaced: true };

Vue.use(Vuex);

const hagrid = new Hagrid();
Vue.use(hagrid);

sinon.spy(hagrid, 'subscribe');
sinon.spy(hagrid, 'unsubscribe');


describe('component hooks', () => {
  it.skip('subscribes and unsubscribes with hagrid', async () => {
    const store = new Vuex.Store({
      modules: { Counter: counter },
    });
    hagrid.store = store;

    const vm = new Vue({
      template: `
      <div>
        <TestComponent v-if="show" />
      </div>`,
      data() {
        return { show: false };
      },
      store,
      components: {
        TestComponent: {
          template: '<div class="test" />',
          hagridActions: 'Counter/incr',
        },
      },
    }).$mount();

    assert(hagrid.subscribe.notCalled, 'Expected component to have not yet been mounted');

    vm.show = true;
    await Vue.nextTick();

    assert(hagrid.subscribe.called, 'expected component mounted to subscribe to hagrid');
  });

  it.skip('finds promises on .hagridPromise', async () => {
    const store = new Vuex.Store({
      modules: { Counter2: counter },
    });
    hagrid.store = store;

    const vm = new Vue({
      template: '<div class="test" />',
      hagridActions: 'Counter2/incr',
      store,
    }).$mount();

    await Vue.nextTick();
    assert.isDefined(vm.hagridPromise, 'Expected hagrid promises to be available');
    assert.isDefined(vm.hagridPromise('Counter2/incr'), 'Expected Counter2/incr to be among hagrid promises');
    assert.isDefined(vm.hagridPromise('Counter2/incr').then, "Expected hagridPromise('Counter2/incr') to be then-able");

    assert.isDefined(vm.hagridPromise('non-existent'), "expected a promise, even for actions hagrid doesn't know about");
    assert.isDefined(vm.hagridPromise('non-existent').then, "expected hagridPromise('non-existent') to be then-able");
  });

  it('can grab the promise *before* the action occurs', async () => {
    const store = new Vuex.Store({
      modules: { Counter3: counter },
    });
    hagrid.store = store;

    const cb = sinon.spy();
    const vm = new Vue({
      template: '<div></div>',
      store,
    }).$mount();
    const p = vm.hagridPromise('Counter3/incr');
    p.then(cb);

    assert(cb.notCalled, 'Expect that an unknown promise is not immediately resolved');

    // for the side-effect of dispatching 'incr'
    new Vue({
      template: '<div class="test" />',
      hagridActions: 'Counter3/incr',
      store,
    }).$mount();
    await Vue.nextTick();
    await Vue.nextTick();
    assert(cb.called, 'expected callback to be executed');
  });

  it('can grab the promise *after* the action is complete', async () => {
    const store = new Vuex.Store({
      modules: { Counter4: counter },
    });
    hagrid.store = store;

    // dispatches 'incr'
    const vm = new Vue({
      template: '<div class="test" />',
      hagridActions: 'Counter4/incr',
      store,
    }).$mount();
    await Vue.nextTick();

    const cb = sinon.spy();
    vm.hagridPromise('Counter4/incr').then(cb);
    await Vue.nextTick();
    assert(cb.called, 'Expected cb to be executed');
  });

  it('can grab the promise *during* the action', async () => {
    let resolveP;

    const patchedModule = {
      ...counter,
      actions: {
        ...counter.actions,
        async incr({ commit }) {
          const p = new Promise((resolve) => { resolveP = resolve; });

          commit('INCR');
          await p;
        },
      },
    };
    const store = new Vuex.Store({
      modules: { Counter5: patchedModule },
    });
    hagrid.store = store;

    // dispatches 'incr'
    const vm = new Vue({
      template: '<div class="test" />',
      hagridActions: 'Counter5/incr',
      store,
    }).$mount();
    await Vue.nextTick();

    assert.isDefined(resolveP, 'Expected incr action to have been dispatched');
    const cb = sinon.spy();
    vm.hagridPromise('Counter5/incr').then(cb);
    await Vue.nextTick();

    assert(cb.notCalled, "The action hasn't finished, so cb should not have executed");

    resolveP();
    await Vue.nextTick();
    assert(cb.called, 'expected cb to have been called');
  });
});
