import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

import VueErrorHandler from '@/lib/VueErrorHandler.js'

Vue.use(VueErrorHandler);

import vConsole from 'vconsole'
var vconsole = new vConsole();

new Vue({
  render: h => h(App),
}).$mount('#app')
