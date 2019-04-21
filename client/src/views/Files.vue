<template lang="pug">
  .files-list
    file(v-for='upload in uploads', :upload='upload', :key='upload.url')
</template>

<script>
import File from '@/components/File'
import {indexFiles} from '@/services/FilesService.js'

export default {
  components: {
    File
  },
  data () {
    return {
      uploads: []
    }
  },
  async mounted () {
    try {
      const res = await indexFiles({
        limit: 100
      })
      this.uploads = res.data
    } catch (error) {
      console.error(error)
    }
  }
}
</script>

<style lang="scss">
.files-list {
  width: 80%;
}
</style>
