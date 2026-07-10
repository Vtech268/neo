export const run = {
   usage: ['-dial'],
   use: 'id',
   category: 'owner',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      setting,
      Utils
   }) => {
      try {
         if (!args || !args[0]) return client.reply(m.chat, Utils.example(isPrefix, command, '1'), m)
         const content = setting.dial.sort((a, b) => a.created_at - b.created_at)[Number(args[0]) - 1]
         if (!content) return client.reply(m.chat, Utils.texted('bold', `🚩 Dial not found.`), m)
         Utils.removeItem(setting.dial, content)
         client.reply(m.chat, Utils.texted('bold', `🚩 Dial successfully removed.`), m)
      } catch (e) {
         console.log(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   owner: true
}