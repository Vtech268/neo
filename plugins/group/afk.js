export const run = {
   usage: ['afk'],
   use: 'reason (optional)',
   category: 'group',
   async: async (m, {
      client,
      text,
      groupSet,
      Utils
   }) => {
      try {
         if (text && Utils.generateLink(text)) return client.reply(m.chat, Utils.texted('bold', `🚩 You can't set a link as your AFK reason.`), m)
         let member = groupSet?.member?.[m.sender]
         member.afk = +new Date
         member.afkReason = text
         member.afkObj = m
         let tag = m.sender.split`@`[0]
         return client.reply(m.chat, Utils.texted('bold', `🚩 @${tag} is now AFK!`), m)
      } catch {
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   group: true
}