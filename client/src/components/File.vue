<template lang="pug">
  .file
    .preview
      a(:href='`/api/files/${upload.url}`')
        img(v-if='!upload.animated', :src='`/api/files/${upload.url}/preview`', draggable='false')
        video(v-else, :src='`/api/files/${upload.url}/preview`', autoplay, loop, muted)
    .name(:title='upload.filename') {{ upload.filename }}
</template>

<script>
export default {
  props: ['upload']
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

  .preview {
  }

  .name {
    width: 100%;
    position: absolute;
    bottom: 0;
    height: 16px;
    line-height: 16px;
    font-size: 8pt;
    background: url(~@/assets/bg-black.png);
    font-family: 'Open Sans', sans-serif;
  }
}
</style>
