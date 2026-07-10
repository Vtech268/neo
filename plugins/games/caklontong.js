export const run = {
   usage: ['caklontong'],
   category: 'games',
   async: async (m, {
      client,
      isPrefix,
      Utils
   }) => {
      client.caklontong = client.caklontong ? client.caklontong : {}
      let id = m.chat,
         timeout = 60000
      if (id in client.caklontong) return client.reply(m.chat, '*^ soal ini belum terjawab!*', client.caklontong?.[id]?.[0])
      let json = Utils.jsonRandom('./media/json/caklontong.json')
      let teks = `乂  *C A K*\n\n`
      teks += `${json.pertanyaan}\n\n`
      teks += `Timeout : [ *${((timeout / 1000) / 60)} menit* ]\n`
      teks += `Reply pesan ini untuk menjawab, kirim *${isPrefix}cakclue* untuk bantuan dan *${isPrefix}cakskip* untuk menghapus sesi.`
      client.caklontong[id] = [
         await client.reply(m.chat, teks, m),
         json,
         setTimeout(() => {
            if (client.caklontong[id]) client.reply(m.chat, `*Waktu habis!*\nJawaban : *${json.jawaban}* (${json.deskripsi})`, client.caklontong[id][0])
            delete client.caklontong[id]
         }, timeout)
      ]
   },
   group: true,
   limit: true,
   game: true
}