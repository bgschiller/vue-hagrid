import Vue from 'vue';
import Vuex from 'vuex';

import { createMoviesModule } from './fixtures';
import { getMovies } from './api';
import { Hagrid } from '../src/index';
import { sleep } from '../src/utils';

Vue.use(Vuex);

const setup = () => {
  const spy = sinon.spy(getMovies);
  const moviesModule = createMoviesModule(spy);
  const store = new Vuex.Store(moviesModule);

  const hagrid = new Hagrid();
  hagrid.store = store;
  return { hagrid, spy, store };
};

describe('Hagrid watchers', () => {
  it('dispatches the action when a watcher is first added', () => {
    const { hagrid, spy } = setup();
    assert(spy.notCalled, 'expected that getMovies has not yet been called');
    hagrid.addWatcher('fetch');
    assert(spy.calledWith({ genre: null }), 'expected getMovies to be called with genre: null');
  });

  it('fires when the getter changes', async () => {
    const { hagrid, spy, store } = setup();
    hagrid.addWatcher('fetch');
    await sleep(5);

    const numCalls = spy.getCalls().length;
    await store.dispatch('setGenre', 'comedy');
    await sleep(5);
    const call = spy.getCall(numCalls);
    assert(call.calledWith({ genre: 'comedy' }));
  });

  it('refuses to add a watcher twice', () => {
    const { hagrid } = setup();

    hagrid.addWatcher('fetch');
    assert.throws(() => hagrid.addWatcher('fetch'));
  });

  it('refuses to remove a watcher that doesnt exist', () => {
    const { hagrid } = setup();
    assert.throws(() => hagrid.removeWatcher('snooze'));
  });

  it('stops responding to changes after removing watcher', async () => {
    const { hagrid, store, spy } = setup();

    hagrid.addWatcher('fetch');
    await sleep(5);

    hagrid.removeWatcher('fetch');
    await store.dispatch('setGenre', 'comedy');
    await sleep(5);

    assert(
      spy.neverCalledWith({ genre: 'comedy' }),
      'expected hagrid to not dispatch action with no watcher',
    );
  });
});

describe('Hagrid subscribers', () => {
  it('wont dispatch action if no subscribers exist', async () => {
    const { store, spy } = setup();

    await store.dispatch('setGenre', 'comedy');
    await sleep(5);
    assert(
      spy.neverCalledWith({ genre: 'comedy' }),
      'expected hagrid to not dispatch action with no subscribers',
    );
  });

  it('will dispatch if subscribers exist', async () => {
    const { hagrid, store, spy } = setup();

    hagrid.subscribe(1, 'fetch');

    await store.dispatch('setGenre', 'comedy');
    await sleep(5);
    assert(
      spy.calledWith({ genre: 'comedy' }),
      'expected hagrid to dispatch action with a subscriber',
    );
  });

  it('removes watcher upon unsubscribe', async () => {
    const { hagrid, store, spy } = setup();

    hagrid.subscribe(1, ['fetch']);
    await store.dispatch('setGenre', 'comedy');
    await sleep(5);
    assert(
      spy.calledWith({ genre: 'comedy' }),
      'expected hagrid to dispatch action with a subscriber',
    );

    await sleep(5);
    hagrid.unsubscribe(1);
    await store.dispatch('setGenre', 'action');
    await sleep(5);

    assert(
      spy.neverCalledWith({ genre: 'action' }),
      'expected hagrid to stop dispatching action after no more subscribers',
    );
  });

  it('avoids redundant dispatch on unsubscribe/resubscribe', async () => {
    const { hagrid, store, spy } = setup();

    hagrid.subscribe(1, ['fetch']);
    await store.dispatch('setGenre', 'comedy');
    await sleep(5);
    assert(spy.calledWith({ genre: 'comedy' }));

    const numCalls = spy.getCalls().length;
    hagrid.unsubscribe(1);
    await sleep(5);

    hagrid.subscribe(2, 'fetch');

    await sleep(5);
    assert.equal(
      spy.getCalls().length, numCalls,
      'no change to getter between unsubscribe/subscribe, so unnecessary call',
    );
  });

  it('makes calls as necessary on resubscribe', async () => {
    const { hagrid, store, spy } = setup();

    hagrid.subscribe(1, ['fetch']);
    await store.dispatch('setGenre', 'comedy');
    await sleep(5);
    assert(spy.calledWith({ genre: 'comedy' }));

    hagrid.unsubscribe(1);

    await store.dispatch('setGenre', 'animation');
    await sleep(5);

    hagrid.subscribe(2, 'fetch');
    await sleep(5);
    assert(
      spy.calledWith({ genre: 'animation' }),
      'there was a change to getter between unsubscribe/subscribe, so we needed to make a call',
    );
  });
});
