export const run = {
   usage: ['fakta', 'galau', 'fml', 'truth', 'dare', 'bucin', 'dilan', 'pantun', 'puisi', 'sad-anime', 'senja', 'sindiran', 'cekkhodam'],
   category: 'random',
   async: async (m, {
      client,
      command,
      Utils
   }) => {
      try {
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.neoxr(`/${command === 'cekkhodam' ? 'khodam' : command.toLowerCase()}`)
         if (!json.status) return client.reply(m.chat, Utils.jsonFormat(json), m)
         let pr = ''
         for (const v in json.data) pr += `◦ *${Utils.ucword(v)}* : ${json.data[v]}\n`
         m.reply(pr.trim())
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true
}