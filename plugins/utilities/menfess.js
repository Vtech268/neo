export const run = {
   usage: ['menfess'],
   hidden: ['delses', 'again', 'close', 'confes', 'confess'],
   category: 'utilities',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      setting,
      Utils
   }) => {
      try {
         setting.menfess = setting.menfess || []
         const chat = global.db?.anon?.chats?.find(c => c.a === m.sender || c.b === m.sender)
         if (chat) return client.reply(m.chat, Utils.texted('bold', '🚩 You are currently in an anonymous chat session.'), m)

         if (['confess', 'confes'].includes(command)) {
            if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, '628xxxxx | John Doe'), m)

            const [jid, name] = text.split('|').map(v => v.trim())
            if (!jid || !name) return client.reply(m.chat, Utils.example(isPrefix, command, '628xxxxx | John Doe'), m)

            const p = (await client.onWhatsApp(jid))[0] || {}
            if (!p.exists) return client.reply(m.chat, Utils.texted('bold', '🚩 That number is not registered on WhatsApp.'), m)
            if (p.jid === m.sender) return client.reply(m.chat, Utils.texted('bold', '🚩 You cannot send a message to yourself.'), m)

            const session = setting.menfess.find(v => v.from === m.sender)
            if (session) {
               return client.reply(m.chat, Utils.texted('bold', `🚩 You are already in a conversation with @${session.receiver.split('@')[0]}. Use *${isPrefix}delses* to delete the current session before starting a new one.`), m)
            }

            const isReceiverBusy = setting.menfess.some(v => v.from === p.jid || v.receiver === p.jid)
            if (isReceiverBusy) {
               return client.reply(m.chat, Utils.texted('bold', `🚩 Unable to send message to that number because they are currently in another conversation.`), m)
            }

            client.reply(m.chat, Utils.texted('bold', `✅ Session created successfully. You can now send messages, including stickers, photos, and more.`), m)

            setting.menfess.push({
               _id: +new Date(),
               from: m.sender,
               name,
               receiver: p.jid,
               msg: [],
               state: true,
               notification: false,
               last_activity: +new Date()
            })
         }

         else if (command === 'delses') {
            const session = setting.menfess.find(v => v.from === m.sender)
            if (!session) return
            Utils.removeItem(setting.menfess, session)
            client.reply(m.chat, Utils.texted('bold', '✅ Session deleted successfully.'), m)
         }

         else if (command === 'close') {
            const session = setting.menfess.find(v => v.from === m.sender && v.state === true)
            if (!session) return
            session.state = false
            session.notification = false
            client.reply(m.chat, Utils.texted('bold', '✅ Conversation closed successfully.'), m).then(() => {
               client.reply(session.receiver, Utils.texted('bold', '🚩 Sorry, the sender has closed the conversation.'))
            })
         }

         else if (command === 'again') {
            const session = setting.menfess.find(v => v.from === m.sender && v.state === false)
            if (!session) return
            session.state = true
            client.reply(m.chat, Utils.texted('bold', `✅ Conversation with @${session.receiver.split('@')[0]} resumed.`), m)
         }

         else {
            let msg = `To start a session, use the following format :\n`
            msg += `Example : *${isPrefix}confess +6285887776722 | Anonymous*\n\n`
            msg += `Available commands :\n\n`
            msg += `➠ *${isPrefix}close* ~ Close current conversation\n`
            msg += `➠ *${isPrefix}again* ~ Reopen closed conversation\n`
            msg += `➠ *${isPrefix}delses* ~ Delete your current session\n`
            m.reply(msg?.trim())
         }

      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   private: true,
   restrict: true
}