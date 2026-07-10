export const run = {
   usage: ['setads', 'delads'],
   category: 'bot hosting',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      setup,
      Utils
   }) => {
      try {
         if (command === 'setads') {
            if (!text) return m.reply(Utils.example(isPrefix, command, 'WhatsApp Gateway : https://wapify.neoxr.eu'))
            setup.ads = text.trim()
            m.reply('✅ Ads has been set.')
         } else {
            setup.ads = ''
            m.reply('✅ Ads has been removed.')
         }
      } catch (e) {
         client.reply(m.chat, Utils.texted('bold', `🚩 ${e.message}.`), m)
      }
   },
   error: false,
   operator: true
}