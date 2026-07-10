import { USD, durabilities, getUpgradeCost, valueable, itemLvl, explain, emoticon, material } from '../../lib/games/rpg-utils.js'

export const run = {
   usage: ['upgrade'],
   use: 'item',
   category: 'rpg',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      players,
      users,
      Utils
   }) => {
      try {
         if (!args || !args[0]) return m.reply(explain(isPrefix, command, 'Berikan nama item/alat yang ingin kamu upgrade'))
         const tools = players.tools.find(v => v.name === args[0])
         if (!tools) return m.reply(`🚩 Kamu tidak mempunyai ${Utils.ucword(args[0])}, kirim *${isPrefix}craft ${args[0]}* untuk mendapatkannya.`)
         if (tools.level >= 12) return m.reply(`🚩 Tidak bisa melakukan upgrade, ${Utils.ucword(args[0])} yang kamu miliki telah mencapai level maksimal.`)
         const costs = getUpgradeCost(args[0], tools.level)
         if (users.pocket < costs) return m.reply(`🚩 Uang yang kamu miliki tidak cukup, biaya *${USD.format(costs)}* untuk melakukan upgrade ${Utils.ucword(args[0])}.\n\n> Kirim *${isPrefix}pocket* untuk cek isi dompet atau *${isPrefix}atm* untuk cek semua saldo tabungan.`)
         const howTo = `> Kirim *${isPrefix}adventure* untuk mendapatkan resource.`
         const need = material[args[0]]
         const resource = players.resource
         let lack = []
         for (let item in need) lack.push(resource[item] < valueable(need[item], tools.level))
         if (lack.filter(v => v).length > 0) {
            let pr = `⚠️ Resource yang kamu miliki tidak cukup untuk melakukan upgrade ${Utils.ucword(args[0])} :\n\n`
            for (let item in need) {
               pr += `  ◦  ${emoticon(item)}  (${resource[item] > valueable(need[item], tools.level) ? valueable(need[item], tools.level) : resource[item]} / ${valueable(need[item], tools.level)})  ${Utils.ucword(item)}\n`
            }
            pr += '\n' + howTo
            m.reply(pr)
            return
         }
         users.pocket -= costs
         for (let item in need) {
            resource[item] -= valueable(need[item], tools.level)
         }
         const durability = tools.durability > 1
            ? (tools.durability + durabilities(tools.level + 1)) >= 100
               ? 100
               : (tools.durability + durabilities(tools.level + 1))
            : durabilities(tools.level + 1)
         tools.damage += 11
         tools.durability = durability
         tools.level += 1
         m.reply(`✅ ${Utils.ucword(args[0])} berhasil di upgrade ke *Lvl. ${tools.level}* (${itemLvl[args[0]][tools.level]})`)
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   group: true,
   limit: true,
   game: true
}