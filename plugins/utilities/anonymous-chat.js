export const run = {
   usage: ['anonymous'],
   hidden: ['start', 'stop', 'next', 'leave', 'anonchat', 'anon'],
   category: 'utilities',
   async: async (m, {
      client,
      command,
      isPrefix,
      setting,
      Utils
   }) => {
      global.db.anon = (typeof global.db.anon === 'object' && global.db.anon !== null) ? global.db.anon : {}

      global.db.anon.waiting = Array.isArray(global.db.anon.waiting) ? global.db.anon.waiting : []
      global.db.anon.chats = Array.isArray(global.db.anon.chats) ? global.db.anon.chats : []

      const chat = setting?.menfess?.find(v => v.from === m.sender || v.receiver === m.sender)?.state
      if (chat) return client.reply(m.chat, Utils.texted('bold', '🚩 You are currently in an menfess chat session.'), m)

      const anon = global.db.anon
      const sender = m.sender

      if (command === 'stop') {
         const session = anon.chats.find(c => c.a === sender || c.b === sender)
         if (session) {
            const partner = session.a === sender ? session.b : session.a
            anon.chats = anon.chats.filter(c => c !== session)
            client.reply(sender, Utils.texted('bold', '🚩 You have left the anonymous chat.'), m)
            client.reply(partner, Utils.texted('bold', '🚩 Your partner has left the anonymous chat.'), m)
         } else {
            client.reply(sender, Utils.texted('bold', '🚩 You are not currently in an anonymous chat.'), m)
         }
      }

      else if (command === 'leave') {
         const inQueue = anon.waiting.includes(sender)
         if (inQueue) {
            anon.waiting = anon.waiting.filter(v => v !== sender)
            client.reply(sender, Utils.texted('bold', '✅ You have left the anonymous queue.'), m)
         } else {
            client.reply(sender, Utils.texted('bold', '🚩 You are not in the anonymous queue.'), m)
         }
      }

      else if (command === 'next') {
         const session = anon.chats.find(c => c.a === sender || c.b === sender)
         if (session) {
            const partner = session.a === sender ? session.b : session.a
            anon.chats = anon.chats.filter(c => c !== session)
            client.reply(partner, Utils.texted('bold', '🚩 Your partner has left the anonymous chat.'), null)
         }

         startAnonymousSession(sender, null, client, anon, Utils)
      }

      else if (command === 'start') {
         const inChat = anon.chats.some(c => c.a === sender || c.b === sender)
         if (inChat) return client.reply(sender, Utils.texted('bold', '🚩 You are already in an anonymous session. Use /stop first to leave.'), m)

         startAnonymousSession(sender, null, client, anon, Utils)
      }

      else if (['anonymous', 'anonchat', 'anon'].includes(command)) {
         let msg = `Available commands :\n\n`
         msg += `➠ *${isPrefix}start* ~ Start an anonymous chat\n`
         msg += `➠ *${isPrefix}stop* ~ Stop an anonymous chat\n`
         msg += `➠ *${isPrefix}next* ~ Change/Search partner\n`
         msg += `➠ *${isPrefix}leave* ~ Leave the anonymous queue\n`
         m.reply(msg?.trim())
      }
   },
   error: false,
   private: true
}

function startAnonymousSession(sender, m, client, anon, Utils) {
   const waitingPartner = anon.waiting.find(u => u !== sender)
   if (waitingPartner) {
      anon.waiting = anon.waiting.filter(u => u !== waitingPartner)
      anon.chats.push({ a: sender, b: waitingPartner })
      client.reply(sender, Utils.texted('bold', '✅ Partner found! You are now connected anonymously. Type your message...'), m)
      client.reply(waitingPartner, Utils.texted('bold', '✅ Partner found! You are now connected anonymously. Type your message...'), m)
   } else {
      anon.waiting.push(sender)
      client.reply(sender, Utils.texted('bold', '⌛ Waiting for a partner to connect...'), m)
   }
}