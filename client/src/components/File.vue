<template lang="pug">
  .file
    img(v-if='!upload.animated', :src='`/api/files/${upload.url}/preview`')
    video(v-else, :src='`/api/files/${upload.url}/preview`', autoplay, loop, muted)
    .name {{ upload.filename }}
</template>

<script>
export default {
  props: ['upload']
}
</script>

<style lang="scss">
.file {
  display: inline-block;
  outline: 1px solid black;
  width: 100px;
  height: 100px;
  overflow: hidden;
  margin: 5px;
  margin-top: unset;

  .name {
    font-size: 8pt;
  }
}
</style>
