// NOT USED

<template lang="pug">
  div
    input(
      type='text', v-model='username', @keydown.enter.prevent='submit', autofocus
      autocomplete='off', autocorrect='off', autocapitalize='off', spellcheck='false'
    )
    br
    input(type='password', v-model='password', @keydown.enter.prevent='submit')
    br
    button(@click='submit') Log In
    p {{ result }}
</template>

<script>
import {login} from '@/services/AuthService.js'

export default {
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
