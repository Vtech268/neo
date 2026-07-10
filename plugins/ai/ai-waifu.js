export const run = {
   usage: ['waifudiff'],
   use: 'prompt',
   category: 'ai',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Utils
   }) => {
      try {
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, 'long hair'), m)
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.neoxr('/waifudiff', {
            q: text
         })
         if (!json.status) return client.reply(m.chat, Utils.jsonFormat(json), m)
         client.sendFile(m.chat, json.data.url, '', `◦  *Prompt* : ${json.data.prompt}`, m)
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true
}