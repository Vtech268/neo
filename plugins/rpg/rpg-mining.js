import { emoticon } from '../../lib/games/rpg-utils.js'

export const run = {
   usage: ['mining'],
   category: 'rpg',
   async: async (m, {
      client,
      players,
      Utils
   }) => {
      try {
         const cooldown = 900000 // 15 minutes
         const timeout = new Date(players.last.mining + cooldown) - new Date()
         if (new Date - players.last.mining > cooldown) {
            const now = Date.now()
            const staminaCost = 5

            if (players.stamina < staminaCost) return m.reply(Utils.texted('bold', `❌ Stamina terlalu rendah untuk melakukan mining. Dibutuhkan minimal ${staminaCost} Stamina.`))

            const lucky = players.lucky || 0
            const luckyFactor = Math.min(lucky, 100)

            function getRandomLoot(baseMin, baseMax, multiplier, clampMin, clampMax) {
               const min = baseMin + Math.floor((luckyFactor / 100) * multiplier)
               const max = baseMax + Math.floor((luckyFactor / 100) * multiplier)
               const result = Math.floor(Math.random() * (max - min + 1)) + min
               if (clampMin != null && clampMax != null) {
                  return Math.max(clampMin, Math.min(result, clampMax))
               }
               return result
            }

            const chance = (percent) => Math.random() * 100 < percent

            const loot = {
               gold: getRandomLoot(1, 3, 10, 1, 20),
               diamond: chance(luckyFactor / 1.5) ? getRandomLoot(0, 2, 1) : 0,
               emerald: chance(luckyFactor / 2) ? getRandomLoot(0, 1, 1) : 0,
               rock: getRandomLoot(1, 5, 3),
               iron: chance(luckyFactor / 2.5) ? getRandomLoot(0, 2, 2) : 0,
               trash: chance(40) ? getRandomLoot(1, 3, 0) : 0
            }

            let result = []

            for (let key in loot) {
               const amount = loot[key]
               if (amount > 0) {
                  players.resource[key] = (players.resource[key] || 0) + amount
                  result.push(`${emoticon(key)} : +${amount} ${key}`)
               }
            }

            m.reply(`${result.length > 0 ? `${result.join('\n')?.trim()}` : '❌ Kamu tidak mendapatkan apapun.'}`).then(() => {
               players.stamina -= staminaCost
               players.last.mining = now
            })
         } else {
            const fn = Utils.readTime(timeout)
            const addZero = i => i < 10 ? '0' + i : i.toString()
            client.reply(m.chat, `❌ Tunggu *${(cooldown / 60) / 1000} menit* untuk mining selanjutnya, sisa waktu : ${addZero(fn.minutes)}:${addZero(fn.seconds)}`, m)
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