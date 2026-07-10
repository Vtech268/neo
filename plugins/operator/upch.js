import { Converter } from '@neoxr/wb'
export const run = {
   usage: ['upch'],
   hidden: ['tochannel', 'toch'],
   use: 'text or reply media',
   category: 'operator',
   async: async (m, {
      client,
      text,
      setting,
      Utils
   }) => {
      try {
         let q = m.quoted ? m.quoted : m
         let mime = (q.msg || q).mimetype || ''
         if (!process.env.NEWSLETTER_ID) return client.reply(m.chat, Utils.texted('bold', `🚩 Error, Newsletter id does not exist.`), m)
         const notify = `✅ Sent successfully`
         client.sendReact(m.chat, '🕒', m.key)
         if (text) {
            client.reply(process.env.NEWSLETTER_ID, text, null).then(async () => {
               await Utils.delay(1200)
               m.reply(notify)
            })
         } else if (/image\/(webp)/.test(mime)) {
            let media = await q.download()
            client.sendSticker(process.env.NEWSLETTER_ID, media, null, {
               packname: setting.sk_pack,
               author: setting.sk_author
            }).then(async () => {
               await Utils.delay(1200)
               m.reply(notify)
            })
         } else if (/video|image\/(jpe?g|png)/.test(mime)) {
            let media = await q.download()
            client.sendFile(process.env.NEWSLETTER_ID, media, '', q?.text || '', null).then(async () => {
               await Utils.delay(1200)
               m.reply(notify)
            })
         } else if (/audio/.test(mime)) {
            let media = await Converter.toPTT(await q.download())
            client.sendFile(process.env.NEWSLETTER_ID, media, '', '', null, { ptt: true }).then(async () => {
               await Utils.delay(1200)
               m.reply(notify)
            })
         } else client.reply(m.chat, Utils.texted('bold', `🚩 Media / text not found or media is not supported.`), m)
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   operator: true
}