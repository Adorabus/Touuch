<template lang="pug">
  #app
    #nav
      #nav-left
        router-link(to='/')
          img(src='logo.png')
        router-link(to='/files', v-if='$store.state.isLoggedIn') Files
        router-link(to='/patch-notes', v-if='$store.state.isLoggedIn') Patch Notes
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
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

.material-icons {
  font-family: 'Material Icons';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;  /* Preferred icon size */
  display: inline-block;
  line-height: 1;
  text-transform: none;
  letter-spacing: normal;
  word-wrap: normal;
  white-space: nowrap;
  direction: ltr;

  /* Support for all WebKit browsers. */
  -webkit-font-smoothing: antialiased;
  /* Support for Safari and Chrome. */
  text-rendering: optimizeLegibility;

  /* Support for Firefox. */
  -moz-osx-font-smoothing: grayscale;

  /* Support for IE. */
  font-feature-settings: 'liga';
}

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
  display: flex;
  flex-direction: row;

  a {
    padding-left: 20px;
    padding-right: 20px;
    line-height: 60px;
    font-weight: bold;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 100%;

    &:first-child {
      padding-left: 30px;
    }

    img {
      display: inline-block;
    }

    &.router-link-active {
      cursor: default;
      color: unset;
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
  height: 22px;
  color: $link-color;
  background: #181818;
  border: 1px solid #222;
  padding: 5px;
  margin: 5px;
  font-size: 10pt;
  font-weight: bold;
  outline: none;
  box-shadow: $shadow-style;
  border-radius: 3px;

  &:disabled {
    color: grey;
    transform: translate(0, 1px);
    box-shadow: $shadow-style-low;
  }

  &:active {
    transform: translate(0, 1px);
    box-shadow: $shadow-style-low;
  }
}

input[type=text], input[type=password], input[type=number] {
  height: 22px;
  color: #fff;
  background: #181818;
  border: 1px solid #222;
  padding: 5px;
  margin: 5px;
  font-size: 12pt;
  border-radius: 3px;

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
