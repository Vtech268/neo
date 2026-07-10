import { format } from 'date-fns'

export const run = {
   usage: ['requestlist', 'approveall', 'rejectall'],
   hidden: ['reqlist'],
   category: 'admin tools',
   async: async (m, {
      client,
      isPrefix,
      command,
      Utils
   }) => {
      try {
         if (['reqlist', 'requestlist'].includes(command)) {
            const groupRequest = client.groupRequestParticipantsList
            if (!groupRequest) return m.reply(Utils.texted('bold', `❌ .groupRequestParticipantsList() not found.`))
            const requests = await groupRequest(m.chat)
            if (!requests?.length) return m.reply(Utils.texted('bold', `❌ No pending join requests.`))

            let p = `This group has ${requests.length} join requests.\n\n`
            p += requests.sort((a, b) => Number(b.request_time) - Number(a.request_time)).map((v, i) => {
               return `◦  @${v.phone_number.replace(/@.+/, '')}\n    At : ${format(Number(v.request_time) * 1000, 'EEE, dd/MM/yy HH:mm')}`
            }).join('\n')

            p += `\n\n> Send *${isPrefix}approveall* or *${isPrefix}rejectall* to approve or reject all request.`

            m.reply(p)
         }

         if (command === 'approveall') {
            const groupRequest = client.groupRequestParticipantsList
            if (!groupRequest) return m.reply(Utils.texted('bold', `❌ .groupRequestParticipantsList() not found.`))
            const requests = await groupRequest(m.chat)
            if (!requests?.length) return m.reply(Utils.texted('bold', `❌ No pending join requests.`))

            let i = 0
            for (const member of requests) {
               await client.groupRequestParticipantsUpdate(m.chat, [member.jid], 'approve')
               await Utils.delay(1500)
               i++
            }
            m.reply(Utils.texted('bold', `✅ ${i} join request(s) have been approved.`))
         }

         if (command === 'rejectall') {
            const groupRequest = client.groupRequestParticipantsList
            if (!groupRequest) return m.reply(Utils.texted('bold', `❌ .groupRequestParticipantsList() not found.`))
            const requests = await groupRequest(m.chat)
            if (!requests?.length) return m.reply(Utils.texted('bold', `❌ No pending join requests.`))

            let i = 0
            for (const member of requests) {
               await client.groupRequestParticipantsUpdate(m.chat, [member.jid], 'reject')
               await Utils.delay(1500)
               i++
            }
            m.reply(Utils.texted('bold', `✅ ${i} join request(s) have been rejected.`))
         }
      } catch (e) {
         m.reply(Utils.texted('bold', `❌ ${e.message}`))
      }
   },
   group: true,
   admin: true,
   botAdmin: true
}