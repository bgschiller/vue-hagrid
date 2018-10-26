import { sleep } from '@/utils';

const state = {
  error: null,
  version: 0,
};

const mutations = {
  ERROR(state, message) {
    state.error = message;
  },
  INCR(state) {
    state.version += 1;
  },
  CLEAR(state) {
    state.error = 0;
  },
};

const actions = {
  async showError({ commit, state }, message) {
    commit('ERROR', message);
    commit('INCR');
    const version = state.version;
    await sleep(5000);
    if (version === state.version) {
      commit('CLEAR');
    }
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
