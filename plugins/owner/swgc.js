export const run = {
   usage: ['swgc'],
   use: 'text',
   category: 'owner',
   async: async (m, {
      client,
      text,
      Utils
   }) => {
      try {
         const color = `#${Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0').toUpperCase()}`
         const q = m.quoted ? m.quoted : m
         const mime = (q.msg || q).mimetype || ''
         if (/video|image\/(jpe?g|png)/.test(mime)) {
            await client.sendReact(m.chat, '🕒', m.key)
            client.groupStatus(m.chat, {
               message: { [q.mtype]: { ...q, caption: text || q.text || '' } },
               caption: text
            }).then(async () => {
               await client.sendReact(m.chat, '✅', m.key)
            })
         } else if (/audio/.test(mime)) {
            await client.sendReact(m.chat, '🕒', m.key)
            client.groupStatus(m.chat, {
               message: { [q.mtype]: q },
               background: color
            }).then(async () => {
               await client.sendReact(m.chat, '✅', m.key)
            })
         } else {
            if (!text) return client.reply(m.chat, Utils.texted('bold', `🚩 Text is required!`), m)
            await client.sendReact(m.chat, '🕒', m.key)
            client.groupStatus(m.chat, {
               text,
               background: color
            }).then(async () => {
               await client.sendReact(m.chat, '✅', m.key)
            })
         }
      } catch {
         return client.reply(m.chat, Utils.texted('bold', `🚩 Sorry something went wrong!`), m)
      }
   },
   owner: true,
   group: true
}