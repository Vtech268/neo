export const run = {
   usage: ['quran'],
   use: 'surah ayat',
   category: 'downloader',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      Utils
   }) => {
      try {
         if (!args || !args[0] || !args[1]) return client.reply(m.chat, Utils.example(isPrefix, command, '114 2'), m)
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.neoxr('/quran', {
            surah: args[0],
            verse: args[1]
         })
         if (!json.status) return client.reply(m.chat, Utils.jsonFormat(json), m)
         let caption = json.data.arabic + '\n\n'
         caption += json.data.translate
         m.reply(caption).then(() => {
            client.sendFile(m.chat, json.data.audio.url, '', '', m)
         })
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true
}