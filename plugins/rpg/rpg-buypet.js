import { petsList } from '../../lib/games/rpg-utils.js'

export const run = {
   usage: ['buypet'],
   use: 'pet',
   category: 'rpg',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      players,
      users,
      Utils
   }) => {
      try {
         if (!args || !args[0]) return m.reply(Utils.example(isPrefix, command, 'cat'))
         const pet = args[0].toLowerCase()
         if (!petsList.map(v => v.type).includes(pet)) return m.reply(`🚩 ${Utils.ucword(pet)} tidak ada dalam daftar Pet.`)
         if (players.pets.find(v => v.type === pet)) return m.reply(`🚩 Kamu sudah memiliki *${Utils.ucword(pet)}*.`)
         const isPet = petsList.find(v => v.type === pet)
         if (users.pocket < isPet.price) return m.reply(`🚩 Uang yang kamu miliki tidak cukup untuk membeli *${Utils.ucword(pet)}*.`)
         m.reply(`✅ Selamat, sekarang kamu mempunyai *${Utils.ucword(args[0])}*.`).then(() => {
            players.pets.push(isPet)
            users.pocket -= Math.max(0, Number(isPet.price))
         })
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   group: true,
   game: true
}