<template lang="pug">
  .file(:style='`border: 1px solid ${extColor}`', :class='{selected}')
    .preview
      button.select(@click='toggleSelect')
      a(:href='`/api/files/${upload.url}`')
        img(v-if='!upload.isAnimated', :src='`/api/files/${upload.url}/preview`', draggable='false')
        video(v-else, :src='`/api/files/${upload.url}/preview`', autoplay, loop, muted)
    .name(:title='upload.filename') {{ upload.filename }}
</template>

<script>
const extColors = {
  png: 'rgba(255, 0, 106, 1)',
  jpg: 'rgba(255, 106, 0, 1)',
  jpeg: 'rgba(255, 106, 0, 1)',
  mp4: 'rgba(144, 0, 255, 1)',
  gif: 'rgba(93, 235, 33, 1)'
}

export default {
  props: ['upload'],
  computed: {
    extColor () {
      const [ext] = this.upload.filename.toLowerCase().split('.').slice(-1)
      return extColors[ext] || 'rgba(255, 255, 255, 1)'
    }
  },
  data () {
    return {
      selected: false
    }
  },
  methods: {
    toggleSelect () {
      if (this.selected) {
        this.selected = false
        this.$emit('deselect', this.upload.url)
      } else {
        this.selected = true
        this.$emit('select', this.upload.url)
      }
    }
  }
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css?family=Open+Sans');

.file {
  @include select(none);

  display: inline-block;
  outline: 1px solid black;
  width: 100px;
  height: 100px;
  overflow: hidden;
  margin: 5px;
  margin-top: unset;
  position: relative;

  &.selected {
    outline: 1px solid white;
  }

  .preview {
  }

  button.select {
    width: 16px;
    height: 16px;
    margin: 0;
    padding: 0;
    border-radius: 100%;
    position: absolute;
    top: 3px;
    left: 3px;
    border: 1px solid white;
    background: none;
    cursor: pointer;
    display: none;
    z-index: 1;
    outline: none;
  }

  &:hover button.select {
    display: inline-block;
  }

  &.selected button.select {
    background: white;
  }

  .name {
    width: 100%;
    position: absolute;
    bottom: 0;
    height: 16px;
    line-height: 16px;
    font-size: 8pt;
    background: hsla(0, 0%, 0%, 0.75);
    font-family: 'Open Sans', sans-serif;
  }
}
</style>
