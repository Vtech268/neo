import { USD, fishs, vegetas, animals } from '../../lib/games/rpg-utils.js'

export const run = {
   usage: ['sellall'],
   category: 'rpg',
   async: async (m, {
      client,
      users,
      players,
      Utils
   }) => {
      try {
         players.inventory.fishing = players?.inventory?.fishing || []
         players.inventory.farming = players?.inventory?.farming || []
         players.inventory.hunting = players?.inventory?.hunting || []
         if (players.inventory.fishing.length < 1 && players.inventory.farming.length < 1 && players.inventory.hunting.length < 1) return m.reply(Utils.texted('bold', `🚩 Maaf, kamu tidak mempunyai item apapun di dalam collection inventory.`))

         let totalFish = []
         fishs.price.map(v => {
            const item = players.inventory.fishing.filter(x => x.count > 0).find(x => x.name == v.name)
            if (item) {
               totalFish.push({
                  ...item,
                  total: v.price * item.count
               })
               item.count = 0
            }
         })
         const isTotalFish = (totalFish.length > 0) ? totalFish.map(v => v.total).reduce((acc, cur) => acc + cur) : 0
         const isCountFish = (totalFish.length > 0) ? totalFish.map(v => v.count).reduce((acc, cur) => acc + cur) : 0

         let totalFarm = []
         vegetas.price.map(v => {
            const item = players.inventory.farming.filter(x => x.count > 0).find(x => x.name == v.name)
            if (item) {
               totalFarm.push({
                  ...item,
                  total: v.price * item.count
               })
               item.count = 0
            }
         })
         const isTotalFarm = (totalFarm.length > 0) ? totalFarm.map(v => v.total).reduce((acc, cur) => acc + cur) : 0
         const isCountFarm = (totalFarm.length > 0) ? totalFarm.map(v => v.count).reduce((acc, cur) => acc + cur) : 0

         let totalHunt = []
         animals.price.map(v => {
            const item = players.inventory.hunting.filter(x => x.count > 0).find(x => x.name == v.name)
            if (item) {
               totalHunt.push({
                  ...item,
                  total: v.price * item.count
               })
               item.count = 0
            }
         })
         const isTotalHunt = (totalHunt.length > 0) ? totalHunt.map(v => v.total).reduce((acc, cur) => acc + cur) : 0
         const isCountHunt = (totalHunt.length > 0) ? totalHunt.map(v => v.count).reduce((acc, cur) => acc + cur) : 0

         if (isTotalFish < 1 && isTotalFarm < 1 && isTotalHunt < 1) return m.reply(Utils.texted('bold', `🚩 Maaf, kamu tidak mempunyai item apapun untuk di jual.`))
         let text = `乂  *F A K T U R*\n\n`
         text += `“Faktur penjualan seluruh item yang kamu punya di dalam collection inventory.”\n\n`
         text += `+ ${Utils.Styles('Fishing')} :\n\n`
         text += (totalFish.length < 1) ? 'Item kosong' : totalFish.sort((a, b) => b.name - a.name).map((v, i) => `◦  [ ${v.emoji} ]  ${Utils.ucword(v.name)} : ${USD.format(v.total)}`).join('\n')
         text += `\n`
         text += `—\n`
         text += `Total : *${USD.format(isTotalFish)}*\n\n`
         text += `+ ${Utils.Styles('Farming')} :\n\n`
         text += (totalFarm.length < 1) ? 'Item kosong' : totalFarm.sort((a, b) => b.name - a.name).map((v, i) => `◦  [ ${v.emoji} ]  ${Utils.ucword(v.name)} : ${USD.format(v.total)}`).join('\n')
         text += `\n`
         text += `—\n`
         text += `Total : *${USD.format(isTotalFarm)}*\n\n`
         text += `+ ${Utils.Styles('Hunting')} :\n\n`
         text += (totalHunt.length < 1) ? 'Item kosong' : totalHunt.sort((a, b) => b.name - a.name).map((v, i) => `◦  [ ${v.emoji} ]  ${Utils.ucword(v.name)} : ${USD.format(v.total)}`).join('\n')
         text += `\n`
         text += `—\n`
         text += `Total : *${USD.format(isTotalHunt)}*\n\n`
         text += `✅ Berhasil menjual *${Utils.formatter(isCountFish + isCountFarm + isCountHunt)}* item dengan total : *${USD.format(Number(isTotalFish + isTotalFarm + isTotalHunt))}*`
         m.reply(text).then(() => users.pocket += Number(isTotalFish + isTotalFarm + isTotalHunt))
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   group: true
}