export const run = {
   usage: ['flashnumber'],
   hidden: ['fn'],
   category: 'games',
   async: async (m, {
      client,
      isPrefix,
      Utils
   }) => {
      client.flashnumber = client.flashnumber ? client.flashnumber : {}
      let id = m.chat,
         timeout = 60000
      if (id in client.flashnumber) return client.reply(m.chat, '*^ soal ini belum terjawab!*', client.flashnumber?.[id]?.[0])

      const number = String(Utils.randomInt(100000, 999999))
      const msg = await client.reply(m.chat, number, m)
     
      await Utils.delay(500)

      client.flashnumber[id] = [
         await client.sendMessage(m.chat, {
            text: `Angka berapa itu? reply pesan ini untuk menjawab dan *${isPrefix}flashskip* untuk menghapus sesi. (Timeout: ${((timeout / 1000) / 60)} menit)`,
            edit: msg.key
         }),
         number,
         setTimeout(() => {
            if (client.flashnumber[id]) client.reply(m.chat, `*Waktu habis!*\nJawaban : *${number}*`, client.flashnumber[id][0])
            delete client.flashnumber[id]
         }, timeout)
      ]
   },
   group: true,
   limit: true,
   game: true
}