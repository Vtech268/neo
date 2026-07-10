import { format } from 'date-fns'

export const run = {
   usage: ['product'],
   category: 'store',
   async: async (m, { client, args, prefixes, command, setting, Utils }) => {
      try {
         setting.product = setting.product || []

         if (args && args[0]) {
            const product = setting.product
               .sort((a, b) => a.created_at - b.created_at)[Number(args[0]) - 1]

            if (!product) {
               return client.reply(m.chat, Utils.texted('bold', `🚩 Product not found.`), m)
            }

            let p = `*${product.name.toUpperCase()}*\n`
            p += `*Updated* : ${format(new Date(product.created_at), 'dd/MM/yyyy HH:mm:ss')} WIB\n\n`
            p += product.content
            p += `\n\n${global.footer}`

            product.mediaUrl
               ? client.sendFile(m.chat, product.mediaUrl, '', p, m)
               : m.reply(p)
         } else {
            if (setting.product.length < 1) {
               return client.reply(m.chat, Utils.texted('bold', `🚩 Product empty.`), m)
            }

            const product = setting.product.sort((a, b) => a.created_at - b.created_at)
            let p = `To display product information use the command : *${prefixes[0] + command} number*\n`
            p += `*Example* : ${prefixes[0] + command} 1\n\n`

            product.map((v, i) => {
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
   error: false
}