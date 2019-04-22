<template lang="pug">
  #app
    #nav
      router-link(to='/') Home
      router-link(to='/files') Files
      router-link(to='/login') Login (temp)
      span(v-if='$store.state.isLoggedIn') {{ this.$store.state.user.username }}
    #view-container
      router-view
</template>

<style lang="scss">
/* TODO: Maybe move global stuff into separate file. */
html, body {
  margin: 0;
  padding: 0;
  background: #23282b;
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
  text-align: left;
  height: 60px;
  outline: 1px solid #0f1113;
  border-bottom: 1px solid #30363a;
  margin-bottom: 30px;

  a {
    padding-left: 22px;
    padding-right: 22px;
    line-height: 60px;
    font-weight: bold;
    color: #f02a55;
    border-right: 1px solid #30363a;
    display: inline-block;

    &.router-link-exact-active {
      text-decoration: underline;
      cursor: default;
    }
  }
}
a {
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
</style>
