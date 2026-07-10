import fs from 'node:fs'
import { watermark } from '../../lib/canvas.js'

export const run = {
   usage: ['flux', 'bardimg'],
   use: 'prompt',
   category: 'ai',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      isPrem,
      Utils
   }) => {
      try {
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, 'yellow cat eat banana, sticker style'), m)
         client.sendReact(m.chat, '🕒', m.key)
         const endpoint = command === 'flux' ? '/flux' : '/bardimg'
         const json = await Api.neoxr(endpoint, { q: text })
         if (!json.status) return client.reply(m.chat, Utils.jsonFormat(json), m)
         let old = new Date()

         if (!isPrem) {
            const buffer = await Utils.fetchAsBuffer(json.data.url)
            const output = await watermark(buffer, fs.readFileSync('./media/image/watermark.png'))
            client.sendFile(m.chat, output.buffer, '', `🍟 *Process* : ${((new Date - old) * 1)} ms`, m)
         } else {
            client.sendFile(m.chat, json.data.url, '', `🍟 *Process* : ${((new Date - old) * 1)} ms`, m)
         }
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true
}