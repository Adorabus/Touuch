<template lang="pug">
  div
    h3 Register User
    input(
      type='text', v-model='registerUsername', autocomplete='off', autocorrect='off',
      autocapitalize='off', spellcheck='false', @keydown.enter.prevent='registerUser',
      data-lpignore='true'
    )
    br
    input(
      type='password', v-model='registerPassword',
      @keydown.enter.prevent='registerUser', data-lpignore='true'
    )
    br
    button(@click='registerUser') Register
    hr
</template>

<script>
import {register} from '@/services/UsersService.js'

export default {
  data () {
    return {
      registerUsername: '',
      registerPassword: ''
    }
  },
  methods: {
    async registerUser () {
      const username = this.registerUsername
      const password = this.registerPassword

      this.registerUsername = ''
      this.registerPassword = ''

      try {
        const res = await register({username, password})
        console.log(res.data.message)
      } catch (error) {
        console.error(error.data)
        console.error('Failed to register user!')
      }
    }
  }
}
</script>
