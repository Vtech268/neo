import { emoticon, USD } from '../../lib/games/rpg-utils.js'

export const run = {
   usage: ['monthly'],
   category: 'rpg',
   async: async (m, {
      client,
      players,
      users,
      Utils
   }) => {
      try {
         const rewards = {
            exp: Utils.randomInt(100, 20 * 30),
            balance: Utils.randomInt(100, 500 * 30),
            potion: Utils.randomInt(1, 20 * 30),
            mythic: Utils.randomInt(1, 3),
            legendary: 1
         }
         const cooldown = 2592000000
         const timeout = new Date(players.last.monthly + cooldown) - new Date()
         if (new Date - players.last.monthly > cooldown) {
            let p = ''
            for (let reward of Object.keys(rewards)) {
               if (!(reward in players)) continue
               if (/potion|mythic|legendary/.test(reward)) {
                  players.resource[reward] += rewards[reward]
               } else if (/money/.test(reward)) {
                  users.pocket += rewards[reward]
               } else {
                  players[reward] += rewards[reward]
               }
               p += `${emoticon(reward)} : +${/money/.test(reward) ? USD.format(rewards[reward]) : Utils.formatter(rewards[reward])} ${reward}\n`
            }
            m.reply(p.trim()).then(() => players.last.monthly = +new Date())
         } else {
            const fn = Utils.readTime(timeout)
            const addZero = i => i < 10 ? '0' + i : i.toString()
            client.reply(m.chat, `❌ Kamu sudah melakukan monthly claim, silahkan tunggu *${fn.days} hari* lagi : *(${addZero(fn.hours)}:${addZero(fn.minutes)}:${addZero(fn.seconds)})*`, m)
         }
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   group: true,
   game: true
}