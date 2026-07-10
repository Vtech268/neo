import { USD } from '../../lib/games/rpg-utils.js'

export const run = {
   usage: ['buypotion'],
   use: 'quantity',
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
         if (!args || !args[0]) return m.reply(Utils.example(isPrefix, command, '1'))
         const [potion] = args
         const price = 2
         if (potion < 1) return m.reply(Utils.example(isPrefix, command, '1'))
         if (users.pocket < (price * (potion || 1))) return m.reply(`🚩 Uang yang kamu miliki tidak cukup untuk membeli *${(potion || 1)}* potion.`)
         m.reply(`✅ Berhasil membeli *${(potion || 1)}* potion dengan harga ${USD.format((price * (potion || 1)))}.`).then(() => {
            users.pocket -= (price * (potion || 1))
            players.resource.potion += parseInt(potion || 1)
         })
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   group: true,
   limit: true,
   game: true
}