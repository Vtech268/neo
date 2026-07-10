// vite.config.js
export default {
   plugins: [
     {
       name: 'clean-html-urls',
       configureServer(server) {
         server.middlewares.use((req, res, next) => {
           if (
             req.method === 'GET' &&
             req.url &&
             !req.url.includes('.') &&
             req.url !== '/'
           ) {
             const fs = require('fs');
             const path = require('path');
             const filePath = path.join(process.cwd(), 'file.html'); // untuk contoh
             const htmlPath = path.join(process.cwd(), req.url.slice(1) + '.html');
 
             if (fs.existsSync(htmlPath)) {
               req.url += '.html';
             }
           }
           next();
         });
       },
     },
   ],
   server: {
     host: true,
     port: 3000,
     watch: {
       usePolling: true,
     },
   },
 };
 