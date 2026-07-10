export const run = {
   usage: ['trigger'],
   hidden: ['tg'],
   use: 'reply photo',
   category: 'converter',
   async: async (m, {
      client,
      setting,
      Utils,
      Scraper
   }) => {
      try {
         if (m.quoted ? m.quoted.message : m.msg.viewOnce) {
            let type = m.quoted ? Object.keys(m.quoted.message)[0] : m.mtype
            let q = m.quoted ? m.quoted.message[type] : m.msg
            if (/image/.test(type)) {
               client.sendReact(m.chat, '🕒', m.key)
               let img = await client.downloadMediaMessage(q)
               let image = await Scraper.uploadImageV2(img)
               const json = await Api.neoxr('/effect3', {
                  image: image.data.url,
                  style: 'trigger'
               })
               if (!json.status) return m.reply(Utils.jsonFormat(json))
               client.sendSticker(m.chat, await Utils.fetchAsBuffer(json.data.url), m, {
                  packname: setting.sk_pack,
                  author: setting.sk_author
               })
            } else client.reply(m.chat, Utils.texted('bold', `🚩 Only for photo.`), m)
         } else {
            let q = m.quoted ? m.quoted : m
            let mime = (q.msg || q).mimetype || ''
            if (!mime) return client.reply(m.chat, Utils.texted('bold', `🚩 Reply photo.`), m)
            if (!/image\/(jpe?g|png)/.test(mime)) return client.reply(m.chat, Utils.texted('bold', `🚩 Only for photo.`), m)
            client.sendReact(m.chat, '🕒', m.key)
            let img = await q.download()
            let image = await Scraper.uploadImageV2(img)
            const json = await Api.neoxr('/effect3', {
               image: image.data.url,
               style: 'trigger'
            })
            if (!json.status) return m.reply(Utils.jsonFormat(json))
            client.sendSticker(m.chat, await Utils.fetchAsBuffer(json.data.url), m, {
               packname: setting.sk_pack,
               author: setting.sk_author
            })
         }
      } catch (e) {
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true
}