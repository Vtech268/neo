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
         let id = m.chat
         var reward = Utils.randomInt(Config.min_reward, Config.max_reward)
         client.letter = client.letter ? client.letter : {}
         if (m.quoted && (m.quoted.sender != client.decodeJid(client.user.id) && m.quoted.sender != client.decodeJid(client.user.lid))) return
         if (m.quoted && /letskip/i.test(m.quoted.text)) {
            if (!(id in client.letter) && /letskip/i.test(m.quoted.text)) return client.reply(m.chat, Utils.texted('bold', `🚩 Soal tersebut telah berakhir, silahkan kirim _${prefixes[0]}letter_ untuk mendapatkan soal baru.`), m)
            let letter = JSON.parse(JSON.stringify(client.letter[id][1]))
            if (body == client.letter[id][1].answer) {
               users.point += reward
               if (client.letter?.[id]?.[3]) clearTimeout(client.letter[id][3])
               delete client.letter[id]
               await client.sendSticker(m.chat, await Utils.fetchAsBuffer('./media/sticker/true.webp'), m, {
                  packname: setting.sk_pack,
                  author: setting.sk_author
               }).then(() => {
                  client.reply(m.chat, Utils.texted('bold', `+ ${Utils.formatNumber(reward)} Point`), m)
               })
            } else {
               if (--client.letter[id][2] == 0) {
                  if (client.letter?.[id]?.[3]) clearTimeout(client.letter[id][3])
                  await client.sendSticker(m.chat, await Utils.fetchAsBuffer('./media/sticker/false.webp'), m, {
                     packname: setting.sk_pack,
                     author: setting.sk_author
                  }).then(() => {
                     client.reply(m.chat, `🚩 _Permainan berakhir karena telah 3x menjawab salah, jawabannya adalah_ : *${client.letter[id][1].answer}*`, m)
                     delete client.letter[id]
                  })
               } else await client.sendSticker(m.chat, await Utils.fetchAsBuffer('./media/sticker/false.webp'), m, {
                  packname: setting.sk_pack,
                  author: setting.sk_author
               }) // client.reply(m.chat, Utils.texted('bold', `${client.letter[id][2]} chances to answer.`), m)}
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