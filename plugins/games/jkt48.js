export const run = {
   usage: ['jkt'],
   category: 'games',
   async: async (m, {
      client,
      isPrefix,
      store,
      Utils
   }) => {
      client.jkt = client.jkt ? client.jkt : {}
      let id = m.chat,
         timeout = 120000
      if (id in client.jkt) {
         return client.reply(m.chat, '*^ soal ini belum terjawab!*', client.jkt?.[id]?.[0])
      } else {
         let json = Utils.jsonRandom('./media/json/jkt48.json')
         let teks = `乂  *J K T - 4 8*\n\n`
         teks += `Siapa nama member JKT48 ini ?\n\n`
         teks += `Timeout : [ *${((timeout / 1000) / 60)} menit* ]\n`
         teks += `Reply pesan ini untuk menjawab, kirim *${isPrefix}jktclue* untuk bantuan dan *${isPrefix}jktskip* untuk menghapus sesi.`
         client.jkt[id] = [
            await client.sendFile(m.chat, json.image, 'image.jpg', teks, m),
            json,
            setTimeout(async () => {
               const msg = await store.loadMessage(m.chat, client.jkt[id][0])
               if (client.jkt[id]) client.reply(m.chat, `*Waktu habis!*\nJawaban : *${json.name}*`, client.jkt[id][0])
               delete client.jkt[id]
            }, timeout)
         ]
      }
   },
   group: true,
   limit: true,
   game: true
}