export const run = {
   usage: ['heal'],
   use: 'quantity',
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
         if (!args || !args[0] || (args?.[0] && isNaN(args[0]))) return m.reply(Utils.example(isPrefix, command, 1))
         if (players.health >= 1000) return m.reply(`⚠️ Health full.`)
         const count = Math.max(1, Math.min(Number.MAX_SAFE_INTEGER, (isNumber(args[0]) && parseInt(args[0]) || Math.round((1000 - players.health) / 1)))) * 1
         if (players.resource.potion < count) return m.reply(`⚠️ Potion tidak cukup, kamu hanya mempunyai *${players.resource.potion}* potion.\n\n> Kirim *${isPrefix}buypotion <quantity>* untuk membeli potion.`)
         if (count > 1000) return m.reply(`⚠️ Maksimal 1000 potion.`)
         if ((count + players.health) > 1000) return m.reply(`⚠️ Penggunaan potion akan melebihi batas maksimal, heal ${1000 - players.health} saja.`)
         players.resource.potion -= parseInt(count)
         players.health += parseInt(count)
         m.reply(`✅ Berhasil menggunakan *${count}* potion.`)
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   group: true,
   limit: true,
   game: true
}

const isNumber = number => {
   if (!number) return number
   number = parseInt(number)
   return typeof number == 'number' && !isNaN(number)
}