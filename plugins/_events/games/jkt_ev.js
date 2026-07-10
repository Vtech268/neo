export const run = {
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
         var id = m.chat
         var reward = Utils.randomInt(Config.min_reward, Config.max_reward)
         client.jkt = client.jkt ? client.jkt : {}
         if (m.quoted && (m.quoted.sender != client.decodeJid(client.user.id) && m.quoted.sender != client.decodeJid(client.user.lid))) return
         if (m.quoted && /jktskip/i.test(m.quoted.text)) {
            if (!(id in client.jkt) && /jktskip/i.test(m.quoted.text)) return client.reply(m.chat, Utils.texted('bold', `🚩 Soal tersebut telah berakhir, silahkan kirim _${prefixes[0]}jkt_ untuk mendapatkan soal baru.`), m)
            if (m.quoted.id == client.jkt[id][0].key.id) {
               let json = JSON.parse(JSON.stringify(client.jkt[id][1]))
               if (['Timeout', ''].includes(body)) return !0
               if (body.toLowerCase() == json.name.toLowerCase()) {
                  await client.sendSticker(m.chat, await Utils.fetchAsBuffer('./media/sticker/true.webp'), m, {
                     packname: setting.sk_pack,
                     author: setting.sk_author
                  }).then(() => {
                     client.reply(m.chat, `*+ ${Utils.formatNumber(reward)} Point*`, m)
                     users.point += reward
                     if (client.jkt?.[id]?.[2]) clearTimeout(client.jkt[id][2])
                     delete client.jkt[id]
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