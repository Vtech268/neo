export const run = {
   usage: ['accept', 'cancel'],
   use: 'no',
   category: 'rpg',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      Utils
   }) => {
      try {
         global.db.clans = global.db?.clans || []
         let clans = global.db.clans
         const [no] = args
         if (!no) return m.reply(Utils.example(isPrefix, command, '1'))
         if (!/clan/.test(m?.quoted?.text) && !/(accept|cancel)/.test(m?.quoted?.text)) return m.reply(`🚩 Reply pesan yang menampilkan daftar perimintaan.`)
         const clan = clans.find(v => v.leader === m.sender)
         if (!clan) return m.reply(`🚩 Kamu bukan ketua/tidak mempunyai clan.`)
         const jids = m?.quoted?.text?.split('@')?.map(v => v.split('\n')?.[0])
         jids.shift()
         if (command === 'accept') {
            const fn = clan.request.sort((a, b) => b.requested_at - a.requested_at).find(v => String(v.jid.match(/\d+/)[0]) === jids[no - 1] && v.state === 'WAITING')
            if (!fn) return m.reply(`🚩 Permintaan tidak ditemukan.`)
            fn.state = 'JOINED'
            m.reply(`✅ Permintaan bergabung @${jids[no - 1]} berhasil diterima.`).then(async () => {
               await Utils.delay(1100)
               client.reply(fn.jid, `🚩 @${clan.leader.replace(/@.+/, '')} menerimamu untuk bergabung kedalam clan *${Utils.ucword(clan.name)}*.`, null)
            })
         } else if (command === 'cancel') {
            const fn = clan.request.sort((a, b) => b.requested_at - a.requested_at).find(v => String(v.jid.match(/\d+/)[0]) === jids[no - 1] && v.state === 'WAITING')
            if (!fn) return m.reply(`🚩 Permintaan tidak ditemukan.`)
            Utils.removeItem(clan.request, fn)
            m.reply(`✅ Permintaan bergabung @${jids[no - 1]} berhasil ditolak.`).then(async () => {
               await Utils.delay(1100)
               client.reply(fn.jid, `🚩 @${clan.leader.replace(/@.+/, '')} menolakmu untuk bergabung kedalam clan *${Utils.ucword(clan.name)}*.`, null)
            })
         }
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   private: true,
   limit: true,
   game: true
}