import Vue from 'vue';
import Vuex from 'vuex';
import { Hagrid } from '../src/index';
import { counterModule } from './fixtures';

const TestComponent = {
  template: '<div class="test" />',
  hagridActions: ['incr'],
};

Vue.use(Vuex);

const hagrid = new Hagrid();
Vue.use(hagrid);

sinon.spy(hagrid, 'subscribe');
sinon.spy(hagrid, 'unsubscribe');

const store = new Vuex.Store(counterModule);

describe('component hooks', () => {
  it('subscribes and unsubscribes with hagrid', async () => {
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
        TestComponent,
      },
    }).$mount();

    assert(hagrid.subscribe.notCalled, 'Expected component to have not yet been mounted');

    vm.show = true;
    await Vue.nextTick();

    assert(hagrid.subscribe.called, 'expected component mounted to subscribe to hagrid');
  });

  it('finds promises on .hagridPromise', async () => {
    const vm = new Vue({
      ...TestComponent,
      store,
    }).$mount();

    await Vue.nextTick();
    assert.isDefined(vm.hagridPromise, 'Expected hagrid promises to be available');
    assert.isDefined(vm.hagridPromise('incr'), 'Expected incr to be among hagrid promises');
    assert.isDefined(vm.hagridPromise('incr').then, "Expected hagridPromise('incr') to be then-able");

    assert.isDefined(vm.hagridPromise('non-existent'), "expected a promise, even for actions hagrid doesn't know about");
    assert.isDefined(vm.hagridPromise('non-existent').then, "expected hagridPromise('non-existent') to be then-able");
  });

  it('follows the unknown promise', async () => {
    const cb = sinon.spy();
    const vm = new Vue({
      template: '<div></div>',
      store,
    }).$mount();
    vm.hagridPromise('incr').then(cb);

    assert(cb.notCalled, 'Expect that an unknown promise is not immediately resolved');

    // for the side-effect of dispatching 'incr'
    new Vue({
      ...TestComponent,
      store,
    }).$mount();
    await Vue.nextTick();

    assert(cb.called);
  });
});
