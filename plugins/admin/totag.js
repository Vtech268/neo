import { Converter } from '@neoxr/wb'

export const run = {
   usage: ['totag'],
   use: 'reply message',
   category: 'admin tools',
   async: async (m, {
      client,
      participants,
      setting,
      Utils
   }) => {
      try {
         const q = m.quoted ? m.quoted : m
         if (/video|image|document/.test(q.mtype)) {
            await client.sendReact(m.chat, '🕒', m.key)
            let buffer = await q.download()
            client.sendFile(m.chat, buffer, '', q.text || '', m, {}, { contextInfo: { mentionedJid: participants.map(v => v.id) } })
         } else if (/audio/.test(q.mtype)) {
            await client.sendReact(m.chat, '🕒', m.key)
            let buffer = q.ptt ? await Converter.toPTT(await q.download()) : await q.download()
            client.sendFile(m.chat, buffer, '', q.text || '', m, {
               ptt: q.ptt
            }, { contextInfo: { mentionedJid: participants.map(v => v.id) } })
         } else if (/sticker/.test(q.mtype)) {
            await client.sendReact(m.chat, '🕒', m.key)
            let buffer = await q.download()
            client.sendSticker(m.chat, buffer, m, {
               packname: setting.sk_pack,
               author: setting.sk_author,
               mentions: participants.map(v => v.id)
            })
         } else if (/conver/.test(q.mtype)) {
            await client.sendReact(m.chat, '🕒', m.key)
            client.reply(m.chat, q.text || '', m, {
               mentions: participants.map(v => v.id)
            })
         } else {
            client.reply(m.chat, Utils.texted('bold', `🚩 Unsupported media type.`), m)
         }
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   admin: true,
   group: true
}