export const run = {
   usage: ['verified'],
   category: 'example',
   async: async (m, {
      client,
      Utils
   }) => {
      try {
         // changes "m" to "Utils.verified()"
         client.reply(m.chat, 'Hi!', Utils.verified())
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false
}