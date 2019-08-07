<template lang="pug">
  .category-menu
    nav.list.floating-box
      router-link.category(v-for='category, key in categories', :to='category.url', :key='key') {{ category.title }}
    .view.center-content
      router-view
</template>

<script>
export default {
  props: {
    categories: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style lang="scss" scoped>
.category-menu {
  display: flex;
  flex-direction: row;
  align-items: flex-start;

  .list {
    font-weight: bold;
    margin-right: 10px;
    white-space: nowrap;
    font-size: 10pt;

    .category {
      display: block;
      height: 40px;
      line-height: 40px;
      border-bottom: $border-style;
      padding: 5px;
      border-right: 3px solid transparent;

      &:last-child {
        border-bottom: none;
      }

      &.router-link-active {
        color: unset;
        border-right: 3px solid $link-color;
        cursor: default;
      }
    }
  }

  .view {
    padding: 10px;
    flex-grow: 1;
  }
}
</style>
