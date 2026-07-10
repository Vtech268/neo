import fs from 'node:fs'
import { watermark } from '../../lib/canvas.js'

export const run = {
   async: async (m, {
      client,
      body,
      users,
      prefixes,
      Utils,
      isPrem,
      Scraper
   }) => {
      try {
         client.faceswap = client?.faceswap || {}
         if (m.quoted && (m.quoted.sender != client.decodeJid(client.user.id) && m.quoted.sender != client.decodeJid(client.user.lid))) return
         if (m.quoted && /cancelswap/i.test(m.quoted.text)) {
            if (!(m.sender in client.faceswap) && /cancelswap/i.test(m.quoted.text)) return client.reply(m.chat, Utils.texted('bold', `❌ You don't have a face swap process session.`), m)
            const fn = client.faceswap[m.sender]
            if (fn.source_url && fn.target_url) return client.reply(m.chat, Utils.texted('bold', `❌ Wait, on process...`), m)
            const id = m.quoted?.text?.split(':')?.[2]?.trim()
            if (fn.id !== id) return client.reply(m.chat, Utils.texted('bold', `❌ Not your process.`), m)
            if (!/image\/(jpe?g|png)/.test(m.msg?.mimetype)) return client.reply(m.chat, Utils.texted('bold', `❌ Only for images.`), m)
            const buffer = await m.download()
            client.sendReact(m.chat, '🕒', m.key)
            const cdn = await Scraper.uploadImageV2(buffer)
            if (!cdn.status) return client.reply(m.chat, Utils.texted('bold', `❌ Fail. Try again!`), m)
            if (!fn.source_url) {
               fn.source_url = cdn.data.url
               let pr = `[${!fn.source_url ? 1 : 2} / 2] : Upload photo ${!fn.source_url ? 'source' : 'target'} by replying to this message.\n`
               pr += `Send *${prefixes[0]}cancelswap* to cancel process.\n\n`
               pr += `ID : ${fn.id}`
               m.reply(pr)
            } else {
               fn.target_url = cdn.data.url
               const json = await Api.neoxr('/faceswap', {
                  source: fn.source_url,
                  target: fn.target_url
               })
               if (!json.status) return client.reply(m.chat, Utils.texted('bold', `❌ ${json.msg}`), m).then(() => {
                  delete client.faceswap[m.sender]
               })

               if (isPrem) return client.sendFile(m.chat, json.data.url, '', '', m).then(() => {
                  delete client.faceswap[m.sender]
               })

               const image = await Utils.fetchAsBuffer(json.data.url)
               const output = await watermark(
                  image,
                  fs.readFileSync('./media/image/watermark.png')
               )
               client.sendFile(m.chat, output.buffer, '', '', m).then(() => {
                  delete client.faceswap[m.sender]
               })
            }
         }
      } catch (e) {
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false
}