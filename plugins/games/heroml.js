import { Converter } from '@neoxr/wb'

export const run = [{
   usage: ['heroml'],
   category: 'games',
   async: async (m, {
      client,
      isPrefix,
      store,
      Utils
   }) => {
      client.heroml = client.heroml ? client.heroml : {}
      let id = m.chat,
         timeout = 120000
      if (id in client.heroml) {
         return client.reply(m.chat, '*^ soal ini belum terjawab!*', client.heroml?.[id]?.[0])
      } else {
         let json = Utils.jsonRandom('./media/json/heroml.json')
         let teks = `乂  *H E R O - M L*\n\n`
         teks += `Siapa nama hero mobile legend dari suara ini ?\n\n`
         teks += `Timeout : [ *${((timeout / 1000) / 60)} menit* ]\n`
         teks += `Reply pesan ini untuk menjawab, kirim *${isPrefix}hrskip* untuk menghapus sesi.`
         client.heroml[id] = [
            await client.reply(m.chat, teks, m),
            json,
            setTimeout(async () => {
               const msg = await store.loadMessage(m.chat, client.heroml[id][0])
               if (client.heroml[id]) client.reply(m.chat, `*Waktu habis!*\nJawaban : *${json.name}*`, client.heroml[id][0])
               delete client.heroml[id]
            }, timeout)
         ]
         const audio = await Converter.toAudio(await Utils.fetchAsBuffer(Utils.random(json.audio)))
         await client.sendFile(m.chat, audio, '', '', m, {
            ptt: true
         })
      }
   },
   group: true,
   limit: true,
   game: true
}, {
   async: async (m, {
      client,
      body,
      users,
      prefixes,
      Config,
      setting,
      Utils
   }) => {
      try {
         const id = m.chat
         const reward = Utils.randomInt(Config.min_reward, Config.max_reward)
         client.heroml = client.heroml ? client.heroml : {}
         if (m.quoted && (m.quoted.sender != client.decodeJid(client.user.id) && m.quoted.sender != client.decodeJid(client.user.lid))) return
         if (m.quoted && /hrskip/i.test(m.quoted.text)) {
            if (!(id in client.heroml) && /hrskip/i.test(m.quoted.text)) return client.reply(m.chat, Utils.texted('bold', `🚩 Soal tersebut telah berakhir, silahkan kirim _${prefixes[0]}heroml_ untuk mendapatkan soal baru.`), m)
            if (m.quoted.id == client.heroml[id][0].key.id) {
               let json = JSON.parse(JSON.stringify(client.heroml[id][1]))
               if (['Timeout', ''].includes(body)) return !0
               if (body.toLowerCase() == json.name.toLowerCase()) {
                  await client.sendSticker(m.chat, await Utils.fetchAsBuffer('./media/sticker/true.webp'), m, {
                     packname: setting.sk_pack,
                     author: setting.sk_author
                  }).then(() => {
                     client.reply(m.chat, `*+ ${Utils.formatNumber(reward)} Point*`, m)
                     users.point += reward
                     clearTimeout(client.heroml[id][2])
                     delete client.heroml[id]
                  })
               } else {
                  if (users.point == 0) return client.sendSticker(m.chat, await Utils.fetchAsBuffer('./media/sticker/false.webp'), m, {
                     packname: setting.sk_pack,
                     author: setting.sk_author
                  })
                  users.point < reward ? users.point = 0 : users.point -= reward
                  await client.sendSticker(m.chat, await Utils.fetchAsBuffer('./media/sticker/false.webp'), m, {
                     packname: setting.sk_pack,
                     author: setting.sk_author
                  }).then(() => {
                     client.reply(m.chat, `*- ${Utils.formatNumber(reward)} Point*`, m)
                  })
               }
            }
         }
      } catch (e) {
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   group: true,
   game: true
}, {
   usage: ['hrskip'],
   async: async (m, {
      client,
      Utils
   }) => {
      const id = m.chat
      client.heroml = client.heroml ? client.heroml : {}
      if ((id in client.heroml)) return client.reply(m.chat, Utils.texted('bold', `🚩 Sesi permainan tebak heroml berhasil di hapus.`), m).then(() => {
         clearTimeout(client.heroml[id][2])
         delete client.heroml[id]
      })
   },
   group: true,
   limit: true,
   game: true
}]