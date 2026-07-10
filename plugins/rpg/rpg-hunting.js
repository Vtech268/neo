import { USD, emoticon, animals } from '../../lib/games/rpg-utils.js'

export const run = {
   usage: ['hunting'],
   hidden: ['hunt', 'berburu'],
   category: 'rpg',
   async: async (m, {
      client,
      isPrefix,
      players,
      users,
      Utils
   }) => {
      try {
         client.hunting = client.hunting ? client.hunting : {}
         players.inventory ??= {}
         players.inventory.hunting ??= []
         const tools = players.tools.find(v => v.name === 'knife')
         const material = {
            health: 5,
            tools: {
               durability: 1
            }
         }
         if (!tools) return m.reply(`⚠️ Kamu tidak mempunyai *Knife* untuk Hunting (Berburu).\n\n> Kirim *${isPrefix}craft knife* untuk mendapatkan Knife.`)
         if (tools.durability < material.tools.durability) return m.reply(`⚠️ Knife yang kamu miliki tidak mempunyai durability.\n\n> Kirim *${isPrefix}training knife* untuk mendambah durability.`)
         if (players.health < material.health) return m.reply(`⚠️ Butuh *${material.health}* Healths.\n\n> Silahkan beli potion dengan mengirim *${isPrefix}buypotion <quantity>* dan *${isPrefix}heal <quantity>* untuk menggunakan potion.`)
         if (players.inventory.hunting.length < 1) players.inventory.hunting = animals.item
         if (typeof client.hunting[m.sender] == 'undefined') client.hunting[m.sender] = {}
         if (typeof client.hunting[m.sender] != 'undefined' && client.hunting[m.sender].state) return m.reply(Utils.texted('bold', `🚩 Silahkan tunggu hasil tangkapan dari pancingan sebelumnya.`))
         const timer = 1000 * Utils.randomInt(1, 5)
         client.sendReact(m.chat, emoticon('sword'), m.key).then(() => {
            client.hunting[m.sender].state = true
         })
         await Utils.delay(timer)
         const random_result = Utils.randomInt(1, 70)
         const random_animal = Utils.random(players.inventory.hunting)
         const final_result = Math.floor(random_result * (1 + players.lucky / 100) * (tools.durability / 100))
         let exp = final_result * 10
         if (/(gunung|gajah)/.test(random_animal.name)) {
            const percent = Number(10)
            const fined = parseInt(((percent / 100) * users.pocket).toFixed(0))
            let p = `乂  *H U N T I N G*\n\n`
            p += `Selamat, kamu berhasil memburu *${Utils.ucword(random_animal.name)}* sebanyak *${random_result}* ekor.\n\n`
            p += `${random_animal.emoji.repeat(random_result)}\n\n`
            p += `Kamu di denda -${USD.format(fined)} [${percent}%] karena memburu hewan yang dilindungi oleh pemerintah.`
            m.reply(p).then(() => {
               users.pocket -= fined
               random_animal.count += random_result
               client.hunting[m.sender].state = false
               tools.durability -= material.tools.durability
               players.health -= material.health
            })
         } else {
            let p = `乂  *H U N T I N G*\n\n`
            p += `Selamat, kamu berhasil memburu *${Utils.ucword(random_animal.name)}* sebanyak *${random_result}* ekor.\n\n`
            p += `${random_animal.emoji.repeat(random_result)}\n\n`
            p += `Kamu bisa mendapatkan uang dengan menjual hasil buruan menggunakan perintah *${isPrefix}sell ${random_animal.name}*`
            m.reply(p).then(() => {
               random_animal.count += random_result
               client.hunting[m.sender].state = false
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
   game: true
}