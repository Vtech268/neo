import { explain, emoticon, durabilities, material } from '../../lib/games/rpg-utils.js'

export const run = {
   usage: ['craft'],
   category: 'rpg',
   async: async (m, {
      args,
      isPrefix,
      command,
      players,
      Utils
   }) => {
      try {
         if (!args || !args[0]) return m.reply(explain(isPrefix, command, 'Berikut adalah 9 item Tools/Weapons yang bisa kamu built'))
         if (!Object.keys(material).includes(args[0])) return m.reply(explain(isPrefix, command, 'Berikut adalah 9 item Tools/Weapons yang bisa kamu built'))
         const tools = players.tools.find(v => v.name === args[0])
         if (tools) return m.reply(`🚩 Kamu sudah mempunyai ${Utils.ucword(args[0])} silahkan cek *${isPrefix}inventory* atau lakukan upgrade dengan mengirim *${isPrefix}upgrade ${args[0]}*`)
         const howTo = `> Kirim *${isPrefix}adventure* untuk mendapatkan resource.`
         const need = material[args[0]]
         const resource = players.resource
         let lack = []
         for (let item in need) lack.push(resource[item] < need[item])
         if (lack.filter(v => v).length > 0) {
            let pr = `⚠️ Resource yang kamu miliki tidak cukup untuk mendapatkan ${Utils.ucword(args[0])} :\n\n`
            for (let item in need) {
               pr += `     ◦  ${emoticon(item)}  (${players.resource[item] > need[item] ? need[item] : players.resource[item]} / ${need[item]})  ${Utils.ucword(item)}\n`
            }
            pr += '\n' + howTo
            m.reply(pr)
            return
         }
         for (let item in need) {
            players.resource[item] -= need[item]
         }
         players.tools.push({
            name: args[0],
            damage: 120,
            durability: durabilities(1),
            level: 1
         })
         m.reply(`Selamat!, kamu berhasil mendapatkan ${emoticon(args[0])}`)
      } catch (e) {
         m.reply(Utils.jsonFormat(e))
      }
   },
   error: false,
   group: true,
   game: true
}