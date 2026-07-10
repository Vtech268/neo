import { format } from 'date-fns'

export const run = {
   usage: ['list'],
   category: 'store',
   async: async (m, {
      client,
      args,
      prefixes,
      command,
      groupSet,
      Utils
   }) => {
      try {
         groupSet.list = groupSet?.list || []
         if (args && args[0]) {
            const list = groupSet.list
               .sort((a, b) => a.created_at - b.created_at)[Number(args[0]) - 1]

            if (!list) {
               return client.reply(m.chat, Utils.texted('bold', `🚩 List not found.`), m)
            }

            let p = `*${list.name.toUpperCase()}*\n`
            p += `*Updated* : ${format(new Date(list.created_at), 'dd/MM/yyyy HH:mm:ss')} WIB\n\n`
            p += list.content
            p += `\n\n${global.footer}`

            list.mediaUrl
               ? client.sendFile(m.chat, list.mediaUrl, '', p, m)
               : m.reply(p)
         } else {
            if (groupSet.list.length < 1) {
               return client.reply(m.chat, Utils.texted('bold', `🚩 List empty.`), m)
            }

            const list = groupSet.list.sort((a, b) => a.created_at - b.created_at)
            let p = `To display list information use the command : *${prefixes[0] + command} number*\n`
            p += `*Example* : ${prefixes[0] + command} 1\n\n`

            list.map((v, i) => {
               p += `*${i + 1}. ${v.name.toUpperCase()}*\n`
            })

            p += `\n${global.footer}`
            m.reply(p)
         }
      } catch (e) {
         console.log(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   group: true
}