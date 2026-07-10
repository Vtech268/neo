export const run = {
   async: async (m, {
      client,
      blockList,
      setting,
      Utils
   }) => {
      try {
         setting.menfess = setting.menfess || []

         // Sender is sending a message to the receiver
         const isFrom = setting.menfess.find(v => v.from === m.sender && v.state)
         if (!m.isGroup && isFrom) {
            if (blockList.includes(isFrom.receiver)) {
               return client.reply(m.chat, Utils.texted('bold', '🚩 Cannot send message. The receiver\'s number is blocked by the bot for calling/spamming.'), m)
            }

            const notifyMsg = `📩 You received *1 new* confession message from: *${isFrom.name.trim()}*`

            if (!isFrom.notification) {
               await client.reply(isFrom.receiver, notifyMsg)
               isFrom.notification = true
            }

            await client.copyNForward(isFrom.receiver, m)
            await Utils.delay(1300)
            await client.sendReact(m.chat, '✅', m.key)
            isFrom.last_activity = +new Date
         }

         // Receiver is replying to the sender
         const isReceiver = setting.menfess.find(v => v.receiver === m.sender && v.state)
         if (!m.isGroup && isReceiver) {
            if (blockList.includes(isReceiver.from)) {
               return client.reply(m.chat, Utils.texted('bold', '🚩 Cannot send message. The receiver\'s number is blocked by the bot for calling/spamming.'), m)
            }

            await client.copyNForward(isReceiver.from, m)
            await Utils.delay(1300)
            await client.sendReact(m.chat, '✅', m.key)
            isReceiver.last_activity = +new Date
         }

      } catch (e) {
         console.error(e)
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false
}