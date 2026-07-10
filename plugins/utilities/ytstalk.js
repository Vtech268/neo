export const run = {
   usage: ['ytstalk'],
   use: 'username',
   category: 'utilities',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      Utils
   }) => {
      try {
         if (!args || !args[0]) return client.reply(m.chat, Utils.example(isPrefix, command, 'neoxrjs'), m)
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.neoxr('/ytstalk', {
         	username: args[0]
         })
         if (!json.status) return client.reply(m.chat, Utils.texted('bold', `🚩 Account not found.`), m)
         let caption = `乂  *Y T - S T A L K*\n\n`
         caption += `	◦  *Name* : ${json.data.name}\n`
         caption += `	◦  *Subscribers* : ${json.data.subscribers}\n`
         caption += `	◦  *Videos* : ${json.data.videos}\n`
         caption += `	◦  *Description* : ${json.data.description}\n`
         caption += `	◦  *Link* : ${json.data.url}\n\n`
         caption += global.footer
         client.sendFile(m.chat, json.data.avatar, 'image.png', caption, m)
      } catch (e) {
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true
}