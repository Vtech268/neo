import { imgkub } from '@neoxr/helper'

export const run = {
   usage: ['+product'],
   use: 'name | content',
   category: 'store',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      setting,
      Utils
   }) => {
      try {
         setting.product = setting.product ? setting.product : []
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, 'premium script | price 150k'), m)
         let [name, ...content] = text.split `|`
         content = (content || []).join `|`
         if (!name) return client.reply(m.chat, Utils.example(isPrefix, command, 'premium script | price 150k'), m)
         const exists = setting.product.some(v => v.name === name.toLowerCase())
         if (exists) return client.reply(m.chat, Utils.texted('bold', `🚩 Product already exist.`), m)
         var mediaUrl = ''
         let q = m.quoted ? m.quoted : m
         let mime = (q.msg || q).mimetype || ''
         if (/image\/(jpe?g|png)/.test(mime)) {
            let buffer = await q.download()
            if (!buffer) return client.reply(m.chat, global.status.wrong, m)
            let upload = await imgkub(buffer)
            var mediaUrl = upload.data.url
         }
         setting.product.push({
            name: name.trim(),
            mediaUrl: mediaUrl ? mediaUrl : false,
            content: (m.quoted && m.quoted.text) ? m.quoted.text.trim() : content.trim(),
            created_at: new Date * 1
         })
         client.reply(m.chat, Utils.texted('bold', `🚩 Product successfully added.`), m)
      } catch (e) {
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   owner: true
}