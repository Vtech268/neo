import { foodsPet } from '../../lib/games/rpg-utils.js'

export const run = {
   usage: ['feed'],
   use: 'pet quantity',
   category: 'rpg',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      players,
      Utils
   }) => {
      try {
         if (!args || !args[0]) return m.reply(Utils.example(isPrefix, command, 'cat 2'))
         const pet = args[0].toLowerCase()
         const fn = players.pets.find(v => v.type === pet)
         if (!fn) return m.reply(`🚩 Kamu tidak mempunyai *${Utils.ucword(pet)}*.\n\n> Kirim *${isPrefix}buypet ${pet}* untuk membeli ${Utils.ucword(pet)}.`)
         if (fn.energy >= 100) return m.reply(`🚩 Energy *${Utils.ucword(pet)}* full.`)
         const cooldown = 300000 // 5 minutes
         if (typeof players?.last?.feeding === 'undefined') players.last.feeding = 0
         const timeout = new Date(players.last.feeding + cooldown) - new Date()
         if (new Date - players.last.feeding > cooldown) {
            var food = foodsPet.find(v => v.for === pet)
            if (players.resource[food.name] < 1) return m.reply(`🚩 Kamu tidak mempunyai *${Utils.ucword(food.name)}* untuk memberi makan *${Utils.ucword(pet)}*.\n\n> Kunjungi *${isPrefix}foodshop* untuk membeli ${Utils.ucword(food.name)}.`)
            if (players.resource[food.name] < parseInt(args[1] || 1)) return m.reply(`🚩 Jumlah *${Utils.ucword(food.name)}* yang kamu miliki kurang.\n\n> Kunjungi *${isPrefix}foodshop* untuk membeli ${Utils.ucword(food.name)}.`)
            m.reply(`✅ Berhasil memberi makan ${Utils.ucword(pet)}.`).then(() => {
               const energy = 25 * parseInt(args[1] || 1)
               fn.energy = fn.energy + energy > 100 ? 100 : parseInt(energy)
               players.last.feeding = +new Date
               players.resource[food.name] -= parseInt(args[1] || 1)
            })
         } else {
            const fn = Utils.readTime(timeout)
            const addZero = i => i < 10 ? '0' + i : i.toString()
            client.reply(m.chat, `❌ Tunggu *${(cooldown / 60) / 1000} menit* untuk feed ${Utils.ucword(pet)} berikutnya, sisa waktu : ${addZero(fn.minutes)} menit`, m)
         }
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   group: true,
   game: true,
   limit: true
}