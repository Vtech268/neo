import { USD, trainPlayer } from '../../lib/games/rpg-utils.js'

export const run = {
   usage: ['gym'],
   category: 'rpg',
   async: async (m, {
      client,
      players,
      users,
      Utils
   }) => {
      try {
         const cost = 50
         if (users.pocket < cost) return m.reply(Utils.texted('bold', `❌ Kamu tidak punya uang untuk melakukan GYM, 1x GYM biayanya sebesar ${USD.format(cost)}`))
         const result = trainPlayer(1)
         if (!result) return m.reply(Utils.texted('bold', '❌ Error'))
         const cooldown = 300000
         if (typeof players?.last?.gym === 'undefined') players.last.gym = 0
         const timeout = new Date(players.last.gym + cooldown) - new Date()
         if (new Date - players.last.gym > cooldown) {
            m.react('💪🏻')
            players.last.gym = +new Date()
            users.pocket -= cost
            await Utils.delay(3000)
            let text = `Hasil dari melakukan GYM :\n\n`
            text += `   〄 +${result.agility} Agility\n`
            text += `   〄 +${result.strength} Strength\n`
            text += `   〄 +${result.stamina} Stamina\n\n`
            text += `> Tunggu 5 menit untuk melakukannya kembali.`
            m.reply(text).then(() => {
               players.agility += result.agility
               players.strength += result.strength
               players.stamina += result.stamina
            })
         } else {
            const fn = Utils.readTime(timeout)
            const addZero = i => i < 10 ? '0' + i : i.toString()
            client.reply(m.chat, `❌ Silahkan tunggu *${fn.minutes} menit* lagi : *(${addZero(fn.minutes)}:${addZero(fn.seconds)})*`, m)
         }
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   group: true,
   limit: true,
   game: true
}