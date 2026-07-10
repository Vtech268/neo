export const run = {
   usage: ['iqc'],
   use: 'text | time | chattime',
   category: 'converter',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Utils
   }) => {
      try {
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, `Hai | 20:20 | 04:30`), m)
         client.sendReact(m.chat, '🕒', m.key)
         let old = new Date()
         const [chat, time, chat_time] = text.split('|')
          const now = new Date()
         const formatTime = (date) => {
            return date.toTimeString().slice(0, 5) // HH:mm
         }

         const statusBarTime = time || formatTime(now)
         const chatTime = chat_time || formatTime(now)
         
         const json = await Api.neoxr('/iqc', {
            text: chat.trim(),
            time: statusBarTime?.trim(),
            chat_time: chatTime?.trim()
         })

         client.sendFile(m.chat, json.data.url, 'image.png', `🍟 *Fetching* : ${((new Date - old) * 1)} ms`, m)
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true
}