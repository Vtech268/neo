import config from '../config.json' assert { type: 'json'}
import { BOT_TYPE as bot_type } from '../lib/bot-type.js'

export default defineNuxtConfig({
   devtools: { enabled: false },
   modules: ['@pinia/nuxt'],
   vue: {
      compilerOptions: {
         isCustomElement: tag => tag === 'iconify-icon'
      }
   },
   vite: {
      server: {
         allowedHosts: true
      }
   },
   css: [
      '~/assets/css/style.min.css'
   ],
   app: {
      head: {
         title: config.bot_hosting.name,
         titleTemplate: '%s - WhatsApp Geteway API',
         meta: [
            { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
            { name: 'author', content: config.owner_name },
            { name: 'description', content: `${config.bot_hosting.name} is a powerful WhatsApp Gateway and API that helps you send automated messages, build chatbots, and integrate WhatsApp with your system easily and securely.` },
            { name: 'keywords', content: 'WhatsApp Gateway, WhatsApp API, message automation, chatbot integration, Wapify' },
            { property: 'og:title', content: config.bot_hosting.name },
            { property: 'og:description', content: 'WhatsApp Gateway, WhatsApp API, message automation, chatbot integration, Wapify.' },
            { property: 'og:image', content: 'https://i.pinimg.com/736x/7d/97/98/7d979860254006b5df3e5475a14cd37b.jpg' },
            { property: 'og:type', content: 'website' }
         ],
         link: [
            { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
            { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css', crossorigin: 'anonymous' }
         ],
         script: [
            {
               innerHTML: `
                 (function() {
                   try {
                     var theme = localStorage.getItem('theme') || 'dark';
                     if (theme === 'light') {
                       document.body.classList.add('light-mode');
                     }
                   } catch (e) {}
                 })()
               `,
               type: 'text/javascript',
               tagPosition: 'bodyOpen'
            },
            { src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js', crossorigin: 'anonymous' },
         ]
      }
   },
   runtimeConfig: {
      public: {
         session_expires: 3 * 24 * 60 * 60,
         title: config.bot_hosting.name,
         currency: config.bot_hosting.currency,
         price_list: config.bot_hosting.price_list,
         owner: config.owner,
         links: [{
            icon: 'bi bi-github',
            title: 'Github',
            url: 'https://github.com/neoxr'
         }, {
            icon: 'bi bi-fire',
            title: 'Neoxr\'s API',
            url: 'https://api.neoxr.eu'
         }, {
            icon: 'bi bi-whatsapp',
            title: 'Whatsapp',
            url: `https://wa.me/${config.owner}`
         }],
         popupURL: 'https://whatsapp.com/channel/0029Vb5ekjf4dTnMuADBHX1j',
         bot_type,
         cp: config.bot_hosting.challenge_password
      }
   }
})