export const run = {
   usage: ['q'],
   use: 'reply chat',
   category: 'group',
   async: async (m, {
      client,
      Utils,
      store
   }) => {
      try {
         if (!m.quoted) return client.reply(m.chat, Utils.texted('bold', `🚩 Reply to message that contain quoted.`), m)
         const result = await store.loadMessage(m.chat, m.quoted.id)
         if (!result?.message) return client.reply(m.chat, Utils.texted('bold', `🚩 Message not found.`), m)
         const quoted = Object.values(result.message)?.[0]?.contextInfo?.quotedMessage
         if (!Object.keys(quoted || {}).length) return client.reply(m.chat, Utils.texted('bold', `🚩 Message does not contain quoted.`), m)

         const type = Object.keys(quoted).find(key => key !== 'messageContextInfo' && key !== 'contextInfo')
         if (!type || (type && ['albumMessage'].includes(type))) return client.reply(m.chat, Utils.texted('bold', `🚩 Invalid type message or message does not contain quoted.`), m)

         const message = type === 'conversation' ? quoted : {
            [type]: {
               ...(quoted?.[type] ?? {}),
               contextInfo: {
                  ...(quoted?.[type]?.contextInfo ?? {}),
                  forwardingScore: 1,
                  isForwarded: true
               }
            }
         }

         client.relayMessage(m.chat, message, {})
      } catch (e) {
         console.error(e)
         client.reply(m.chat, `🚩 Can't load message.`, m)
      }
   },
   error: false
}