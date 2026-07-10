import { bar, USD, emoticon, petsList, petsName } from '../../lib/games/rpg-utils.js'

export const run = {
   usage: ['petshop'],
   category: 'rpg',
   async: async (m, {
      client,
      isPrefix,
      Utils
   }) => {
      try {
         let pr = `乂  *P E T S H O P*\n\n`
         pr += `Daftar harga 5 hewan peliharaan yang bisa kamu beli untuk mengikuti pet battle.\n\n`
         for (let v of petsList) {
            pr += `  ◦  ${emoticon(v.type)}  ${Utils.ucword(v.type)} (${petsName[v.type][parseInt(v.level)]})\n`
            pr += `     - Price : ${USD.format(v.price)}\n`
            pr += `     - Attack : ${v.attack}\n`
            pr += `     - Defense : ${v.defense}\n`
            pr += `     - Energy : ${bar(v.energy, 100, 9)}\n\n`
         }
         pr += `> Kirim *${isPrefix}buypet <name>* untuk membeli hewan peliharaan.`
         m.reply(pr)
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   group: true,
   game: true
}