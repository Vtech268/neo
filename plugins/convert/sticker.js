export const run = {
   usage: ['sticker'],
   hidden: ['s', 'sk', 'stiker', 'sgif'],
   use: 'query / reply media',
   category: 'converter',
   async: async (m, {
      client,
      setting: exif,
      Utils
   }) => {
      try {
         if (m.quoted ? m.quoted.message : m.msg.viewOnce) {
            const type = m.quoted ? Object.keys(m.quoted.message)[0] : m.mtype
            const q = m.quoted ? m.quoted.message[type] : m.msg
            const buffer = await client.downloadMediaMessage(q)
            if (/video/.test(type)) {
               if (q.seconds > 10) return client.reply(m.chat, Utils.texted('bold', `🚩 Maximum video duration is 10 seconds.`), m)
               return await client.sendSticker(m.chat, buffer, m, {
                  packname: exif.sk_pack,
                  author: exif.sk_author,
                  meta: true
               })
            } else if (/image/.test(type)) {
               return await client.sendSticker(m.chat, buffer, m, {
                  packname: exif.sk_pack,
                  author: exif.sk_author,
                  meta: true
               })
            }
         } else {
            const q = m.quoted ? m.quoted : m
            const mime = (q.msg || q).mimetype || ''
            if (/image\/(jpe?g|png)/.test(mime)) {
               const buffer = await q.download()
               if (!buffer) return client.reply(m.chat, global.status.wrong, m)
               return await client.sendSticker(m.chat, buffer, m, {
                  packname: exif.sk_pack,
                  author: exif.sk_author,
                  meta: true
               })
            } else if (/video/.test(mime)) {
               if ((q.msg || q).seconds > 10) return client.reply(m.chat, Utils.texted('bold', `🚩 Maximum video duration is 10 seconds.`), m)
               const buffer = await q.download()
               if (!buffer) return client.reply(m.chat, global.status.wrong, m)
               return await client.sendSticker(m.chat, buffer, m, {
                  packname: exif.sk_pack,
                  author: exif.sk_author,
                  meta: true
               })
            } else client.reply(m.chat, Utils.texted('bold', `Stress ??`), m)
         }
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true
}