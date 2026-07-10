export const run = {
   async: async (m, {
      client,
      body,
      users,
      prefixes,
      Utils
   }) => {
      try {
         var id = m.chat
         client.bet = client?.bet || {}
         if (m.quoted && (m.quoted.sender != client.decodeJid(client.user.id) && m.quoted.sender != client.decodeJid(client.user.lid))) return
         if (m.quoted && /taruhan/i.test(m.quoted.text)) {
            if (!(id in client.bet) && /taruhan/i.test(m.quoted.text)) return client.reply(m.chat, Utils.texted('bold', `🚩 Sesi tersebut telah berakhir, silahkan kirim _${prefixes[0]}bet <amount>_ untuk membuat sesi baru.`), m)
            const game = client.bet[id]
            const player = `@${m.sender.replace(/@.+/, '')}`
            if (!(player in game.bets)) return m.reply(`❌ Kamu bukan peserta/tidak sedang bermain game ini.`)
            const json = game.pick(player, body)
            console.log({ json })
            if (!json.status) return m.reply(`❌ ${json.msg}`)
            if (game.players.length === 1 && json?.final) {
               m.reply(json.msg).then(() => {
                  if (json?.winner) users.pocket += parseInt(json.reward)
                  if (game.timeline) clearTimeout(game.timeline)
                  if (game.timer) clearTimeout(game.timer)
                  delete client.bet[id]
               })
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