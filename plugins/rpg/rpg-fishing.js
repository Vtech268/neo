import { USD, emoticon, fishs } from '../../lib/games/rpg-utils.js'

export const run = {
   usage: ['fishing'],
   hidden: ['mancing'],
   category: 'rpg',
   async: async (m, {
      client,
      isPrefix,
      players,
      users,
      Utils
   }) => {
      try {
         client.fishing = client.fishing ? client.fishing : {}
         players.inventory ??= {}
         players.inventory.fishing ??= []
         const tools = players.tools.find(v => v.name === 'fishingrod')
         const material = {
            health: 5,
            tools: {
               durability: 1
            }
         }
         if (!tools) return m.reply(`⚠️ Kamu tidak mempunyai *Fishingrod* untuk Fishing (Memancing).\n\n> Kirim *${isPrefix}craft fishingrod* untuk mendapatkan Fishingrod.`)
         if (tools.durability < material.tools.durability) return m.reply(`⚠️ Fishingrod yang kamu miliki tidak mempunyai durability.\n\n> Kirim *${isPrefix}training fishingrod* untuk mendambah durability.`)
         if (players.health < material.health) return m.reply(`⚠️ Butuh *${material.health}* Healths.\n\n> Silahkan beli potion dengan mengirim *${isPrefix}buypotion <quantity>* dan *${isPrefix}heal <quantity>* untuk menggunakan potion.`)
         if (players.inventory.fishing.length < 1) players.inventory.fishing = fishs.item
         if (typeof client.fishing[m.sender] == 'undefined') client.fishing[m.sender] = {}
         if (typeof client.fishing[m.sender] != 'undefined' && client.fishing[m.sender].state) return m.reply(Utils.texted('bold', `🚩 Silahkan tunggu hasil tangkapan dari pancingan sebelumnya.`))
         const timer = 1000 * Utils.randomInt(1, 5)
         client.sendReact(m.chat, emoticon('fishingrod'), m.key).then(() => {
            client.fishing[m.sender].state = true
         })
         await Utils.delay(timer)
         const random_result = Utils.randomInt(1, 70)
         const random_fish = Utils.random(players.inventory.fishing)
         const final_result = Math.floor(random_result * (1 + players.lucky / 100) * (tools.durability / 100))
         let exp = final_result * 10
         if (/(hiu|lumba)/.test(random_fish.name)) {
            const percent = Number(10)
            const fined = parseInt(((percent / 100) * users.pocket).toFixed(0))
            let p = `乂  *F I S H I N G*\n\n`
            p += `Selamat, kamu berhasil menangkap *${Utils.ucword(random_fish.name)}* sebanyak *${random_result}* ekor.\n\n`
            p += `${random_fish.emoji.repeat(random_result)}\n\n`
            p += `Kamu di denda -${USD.format(fined)} [${percent}%] karena menangkap hewan yang dilindungi oleh pemerintah.`
            m.reply(p).then(() => {
               users.pocket -= fined
               random_fish.count += random_result
               client.fishing[m.sender].state = false
               tools.durability -= material.tools.durability
               players.health -= material.health
            })
         } else {
            let p = `乂  *F I S H I N G*\n\n`
            p += `Selamat, kamu berhasil menangkap *${Utils.ucword(random_fish.name)}* sebanyak *${random_result}* ekor.\n\n`
            p += `${random_fish.emoji.repeat(random_result)}\n\n`
            p += `Kamu bisa mendapatkan uang dengan menjual hasil tangkapan menggunakan perintah *${isPrefix}sell ${random_fish.name}*`
            m.reply(p).then(() => {
               random_fish.count += random_result
               client.fishing[m.sender].state = false
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