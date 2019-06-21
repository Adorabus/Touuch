module.exports = {
  lintOnSave: false,
  devServer: {
    host: '0.0.0.0',
    port: 8999,
    hot: true,
    disableHostCheck: true,
    proxy: {
      '/api': {
        target: 'http://localhost/'
      }
    }
  },
  css: {
    loaderOptions: {
      sass: {
        data: `
        @import '@/style/_mixins.scss';
        @import '@/style/_global.scss';
        `
      }
    }
  }
}
