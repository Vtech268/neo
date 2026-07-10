import { USD, emoticon, foodsPet } from '../../lib/games/rpg-utils.js'

export const run = {
   usage: ['foodshop'],
   category: 'rpg',
   async: async (m, {
      client,
      isPrefix,
      Utils
   }) => {
      try {
         let text = `乂  *F O O D S H O P*\n\n`
         text += `Daftar makanan Pet (Hewan Peliharaan) yang bisa kamu beli untuk meningkatkan energy.\n\n`
         for (let v of foodsPet) {
            text += `  ◦  ${emoticon(v.name)}  ${Utils.ucword(v.name)}\n`
            text += `     - Price : ${USD.format(v.price)}\n`
            text += `     - Energy : +25\n`
            text += `     - For Pet : ${Utils.ucword(v.for)}\n\n`
         }
         text += `> Kirim *${isPrefix}buyfood <name> <quantity>* untuk membeli dan *${isPrefix}feed <pet>* untuk memberi makan Pet.`
         m.reply(text)
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   group: true,
   game: true,
   limit: true
}