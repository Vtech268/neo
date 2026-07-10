export const run = {
   async: async (m, {
      client,
      body,
      isOwner,
      groupSet,
      setting,
      Utils
   }) => {
      try {
         if (groupSet.autoreply) {
            m.reply('Hello')
         }
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   group: true
}