import mime from 'mime-types'
import axios from 'axios'

export const run = {
   async: async (m, {
      client,
      body,
      setting,
      storage,
      Utils
   }) => {
      try {
         const files = storage?.find(v => body && v.name == body.toLowerCase())
         if (files) {
            let file = null
            if (files.url.includes('qu.ax')) {
               const fileUrl = (files.url.match(/\./g) || []).length === 1 ? `${files.url}.${mime.extension(files.mime)?.replace('jpeg', 'jpg')}` : files.url
               const { data } = await axios.get(fileUrl, {
                  responseType: 'arraybuffer',
                  headers: {
                     'Referer': 'https://qu.ax/'
                  }
               })

               file = Buffer.from(data)
            } else {
               file = files.url
            }

            if (/audio/.test(files.mime)) {
               client.sendFile(m.chat, file, files.filename, '', m, {
                  ptt: files.ptt
               })
            } else if (/webp/.test(files.mime)) {
               client.sendSticker(m.chat, file, m, {
                  packname: setting.sk_pack,
                  author: setting.sk_author
               })
            } else {
               client.sendFile(m.chat, file, files.filename, '', m)
            }
         }
      } catch (e) {
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   }
}