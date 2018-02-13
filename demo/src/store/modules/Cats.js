import { getCats } from './api';

const state = {
  imgs: null,
  status: null,
  version: 0,
};

const mutations = {
  FETCHING(state) {
    state.status = 'fetching';
    state.version += 1;
  },
  SET_IMGS(state, imgs) {
    state.status = 'complete';
    state.imgs = imgs;
  },
};

const parser = new DOMParser();

const actions = {
  async fetch({ commit }, payload) {
    commit('FETCHING');
    const version = state.version;
    const text = await getCats(payload);
    if (!text) return;
    const xml = parser.parseFromString(text, 'text/xml');
    const imgs = Array.from(xml.querySelectorAll('image'))
      .map(img => ({
        url: img.querySelector('url').firstChild.data,
        id: img.querySelector('id').firstChild.data,
      }));
    if (version === state.version) {
      commit('SET_IMGS', imgs);
    }
  },
};

const getters = {
  catOptions(state, getters, rootState, rootGetters) {
    const category = rootGetters['Config/selectedCategory'];
    if (!category) return null;
    return {
      numResults: rootState.Config.numResults,
      category: category.name,
      size: rootState.Config.size,
    };
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
  hagridResources: {
    fetch: 'catOptions',
  },
};
