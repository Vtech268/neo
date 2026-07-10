import { emoticon, resources } from '../../lib/games/rpg-utils.js'

export const run = {
   usage: ['adventure'],
   hidden: ['adv'],
   category: 'rpg',
   async: async (m, {
      client,
      isPrefix,
      command,
      players,
      Utils
   }) => {
      try {
         const cooldown = 30000
         const timeout = new Date(players.last.adventure + cooldown) - new Date()
         if (new Date - players.last.adventure > cooldown) {
            if (players.health < 15) return m.reply(`⚠️ Butuh 15 Healths untuk Adventure.\n\n> Silahkan beli potion dengan mengirim *${isPrefix}buypotion <quantity>* dan *${isPrefix}heal <quantity>* untuk menggunakan potion.`)
            const rewards = resources(Utils, players.resource)
            let pr = '“Beberapa resource yang kamu dapatkan dari hasil Adventure” :\n\n'
            for (const item in rewards.reward) {
               const total = typeof rewards.reward[item] === 'object' ? Utils.random(rewards.reward[item]) : rewards.reward[item]
               if (item in players.resource) {
                  if (total) pr += `   ◦ ${emoticon(item)} +${total} ${Utils.ucword(item)}\n`
                  players.resource[item] += total
               } else if (item in players) {
                  if (total) pr += `   ◦ ${emoticon(item)} +${total} ${Utils.ucword(item)}\n`
                  players[item] += total
               }
            }
            pr += `\n> Kirim *${isPrefix}inventory* untuk melihat inventory.`
            m.reply(pr).then(v => {
               players.health -= 15
            })
            players.last.adventure = new Date * 1
         } else {
            const fn = Utils.readTime(timeout)
            const addZero = i => i < 10 ? '0' + i : i.toString()
            client.reply(m.chat, `❌ Tunggu *${addZero(fn.seconds)} detik* untuk Adventure selanjutnya.`, m)
         }
      } catch (e) {
         m.reply(Utils.jsonFormat(e))
      }
   },
   error: false,
   group: true,
   game: true
}