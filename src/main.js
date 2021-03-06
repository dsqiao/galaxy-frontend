import Vue from 'vue'
import Vuex from 'vuex'
import App from './App.vue'
import store from './store'

Vue.use(Vuex)

Vue.config.productionTip = false

new Vue({
  store: store,
  render: function (h) { return h(App) }
}).$mount('#app')
