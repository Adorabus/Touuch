<template lang="pug">
  #app
    #nav
      router-link(to='/') Home
      router-link(to='/huh') Huh
    router-view
</template>

<style lang="scss">
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
  padding: 30px;
  a {
    font-weight: bold;
    color: #f02a55;
    padding: 5px;
    &.router-link-exact-active {
      text-decoration: underline;
    }
  }
  outline: 1px solid #f02a55;
}
a {
  text-decoration: none;
}
</style>
