import Tournament from '../../lib/games/tournament.js'
import { USD, getStaminaCost } from '../../lib/games/rpg-utils.js'

export const run = {
   usage: ['tournament'],
   hidden: ['trm'],
   category: 'rpg',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      users,
      players,
      Utils
   }) => {
      try {
         client.tournament = client.tournament || {}
         const room = m.chat
         const [options] = args
         const required = ['exp', 'health', 'stamina', 'exp', 'agility', 'strength', 'defense', 'lucky']
         const cost = 1500

         if (options === 'create') {
            if (users.pocket < cost) return m.reply(Utils.texted('bold', `❌ Biayanya untuk mengikuti tournament sebesar ${USD.format(cost)}`))
            if (room in client.tournament) return client.reply(m.chat, `❌ Room sudah tersedia.\n\n> Kirim *${isPrefix + command} join* untuk masuk room.`, m)
            if (players.health < 1 || players.stamina < 1) return client.reply(m.chat, `❌ Tidak bisa membuat room karena tidak mempunyai Health & Stamina.\n\n> Kirim *${isPrefix}heal <amount>* untuk mengisi health dan kirim *${isPrefix}gym* untuk menambah stamina.`, m)
            if (!players.tools?.filter(v => v.durability > 0)?.length) return client.reply(m.chat, `❌ Kamu tidak mempunyai senjata untuk mengikuti tournament atau durabilty senjata yang kamu miliki tidak layak.\n\n> Kirim *${isPrefix}craft* untuk mendapatkan senjata.`, m)

            client.tournament[room] = {
               id: room,
               players: [{
                  jid: m.sender,
                  ...required.reduce((x, y) => {
                     if (players.hasOwnProperty(y)) x[y] = players[y]
                     return x
                  }, {}),
                  skills: players.tools.map(v => ({
                     name: v.name,
                     cost: getStaminaCost(v.name),
                     baseDamage: v.damage
                  }))
               }],
               game: null,
               running: false,
               interval: null,
               timeout: null
            }

            m.reply(`✅ Berhasil membuat room.\n\n> Tunggu hingga jumlah pemain lebih dari 1 kemudian kirim *${isPrefix + command} start* untuk memulai.`).then(() => users.pocket -= cost)
         } else if (options === 'join') {
            if (users.pocket < cost) return m.reply(Utils.texted('bold', `❌ Biayanya untuk mengikuti tournament sebesar ${USD.format(cost)}`))
            if (!(room in client.tournament)) return client.reply(m.chat, `❌ Room tidak tersedia.\n\n> Kirim *${isPrefix + command} create* untuk membuat room.`, m)
            const data = client.tournament[room]
            if (data.running) return client.reply(m.chat, `❌ Tidak bisa bergabung karena tournament sedang berlangsung.`, m)
            if (data.players.some(v => v.jid === m.sender)) return client.reply(m.chat, `❌ Kamu sudah berada didalam room.`, m)
            if (players.health < 1 || players.stamina < 1) return client.reply(m.chat, `❌ Tidak bisa mengikuti tournament karena tidak mempunyai Health & Stamina.\n\n> Kirim *${isPrefix}heal <amount>* untuk mengisi health dan kirim *${isPrefix}gym* untuk menambah stamina.`, m)
            if (!players.tools?.filter(v => v.durability > 0)?.length) return client.reply(m.chat, `❌ Kamu tidak mempunyai senjata untuk mengikuti tournament atau durabilty senjata yang kamu miliki tidak layak.\n\n> Kirim *${isPrefix}craft* untuk mendapatkan senjata.`, m)

            data.players.push({
               jid: m.sender,
               ...required.reduce((x, y) => {
                  if (players.hasOwnProperty(y)) x[y] = players[y]
                  return x
               }, {}),
               skills: players.tools.map(v => ({
                  name: v.name,
                  cost: getStaminaCost(v.name),
                  baseDamage: v.damage
               }))
            })

            m.reply(`✅ Berhasil join Tournament.\n\n> Tunggu hingga jumlah pemain lebih dari 1 kemudian kirim *${isPrefix + command} start* untuk memulai.`).then(() => users.pocket -= cost)
         } else if (options === 'start') {
            if (!(room in client.tournament)) return client.reply(m.chat, `❌ Tidak ada tournament yang ditemukan.`, m)

            const data = client.tournament[room]
            if (data.running) return client.reply(m.chat, `❌ Tournament sudah dimulai.`, m)
            if (!data.players.some(v => v.jid === m.sender)) return client.reply(m.chat, `❌ Kamu bukan peserta tournament ini.`, m)
            if (data.players.length < 2) return client.reply(m.chat, `❌ Minimal 2 pemain untuk memulai tournament.`, m)

            let caption = `乂  *T O U R N A M E N T*\n\n`
            caption += `Permainan telah di mulai dengan peserta :\n\n`
            data.players.forEach((v, i) => {
               const skill = global.db.players.find(x => x.jid === v.jid).tools
               caption += `*${i + 1}.* @${v.jid.replace(/@.+/, '')}\n`
               caption += `  ▦ Health : ${v.health}%\n`
               caption += `  ▦ Stamina : ${v.stamina}\n`
               caption += `  ▦ Skills : ${skill?.map((_, x) => x + 1)?.join(', ')}\n\n`
            })

            data.game = new Tournament(room, data.players)
            const game = data?.game
            game.setAutoMode(false)
            game.running = true
            data.running = true

            game.startTurn(v => {
               if (v.status && v.jid) {
                  caption += `〄 ${game.log?.slice(-1)}.\n\n`
                  caption += `> Kirim *${isPrefix}attack <no target>.<skill>* untuk melakukan serangan.`
               }
            })

            const onTurn = v => {
               if (!v.status && v.winner) return client.reply(m.chat, `Hasil pertandingan draw!`, m).then(() => {
                  delete client.tournament[room]
                  if (game.ended && data.interval) {
                     clearInterval(data.interval)
                     delete data.interval
                  }
               })

               if (v.status && v.jid) {
                  let caption = `乂  *T O U R N A M E N T*\n\n`
                  caption += `Permainan telah di mulai dengan jumlah peserta sebanyak *${data.players.length}* orang :\n\n`
                  data.players.forEach((v, i) => {
                     const skill = global.db.players.find(x => x.jid === v.jid).tools
                     caption += `*${i + 1}.* @${v.jid.replace(/@.+/, '')}\n`
                     caption += `  ▦ Health : ${v.health}%\n`
                     caption += `  ▦ Stamina : ${v.stamina}\n`
                     caption += `  ▦ Skills : ${skill?.map((_, x) => x + 1)?.join(', ')}\n\n`
                  })
                  caption += `〄 ${game.log?.slice(-2)?.join(', ')}\n\n`
                  caption += `> Kirim *${isPrefix}attack <no target>.<skill>* untuk melakukan serangan.`
                  return m.reply(caption)
               }
            }

            data.interval = setInterval(() => {
               game.startTurn(onTurn)
            }, game.TURN_TIMEOUT)

            m.reply(caption)
         } else if (options === 'exit') {
            if (!(room in client.tournament)) return client.reply(m.chat, `❌ Tidak ada tournament yang ditemukan.`, m)

            const data = client.tournament[room]
            if (data.running) return client.reply(m.chat, `❌ Tidak bisa keluar room karerna tournament sudah dimulai.`, m)
            if (!data.players.some(v => v.jid === m.sender)) return client.reply(m.chat, `❌ Kamu bukan peserta tournament ini.`, m)
            Utils.removeItem(data.players, data.players.find(v => v.jid === m.sender))
            m.reply('✅ Berhasil keluar room.')
         } else if (options === 'player') {
            if (!(room in client.tournament)) return client.reply(m.chat, `❌ Tidak ada tournament yang ditemukan.`, m)

            const data = client.tournament[room]
            if (!data.players?.length) return client.reply(m.chat, `🚩 Tidak ada peserta didalam room.`, m)

            let caption = `乂  *T O U R N A M E N T*\n\n`
            caption += `Berikut adalah peserta yang sudah ada di dalam room :\n\n`
            data.players.forEach((v, i) => {
               const skill = global.db.players.find(x => x.jid === v.jid).tools
               caption += `*${i + 1}.* @${v.jid.replace(/@.+/, '')}\n`
               caption += `  ▦ Health : ${v.health}%\n`
               caption += `  ▦ Stamina : ${v.stamina}\n`
               caption += `  ▦ Skills : ${skill?.map((_, x) => x + 1)?.join(', ')}\n\n`
            })
            caption += `> Kirim *${isPrefix + command}* start untuk memulai permainan.`
            m.reply(caption)
         } else m.reply(explain(isPrefix, command))
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   group: true,
   game: true
}

const explain = (prefix, command) => {
   return `乂  *T O U R N A M E N T*

“Game Tournament ini adalah pertandingan adu kekuatan antar pemain dimana kemenangan tergantung pada Agility, Defense, Lucky dan lainnya, berikut adalah perintah yang bisa digunakan :”

 ◦ *${prefix + command} create* -- Perintah untuk membuat room.

 ◦ *${prefix + command} join* -- Perintah untuk masuk kedalam room.

 ◦ *${prefix + command} player* -- Perintah untuk menampilkan peserta yang ada di dalam room.

 ◦ *${prefix + command} exit* -- Perintah untuk keluar dari room.
   
${global.footer}`
}
