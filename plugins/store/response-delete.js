export const run = {
   usage: ['-response'],
   hidden: ['-res'],
   use: 'name',
   category: 'store',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      groupSet,
      Utils
   }) => {
      try {
         groupSet.response = groupSet.response ? groupSet.response : []
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, 'XXXX'), m)
         const exists = groupSet.response.find(v => v._id === text.toLowerCase())
         if (!exists) return client.reply(m.chat, Utils.texted('bold', `🚩 Response does not exists.`), m)
         Utils.removeItem(groupSet.response, exists)
         client.reply(m.chat, Utils.texted('bold', `🚩 Response successfully removed.`), m)
      } catch (e) {
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   owner: true,
   group: true
}