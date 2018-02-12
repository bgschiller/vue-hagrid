import Vue from 'vue';
import Vuex from 'vuex';
import findGetter from '../src/findGetter';
import { counterModule, moviesModule, slashyModule, badGetterName } from './fixtures';

Vue.use(Vuex);


describe('findGetter', () => {
  it('finds getters for top-level actions', () => {
    const store = new Vuex.Store(counterModule);
    const getterName = findGetter(store, 'incr');
    assert.equal(getterName, 'latest');
  });

  it('it finds getters for nested actions (namespaced)', () => {
    const store = new Vuex.Store({
      modules: {
        Counter: { ...counterModule, namespaced: true },
      },
    });
    const getterName = findGetter(store, 'Counter/incr');
    assert.equal(getterName, 'Counter/latest');
  });

  it('it finds getters for nested actions (no namespace)', () => {
    const store = new Vuex.Store({
      modules: {
        Counter: counterModule,
      },
    });
    const getterName = findGetter(store, 'incr');
    assert.equal(getterName, 'latest');
  });

  it('finds getters for deeply nested actions', () => {
    const store = new Vuex.Store({
      modules: {
        Counter: {
          namespaced: true,
          modules: {
            Shelf: { ...counterModule, namespaced: true },
          },
        },
        Movies: {
          namespaced: false,
          ...moviesModule,
        },
      },
    });
    const getterName = findGetter(store, 'Counter/Shelf/incr');
    assert.equal(getterName, 'Counter/Shelf/latest');
  });

  it('can handle a mix of namespaced and non-namespaced modules', () => {
    const store = new Vuex.Store({
      modules: {
        Counter: {
          namespaced: true,
          modules: {
            Shelf: counterModule,
          },
        },
        moviesModule,
      },
    });
    const getterName = findGetter(store, 'Counter/incr');
    assert.equal(getterName, 'Counter/latest');
  });

  it('finds top-level actions with slashes in the name', () => {
    const store = new Vuex.Store(slashyModule);
    const getterName = findGetter(store, 'this/name/has/slashes');
    assert.equal(getterName, 'slashy/name/getter');
  });

  it('reports an error when unable to find an action', () => {
    const store = new Vuex.Store(moviesModule);
    assert.throws(
      () => findGetter(store, 'nonExistentAction'),
      'unable to find action: nonExistentAction');
  });

  it('reports an error when action exists, but getter does not', () => {
    const store = new Vuex.Store(badGetterName);
    assert.throws(
      () => findGetter(store, 'doStuff'),
      'Found hagridResource for action "doStuff", but no getter called "noGetterWithThisName" exists...');
  });

  it('advises when hagridResources is missing', () => {
    const store = new Vuex.Store({ ...counterModule, hagridResources: undefined });
    assert.throws(
      () => findGetter(store, 'incr'),
      'Found action "incr", but no getter is listed in hagridResources');
  });
});