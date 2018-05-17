import Vue from 'vue';
import App from './App';

import store from './store';

import Hagrid from '../../src/index';

const hagrid = new Hagrid();
Vue.use(hagrid);

window.app = new Vue({
  el: '#app',
  store,
  render: h => h(App),
});
