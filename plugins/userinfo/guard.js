export const run = {
   usage: ['guard'],
   category: 'user info',
   async: async (m, {
      client,
      isPrefix,
      users,
      Utils
   }) => {
      if (users.point < 1) return client.reply(m.chat, `🚩 You don't have guards`, m)
      client.reply(m.chat, Utils.texted('bold', `🚩 You have ${Utils.formatNumber(users.guard)} guards.`), m)
   },
   error: false
}