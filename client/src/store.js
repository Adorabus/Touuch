import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

export default new Vuex.Store({
  strict: true,
  plugins: [
    createPersistedState()
  ],
  state: {
    token: null,
    user: null,
    isLoggedIn: false,
    isAdmin: false
  },
  mutations: {
    setToken (state, token) {
      state.token = token
      state.isLoggedIn = !!(token)
    },
    setUser (state, user) {
      state.user = user
      state.isAdmin = user && !!(user.admin)
    },
    set2FA (state, enabled) {
      state.user.twoFactorEnabled = enabled
    }
  },
  actions: {
    setToken ({commit}, token) {
      commit('setToken', token)
    },
    setUser ({commit}, user) {
      commit('setUser', user)
    },
    set2FA ({commit}, enabled) {
      commit('set2FA', enabled)
    }
  }
})
