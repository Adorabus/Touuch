<template lang="pug">
  div#administration
    category-view(:categories='categories')
</template>

<script>
import CategoryView from '@/components/common/CategoryView'

export default {
  components: {
    CategoryView
  },
  data () {
    return {
      categories: [
        {
          title: 'Manage Users',
          url: 'users'
        },
        {
          title: 'Server Maintenance',
          url: 'maintenance'
        }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
#administration {
  justify-content: center;
  align-content: center;
  width: 60%;
}
</style>
