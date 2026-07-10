import { Converter } from '@neoxr/wb'

export const run = {
   usage: ['bcbot'],
   use: 'text or reply media',
   category: 'bot hosting',
   async: async (m, {
      client,
      text,
      setting,
      Utils
   }) => {
      try {
         let q = m.quoted ? m.quoted : m
         let mime = (q.msg || q).mimetype || ''
         let botJid = global.db.bots.map(v => v.jid)
         if (botJid.length < 1) return client.reply(m.chat, Utils.texted('bold', `🚩 Error, bot does not exist.`), m)
         client.sendReact(m.chat, '🕒', m.key)
         if (text) {
            for (let jid of botJid) {
               await Utils.delay(1500)
               await client.sendMessageModify(jid, text, null, {
                  netral: true,
                  type: 'preview-link',
                  title: global.botname,
                  thumbnail: await Utils.fetchAsBuffer('https://telegra.ph/file/aa76cce9a61dc6f91f55a.jpg'),
                  largeThumb: true,
                  url: setting.link,
                  icon: setting.icon ? Utils.isUrl(setting.icon) ? setting.icon : Buffer.from(setting.icon, 'base64') : null
               })
            }
            client.reply(m.chat, Utils.texted('bold', `🚩 Successfully send broadcast message to ${botJid.length} bots`), m)
         } else if (/image\/(webp)/.test(mime)) {
            for (let jid of botJid) {
               await Utils.delay(1500)
               let media = await q.download()
               await client.sendSticker(jid, media, null, {
                  packname: '© neoxr.js',
                  author: ''
               })
            }
            client.reply(m.chat, Utils.texted('bold', `🚩 Successfully send broadcast message to ${botJid.length} bots`), m)
         } else if (/video|image\/(jpe?g|png)/.test(mime)) {
            for (let jid of botJid) {
               await Utils.delay(1500)
               let media = await q.download()
               await client.sendFile(jid, media, '', q.text ? '乂  *B R O A D C A S T*\n\n' + q.text : '', null, {
                  netral: true
               })
            }
            client.reply(m.chat, Utils.texted('bold', `🚩 Successfully send broadcast message to ${botJid.length} bots`), m)
         } else if (/audio/.test(mime)) {
            for (let jid of botJid) {
               await Utils.delay(1500)
               let media = q.ptt ? await Converter.toPTT(await q.download()) : await q.download()
               await client.sendFile(jid, media, '', '', null, {
                  ptt: q.ptt
               })
            }
            client.reply(m.chat, Utils.texted('bold', `🚩 Successfully send broadcast message to ${botJid.length} bot`), m)
         } else client.reply(m.chat, Utils.texted('bold', `🚩 Media / text not found or media is not supported.`), m)
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   owner: true
}