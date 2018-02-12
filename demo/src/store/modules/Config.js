import { getCategories } from './api';

const state = {
  numResults: 20,
  categories: null,
  selectedCategoryId: null,
  size: 'full',
  possibleSizes: ['full', 'med', 'small'],
  show: {
    carousel: true,
    links: true,
    download: true,
  },
};

const mutations = {
  SET_NUM_RESULTS(state, value) {
    state.numResults = value;
  },
  SET_CATEGORIES(state, categories) {
    state.categories = categories;
  },
  SELECT_CATEGORY(state, categoryId) {
    state.selectedCategoryId = categoryId;
  },
  SET_SIZE(state, size) {
    state.size = size;
  },
  TOGGLE_SHOW(state, key) {
    state.show = { ...state.show, [key]: !state.show[key] };
  },
};

const parser = new DOMParser();

const actions = {
  toggleShow({ commit }, key) {
    if (!key in state.show) {
      console.error(`Uh oh, I don't recognize ${key} as a show/hide option`);
      return;
    }
    commit('TOGGLE_SHOW', key);
  },
  setNumResults({ commit, dispatch }, value) {
    if (value >= 1 && value <= 100) {
      commit('SET_NUM_RESULTS', value);
    } else {
      dispatch('Error/showError', 'num results must be between 1 and 100', { root: true });
    }
  },
  async retrieveCategories({ commit, dispatch }) {
    const text = await getCategories();
    const xml = parser.parseFromString(text, 'text/xml');
    const categories = Array.from(xml.querySelectorAll('category'))
      .map(cat => ({
        id: cat.querySelector('id').firstChild.data,
        name: cat.querySelector('name').firstChild.data,
      }));
    commit('SET_CATEGORIES', categories);
    commit('SELECT_CATEGORY', categories[0].id);
  },
  selectCategory({ commit, state }, id) {
    if (!state.categories.find(c => c.id === id)) {
      console.error('something went wrong. no category with id', id);
      return;
    }
    commit('SELECT_CATEGORY', id);
  },
  setSize({ commit, state }, size) {
    if (state.possibleSizes.indexOf(size) < 0) {
      console.error('something went wrong. no size like', size);
      return;
    }
    commit('SET_SIZE', size);
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
