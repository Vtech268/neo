export const run = {
   usage: ['spin'],
   category: 'games',
   async: async (m, {
      client,
      args,
      isPrefix,
      users,
      command,
      Config,
      Utils
   }) => {
      const limitation = 500000
      if (!args || !args[0] || args[0].startsWith('0')) return client.reply(m.chat, Utils.texted('bold', `🚩 Berikan argumen berupa nominal point untuk dispin.`), m)
      if (isNaN(args[0])) return client.reply(m.chat, Utils.example(isPrefix, command, '10000'), m)
      if (args[0] > users.point) return client.reply(m.chat, Utils.texted('bold', `🚩 Pointmu tidak cukup untuk melakukan spin sebanyak ${Utils.formatNumber(args[0])} point.`), m)
      if (args[0] < 1000) return client.reply(m.chat, Utils.texted('bold', `🚩 Tidak bisa melakukan spin dengan nominal dibawah 1000 point.`), m)
      users.point -= args[0]
      let reward = Utils.randomInt(100, args[0] * 2)
      users.point += reward
      let last = users.point
      let teks = `乂  *S P I N - R E S U L T*\n\n`
      teks += `	*- ${Utils.formatNumber(args[0])}*\n`
      teks += `	*+ ${Utils.formatNumber(reward)}*\n\n`
      teks += `• *Total* : ${Utils.formatNumber(users.point)} Point\n\n`
      teks += `*NB : “Anti-Spam jeda ${Config.cooldown} detik untuk eksekusi selanjutnya.”*`
      client.reply(m.chat, teks, m)
   },
   group: true,
   limit: true,
   game: true
}