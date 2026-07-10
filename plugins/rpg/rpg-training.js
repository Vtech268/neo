import { USD, getTrainingCost, explain } from '../../lib/games/rpg-utils.js'

export const run = {
   usage: ['training'],
   use: 'item',
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
         if (!args || !args[0]) return m.reply(explain(isPrefix, command, 'Berikan nama item/alat yang ingin kamu training'))
         const tools = players.tools.find(v => v.name === args[0])
         if (!tools) return m.reply(`🚩 Kamu tidak mempunyai ${Utils.ucword(args[0])}, kirim *${isPrefix}craft ${args[0]}* untuk mendapatkannya.`)
         if (tools.durability >= 100) return m.reply(`🚩 Tidak bisa melakukan training, karena durability ${Utils.ucword(args[0])} yang kamu miliki telah mencapai batas maksimal.`)
         const { money, exp, durability } = getTrainingCost(args[0], tools.level)
         if (users.pocket < money) return m.reply(`🚩 Uang yang kamu miliki tidak cukup, biaya *${USD.format(money)}* untuk melakukan training ${Utils.ucword(args[0])}.\n\n> Kirim *${isPrefix}pocket* untuk cek isi dompet atau *${isPrefix}atm* untuk cek semua saldo tabungan.`)
         if (players.exp < exp) return m.reply(`🚩 Dibutuhkan ${Utils.formatter(exp)} EXP untuk melakukan training.`)
         users.pocket -= money
         players.exp -= exp
         tools.durability = tools.durability > 1
            ? (tools.durability + durability) >= 1000
               ? 1000
               : (tools.durability + durability)
            : durability
         m.reply(`✅ Durability ${Utils.ucword(args[0])} bertambah +${durability}%`)
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   group: true,
   limit: true,
   game: true
}