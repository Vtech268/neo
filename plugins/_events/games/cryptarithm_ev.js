export const run = {
   async: async (m, {
      client,
      body,
      users,
      prefixes,
      setting,
      Config,
      Utils
   }) => {
      try {
         var id = m.chat
         var reward = Utils.randomInt(Config.min_reward, Config.max_reward)
         client.cryptarithm = client.cryptarithm ? client.cryptarithm : {}
         if (m.quoted && (m.quoted.sender != client.decodeJid(client.user.id) && m.quoted.sender != client.decodeJid(client.user.lid))) return
         if (m.quoted && /cryskip/i.test(m.quoted.text)) {
            if (!(id in client.cryptarithm) && /cryskip/i.test(m.quoted.text)) return client.reply(m.chat, Utils.texted('bold', `🚩 Soal tersebut telah berakhir, silahkan kirim _${prefixes[0]}cry_ untuk mendapatkan soal baru.`), m)
            if (body == client.cryptarithm[id][1]) {
               users.point += reward
               if (client.cryptarithm?.[id]?.[3]) clearTimeout(client.cryptarithm[id][3])
               delete client.cryptarithm[id]
               await client.sendSticker(m.chat, await Utils.fetchAsBuffer('./media/sticker/true.webp'), m, {
                  packname: setting.sk_pack,
                  author: setting.sk_author
               }).then(() => {
                  client.reply(m.chat, Utils.texted('bold', `+ ${Utils.formatNumber(reward)} Point`), m)
               })
            } else {
               if (--client.cryptarithm[id][2] == 0) {
                  if (client.cryptarithm?.[id]?.[3]) clearTimeout(client.cryptarithm[id][3])
                  await client.sendSticker(m.chat, await Utils.fetchAsBuffer('./media/sticker/false.webp'), m, {
                     packname: setting.sk_pack,
                     author: setting.sk_author
                  }).then(() => {
                     client.reply(m.chat, `🚩 _Permainan berkahir karena telah 3x menjawab salah, jawabannya adalah_ : *${client.cryptarithm[id][1]}*`, m).then(() => delete client.cryptarithm[id])
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
}