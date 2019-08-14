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
    page-switcher(:total='totalPages', @change='pageChanged')
</template>

<script>
import File from '@/components/File'
import PageSwitcher from '@/components/common/PageSwitcher'
import {indexFiles, removeFiles} from '@/services/FilesService.js'
import debounce from 'lodash.debounce'

export default {
  components: {
    File,
    PageSwitcher
  },
  methods: {
    async pageChanged (newPage) {
      if (newPage !== this.lastPage) {
        this.pendingPageChange = true
        await this.getUploads(newPage)
      }

      this.lastPage = newPage
    },
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
    },
    getUploads: debounce(async function (page) {
      try {
        const res = await indexFiles({
          limit: 25,
          page
        })

        this.totalPages = res.data.totalPages

        const uploads = {}
        for (const upload of res.data.uploads) {
          uploads[upload.url] = upload
        }

        this.uploads = uploads
      } catch (error) {
        console.error(error)
      }

      this.pendingPageChange = false
    }, 250)
  },
  data () {
    return {
      uploads: {},
      numSelected: 0,
      totalPages: 0,
      pendingPageChange: false,
      lastPage: 1
    }
  },
  async mounted () {
    await this.getUploads(1)
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
