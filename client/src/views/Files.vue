<template lang="pug">
  #files
    #files-controls.floating-box(v-if='numSelected > 0')
      .info
        span {{ numSelected }} file(s) selected.
      .controls
        button(@click='deleteSelected') Delete
        button.cancel(@click='cancelSelection') Cancel
    #files-list
      file(
        v-for='upload in uploads', :selected='upload.selected',
        :upload='upload', :key='upload.url',
        @select='fileSelected', @deselect='fileDeselected',
        :selectionMode='numSelected > 0'
      )
    page-switcher(:total='30')
</template>

<script>
import File from '@/components/File'
import PageSwitcher from '@/components/common/PageSwitcher'
import {indexFiles, removeFiles} from '@/services/FilesService.js'

export default {
  components: {
    File,
    PageSwitcher
  },
  methods: {
    fileSelected (url) {
      if (!this.uploads[url].selected) this.numSelected++
      this.uploads[url].selected = true
    },
    fileDeselected (url) {
      if (this.uploads[url].selected) this.numSelected--
      this.uploads[url].selected = false
    },
    cancelSelection () {
      for (const upload of Object.values(this.uploads)) {
        upload.selected = false
      }
      this.numSelected = 0
    },
    async deleteSelected () {
      try {
        const selectedUrls = Object.values(this.uploads)
          .filter(upload => upload.selected)
          .map(upload => upload.url)

        console.log(`Deleting [${selectedUrls.join(', ')}]`)
        const res = await removeFiles(selectedUrls)
        console.log(res.data)
      } catch (error) {
        console.error(error)
      }
    }
  },
  data () {
    return {
      uploads: {},
      numSelected: 0
    }
  },
  async mounted () {
    try {
      const res = await indexFiles({
        limit: 100
      })

      const uploads = {}
      for (const upload of res.data) {
        uploads[upload.url] = upload
      }

      this.uploads = uploads
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
  padding-top: 20px;
}

#files-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  justify-content: center;

  .info {
    border-bottom: $border-style;
    padding: 5px;
  }

  .controls {
    button.cancel {
      color: grey;
    }
  }
}
</style>
