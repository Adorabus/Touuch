<template lang="pug">
  ul.link-list
    li.link-list-item(v-for='link in links')
      router-link(:to='link.url') {{ link.title }}
</template>

<script>
export default {
  props: {
    links: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style lang="scss">
ul.link-list {
  list-style: none;
  margin: 0;
  padding: 0;
  border: $border-style;
  border-top: none;
  box-shadow: 0 1px 0 0 black;
  background: $app-background;
}

li.link-list-item {
  margin: 0;
  padding: 0;
  border-bottom: $border-style;
  padding: 4px;
  text-align: center;

  &:last-child {
    border: none;
  }
}
</style>
