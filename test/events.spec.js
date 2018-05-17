import Vuex from 'vuex';
import { createLocalVue } from 'vue-test-utils';
import Hagrid from '../src/index';
import { sleep } from '../src/utils';


const setup = ({ namespaced } = {}) => {
  const Vue = createLocalVue();

  Vue.use(Vuex);

  const projectsSpy = sinon.spy();

  const eventArg = { anObject: true };

  const Login = {
    namespaced,
    actions: {
      logout() {
        assert(this.hagrid, 'expected hagrid to be defined');

        this.hagrid.emit('logout', eventArg);
      },
    },
  };

  const Projects = {
    namespaced,
    actions: {
      clear(context, payload) {
        projectsSpy(payload);
      },
    },
    hagridOn: {
      logout: 'clear',
    },
  };
  const hagrid = new Hagrid();
  Vue.use(hagrid);
  const store = new Vuex.Store({
    modules: {
      Login,
      Projects,
    },
    plugins: [
      hagrid.vuexPlugin,
    ],
  });

  return { hagrid, projectsSpy, store, Login, Projects, eventArg };
};

describe('context api', () => {
  it('top-level actions have access to hagridEmit via context', (done) => {
    const { hagrid, store } = setup();
    hagrid.on('logout', () => done());

    store.dispatch('logout');
  });

  it("namespaced modules' actions have access to hagridEmit via context", (done) => {
    const { hagrid, store } = setup({ namespaced: true });
    hagrid.on('logout', () => done());

    store.dispatch('Login/logout');
  });

  it("even dynamic modules' actions have access to hagridEmit via context", async () => {
    const { hagrid, store, Login } = setup();
    let res;
    const p = new Promise((resolve) => { res = resolve; });
    hagrid.on('logout', res);

    store.registerModule('OtherLogin', { ...Login, namespaced: true });
    await sleep(0);
    await store.dispatch('OtherLogin/logout');
    await p;
  });
});

describe('declarative event triggering', () => {
  it('modules can register to be triggered on events', async () => {
    const { store, projectsSpy } = setup();

    assert(projectsSpy.notCalled, 'expected projects spy to start out not called');
    await store.dispatch('logout');
    await sleep(0);
    assert(projectsSpy.called, 'expected projects spy to be called');
  });

  it('namespaced modules can register for events', async () => {
    const { store, projectsSpy } = setup({ namespaced: true });

    assert(projectsSpy.notCalled, 'expected projects spy to start out not called');
    await store.dispatch('Login/logout');
    await sleep(0);

    assert(projectsSpy.called, 'expected projects spy to be called');
  });

  it('even dynamic modules can register for events', async () => {
    const { store, projectsSpy, Projects } = setup();

    assert(projectsSpy.notCalled, 'expected projects spy to start out not called');

    store.registerModule('OtherProjects', { ...Projects, namespaced: true });

    await store.dispatch('logout');
    await sleep(0);

    assert(projectsSpy.calledTwice, 'expected projects spy to be called on each Products module');
  });

  it('when a listening module is removed, so is the listener', async () => {
    const { store, projectsSpy, Projects } = setup({ namespaced: true });

    assert(projectsSpy.notCalled, 'expected projects spy to start out not called');

    store.registerModule('OtherProjects', Projects);

    await store.dispatch('Login/logout');
    await sleep(0);
    assert(projectsSpy.calledTwice, 'expected projects spy to be called on each Products module');

    store.unregisterModule('OtherProjects');

    await store.dispatch('Login/logout');
    await sleep(0);

    assert(projectsSpy.calledThrice, 'expected only static Projects listener to remain');
  });
});

describe('events', () => {
  it('passes the arguments on to actions', async () => {
    const { store, projectsSpy, eventArg } = setup();

    assert(projectsSpy.notCalled, 'expected projects spy to start out not called');

    await store.dispatch('logout');
    await sleep(0);

    assert(projectsSpy.calledWith(eventArg), 'expected event to pass along args to dispatch');
  });
});
