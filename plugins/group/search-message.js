import { format } from 'date-fns'

export const run = [{
   usage: ['searchmsg'],
   use: 'query | amount',
   category: 'group',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      store,
      Utils
   }) => {
      try {
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, 'salken | 5'), m)

         let [query, amount] = text.split('|').map(v => v.trim())
         if (!amount) return client.reply(m.chat, Utils.example(isPrefix, command, 'salken | 5'), m)

         amount = parseInt(amount)
         if (isNaN(amount)) return client.reply(m.chat, Utils.example(isPrefix, command, 'salken | 5'), m)

         const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
         const safeQuery = escapeRegex(query)
         const regex = new RegExp(safeQuery, 'i')

         const allMessages = await store.getAllMessages(m.chat) || []
         const messages = allMessages.filter(v => {
            if (!v.text || v.fromMe) return false
            if (v.key?.id === m.key?.id) return false // ⛔️ kecualikan pesan command
            return regex.test(v.text)
         }).slice(-amount)

         if (!messages.length) return client.reply(m.chat, Utils.texted('bold', `🚩 No messages found for "${query}".`), m)

         let results = '', i = 0
         for (const v of messages.slice(-amount)) {
            i++
            results += `┌ No. ${i}\n`
            results += `│ ID : ${v.key.id}\n`
            results += `│ From : @${v.sender.replace(/@.+/, '')}\n`
            results += `│ At : ${format(v.messageTimestamp * 1000, 'EEEE, dd/MM/yyyy HH:mm')}\n`
            results += `└ Message : ${v.text}\n\n`
         }

         client.reply(m.chat, `🔍 *Search results for:* "${query}"\n\n${results.trim()}\n\n> 📦 Found ${messages.length} messages, Send .load <no> to mark the message.`, m)

         // load all message (high risk - potential banned from whatsapp)
         // for (const message of messages) {
         //    const msg = await store.loadMessage(m.chat, message.id)
         //    await client.reply(m.chat, '.', msg)
         //    await Utils.delay(1200)
         // }
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   group: true
}, {
   usage: ['load'],
   use: 'number',
   category: 'group',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      store,
      Utils
   }) => {
      try {
         let [number] = args
         if (!m?.quoted?.text) return client.reply(m.chat, `🚩 Reply message list.`, m)
         if (!number) return client.reply(m.chat, Utils.example(isPrefix, command, '1'), m)

         number = Number(number)
         if (isNaN(number) || number < 1) return client.reply(m.chat, Utils.example(isPrefix, command, '1'), m)

         const text = m.quoted.text
         const parser = [
            ...text.matchAll(/ID\s*:\s*([A-Z0-9]+)[\s\S]*?From\s*:\s*(.+)\n│ At\s*:\s*(.+)\n└ Message\s*:\s*(.+)/gi)
         ]

         const data = parser[number - 1]
         if (!data) return client.reply(m.chat, `🚩 No result found for number ${number}.`, m)

         const msg = await store.loadMessage(m.chat, data[1])
         if (!msg) return client.reply(m.chat, `🚩 Can't load message.`, m)

         client.reply(m.chat, '> This!', msg)
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   group: true
}]
