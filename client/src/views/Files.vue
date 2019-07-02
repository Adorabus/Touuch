<template lang="pug">
  #files
    #files-controls-container
      #files-controls(v-if='selected.length > 0') {{ selected.length }} file(s) selected.
    #files-list
      file(
        v-for='upload in uploads',
        :upload='upload', :key='upload.url',
        @select='fileSelected', @deselect='fileDeselected'
      )
</template>

<script>
import File from '@/components/File'
import {indexFiles} from '@/services/FilesService.js'

export default {
  components: {
    File
  },
  methods: {
    fileSelected (url) {
      this.selected.push(url)
    },
    fileDeselected (url) {
      this.selected = this.selected.filter(item => item !== url)
    }
  },
  data () {
    return {
      uploads: [],
      selected: [],
      selecting: false
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
#files {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

#files-list {
  width: 80%;
}

#files-controls-container {
  height: 30px;
  width: 100%;
  margin-bottom: 20px;
}

#files-controls {
  display: flex;
  align-items: center;
  text-align: center;
  justify-content: center;
  border-bottom: $border-style;
}
</style>
