export const run = {
   async: async (m, {
      client,
      body,
      users,
      prefixes,
      Config,
      Utils
   }) => {
      try {
         let id = m.chat,
            timeout = 60000 * 3
         var reward = Utils.randomInt(Config.min_reward, Config.max_reward)
         client.hangman = client.hangman ? client.hangman : {}
         if (m.quoted && (m.quoted.sender != client.decodeJid(client.user.id) && m.quoted.sender != client.decodeJid(client.user.lid))) return
         if (m.quoted && /hangskip/i.test(m.quoted.text) && body && typeof body === 'string') {
            if (!(id in client.hangman) && /hangskip/i.test(m.quoted.text)) return client.reply(m.chat, Utils.texted('bold', `🚩 Soal tersebut telah berakhir, silahkan kirim _${prefixes[0]}hangman_ untuk mendapatkan soal baru.`), m)
            let json = JSON.parse(JSON.stringify(client.hangman[id][1]))
            let displayWord = client.hangman[id][4]
            let guessedLetters = client.hangman[id][3]
            if (body?.length > 1) return client.reply(m.chat, Utils.texted('bold', `🚩 Jawab dengan 1 huruf saja.`), m)

            if (guessedLetters.includes(body.toLowerCase())) {
               client.reply(m.chat, Utils.texted('bold', `🚩 Huruf tersebut sudah ditebak sebelumnya.`), m)
               return
            }

            guessedLetters.push(body.toLowerCase())

            if (json.word.includes(body.toLowerCase())) {
               for (let i = 0; i < json.word.length; i++) {
                  if (json.word[i] === body.toLowerCase()) {
                     displayWord[i] = body.toLowerCase()
                  }
               }
               if (!displayWord.includes('_')) {
                  client.reply(m.chat, `✅ Jawaban benar : "${json.word.toUpperCase()}" (+ ${Utils.formatNumber(reward)} Point).`, m).then(() => {
                     users.point += reward
                     if (client.hangman?.[id]?.[5]) clearTimeout(client.hangman[id][5])
                     delete client.hangman[id]
                  })
                  return
               } else {
                  let teks = `乂  *H A N G M A N*\n\n`
                  teks += `${displayWord.join(' ').toUpperCase()}\n\n`
                  teks += `Hint : ${json.hint}\n\n`
                  teks += `Timeout : [ *${((timeout / 1000) / 60)} minutes* ]\n`
                  teks += `Reply pesan ini untuk menjawab, kirim *${prefixes[0]}hangskip* untuk menghapus sesi.`
                  client.reply(m.chat, teks, m)
               }
            } else {
               client.hangman[id][2]--
               client.reply(m.chat, Utils.texted('bold', `🚩 Huruf "${body.toUpperCase()}" salah! Sisa kesempatan : ${client.hangman[id][2]}.`), m)
            }

            if (client.hangman[id][2] === 0) {
               client.reply(m.chat, Utils.texted('bold', `🚩 Kesempatan habis, kata yang benar adalah : "${json.word.toUpperCase()}".`), m)
               if (client.hangman?.[id]?.[5]) clearTimeout(client.hangman[id][5])
               delete client.hangman[id]
               return
            }
         }
      } catch (e) {
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   group: true,
   game: true
}