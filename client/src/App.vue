<template lang="pug">
  #app
    #nav
      #nav-left
        router-link(to='/') Home
        router-link(to='/files', v-if='$store.state.isLoggedIn') Files
        router-link(to='/administration', v-if='$store.state.isAdmin') Administration
      #nav-right
        dropdown.account-dropdown(v-if='$store.state.isLoggedIn')
          template(v-slot:button)
            span#settings-emoji ⚙
          template(v-slot:content)
            #account-links
              router-link(to='/profile') Profile
              a(@click='logout') Logout
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
  methods: {
    logout () {
      this.$store.dispatch('setToken', null)
      this.$store.dispatch('setUser', null)
      this.$router.push('/')
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
  color: $link-color;
  text-decoration: none;
}

hr {
  border: none;
  border-bottom: 1px solid $border-color;
}

button {
  color: $link-color;
  background: #181818;
  border: 1px solid #222;
  padding: 8px;
  margin: 5px;
  font-size: 10pt;
  font-weight: bold;
  outline: none;
  box-shadow: $shadow-style;

  &:active {
    transform: translate(0, 1px);
    box-shadow: $shadow-style-low;
  }
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
  text-align: center;
  border: $border-style;
  border-top: none;
  box-shadow: 0 1px 0 0 black;
  background: $app-background;
  width: 150px;
  padding: 10px;

  * {
    display: block;
    line-height: 30px;
  }
}
</style>
