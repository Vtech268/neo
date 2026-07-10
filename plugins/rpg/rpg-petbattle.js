import { bar, emoticon, petsName } from '../../lib/games/rpg-utils.js'

export const run = {
   usage: ['petbattle'],
   hidden: ['pb'],
   category: 'rpg',
   async: async (m, {
      client,
      args,
      isPrefix,
      players,
      Utils,
   }) => {
      try {
         const room = m.chat
         const id = Utils.makeId(10)
         const pets = players.pets
         if (!args || !args[0]) {
            client.petbattle = client?.petbattle || {}
            if (pets.length < 1) return m.reply(`🚩 Kamu tidak mempunyai pet.\n\n> Kirim *${isPrefix}petshop* untuk membeli pet.`)
            if (pets.length > 0 && !pets.some(v => v.energy > 0)) return m.reply(`🚩 Semua pet yang kamu miliki tidak mempunyai energy.\n\n> Kirim *${isPrefix}feed <pet>* untuk menambah energy pet.`)
            if (room in client.petbattle) {
               if (client.petbattle[room].players.map(v => v.jid).includes(m.sender)) return m.reply(`🚩 Kamu sudah berada didalam sesi/room.`)
               client.petbattle[room].players.push({
                  jid: m.sender,
                  type: '',
                  attack: 0,
                  defense: 0,
                  energy: 0
               })
            } else {
               client.petbattle[room] = {
                  id,
                  players: [{
                     jid: m.sender,
                     type: '',
                     attack: 0,
                     defense: 0,
                     energy: 0
                  }],
                  battle: [],
                  start: false,
                  created_at: +new Date
               }
            }
            m.reply(`✅ Berhasil join ke sesi Pet Battle.\n\n> Tunggu hingga jumlah pemain lebih dari 1 kemudian kirim *${isPrefix}petbattle start* untuk memulai.`)
         } else if (args[0] === 'start') {
            if (!(room in client.petbattle)) return m.reply(`🚩 Sesi Pet Battle tidak tersedia.`)
            const sesi = client.petbattle[room]
            if (sesi.start) return m.reply(`🚩 Turnamen Pet Battle sudah dimulai.`)
            if (sesi.players.length < 2) return m.reply(`🚩 Untuk memulai jumlah pemain harus lebih dari 1.`)
            client.sendReact(m.chat, '🕒', m.key)
            sesi.start = true
            for (let player of sesi.players) {
               let pr = `Pet Battle ID : ${sesi.id}\n`
               pr += `Hi @${player.jid.replace(/@.+/g, '')}, silahkan pilih Pet mana yang ingin kamu gunakan untuk Battle :\n\n`
               let i = 0
               for (let pet of global.db.players.find(v => v.jid === player.jid).pets) {
                  i += 1
                  pr += `  *${i}.*  ${emoticon(pet.type)}  ${Utils.ucword(pet.type)} (${petsName[pet.type][parseInt(pet.level)]} Lvl. ${pet.level})\n`
                  pr += `     - Attack : ${pet.attack}\n`
                  pr += `     - Defense : ${pet.defense}\n`
                  pr += `     - Energy : ${bar(pet.energy, 100, 9)}\n\n`
               }
               pr += `> Reply/Quote pesan dengan nomor urut angka dari Pet.`
               client.reply(player.jid, pr)
               await Utils.delay(1700)
            }
            m.reply(`✅ Berhasil memulai sesi, silahkan pilih pet di personal chat.`)
         }
      } catch (e) {
         m.reply(Utils.jsonFormat(e))
      }
   },
   error: false,
   group: true,
   limit: true,
   game: true
}