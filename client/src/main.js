import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import {checkAuth} from './services/AuthService'

Vue.config.productionTip = false

router.beforeEach(
  (to, from, next) => {
    if (to.matched.length < 1) {
      return next('/')
    }

    if (to.meta.title) {
      document.title = `Touuché - ${to.meta.title}`
    } else {
      document.title = `Touuché`
    }

    if (to.matched.some(record => record.meta.forAdministrators)) {
      if (store.state.isAdmin) {
        next()
      } else {
        next('/')
      }
    } else if (to.matched.some(record => record.meta.forUsers)) {
      if (store.state.isLoggedIn) {
        next()
      } else {
        next('/')
      }
    } else if (to.matched.some(record => record.meta.forGuests)) {
      if (!store.state.isLoggedIn) {
        next()
      } else {
        next('/')
      }
    } else {
      next()
    }
  }
)

router.afterEach(
  async (to, from) => {
    if (!to.meta.skipAuthCheck && store.state.isLoggedIn) {
      try {
        const response = await checkAuth(store.state.user.updatedAt)
        if (response.data.user) {
          store.dispatch('setUser', response.data.user)
        }
      } catch (error) {
        store.dispatch('setToken', null)
        store.dispatch('setUser', null)
        router.push('/')
      }
    }
  }
)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
