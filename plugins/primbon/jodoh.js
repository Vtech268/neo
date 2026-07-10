export const run = {
   usage: ['jodoh'],
   use: 'name | name',
   category: 'primbon',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Utils
   }) => {
      try {
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, 'jokowi | megawati'), m)
         client.sendReact(m.chat, '🕒', m.key)
         const [name1, name2] = text.split`|`
         if (!name1 || !name2) return client.reply(m.chat, Utils.example(isPrefix, command, 'jokowi | megawati'), m)
         const json = await Api.neoxr('/jodoh', {
            name1: name1?.trim(),
            name2: name2?.trim()
         })
         if (!json.status) return client.reply(m.chat, Utils.jsonFormat(json), m)
         let p = `${Utils.ucword(name1)} 🧡 ${Utils.ucword(name2)}\n\n`
         p += `◦ *Positif* : ${json.data.positif}\n`
         p += `◦ *Negatif* : ${json.data.negatif}\n\n`
         p += json.data.info
         client.reply(m.chat, p, m)
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true
}