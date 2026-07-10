import fs from 'node:fs'

export const run = {
   usage: ['createclan'],
   use: 'name',
   category: 'rpg',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      players,
      Utils
   }) => {
      try {
         global.db.clans = global.db?.clans || []
         let clans = global.db.clans
         if (!text) return m.reply(Utils.example(isPrefix, command, 'uchiha'))
         if (players.exp < 16000) return m.reply(`🚩 Untuk membuat clan kamu harus berada di level *Expert*.`)
         const id = Utils.randomInt(100000, 999999)
         if (players.clan > 0) return m.reply(`🚩 Tidak bisa membuat clan karena kamu sudah menjadi ketua / anggota dari clan lain.`)
         if (!/^[a-zA-Z0-9]+$/.test(text)) return m.reply(`🚩 Karakter untuk nama clan hanya huruf dan angka.`)
         if (text.length < 4 || text.length > 25) return m.reply(`🚩 Jumlah karakter untuk nama clan min. 4 dan max. 25 karakter.`)
         if (clans.some(v => v.name.toLowerCase() === text.toLowerCase().trim())) return m.reply(`🚩 Clan dengan nama *${Utils.ucword(text)}* sudah terdaftar, gunakan nama lain.`)
         clans.push({
            icon: Buffer.from(fs.readFileSync('./media/image/default.jpg')).toString('base64'),
            id: id,
            name: text.toLowerCase().trim(),
            leader: m.sender,
            request: [],
            created_at: Date.now()
         })
         players.clan = parseInt(id)
         m.reply(`✅ Clan *${Utils.ucword(text)}* berhasil dibuat dengan ID : *${id}*\n\n> Bagikan ID untuk mengajak player lain masuk kedalam clan.`)
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   group: true,
   game: true,
   limit: true
}