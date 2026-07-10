import { emoticon, USD } from '../../lib/games/rpg-utils.js'

export const run = {
   usage: ['daily'],
   category: 'rpg',
   async: async (m, {
      client,
      players,
      users,
      Utils
   }) => {
      try {
         const rewards = {
            exp: Utils.randomInt(100, 20),
            money: Utils.randomInt(100, 500),
            potion: Utils.randomInt(1, 20)
         }
         const cooldown = 86400000
         const timeout = new Date(players.last.daily + cooldown) - new Date()
         if (new Date - players.last.daily > cooldown) {
            let p = ''
            for (let reward of Object.keys(rewards)) {
               if (!(reward in players)) continue
               if (/potion/.test(reward)) {
                  players.resource[reward] += rewards[reward]
               } else if (/money/.test(reward)) {
                  users.pocket += rewards[reward]
               } else {
                  players[reward] += rewards[reward]
               }
               p += `${emoticon(reward)} : +${/money/.test(reward) ? USD.format(rewards[reward]) : Utils.formatter(rewards[reward])} ${reward}\n`
            }
            m.reply(p.trim()).then(() => players.last.daily = +new Date())
         } else {
            const fn = Utils.readTime(timeout)
            const addZero = i => i < 10 ? '0' + i : i.toString()
            client.reply(m.chat, `❌ Kamu sudah melakukan daily claim, silahkan tunggu *${fn.days} hari* lagi : *(${addZero(fn.hours)}:${addZero(fn.minutes)}:${addZero(fn.seconds)})*`, m)
         }
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   group: true,
   game: true
}