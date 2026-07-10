import { emoticon, tournament } from '../../lib/games/rpg-utils.js'

export const run = {
   async: async (m, {
      client,
      body,
      players,
      prefixes,
      hostJid,
      clientJid,
      findJid,
      Utils
   }) => {
      try {
         client.petbattle = client?.petbattle || {}
         let users = hostJid ? global.db.users : findJid.bot(clientJid) ? findJid.bot(clientJid)?.data?.users : global.db.users
         if (body && /conversation|extended/.test(m.mtype) && m.quoted && m.quoted.text && /Pet\sBattle\sID/.test(m.quoted.text)) {
            const id = m.quoted.text.split`ID :`[1].split`\n`[0].trim()
            if (!id) return
            if (!Object.values(client?.petbattle)?.some(v => v.id === id)) return client.reply(m.chat, Utils.texted('bold', `🚩 Sesi telah berakhir, silahkan kirim _${prefixes[0]}petbattle_ untuk membuat sesi baru.`), m)
            let room = null
            for (const jid in client.petbattle) {
               if (client.petbattle[jid]?.id === id) {
                  room = jid
                  break
               }
            }
            if (!room) return m.reply(`❌ Room tidak ditemukan.`)
            const json = client.petbattle[room]
            if (json.battle.some(v => v.jid === m.sender)) return m.reply(`❌ Kamu sudah memilih pet silahkan tunggu pemain lain.`)
            if (isNaN(body)) {
               var isPet = players.pets.find(v => v.type === body.toLowerCase())
            } else {
               var isPet = players.pets[body - 1]
            }
            if (!isPet) return m.reply(`❌ Pet tidak ditemukan.`)
            if (isPet.energy < 1) return m.reply(`🚩 Jenis pet yang kamu pilih tidak mempunyai energy.`)
            m.reply(`Kamu memilih ${emoticon(isPet.type)} dengan energy *${isPet.energy}%* untuk melakukan Battle.`)
            json.battle.push({
               jid: m.sender,
               ...isPet,
               ok: true
            })
            if (json.battle.filter(v => v.ok).length === json.players.length) {
               const WEIGHTS = {
                  money: 10,
                  exp: 30,
                  attack: 0.5,
                  defense: 0.3,
                  energy: 0.2
               }
               const battle = tournament(json.battle, WEIGHTS)
               let win = null
               for (const jid in battle.results) {
                  if (battle.results[jid].isWinner) {
                     win = {
                        id: jid,
                        ...battle.results[jid]
                     }
                     break
                  }
               }
               for (const jid in battle.results) {
                  let fn = battle.results[jid]
                  let user = users.find(v => v.jid === jid)
                  let player = global.db.players.find(v => v.jid === jid)
                  let pet = player.pets.find(v => v.type === fn.type)
                  if (pet.energy < fn.totalEnergyLost) {
                     pet.energy = 0
                  } else {
                     pet.energy -= fn.totalEnergyLost
                  }
                  if (fn.isWinner) {
                     player.petbattle.winner += 1
                  } else {
                     player.petbattle.lose += 1
                  }
                  user.pocket += parseInt(fn.money)
                  player.exp += parseInt(fn.exp)
               }
               client.reply(room, `Selamat @${win.id.replace(/@.+/, '')}! Kamu menang dengan pet ${emoticon(win.type)}, Win Rate : ${win.winningPercentage.toFixed(2)}%`, null, {
                  contextInfo: {
                     mentionedJid: json.players.map(v => v.jid)
                  }
               }).then(async () => {
                  delete client.petbattle[room]
               })
            }
         }
      } catch (e) {
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   private: true
}