<template lang="pug">
  div(v-if='!$store.state.isLoggedIn')
    input(type='text', v-model='username', placeholder='username', @keydown.enter.prevent='submit', autofocus)
    br
    input(type='password', v-model='password', placeholder='password', @keydown.enter.prevent='submit')
    p {{ result }}
  div(v-else)
    p Welcome, {{ $store.state.user.username }}
</template>

<script>
import {login} from '@/services/AuthService.js'

export default {
  name: 'home',
  data () {
    return {
      username: '',
      password: '',
      result: ''
    }
  },
  methods: {
    async submit () {
      try {
        const res = await login({
          username: this.username,
          password: this.password
        })

        this.$store.dispatch('setToken', res.data.token)
        this.$store.dispatch('setUser', res.data.user)

        this.username = ''
        this.password = ''
      } catch (error) {
        console.error(error)
      }
    }
  }
}
</script>
