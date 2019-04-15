module.exports = {
  lintOnSave: false,
  devServer: {
    host: '0.0.0.0',
    port: 8999,
    hot: true,
    disableHostCheck: true
  },
  css: {
    loaderOptions: {
      sass: {
        data: `@import "@/style/_mixins.scss";`
      }
    }
  }
}
