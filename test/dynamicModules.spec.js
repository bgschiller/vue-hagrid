import Vue from 'vue';
import Vuex from 'vuex';

import { createMoviesModule, counterModule } from './fixtures';
import { getMovies } from './api';
import { Hagrid } from '../src/index';
import findGetter from '../src/findGetter';
import { sleep } from '../src/utils';

Vue.use(Vuex);

const setup = () => {
  const store = new Vuex.Store({
    modules: {
      Counter: { ...counterModule, namespaced: true },
    },
  });
  const spy = sinon.spy(getMovies);
  const moviesModule = { ...createMoviesModule(spy), namespaced: true };

  const hagrid = new Hagrid();
  hagrid.store = store;
  return { hagrid, spy, store, moviesModule };
};

describe('Dynamic modules', () => {
  it('findGetter works', () => {
    const { store, moviesModule } = setup();
    store.registerModule('Movies', moviesModule);

    const getterName = findGetter(store, 'Movies/fetch');
    assert.equal(getterName, 'Movies/moviesDependencies');
  });


  it('findGetter errs if module not loaded', () => {
    const { store } = setup();

    assert.throws(
      () => findGetter(store, 'Movies/fetch'),
      'unable to find action: Movies/fetch',
    );
  });

  it('can handle dynamically added modules (before subscribers)', async () => {
    const { store, hagrid, moviesModule, spy } = setup();
    store.registerModule('Movies', moviesModule);

    hagrid.subscribe(1, 'Movies/fetch');
    await sleep(5);
    assert(spy.calledWith({ genre: null }));

    store.dispatch('Movies/setGenre', 'animation');
    await sleep(5);
    assert(spy.calledWith({ genre: 'animation' }));

    hagrid.unsubscribe(1);
    store.dispatch('Movies/setGenre', 'comedy');

    await sleep(5);
    assert(spy.neverCalledWith({ genre: 'comedy' }));
  });

  it('wont crash hard when a dynamically registered module is removed', async () => {
    const { store, hagrid, moviesModule, spy } = setup();
    store.registerModule('Movies', moviesModule);

    hagrid.subscribe(1, 'Movies/fetch');
    await sleep(5);
    assert(spy.calledWith({ genre: null }));

    store.unregisterModule('Movies');
    await sleep(5);

    hagrid.unsubscribe(1);
  });
});
