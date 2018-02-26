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

  it('finds promises on .hagridPromises', async () => {
    const vm = new Vue({
      ...TestComponent,
      store,
    }).$mount();

    await Vue.nextTick();
    assert.isDefined(vm.hagridPromises, 'Expected hagrid promises to be available');
    assert.isDefined(vm.hagridPromises.incr, 'Expected incr to be among hagrid promises');
    assert.isDefined(vm.hagridPromises.incr.then, 'Expected hagridPromises.incr to be then-able');
  });
});
