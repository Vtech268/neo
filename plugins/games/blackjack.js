import Blackjack from '../../lib/games/blackjack.js'
import { USD } from '../../lib/games/rpg-utils.js'

export const run = {
   usage: ['blackjack'],
   hidden: ['bj'],
   use: 'jumlah / start / hit / stand',
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
      client.blackjack = client?.blackjack || {}
      const room = m.chat
      const jid = m.sender
      const [options] = args

      const data = global.db
      const user_data = hostJid
         ? data.users
         : findJid.bot(clientJid)?.data?.users || data.users

      if (!isNaN(options) && options > 0) {
         if (!(room in client.blackjack)) {
            client.blackjack[room] = new Blackjack(Utils.makeId(4), 60000)
         }
         const game = client.blackjack[room]
         const amount = parseInt(options)
         if (users.pocket < amount) return m.reply(`❌ Saldo (Pocket) kamu tidak cukup.`)
         if (amount < 1000) return m.reply(`❌ Jumlah taruhan minimal ${USD.format(1000)}`)
         const res = game.join(jid, amount)
         if (!res.status) return m.reply(res.msg)
         users.pocket -= amount
         m.reply(`✅ Kamu bertaruh sebesar ${USD.format(amount)}. Ketik *${isPrefix + command} start* untuk mulai.`)

      } else if (options === 'start') {
         const game = client.blackjack[room]
         if (!game) return m.reply(`❌ Tidak ada sesi permainan. Ketik *${isPrefix + command} [jumlah]* untuk bertaruh.`)
         if (game.started) return
         if (!game.players.includes(jid)) return m.reply(`❌ Kamu tidak terdaftar dalam permainan ini.`)

         game.start()
         sendTurnMessage(client, room, game, m, isPrefix, command, user_data)

      } else if (options === 'hit') {
         const game = client.blackjack[room]
         if (!game || !game.started) return
         if (jid !== game.getCurrentPlayer()) return m.reply(`❌ Bukan giliranmu. Menunggu @${game.getCurrentPlayer().split('@')[0]}`, null, { mentions: [game.getCurrentPlayer()] })

         const res = game.hit(jid)
         if (res.status) {
            // await m.reply(`🃏 Kamu mengambil kartu: *${res.card.value}${res.card.suit}* (Total: ${res.score})`)
            sendTurnMessage(client, room, game, m, isPrefix, command, user_data)
         }

      } else if (options === 'stand') {
         const game = client.blackjack[room]
         if (!game || !game.started) return
         if (jid !== game.getCurrentPlayer()) return m.reply(`❌ Bukan giliranmu. Menunggu @${game.getCurrentPlayer().split('@')[0]}`, null, { mentions: [game.getCurrentPlayer()] })

         game.stand(jid)
         // await m.reply(`✅ Kamu memilih Stand (Berhenti).`)
         sendTurnMessage(client, room, game, m, isPrefix, command, user_data)

      } else {
         m.reply(info(isPrefix))
      }
   },
   group: true,
   game: true,
   limit: true
}

async function sendTurnMessage(client, room, game, m, isPrefix, command, user_data) {
   const currentPlayer = game.getCurrentPlayer()
   if (!currentPlayer) return finishGame(client, room, game, m, user_data)

   let txt = game.renderTable()
   txt += `\nGiliran: @${currentPlayer.split('@')[0]}\n`
   txt += `> Ketik *${isPrefix + command} hit* atau *${isPrefix + command} stand*`

   client.reply(room, txt, m, { mentions: game.players })
}

async function finishGame(client, room, game, m, user_data) {
   while (game.calculateScore(game.dealerHand) < 17) {
      game.dealerHand.push(game.deck.pop())
   }

   const dScore = game.calculateScore(game.dealerHand)
   let finalTxt = game.renderTable(true)
   finalTxt += `\n*HASIL AKHIR* :\n\n`

   for (let p of game.players) {
      const pScore = game.calculateScore(game.hands[p])
      const bet = game.bets[p]
      let reward = 0
      let resStr = ""

      if (pScore > 21) {
         resStr = "KALAH (Bust)"
      } else if (dScore > 21 || pScore > dScore) {
         resStr = "MENANG"
         reward = bet * 2
      } else if (pScore === dScore) {
         resStr = "SERI (Push)"
         reward = bet
      } else {
         resStr = "KALAH"
      }

      if (reward > 0) {
         const userDb = user_data.find(u => u.jid === p)
         if (userDb) userDb.pocket += reward
      }
      finalTxt += `▫ @${p.split('@')[0]} : ${resStr} ${reward > 0 ? `(+${USD.format(reward)})` : ''}\n`
   }

   client.reply(room, finalTxt.trim(), m, { mentions: game.players })
   delete client.blackjack[room]
}

const info = (prefix) => {
   return `乂  *B L A C K J A C K*

Tujuan permainan ini adalah mendapatkan total nilai kartu 21 atau mendekati 21 tanpa melebihi angka tersebut.

Command :
➠ *${prefix}bj <jumlah>* -- Pasang taruhan.
➠ *${prefix}bj start* -- Mulai main.
➠ *${prefix}bj hit* -- Tambah kartu.
➠ *${prefix}bj stand* -- Berhenti.`
}