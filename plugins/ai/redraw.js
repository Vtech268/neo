import fs from 'node:fs'
import { watermark } from '../../lib/canvas.js'

export const run = {
   usage: ['redraw'],
   hidden: ['rd'],
   use: 'reply media',
   category: 'ai',
   async: async (m, {
      client,
      Utils,
      isPrem,
      Scraper
   }) => {
      try {
         let old = new Date()
         if (m.quoted ? m.quoted.message : m.msg.viewOnce) {
            let type = m.quoted ? Object.keys(m.quoted.message)[0] : m.mtype
            let q = m.quoted ? m.quoted.message[type] : m.msg
            let img = await client.downloadMediaMessage(q)
            if (!/image/.test(type)) return client.reply(m.chat, Utils.texted('bold', `Stress ??`), m)
            client.sendReact(m.chat, '🕒', m.key)
            const srv = await Scraper.uploadImageV2(img)
            if (!srv.status) return m.reply(Utils.jsonFormat(srv))
            const json = await Api.neoxr('/perfect-drawing', {
               image: srv.data.url
            })
            if (!json.status) return m.reply(Utils.jsonFormat(json))
            let caption = `🍟 *Process* : ${((new Date - old) * 1)} ms`
            if (isPrem) return client.sendFile(m.chat, json.data.url, '', caption, m)
            const image = await Utils.fetchAsBuffer(json.data.url)
            const output = await watermark(
               image,
               fs.readFileSync('./media/image/watermark.png')
            )
            client.sendFile(m.chat, output.buffer, '', caption, m)
         } else {
            let q = m.quoted ? m.quoted : m
            let mime = (q.msg || q).mimetype || ''
            if (!/image\/(jpe?g|png)/.test(mime)) return client.reply(m.chat, Utils.texted('bold', `Stress ??`), m)
            let img = await q.download()
            if (!img) return client.reply(m.chat, global.status.wrong, m)
            client.sendReact(m.chat, '🕒', m.key)
            const srv = await Scraper.uploadImageV2(img)
            if (!srv.status) return m.reply(Utils.jsonFormat(srv))
            const json = await Api.neoxr('/perfect-drawing', {
               image: srv.data.url
            })
            if (!json.status) return m.reply(Utils.jsonFormat(json))
            let caption = `🍟 *Process* : ${((new Date - old) * 1)} ms`
            if (isPrem) return client.sendFile(m.chat, json.data.url, '', caption, m)
            const image = await Utils.fetchAsBuffer(json.data.url)
            const output = await watermark(
               image,
               fs.readFileSync('./media/image/watermark.png')
            )
            client.sendFile(m.chat, output.buffer, '', caption, m)
         }
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true,
   premium: true
}