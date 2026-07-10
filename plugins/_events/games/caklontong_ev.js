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
         client.caklontong = client.caklontong ? client.caklontong : {}
         if (m.quoted && (m.quoted.sender != client.decodeJid(client.user.id) && m.quoted.sender != client.decodeJid(client.user.lid))) return
         if (m.quoted && /cakskip/i.test(m.quoted.text)) {
            if (!(id in client.caklontong) && /cakskip/i.test(m.quoted.text)) return client.reply(m.chat, Utils.texted('bold', `🚩 Soal tersebut telah berakhir, silahkan kirim _${prefixes[0]}caklontong_ untuk mendapatkan soal baru.`), m)
            if (m.quoted.id == client.caklontong[id][0].key.id) {
               let json = JSON.parse(JSON.stringify(client.caklontong[id][1]))
               if (['Timeout', ''].includes(body)) return !0
               if (body.toLowerCase() == json.jawaban.toLowerCase()) {
                  await client.sendSticker(m.chat, await Utils.fetchAsBuffer('./media/sticker/true.webp'), m, {
                     packname: setting.sk_pack,
                     author: setting.sk_author
                  }).then(() => {
                     client.reply(m.chat, `*+ ${Utils.formatNumber(reward)} Point*`, m)
                     users.point += reward
                     if (client.caklontong?.[id]?.[2]) clearTimeout(client.caklontong[id][2])
                     delete client.caklontong[id]
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