export const run = {
   usage: ['artimimpi'],
   use: 'query',
   category: 'primbon',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Utils
   }) => {
      try {
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, 'belanja'), m)
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.neoxr('/artimimpi', {
            q: text
         })
         if (!json.status) return client.reply(m.chat, Utils.jsonFormat(json), m)
         let p = `${json.data.result}\n\n`
         p += `◦ *Solusi* : ${json.data.solusi}`
         client.reply(m.chat, p, m)
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true
}