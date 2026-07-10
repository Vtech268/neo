export const run = {
   usage: ['claim'],
   category: 'user info',
   async: async (m, {
      client,
      users,
      Utils
   }) => {
      try {
         let timeClaim = 3600000
         let claimed = new Date(users.lastclaim + timeClaim)
         let timeout = claimed - new Date()
         let point = Utils.randomInt(1, 1000)
         if (new Date - users.lastclaim > timeClaim) {
            client.reply(m.chat, Utils.texted('bold', `🎉 Congratulations!, you got +${Utils.formatNumber(point)} points.`), m)
            users.point += point
            users.lastclaim = new Date() * 1
         } else {
            client.reply(m.chat, `*You have claimed, you can reclaim in the next hour.*\n\n*Timeout : [ ${Utils.toTime(timeout)} ]*`, m)
         }
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false
}