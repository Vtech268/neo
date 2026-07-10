export const run = {
   usage: ['totext'],
   hidden: ['whisper'],
   use: 'reply audio',
   category: 'converter',
   async: async (m, {
      client,
      Utils,
      Scraper
   }) => {
      try {
         let q = m.quoted ? m.quoted : m
         let mime = (q.msg || q).mimetype || ''
         if (!mime) return client.reply(m.chat, Utils.texted('bold', `🚩 Reply audio.`), m)
         if (!/(audio)/.test(mime)) return client.reply(m.chat, Utils.texted('bold', `🚩 Only for audio.`), m)
         client.sendReact(m.chat, '🕒', m.key)
         let file = await Scraper.uploadImageV2(await q.download())
         const json = await Api.neoxr('/whisper', {
            audio: file.data.url
         })
         if (!json.status) return m.reply(Utils.jsonFormat(json))
         m.reply(json.data.text)
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true
}