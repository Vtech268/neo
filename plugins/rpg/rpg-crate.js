import { emoticon } from '../../lib/games/rpg-utils.js'

export const run = {
   usage: ['crate'],
   category: 'rpg',
   async: async (m, {
      isPrefix,
      players,
      Utils
   }) => {
      try {
         let pr = `乂  *C R A T E*\n\n`
         pr += `Daftar crate yang bisa kamu buka untuk mendapatkan item.\n\n`
         const itemsName = ['legendary', 'mythic', 'common', 'uncommon', 'superior']
         let itemsIndex = 0
         for (let item in players.resource) {
            if (itemsName.includes(item)) {
               itemsIndex += 1
               pr += `  ◦  ${emoticon(item)}  ${Utils.ucword(item)} : ${Utils.formatter(players.resource[item])}\n`
            }
         }
         pr += `\n> Kirim *${isPrefix}opencrate <crate name>* untuk membuka crate.`
         m.reply(pr.trim())
      } catch (e) {
         m.reply(Utils.jsonFormat(e))
      }
   },
   error: false,
   group: true,
   game: true
}