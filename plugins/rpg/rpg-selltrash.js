import { USD } from '../../lib/games/rpg-utils.js'

export const run = {
   usage: ['selltrash'],
   category: 'rpg',
   async: async (m, {
      client,
      players,
      users,
      Utils
   }) => {
      try {
         if (!players?.resource?.trash) return m.reply(Utils.texted('bold', `🚩 Kamu tidak mempunyai sampah.`))
         const price = 1 * players.resource.trash
         m.reply(`✅ Sampah berhasil terjual dengan harga *${USD.format(price)}*.`).then(() => {
            users.pocket += Number(price)
            players.resource.trash = 0
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