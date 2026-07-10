export const run = {
   usage: ['response'],
   category: 'store',
   async: async (m, {
      client,
      groupSet,
      Utils
   }) => {
      try {
         groupSet.response = groupSet.response ? groupSet.response : []
         if (groupSet.response.length < 1) return client.reply(m.chat, Utils.texted('bold', `🚩 Response empty.`), m)
         let text = groupSet.response.sort((a, b) => a._id.localeCompare(b._id)).map((v, i) => {
            if (i == 0) {
               return `┌  ◦  ${v._id}`
            } else if (i == groupSet.response.sort((a, b) => a._id.localeCompare(b._id)).length - 1) {
               return `└  ◦  ${v._id}`
            } else {
               return `│  ◦  ${v._id}`
            }
         }).join('\n')
         m.reply(text)
      } catch (e) {
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   owner: true,
   group: true
}