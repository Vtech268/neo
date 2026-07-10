import fs from 'node:fs'

export const run = {
   usage: ['hangman'],
   use: 'category',
   category: 'games',
   async: async (m, {
      client,
      args,
      command,
      isPrefix,
      Utils
   }) => {
      if (!args || !args[0]) return m.reply(explain(isPrefix, command))
      client.hangman = client.hangman ? client.hangman : {}
      let id = m.chat,
         timeout = 60000 * 3
      if (id in client.hangman) return client.reply(m.chat, '*^ soal ini belum terjawab!*', client.hangman?.[id]?.[0])
      let question = JSON.parse(fs.readFileSync('./media/json/hangman.json', 'utf-8'))
      if (!Object.keys(question).includes(args[0].toLowerCase())) return client.reply(m.chat, Utils.texted('bold', `🚩 Kategori tidak ditemukan.`), m)
      let json = Utils.random(question[args[0].toLowerCase()])
      let teks = `乂  *H A N G M A N*\n\n`
      teks += `${'_'.repeat(json.word.length).split('').join(' ').toUpperCase()}\n\n`
      teks += `Hint : ${json.hint}\n\n`
      teks += `Timeout : [ *${((timeout / 1000) / 60)} minutes* ]\n`
      teks += `Reply pesan ini untuk menjawab, kirim *${isPrefix}hangskip* untuk menghapus sesi.`
      client.hangman[id] = [
         await client.reply(m.chat, teks, m),
         json, 6, [], '_'.repeat(json.word.length).split(''),
         setTimeout(() => {
            if (client.hangman[id]) client.reply(m.chat, `*Waktu habis!*\nJawaban : *${json.word}*`, client.hangman[id][0])
            delete client.hangman[id]
         }, timeout)
      ]
   },
   group: true,
   limit: true,
   game: true
}

const explain = (prefix, command) => {
   const question = JSON.parse(fs.readFileSync('./media/json/hangman.json', 'utf-8'))
   let p = `乂  *H A N G M A N*\n\n`
   p += `Permainan tebak kata dengan hanya mengetikan huruf yang terdapat dalam suatu kata.\n`
   p += `Daftar Kategori : *${Object.keys(question).join(', ')}*\n\n`
   p += `Untuk bermain gunakan perintah *${prefix + command} <kategori>*\n\n`
   p += global.footer
   return p
}