import { receipt } from '../../lib/canvas.js'
import fs from 'node:fs'

export const run = {
   usage: ['done'],
   hidden: ['paid'],
   use: 'id / reply invoice',
   category: 'store',
   async: async (m, {
      client,
      args,
      Utils
   }) => {
      try {
         client.receipt = client?.receipt || []
         const id = m?.quoted
            ? (!/I\sN\sV\sO\sI\sC\sE/gi.test(m?.quoted?.text)
               ? client.reply(m.chat, `🚩 Reply to invoice image message.`, m)
               : m?.quoted?.text?.split(':')?.[1]?.split('\n')?.shift()?.trim())
            : args?.[0]
         if (!id) return client.reply(m.chat, `🚩 Invoice not found.`, m)
         const fn = client.receipt.find(v => v.invoice === id)
         if (!fn) return client.reply(m.chat, `🚩 Invoice not found.`, m)
         if (fn.status === 'canceled') return client.reply(m.chat, `🚩 Invoice already canceled.`, m)
         if (fn.status === 'paid') return client.reply(m.chat, `🚩 Invoice already paid.`, m)
         client.sendReact(m.chat, '🕒', m.key)
         fn.status = 'paid'
         fn.qr = fs.readFileSync('./media/image/complete.png')
         const json = await receipt(fn)
         let caption = `乂  *I N V O I C E*\n\n`
         caption += `	◦  *ID* : ${fn.invoice}\n`
         caption += `	◦  *Date* : ${fn.date}\n`
         caption += `	◦  *Status* : ${fn.status.toUpperCase()}\n\n`
         caption += global.footer
         client.sendFile(m.chat, json.buffer, 'image.png', caption, m)
      } catch (e) {
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false
}