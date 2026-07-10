import { format } from 'date-fns'
import retry from 'async-retry'

export const run = {
   usage: ['remini'],
   hidden: ['hd'],
   use: 'reply photo',
   category: 'utilities',
   async: async (m, { client, Utils, Scraper }) => {
      try {
         if (m.quoted ? m.quoted.message : m.msg.viewOnce) {
            const type = m.quoted ? Object.keys(m.quoted.message)[0] : m.mtype
            const q = m.quoted ? m.quoted.message[type] : m.msg
            if (/image/.test(type)) {
               client.sendReact(m.chat, '🕒', m.key)
               await retry(async () => {
                  const img = await client.downloadMediaMessage(q)
                  const cdn = await Scraper.uploadImageV2(img)
                  if (!cdn.status) throw new Error(cdn.msg)
                  const json = await Api.neoxr('/remini', { image: cdn.data.url })
                  if (!json.status) throw new Error(json.msg)
                  client.sendFile(
                     m.chat,
                     json.data.url,
                     `Remini - ${format(new Date(), 'dd/MM/yy')}_${Date.now()}.jpg`,
                     '',
                     m,
                     { document: true }
                  )
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
            client.sendReact(m.chat, '🕒', m.key)
            await retry(async () => {
               const img = await q.download()
               const cdn = await Scraper.uploadImageV2(img)
               if (!cdn.status) throw new Error(cdn.msg)
               const json = await Api.neoxr('/remini', { image: cdn.data.url })
               if (!json.status) throw new Error(json.msg)
               client.sendFile(
                  m.chat,
                  json.data.url,
                  `Remini - ${format(new Date(), 'dd/MM/yy')}_${Date.now()}.jpg`,
                  '',
                  m,
                  { document: true }
               )
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
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true
}