import Bingo from '../../lib/games/bingo.js'
import fs from 'node:fs'

export const run = {
   usage: ['bingo'],
   category: 'games',
   async: async (m, {
      client,
      isPrefix,
      Utils
   }) => {
      client.bingo = client.bingo ? client.bingo : {}
      let id = m.chat,
         timeout = 180000,
         i = 0
      if (id in client.bingo) return client.reply(m.chat, '*^ soal ini belum terjawab!*', client.bingo?.[id]?.[0])
      const wordFinder = new Bingo(8, 10) // Grids
      const words = wordFinder.getRandomElements(JSON.parse(fs.readFileSync('./media/json/kbbi.json', 'utf-8')).filter(v => v.length >= 4).filter(v => v.length <= 5), 5).map(v => v.toUpperCase())
      const placedWords = wordFinder.generateGridFrom(words)
      const json = wordFinder.printGridAsJSON(placedWords)
      let teks = `乂  *B I N G O*\n\n`
      teks += `Cari *${json.answer.length}* kata dalam KBBI yang terdapat pada huruf acak dibawah ini dengan arah pencarian Vertical, Horizontal & Diagonal :\n\n`
      for (let v of json.question) {
         teks += '`' + v.split('').join(' ') + '`\n'
      }
      teks += `\n`
      for(let v of json.answer) {
         i += 1
         teks += `${i}. ${'_'.repeat(v.length)}\n`
      }
      teks += `\n`
      teks += `Timeout : [ *${((timeout / 1000) / 60)} menit* ]\n`
      teks += `Reply pesan ini untuk menjawab, kirim *${isPrefix}bingoskip* untuk menghapus sesi.`
      client.bingo[id] = [
         await client.reply(m.chat, teks, m),
         json,
         setTimeout(() => {
            if (client.bingo[id]) {
               const isJson = JSON.parse(JSON.stringify(client.bingo[id][1]))
               let teks = `乂  *J A W A B A N*\n\n`
               teks += isJson.answer.map((v, i) => (i + 1) + '. ```' + Utils.ucword(v) + '```').join('\n')
               teks += `\n\n*Waktu habis!* berikut adalah jawabannya.`
               client.reply(m.chat, teks, client.bingo[id][0])
            }
            delete client.bingo[id]
         }, timeout),
         [], []
      ]
      console.log(json)
   },
   group: true,
   limit: true,
   game: true
}