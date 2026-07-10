import sharp from 'sharp'
import axios from 'axios'

export const run = {
   usage: ['ytpost'],
   use: 'link',
   category: 'downloader',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      setting: exif,
      Utils
   }) => {
      try {
         if (!args || !args[0]) return client.reply(m.chat, Utils.example(isPrefix, command, 'http://youtube.com/post/UgkxgtfViWZ8FVDe3YOiLfJ6sz7Nj9Im8ffd?si=vMECIAo-WJd9i41x'), m)
         if (!/channel|post/.test(args[0])) return client.reply(m.chat, global.status.invalid, m)
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.neoxr('/ytpost', {
            url: args[0]
         })
         if (!json.status) return client.reply(m.chat, Utils.jsonFormat(json), m)
         for (let v of json.data.medias) {
            const headers = await (await axios.get(v.url)).headers
            if (headers['content-type'] === 'image/gif') {
               const buffer = await Utils.fetchAsBuffer(v.url)
               client.sendSticker(m.chat, buffer, m, {
                  packname: exif.sk_pack,
                  author: exif.sk_author
               })
            } else {
               const jpg = await toJpg(await Utils.fetchAsBuffer(v.url))
               if (jpg) {
                  let caption = `乂  *Y T - P O S T*\n\n`
                  caption += `	◦  *ID* : ${json.data.postId}\n`
                  caption += `	◦  *Author* : ${json.data.author.name} (${json.data.author.username})\n`
                  caption += `	◦  *Publish* : ${json.data.published}\n`
                  caption += `	◦  *Type* : ${json.data.type}\n`
                  caption += `	◦  *Caption* : ${json.data.caption}\n\n`
                  caption += global.footer
                  client.sendFile(m.chat, jpg, '', caption, m)
                  await Utils.delay(1100)
               }
            }
         }
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true
}

const toJpg = async buffer => {
   try {
      const jpgBuffer = await sharp(buffer)
         .jpeg()
         .toBuffer()
      return jpgBuffer
   } catch {
      return null
   }
}