export const run = {
   usage: ['-list'],
   hidden: ['dellist'],
   use: 'id',
   category: 'store',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      groupSet,
      Utils
   }) => {
      try {
         groupSet.list = groupSet?.list || []
         if (!args || !args[0]) return client.reply(m.chat, Utils.example(isPrefix, command, '1'), m)
         const exists = groupSet.list.sort((a, b) => a.created_at - b.created_at)[Number(args[0]) - 1]
         if (!exists) return client.reply(m.chat, Utils.texted('bold', `🚩 List does not exists.`), m)
         Utils.removeItem(groupSet.list, exists)
         client.reply(m.chat, Utils.texted('bold', `🚩 List successfully removed.`), m)
      } catch (e) {
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   group: true
}