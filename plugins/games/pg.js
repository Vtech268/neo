export const run = {
   usage: ['pilgan'],
   hidden: ['pg'],
   category: 'games',
   async: async (m, {
      client,
      isPrefix,
      Utils
   }) => {
      client.pg = client.pg ? client.pg : {}
      let id = m.chat,
         timeout = 60000,
         keys = Object.freeze({
            0: 'A',
            1: 'B',
            2: 'C',
            3: 'D',
            4: 'E'
         })
      if (id in client.pg) return client.reply(m.chat, `🚩 Soal sebelumnya belum selesai silahkan selesaikan terlebih dahulu atau kirim *${isPrefix}pgskip*`, m)
      let json = Utils.jsonRandom('./media/json/pg.json')
      let selection = []
      json.selection.map((v, i) => selection.push(`${keys[i]}. ${v}`))
      client.pg[id] = [
         await client.sendPoll(m.chat, json.question, {
            options: selection,
            multiselect: false
         }, m),
         json, selection,
         setTimeout(async () => {
            if (client.pg[id]) {
               let tm = `Waktu habis! Jawaban untuk soal *"${json.question}"* :\n\n`
               tm += client.pg[id][2].find(v => v.startsWith(json.answer)) + '\n\n'
               tm += `*Penjelasan* : ${json.explanation}`
               client.reply(m.chat, tm, m).then(() => {
                  client.sendMessage(m.chat, {
                     delete: {
                        remoteJid: m.chat,
                        fromMe: true,
                        id: client.pg[id][0].id,
                        participant: client.decodeJid(client.user.id)
                     }
                  })
                  delete client.pg[id]
               })
            }
         }, timeout)
      ]
   },
   group: true,
   limit: true,
   game: true
}