import retry from 'async-retry'

export const run = {
   usage: ['smeme', 'smemevid'],
   use: 'text | text',
   category: 'converter',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Utils,
      setting: exif,
      Scraper
   }) => {
      try {
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, 'Hi | Dude'), m)
         client.sendReact(m.chat, '🕒', m.key)
         const [top, bottom] = text.split`|`
         if (m.quoted ? m.quoted.message : m.msg.viewOnce) {
            const type = m.quoted ? Object.keys(m.quoted.message)[0] : m.mtype
            const q = m.quoted ? m.quoted.message[type] : m.msg
            if (/image/.test(type)) {
               await retry(async () => {
                  const img = await client.downloadMediaMessage(q)
                  const cdn = await Scraper.uploadImageV2(img)
                  if (!cdn.status) throw new Error(cdn.msg)
                  const json = await Api.neoxr(command === 'smeme' ? '/memegen' : '/memegenvid', {
                     image: cdn.data.url,
                     top: top || '️',
                     bottom: bottom || '️'
                  })
                  if (!json.status) throw new Error(json.msg)
                  return client.sendSticker(m.chat, json.data.url, m, {
                     packname: exif.sk_pack,
                     author: exif.sk_author
                  })
               }, {
                  retries: 3,
                  factor: 2,
                  minTimeout: 1000,
                  maxTimeout: 3000,
                  onRetry: (e, n) => {
                     client.reply(m.chat, Utils.texted('bold', `🚩 Retry attempt ${n}.`), m)
                  }
               })
            } else client.reply(m.chat, Utils.texted('bold', `🚩 Only for photo.`), m)
         } else {
            const q = m.quoted ? m.quoted : m
            const mime = (q.msg || q).mimetype || ''
            if (!mime) return client.reply(m.chat, Utils.texted('bold', `🚩 Reply photo.`), m)
            if (!/image\/(jpe?g|png)/.test(mime)) return client.reply(m.chat, Utils.texted('bold', `🚩 Only for photo.`), m)
            await retry(async () => {
               const img = await q.download()
               const cdn = await Scraper.uploadImageV2(img)
               if (!cdn.status) throw new Error(cdn.msg)
               const json = await Api.neoxr(command === 'smeme' ? '/memegen' : '/memegenvid', {
                  image: cdn.data.url,
                  top: top || '️',
                  bottom: bottom || '️'
               })
               if (!json.status) throw new Error(json.msg)
               return client.sendSticker(m.chat, json.data.url, m, {
                  packname: exif.sk_pack,
                  author: exif.sk_author
               })
            }, {
               retries: 3,
               factor: 2,
               minTimeout: 1000,
               maxTimeout: 3000,
               onRetry: (e, n) => {
                  client.reply(m.chat, Utils.texted('bold', `🚩 Retry attempt ${n}.`), m)
               }
            })
         }
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true
}