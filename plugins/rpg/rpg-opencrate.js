import { emoticon } from '../../lib/games/rpg-utils.js'

export const run = {
   usage: ['opencrate'],
   hidden: ['oc'],
   use: 'crate',
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
         if (!args || !args[0]) return m.reply(Utils.example(isPrefix, command, 'common 5'))

         const [crateName, total] = args
         const lootTable = {
            common: ['potion', 'wood', 'trash', 'rock'],
            uncommon: ['iron', 'string', 'bone', 'carrot'],
            mythic: ['gold', 'emerald', 'fish', 'fire'],
            legendary: ['diamond', 'thread', 'iron', 'gold'],
            superior: ['trash', 'potion', 'diamond', 'emerald', 'rat', 'bone']
         }

         const normalized = crateName.toLowerCase()
         const items = lootTable[normalized]

         if (!items) return m.reply(`❌ Crate tidak tersedia.`)

         if (total && isNaN(total)) return m.reply('❌ Jumlah harus angka.')

         if (!players.resource[normalized]) return m.reply(`❌ Kamu tidak mempunyai crate *${Utils.ucword(args[0])}*.`)
         if (players.resource[normalized] < total) return m.reply(`❌ Kamu tidak mempunyai *${total || 1}* crate *${Utils.ucword(args[0])}*.`)

         const rewardCount = (Math.floor(Math.random() * 3) + 1) * (total || 1)
         const obtained = {}

         for (let i = 0; i < rewardCount; i++) {
            const loot = items[Math.floor(Math.random() * items.length)]
            const amount = Math.floor(Math.random() * 20) + 1 * (total || 1)

            if (players.resource.hasOwnProperty(loot)) {
               players.resource[loot] += amount
            } else {
               players.resource[loot] = amount
            }

            if (obtained[loot]) {
               obtained[loot] += amount
            } else {
               obtained[loot] = amount
            }
         }

         const resultList = Object.entries(obtained)
            .map(([item, count]) => ` ${emoticon(item)} ${item} x${count}`)
            .join(', ')

         m.reply(`✅ Kamu membuka *${total || 1}* crate ${Utils.ucword(normalized)} dan mendapatkan : ${resultList}`).then(() => {
            players.resource[normalized] -= 1 * (total || 1)
         })
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   group: true,
   game: true
}