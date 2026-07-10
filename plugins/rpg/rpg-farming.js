import { USD, emoticon, vegetas } from '../../lib/games/rpg-utils.js'

export const run = {
   usage: ['farming'],
   hidden: ['farm', 'bertani'],
   category: 'rpg',
   async: async (m, {
      client,
      isPrefix,
      players,
      users,
      Utils
   }) => {
      try {
         client.farming = client.farming ? client.farming : {}
         players.inventory ??= {}
         players.inventory.farming ??= []
         const tools = players.tools.find(v => v.name === 'pickaxe')
         const material = {
            health: 5,
            tools: {
               durability: 1
            }
         }
         if (!tools) return m.reply(`⚠️ Kamu tidak mempunyai *Pickaxe* untuk Farming (Bertani).\n\n> Kirim *${isPrefix}craft pickaxe* untuk mendapatkan Pickaxe.`)
         if (tools.durability < material.tools.durability) return m.reply(`⚠️ Pickaxe yang kamu miliki tidak mempunyai durability.\n\n> Kirim *${isPrefix}training pickaxe* untuk mendambah durability.`)
         if (players.health < material.health) return m.reply(`⚠️ Butuh *${material.health}* Healths.\n\n> Silahkan beli potion dengan mengirim *${isPrefix}buypotion <quantity>* dan *${isPrefix}heal <quantity>* untuk menggunakan potion.`)
         if (players.inventory.farming.length < 1) players.inventory.farming = vegetas.item
         if (typeof client.farming[m.sender] == 'undefined') client.farming[m.sender] = {}
         if (typeof client.farming[m.sender] != 'undefined' && client.farming[m.sender].state) return m.reply(Utils.texted('bold', `🚩 Saat ini kamu sedang bertani.`))
         const timer = 1000 * Utils.randomInt(1, 5)
         client.sendReact(m.chat, emoticon('pickaxe'), m.key).then(() => {
            client.farming[m.sender].state = true
         })
         await Utils.delay(timer)
         const random_result = Utils.randomInt(1, 70)
         const random_vegfruit = Utils.random(players.inventory.farming)
         const final_result = Math.floor(random_result * (1 + players.lucky / 100) * (tools.durability / 100))
         let exp = final_result * 10
         if (/(ganja)/.test(random_vegfruit.name)) {
            const percent = Number(10)
            const fined = parseInt(((percent / 100) * users.pocket).toFixed(0))
            let p = `乂  *F A R M I N G*\n\n`
            p += `Dari bertani kamu memanen *${Utils.ucword(random_vegfruit.name)}* sebanyak *${random_result}* buah.\n\n`
            p += `${random_vegfruit.emoji.repeat(random_result)}\n\n`
            p += `Kamu di denda -${USD.format(fined)} [${percent}%] karena menanam tanaman ilegal.`
            m.reply(p).then(() => {
               users.pocket -= fined
               random_vegfruit.count += random_result
               client.farming[m.sender].state = false
               tools.durability -= material.tools.durability
               players.health -= material.health
            })
         } else {
            let p = `乂  *F A R M I N G*\n\n`
            p += `Dari bertani kamu memanen *${Utils.ucword(random_vegfruit.name)}* sebanyak *${random_result}* buah.\n\n`
            p += `${random_vegfruit.emoji.repeat(random_result)}\n\n`
            p += `Kamu bisa mendapatkan uang dengan menjual hasil bertani menggunakan perintah *${isPrefix}sell ${random_vegfruit.name}*`
            m.reply(p).then(() => {
               random_vegfruit.count += random_result
               client.farming[m.sender].state = false
               tools.durability -= material.tools.durability
               players.health -= material.health
               players.exp += exp
            })
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