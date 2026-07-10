export const run = {
   usage: ['cryptarithm'],
   hidden: ['crp'],
   category: 'games',
   async: async (m, {
      client,
      isPrefix,
      Utils
   }) => {
      client.cryptarithm = client.cryptarithm ? client.cryptarithm : {}
      let id = m.chat,
         timeout = 60000
      if (id in client.cryptarithm) return client.reply(m.chat, '*^ soal ini belum terjawab!*', client.cryptarithm?.[id]?.[0])
      const cry = Utils.generateCryptarithm()
      let teks = `乂  *C R Y P T A R I T H M*\n\n`
      teks += cry.game.question + '\n\n'
      teks += `Timeout : [ *${((timeout / 1000) / 60)} menit* ]\n`
      teks += `Reply pesan ini untuk menjawab, kirim *${isPrefix}cryskip* untuk menghapus sesi.`
      client.cryptarithm[id] = [
         await client.reply(m.chat, teks, m),
         cry.game.answer, 3,
         setTimeout(() => {
            if (client.cryptarithm[id]) client.reply(m.chat, `*Waktu habis!*\nJawaban : *${client.cryptarithm[id][1]}*`, client.cryptarithm[id][0])
            delete client.cryptarithm[id]
         }, timeout)
      ]
   },
   group: true,
   limit: true,
   game: true
}