import { format } from 'date-fns'

export const run = {
   usage: ['dial'],
   category: 'miscs',
   async: async (m, {
      client,
      setting,
      Utils
   }) => {
      try {
         const response = setting.dial.sort((a, b) => a.created_at - b.created_at)
         if (setting.dial.length < 1) return client.reply(m.chat, Utils.texted('bold', `🚩 Empty data.`), m)
         let p = `To showing content send the number.\n`
         p += `*Example* : 1\n\n`
         response.map((v, i) => {
            p += `›  *${i + 1}. ${v.title}*\n`
            p += `   *Created At* : ${format(v.updated_at, 'dd/MM/yy')}\n`
            p += `   *Updated At* : ${format(v.created_at, 'dd/MM/yy')}\n\n`
         })
         p += global.footer
         m.reply(p)
      } catch (e) {
         console.log(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false
}