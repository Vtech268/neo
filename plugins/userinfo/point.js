export const run = {
   usage: ['point'],
   category: 'user info',
   async: async (m, {
      client,
      isPrefix,
      users,
      Utils
   }) => {
      try {
         if (users.point < 1) return client.reply(m.chat, `🚩 You don't have points, to get points send *${isPrefix}claim*`, m)
         client.reply(m.chat, Utils.texted('bold', `🚩 You have ${Utils.h2k(users.point)} (${Utils.formatNumber(users.point)}) points.`), m)
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false
}