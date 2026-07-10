export const run = {
   usage: ['meme'],
   category: 'random',
   async: async (m, {
      client,
      command,
      Utils
   }) => {
      try {
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.neoxr('/meme')
         if (!json.status) return client.reply(m.chat, Utils.jsonFormat(json), m)
         client.sendFile(m.chat, json.data.url, '', json.data.title, m)
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true
}