import { format } from 'date-fns'

export const run = {
   usage: ['couple'],
   category: 'group',
   async: async (m, {
      client,
      participants
   }) => {
      const member = participants.map(u => u.id)
      const now = Date.now()

      let tag1 = member[Math.floor(member.length * Math.random())]
      let tag2 = member[Math.floor(member.length * Math.random())]

      if (tag1 === tag2) {
         for (let i = 0; i < 5; i++) {
            tag1 = member[Math.floor(member.length * Math.random())]
            tag2 = member[Math.floor(member.length * Math.random())]
            if (tag1 !== tag2) break
         }
      }

      client.reply(
         m.chat,
         `Random Best Couple : @${tag1.replace(/@.+/, '')} 💞 @${tag2.replace(/@.+/, '')}, New couple of the day may be chosen at _${format(new Date(now), 'dd/MM/yyyy HH:mm')}._`
      )
   },
   group: true
}
