export const run = [{
   usage: ['whatanime'],
   category: 'games',
   async: async (m, {
      client,
      isPrefix,
      store,
      Utils,
      Scraper
   }) => {
      client.whatanime = client.whatanime ? client.whatanime : {}
      let id = m.chat,
         timeout = 120000
      if (id in client.whatanime) {
         return client.reply(m.chat, '*^ soal ini belum terjawab!*', client.whatanime?.[id]?.[0])
      } else {
         m.react('🕒')
         const json = await Scraper.myAnimeList()
         if (!json.status) return client.reply(m.chat, Utils.texted('bold', `🚩 ${json.msg}`), m)
         let teks = `乂  *W H A T A N I M E*\n\n`
         teks += `Siapa nama karakter anime ini ?\n\n`
         teks += `Timeout : [ *${((timeout / 1000) / 60)} menit* ]\n`
         teks += `Reply pesan ini untuk menjawab, kirim *${isPrefix}waclue* untuk bantuan dan kirim *${isPrefix}waskip* untuk menghapus sesi.`
         client.whatanime[id] = [
            await client.sendFile(m.chat, json.data.image, 'image.jpg', teks, m),
            json,
            setTimeout(async () => {
               const msg = await store.loadMessage(m.chat, client.whatanime[id][0])
               if (client.whatanime[id]) client.reply(m.chat, `*Waktu habis!*\nJawaban : *${json.data.name}*`, client.whatanime[id][0])
               delete client.whatanime[id]
            }, timeout)
         ]
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
         client.whatanime = client.whatanime ? client.whatanime : {}
         if (m.quoted && (m.quoted.sender != client.decodeJid(client.user.id) && m.quoted.sender != client.decodeJid(client.user.lid))) return
         if (m.quoted && /waskip/i.test(m.quoted.text)) {
            if (!(id in client.whatanime) && /waskip/i.test(m.quoted.text)) return client.reply(m.chat, Utils.texted('bold', `🚩 Soal tersebut telah berakhir, silahkan kirim _${prefixes[0]}whatanime_ untuk mendapatkan soal baru.`), m)
            if (m.quoted.id == client.whatanime[id][0].key.id) {
               let json = JSON.parse(JSON.stringify(client.whatanime[id][1]))
               if (['Timeout', ''].includes(body)) return !0
               if (body.toLowerCase() == json.data.name.toLowerCase()) {
                  await client.sendSticker(m.chat, await Utils.fetchAsBuffer('./media/sticker/true.webp'), m, {
                     packname: setting.sk_pack,
                     author: setting.sk_author
                  }).then(() => {
                     client.reply(m.chat, `*+ ${Utils.formatNumber(reward)} Point*`, m)
                     users.point += reward
                     clearTimeout(client.whatanime[id][2])
                     delete client.whatanime[id]
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
   usage: ['waskip'],
   async: async (m, {
      client,
      Utils
   }) => {
      const id = m.chat
      client.whatanime = client.whatanime ? client.whatanime : {}
      if ((id in client.whatanime)) return client.reply(m.chat, Utils.texted('bold', `🚩 Sesi permainan whatanime berhasil di hapus.`), m).then(() => {
         clearTimeout(client.whatanime[id][2])
         delete client.whatanime[id]
      })
   },
   group: true,
   limit: true,
   game: true
}, {
   usage: ['waclue'],
   async: async (m, {
      client
   }) => {
      const id = m.chat
      client.whatanime = client.whatanime ? client.whatanime : {}
      if ((id in client.whatanime)) {
         const clue = client.whatanime[id][1].data.name.replace(/[bcdfghjklmnpqrstvwxyz]/g, '_')
         client.reply(m.chat, '🚩 Clue : ```' + clue + '``` ~ (Anime: *' +  client.whatanime[id][1].data.anime + '*)', m)
      }
   },
   group: true,
   limit: true,
   game: true
}]