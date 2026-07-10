export const run = {
   usage: ['coin'],
   use: 'A / B',
   category: 'games',
   async: async (m, {
      client,
      args,
      Config,
      users,
      Utils
   }) => {
      if (!args || !args[0]) return client.reply(m.chat, Utils.texted('bold', `🚩 Berikan argumen A atau B.`), m)
      if (users.point == 0) return client.reply(m.chat, Utils.texted('bold', `🚩 Kamu tidak punya point untuk bermain game ini.`), m)
      if (users.point < 300000) return client.reply(m.chat, Utils.texted('bold', `🚩 Untuk bermain game ini kamu harus mempunyai minimal 300K point.`), m)
      let x = Utils.ucword(args[0])
      if (x == 'A' || x == 'B') {
         var type = Utils.random(['A', 'B'])
         if (Utils.ucword(args[0]) == type) {
            let percent = Utils.randomInt(5, 10)
            let reward = ((percent / 100) * users.point)
            users.point += reward
            let last = users.point
            let teks = `乂  *W I N*\n\n`
            teks += `	*System* : ${type}, *You* : ${Utils.ucword(args[0])}!\n`
            teks += `	*+ ${Utils.formatNumber(reward)}*\n\n`
            teks += `• *Total* : ${Utils.formatNumber(last)} Point\n\n`
            teks += `*NB : “Anti-Spam jeda ${Config.cooldown} detik untuk eksekusi selanjutnya.”*`
            client.reply(m.chat, teks, m)
         } else if (Utils.ucword(args[0]) != type) {
            let percent = Utils.randomInt(5, 15)
            let reward = ((percent / 100) * users.point)
            users.point -= reward
            let last = users.point
            let teks = `乂  *L O S E*\n\n`
            teks += `	*System* : ${type}, *You* : ${Utils.ucword(args[0])}!\n`
            teks += `	*- ${Utils.formatNumber(reward)}*\n\n`
            teks += `• *Total* : ${Utils.formatNumber(last)} Point\n\n`
            teks += `*NB : “Anti-Spam jeda ${Config.cooldown} detik untuk eksekusi selanjutnya.”*`
            client.reply(m.chat, teks, m)
         }
      } else {
         return client.reply(m.chat, Utils.texted('bold', `🚩 Hanya terdapat argumen A dan B.`), m)
      }
   },
   group: true,
   limit: true,
   game: true
}