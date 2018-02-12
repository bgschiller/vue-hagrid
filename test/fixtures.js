import { getMovies } from './api';

export const counterModule = {
  state: { amount: 0 },
  mutations: {
    INCR(state) { state.amount += 1; },
  },
  actions: {
    incr({ commit }) { commit('INCR'); },
  },
  getters: {
    latest(state) { return state.amount; },
  },
  hagridResources: {
    incr: 'latest',
  },
};

export const moviesModule = {
  state: { movies: [], status: 'unfetched', genre: null },
  mutations: {
    FETCH(state) { state.status = 'fetching'; },
    SET_MOVIES(state, payload) { state.movies = payload; state.status = 'fetched'; },
    SET_GENRE(state, payload) { state.genre = payload; state.status = 'unfetched'; },
  },
  actions: {
    fetch({ commit }, { genre }) {
      commit('FETCH');
      getMovies({ genre })
        .then(movies => commit('SET_MOVIES', movies));
    },
    setGenre({ commit }, genre) {
      commit('SET_GENRE', genre);
    },
  },
  getters: {
    moviesDependencies(state) { return { genre: state.genre }; },
  },
  hagridResources: {
    fetch: 'moviesDependencies',
  },
};

export const slashyModule = {
  state: {},
  actions: {
    'this/name/has/slashes': () => {},
  },
  getters: {
    'slashy/name/getter': () => { return 2; },
  },
  hagridResources: {
    'this/name/has/slashes': 'slashy/name/getter',
  },
};

export const badGetterName = {
  state: {},
  actions: { doStuff() {} },
  hagridResources: {
    doStuff: 'noGetterWithThisName',
  },
};