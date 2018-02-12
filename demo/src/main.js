import Vue from 'vue'
import App from './App.vue'

import store from './store';

import Hagrid from '../../src/index';
Vue.use(Hagrid);

new Vue({
  el: '#app',
  store,
  render: h => h(App)
})
