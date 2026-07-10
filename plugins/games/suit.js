export const run = {
   usage: ['suit'],
   category: 'games',
   async: async (m, {
      client,
      isPrefix,
      command,
      users,
      hostJid,
      clientJid,
      findJid,
      Utils
   }) => {
      let user = hostJid ? global.db.users : findJid.bot(clientJid) ? findJid.bot(clientJid)?.data?.users : global.db.users
      let timeout = 60000
      let poin = Utils.randomInt(0, 50000)
      let poin_lose = Utils.randomInt(0, 10000)
      if (users.point < 10000) return client.reply(m.chat, Utils.texted('bold', `🚩 Point yang kamu miliki tidak cukup untuk bermain game suit, minimal mempunyai 10K point.`), m)
      client.suit = client.suit ? client.suit : {}
      if (Object.values(client.suit).find(room => room.id.startsWith('suit') && [room.p, room.p2].includes(m.sender))) return client.reply(m.chat, Utils.texted('bold', `🚩 Kamu belum menyelesaikan suit sebelumnya.`), m)
      if (!m.mentionedJid[0]) return client.reply(m.chat, Utils.example(isPrefix, command, '@0'), m)
      const opponent = user?.find(v =>
         v.jid === m.mentionedJid[0] ||
         v.lid === m.mentionedJid[0]
      )
      if (!opponent) return client.reply(m.chat, Utils.texted('bold', `🚩 Orang yang kamu ajak bermain suit belum terdaftar sebagai pengguna bot.`), m)
      if (opponent?.point < 1000) return client.reply(m.chat, Utils.texted('bold', `🚩 Orang yang kamu tantang tidak mempunyai cukup untuk bermain suit.`), m)
      if (Object.values(client.suit).find(room => room.id.startsWith('suit') && [room.p, room.p2].includes(opponent.jid))) return client.reply(m.chat, Utils.texted('bold', `🚩 Orang yang kamu ajak bermain sedang bermain suit dengan orang lain.`), m)
      let id = 'suit_' + new Date() * 1
      let teks = `乂  *S U I T (PVP)*\n\n`
      teks += `“@${m.sender.split`@`[0]} menantang @${opponent.jid.split`@`[0]} untuk bermain suit.”\n\n`
      teks += `Silahkan @${opponent.jid.split`@`[0]} kirim *${isPrefix}acc* untuk mulai bermain dan kirim *${isPrefix}reject* untuk menolak tantangan bermain suit.`
      client.suit[id] = {
         chat: await client.reply(m.chat, teks, m),
         id,
         p: m.sender,
         p2: opponent.jid,
         status: 'wait',
         waktu: setTimeout(() => {
            if (client.suit[id]) return client.reply(m.chat, Utils.texted('bold', `🚩 Sesi game Suit telah habis.`), m).then(() => delete client.suit[id])
         }, timeout),
         poin,
         poin_lose,
         timeout
      }
   },
   error: false,
   group: true,
   limit: true,
   game: true
}