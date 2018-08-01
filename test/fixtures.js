import * as Api from './api';

export const counterModule = {
  state: { amount: 0, step: 1 },
  mutations: {
    INCR(state) { state.amount += 1; },
    SET_STEP(state, size) { state.step = size; },
  },
  actions: {
    incr({ commit }) { commit('INCR'); },
    setStep({ commit }, step) { commit('SET_STEP', step); },
  },
  getters: {
    latest(state) { return state.step; },
  },
  hagridResources: {
    incr: 'latest',
  },
};

export const createMoviesModule = (getMovies = Api.getMovies) => ({
  state: { movies: [], status: 'unfetched', genre: null, loggedIn: false },
  mutations: {
    FETCH(state) { state.status = 'fetching'; },
    SET_MOVIES(state, payload) { state.movies = payload; state.status = 'fetched'; },
    SET_GENRE(state, payload) { state.genre = payload; state.status = 'unfetched'; },
    LOG_IN(state) { state.loggedIn = true; },
  },
  actions: {
    logIn({ commit }) {
      commit('LOG_IN');
    },
    fetch({ commit }, { genre }) {
      commit('FETCH');
      getMovies({ genre })
        .then(movies => commit('SET_MOVIES', movies));
    },
    fetchLoggedIn({ dispatch }, payload) {
      return dispatch('fetch', payload);
    },
    setGenre({ commit }, genre) {
      commit('SET_GENRE', genre);
    },
  },
  getters: {
    moviesDependencies(state) { return { genre: state.genre }; },
    loggedInDependencies(state, getters) {
      if (!state.loggedIn) {
        return false;
      }
      return getters.moviesDependencies;
    },
  },
  hagridResources: {
    fetch: 'moviesDependencies',
    fetchLoggedIn: 'loggedInDependencies',
  },
});

export const moviesModule = createMoviesModule();

export const slashyModule = {
  state: {},
  actions: {
    'this/name/has/slashes': () => {},
  },
  getters: {
    'slashy/name/getter': () => 2,
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
