import Bet from '../../lib/games/bet.js'

export const run = {
   usage: ['bet'],
   hidden: ['judol'],
   use: 'amount',
   category: 'games',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      users,
      hostJid,
      clientJid,
      findJid,
      Utils
   }) => {
      client.bet = client?.bet || {}
      const room = m.chat
      const [options] = args
      if (!isNaN(options)) {
         if (!(room in client.bet)) {
            var game = client.bet[room] = new Bet(Utils.makeId(4), 30 * 1000)
         } else {
            var game = client.bet[room]
         }
         const player = `@${m.sender.replace(/@.+/, '')}`
         if (game.started) return m.reply(`❌ Permainan sedang berlangsung.`)
         if (player in game.bets) return m.reply(`❌ Kamu sudah menyimpan taruhan.`)
         if (users.pocket < options) return m.reply(`❌ Uang yang kamu miliki tidak cukup.`)
         users.pocket -= parseInt(options)
         const json = game.join(player, options)
         if (!json.status) return m.reply(`❌ ${json.msg}`)
         m.reply(`✅ ${json.msg}\n\n> Kirim *${isPrefix + command} start* untuk memulai (kamu bisa mengajak teman untuk bermain dengan menyimpan taruhan sebelum memulai).`)
      } else if (options === 'start') {
         if (!(room in client.bet)) return m.reply(`❌ Sesi permainan tidak tersedia.`)
         let user = hostJid ? global.db.users : findJid.bot(clientJid) ? findJid.bot(clientJid)?.data?.users : global.db.users
         const game = client.bet[room]
         const player = `@${m.sender.replace(/@.+/, '')}`
         if (game.started) return m.reply(`❌ Permainan sedang berlangsung.`)
         if (!(player in game.bets)) return m.reply(`❌ Kamu belum menyimpan taruhan.`)
         game.start(turnState => {
            if (turnState.result) {
               m.reply(turnState.result.msg?.trim()).then(() => {
                  if (turnState.result?.winner) user.find(v => v.jid?.match(/\d+/)[0] === turnState.result?.winner.match(/\d+/)[0]).pocket += parseInt(turnState.result?.reward || 0)
                  if (game.timer) clearTimeout(game.timer)
                  delete client.bet[room]
               })
            } else {
               if (game.players.length === 1) {
                  m.reply(turnState.msg).then(() => {
                     game.timeline = setTimeout(() => {
                        clearTimeout(game.timeline)
                        const end = game.endGame()
                        if (!end.status) return m.reply(`❌ ${json.msg}`).then(() => {
                           delete client.bet[room]
                        })
                        m.reply(`${end.msg}`).then(() => {
                           delete client.bet[room]
                        })
                     }, game.timeout)
                  })
               } else {
                  m.reply(turnState.msg)
               }
            }
         })
      } else m.reply(Utils.example(isPrefix, command, 500))
   },
   group: true,
   limit: true,
   game: true
}