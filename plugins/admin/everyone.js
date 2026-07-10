export const run = {
   usage: ['everyone'],
   hidden: ['all'],
   use: 'text (optional)',
   category: 'admin tools',
   async: async (m, {
      client,
      text,
      participants,
      Utils
   }) => {
      try {
         let member = participants.map(v => v.id)
         client.reply(m.chat, `@${m.chat} ${text}`, null, {
            mentionedJid: member,
            groupMentions: [{
               'groupJid': m.chat,
               'groupSubject': 'everyone'
            }]
         })
      } catch (e) {
         console.error(e)
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   admin: true,
   group: true
}