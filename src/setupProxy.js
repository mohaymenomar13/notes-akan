const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/fetch_users.php',
    createProxyMiddleware({
      target: 'http://noteakan.ct.ws',
      changeOrigin: true,
      onProxyRes(proxyRes) {
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      },
    })
  );
};
