import { imgkub } from '@neoxr/helper'

export const run = {
   usage: ['+response'],
   hidden: ['+res'],
   use: 'name | response',
   category: 'store',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      groupSet,
      Utils,
      Scraper
   }) => {
      try {
         groupSet.response = groupSet.response ? groupSet.response : []
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, 'name | response'), m)
         let [name, response] = text.split`|`
         if (!name || !response) return client.reply(m.chat, Utils.example(isPrefix, command, 'name | response'), m)
         const exists = groupSet.response.some(v => v._id === name.toLowerCase())
         if (exists) return client.reply(m.chat, Utils.texted('bold', `🚩 Response already exist.`), m)
         // if (response.length >= 250) return client.reply(m.chat, Utils.texted('bold', `🚩 Response text max. 250 chars.`), m)
         var mediaUrl = ''
         let q = m.quoted ? m.quoted : m
         let mime = (q.msg || q).mimetype || ''
         if (/video|image\/(jpe?g|png)/.test(mime)) {
            let buffer = await q.download()
            if (!buffer) return client.reply(m.chat, global.status.wrong, m)
            let upload = await imgkub(buffer)
            var mediaUrl = upload.data.url
         }
         groupSet.response.push({
            _id: name.toLowerCase().trim(),
            mediaUrl: mediaUrl ? mediaUrl : false,
            response: response.trim(),
            created_at: new Date * 1
         })
         client.reply(m.chat, Utils.texted('bold', `🚩 Response successfully added.`), m)
      } catch (e) {
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   owner: true,
   group: true
}