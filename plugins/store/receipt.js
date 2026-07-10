import { receipt } from '../../lib/canvas.js'
import fs from 'fs'
import { format } from 'date-fns'

export const run = {
   usage: ['invoice'],
   hidden: ['receipt', 'struk'],
   use: 'item | unit | price',
   category: 'store',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Utils
   }) => {
      try {
         client.receipt = client?.receipt || []

         const STORE_MAP = {
            id: Utils.makeId(8).toUpperCase(),
            name: 'NEOXR CREATIVE',
         }

         if (!text) return m.reply(Utils.example(isPrefix, command, 'Premium Script | 1x | 150000'))

         const [item, unit, price] = text.split('|')
         if (!item || !unit || !price || (price && isNaN(price))) {
            return m.reply(Utils.example(isPrefix, command, 'Script Premium | 1 | 150000'))
         }

         client.sendReact(m.chat, '🕒', m.key)

         const data = {
            store: STORE_MAP.name,
            invoice: STORE_MAP.id,
            date: format(new Date(), 'dd/MM/yy'),
            status: 'unpaid', // paid | unpaid | canceled
            qr: fs.readFileSync('./media/image/qr.jpg'),
            items: [
               { name: item?.trim(), unit: unit?.trim(), price: Utils.formatter(price?.trim()) }
            ],
            total: Utils.formatter(price?.trim())
         }

         const json = await receipt(data)

         let caption = `乂  *I N V O I C E*\n\n`
         caption += `	◦  *ID* : ${data.invoice}\n`
         caption += `	◦  *Date* : ${data.date}\n`
         caption += `	◦  *Status* : ${data.status.toUpperCase()}\n\n`
         caption += global.footer

         client.sendFile(m.chat, json.buffer, 'image.png', caption, m).then(() => {
            client.receipt.push(data)
         })
      } catch (e) {
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false
}
