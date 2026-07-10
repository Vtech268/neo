export const run = {
   usage: ['nikah'],
   use: 'date',
   category: 'primbon',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      Utils
   }) => {
      try {
         if (!args || !args[0]) return client.reply(m.chat, Utils.example(isPrefix, command, '11-15-2025'), m)
         client.sendReact(m.chat, '🕒', m.key)
         const [dd, mm, yy] = args[0].split`-`
         if (!dd || !mm || !yy) return client.reply(m.chat, Utils.example(isPrefix, command, '11-15-2025'), m)
         const json = await Api.neoxr('/nikah', {
            tanggal: dd,
            bulan: mm,
            tahun: yy
         })
         if (!json.status) return client.reply(m.chat, Utils.jsonFormat(json), m)
         let p = `◦ *Tanggal* : ${json.data.tanggal}\n`
         p += `◦ *Karaktersitik* : ${json.data.karakteristik}\n\n`
         p += json.data.result
         client.reply(m.chat, p, m)
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true
}