<template lang="pug">
  div
    h1 {{ $store.state.user.username }}
    h3 Storage Used
    span {{ totalStorage }}
    h3 Total Files
    span {{ me.totalFiles }}
</template>

<script>
import {getSelfDetails} from '@/services/UsersService'
import prettyBytes from 'pretty-bytes'

export default {
  computed: {
    totalStorage () {
      if (!this.me.totalBytes) return 'Unknown'
      return prettyBytes(this.me.totalBytes)
    }
  },
  data () {
    return {
      me: {}
    }
  },
  async mounted () {
    try {
      const res = await getSelfDetails()
      this.me = res.data
    } catch (error) {
      console.error(error)
    }
  }
}
</script>

<style lang="scss">
p {
  @include select(none);
}
</style>
