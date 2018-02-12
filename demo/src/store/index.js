import Vue from 'vue';
import Vuex from 'vuex';

import Cats from './modules/Cats';
import Config from './modules/Config';
import Error from './modules/Error';

Vue.use(Vuex);


export default new Vuex.Store({
  modules: {
    Cats,
    Config,
    Error,
  },
  strict: process.env.NODE_ENV !== 'production',
});
