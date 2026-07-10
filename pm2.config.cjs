module.exports = {
   apps: [{
      name: 'DANIELBOT',
      script: './index.js',
      node_args: '--max-old-space-size=1024',
      env: {
         NODE_ENV: 'no_gateway'
      }
   }, {
      name: 'gateway',
      script: './index.js',
      node_args: '--max-old-space-size=512',
      args: '--server',
      env: {
         NODE_ENV: 'gateway'
      }
   }]
}
