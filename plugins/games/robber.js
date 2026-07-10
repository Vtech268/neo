export const run = {
   usage: ['steal'],
   hidden: ['robber'],
   use: 'mention or reply',
   category: 'games',
   async: async (m, {
      client,
      text,
      users,
      hostJid,
      clientJid,
      findJid,
      Utils
   }) => {
      try {
         let user = hostJid ? global.db.users : findJid.bot(clientJid) ? findJid.bot(clientJid)?.data?.users : global.db.users
         const target = client.getJid(m, text)
         if (!target) return
         let p = await client.onWhatsApp(target)
         if (p.length == 0) return client.reply(m.chat, Utils.texted('bold', `🚩 Invalid number.`), m)
         let jid = client.decodeJid(p[0].jid)
         let number = jid.replace(/@.+/, '')
         if (jid == m.sender) return client.reply(m.chat, Utils.texted('bold', `🚩 Stress ??`), m)
         const USD = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
         })
         let timeRob = 3600000
         let rob = new Date(users.lastrob + timeRob)
         let timeout = rob - new Date()
         if (new Date - users.lastrob > timeRob) {
            const target = user.find(v => v.jid == jid)
            if (!target) return client.reply(m.chat, Utils.texted('bold', `🚩 Target tidak ada di dalam database.`), m)
            const percent = Utils.randomInt(1, 10)
            const nominal = parseInt(((percent / 100) * target.pocket).toFixed(0))
            target.pocket -= nominal
            users.pocket += nominal
            users.lastrob = new Date() * 1
            m.reply(`✅ Berhasil mencuri uang dari @${number} dengan nominal *${USD.format(nominal)}*.`)
         } else return client.reply(m.chat, `*Tunggu 1 jam untuk kamu bisa mencuri lagi.*\n\n*Timeout : [ ${Utils.toTime(timeout)} ]*`, m)
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   group: true,
   limit: true,
   game: true
}