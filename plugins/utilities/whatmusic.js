import { crypty } from '@neoxr/helper'

export const run = {
   usage: ['whatmusic'],
   use: 'reply audio',
   category: 'utilities',
   async: async (m, {
      client,
      users,
      Utils,
      Config
   }) => {
      try {
         const q = m.quoted ? m.quoted : m
         const mime = (q.msg || q).mimetype || ''
         if (!mime) return client.reply(m.chat, Utils.texted('bold', `🚩 Reply audio.`), m)
         if (!/audio/.test(mime)) return client.reply(m.chat, Utils.texted('bold', `🚩 Only for audio.`), m)
         client.sendReact(m.chat, '🕒', m.key)
         const cdn = await crypty(await q.download())
         if (!cdn) return client.reply(m.chat, Utils.texted('bold', `🚩 ${cdn.msg}`), m)
         const json = await Api.neoxr('/whatmusic', {
            url: cdn.data.url
         })
         if (!json.status) return m.reply(Utils.jsonFormat(json))
         let note = ''
         for (const i in json.data) {
            if (i != 'links') note += `◦  *${Utils.ucword(i)}* : ${json.data[i]}\n`
         }
         note += '\n> Please wait, the audio is downloading ...'
         m.reply(note.trim()).then(async () => {
            const music = await Api.neoxr('/play', {
               q: json.data.title + ' - ' + json.data.artist
            })
            if (!music.status) return client.reply(m.chat, Utils.jsonFormat(music), m)
            const chSize = Utils.sizeLimit(music.data.size, users.premium ? Config.max_upload : Config.max_upload_free)
            const isOver = users.premium ? `💀 File size (${music.data.size}) exceeds the maximum limit.` : `⚠️ File size (${music.data.size}), you can only download files with a maximum size of ${Config.max_upload_free} MB and for premium users a maximum of ${Config.max_upload} MB.`
            if (chSize.oversize) return client.reply(m.chat, isOver, m)
            client.sendFile(m.chat, music.data.url, music.data.filename, '', m, {
               document: true,
               APIC: await Utils.fetchAsBuffer(music.thumbnail)
            }, {
               jpegThumbnail: await Utils.generateImageThumbnail(music.thumbnail)
            })
         })
      } catch (e) {
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true
}