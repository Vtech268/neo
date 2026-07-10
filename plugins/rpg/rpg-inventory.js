import { bar, emoticon, petsName, itemLvl } from '../../lib/games/rpg-utils.js'

export const run = {
   usage: ['inventory'],
   hidden: ['inv'],
   category: 'rpg',
   async: async (m, {
      client,
      isPrefix,
      players,
      Utils
   }) => {
      try {
         let pr = `乂  *I N V E N T O R Y*\n\n`
         pr += `Daftar items dalam inventory yang bisa kamu gunakan untuk menyelesaikan quest.\n\n`
         const itemsName = ['potion', 'trash', 'wood', 'rock', 'iron', 'string', 'emerald', 'diamond', 'gold', 'upgrader', 'pet', 'fish', 'bone', 'rat', 'fire', 'carrot', 'lettuce']
         let itemsIndex = 0
         for (let item in players.resource) {
            if (itemsName.includes(item)) {
               itemsIndex += 1
               if (!players.resource[item]) players.resource[item] = 0
               pr += `  ◦  ${emoticon(item)}  ${Utils.ucword(item)} : ${Utils.formatter(players.resource[item] || 0)}\n`
            }
         }
         pr += `\n`
         if (players?.pets?.length > 0) {
            pr += `Daftar Pet yang bisa kamu gunakan untuk mengikuti turnamen pet battle.\n\n`
            for (let pet of players.pets) {
               pr += `  ◦  ${emoticon(pet.type)}  ${Utils.ucword(pet.type)} (${petsName[pet.type][parseInt(pet.level)]} Lvl. ${pet.level})\n`
               pr += `     - Attack : ${pet.attack}\n`
               pr += `     - Defense : ${pet.defense}\n`
               pr += `     - Energy : ${bar(pet.energy, 100, 9)}\n\n`
            }
         }
         if (players?.tools?.length > 0) {
            pr += `Daftar Tools/Weapons yang bisa kamu gunakan untuk mengikuti fight club atau menyelesaikan quest.\n\n`
            for (let tool of players.tools) {
               pr += `  ◦  ${emoticon(tool.name)}  ${Utils.ucword(tool.name)} (${itemLvl[tool.name][tool.level]} Lvl. ${tool.level})\n`
               pr += `     - Level : ${tool.level}\n`
               pr += `     - Damage : ${tool.damage}\n`
               pr += `     - Durability : ${bar(tool.durability, 100, 12)}\n\n`
            }
         }
         pr += `> Kirim *${isPrefix}my* untuk melihat informasi profil dan *${isPrefix}collection* untuk melihat item yang bisa untuk dijual.`
         m.reply(pr.trim())
      } catch (e) {
         m.reply(Utils.jsonFormat(e))
      }
   },
   error: false,
   group: true,
   game: true
}