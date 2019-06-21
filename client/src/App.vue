<template lang="pug">
  #app
    #nav
      #nav-left
        router-link(to='/') Home
        router-link(to='/files') Files
        span(v-if='$store.state.isLoggedIn') {{ this.$store.state.user.username }}
      #nav-right
        dropdown.account-dropdown
          template(v-slot:button)
            span#settings-emoji ⚙
          template(v-slot:content)
            link-list#account-links(:links='navLinks')
    #view-container
      router-view
</template>

<script>
import Dropdown from '@/components/common/Dropdown'
import LinkList from '@/components/common/LinkList'

export default {
  components: {
    Dropdown,
    LinkList
  },
  computed: {
    navLinks () {
      return [
        {
          title: 'Thing',
          url: '/stuff'
        },
        {
          title: 'Other Thing',
          url: '/otherstuff'
        }
      ]
    }
  }
}
</script>

<style lang="scss">
/* TODO: Maybe move global stuff into separate file. */
html, body {
  margin: 0;
  padding: 0;
  background: $app-background;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #dfe7ef;
}
#nav {
  @include select(none);
  display: flex;
  justify-content: space-between;
  text-align: left;
  width: 100%;
  height: 60px;
  outline: 1px solid #0f1113;
  border-bottom: $border-style;
  margin-bottom: 30px;
}

#nav-left {
  a {
    padding-left: 22px;
    padding-right: 22px;
    line-height: 60px;
    font-weight: bold;
    border-right: $border-style;
    display: inline-block;

    &.router-link-exact-active {
      text-decoration: underline;
      cursor: default;
    }
  }
}

a {
  color: #f02a55;
  text-decoration: none;
}

input[type=text], input[type=password] {
  color: #fff;
  background: #181818;
  border: 1px solid #222;
  padding: 5px;
  margin: 5px;
  font-size: 12pt;

  &:focus {
    outline: 1px solid rgb(255, 33, 85);
  }
}
#logo {
}
#view-container {
  display: flex;
  justify-content: center;
}

.account-dropdown {
  width: 60px;
  height: 100%;
}

#settings-emoji {
  font-size: 32pt;
  line-height: 60px;
}

#account-links {
  width: 200px;
}
</style>
