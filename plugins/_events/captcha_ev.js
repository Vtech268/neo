export const run = {
   async: async (m, {
      client,
      body,
      groupSet,
      isBotAdmin,
      Utils
   }) => {
      try {
         if (!isBotAdmin) groupSet.captcha = false
         client.captcha = client?.captcha || {}
         const room = Object.values(client.captcha).find(room => room.to === m.sender && room.groupId === m.chat)
         if (room && body) {
            if (room.code === body) {
               return client.reply(room.groupId, Utils.texted('bold', `✅ You've been successfully verified. Welcome!`), m).then(() => {
                  clearTimeout(room.timeout)
                  delete client.captcha[room.to]
               })
            } else {
               room.wrong += 1
               if (room.wrong >= 3) return await client.reply(room.groupId, Utils.texted('bold', `❌ [ 3 / 3 ] Your attempts have been exhausted. Goodbye.`), m).then(async () => {
                  await Utils.delay(1500)
                  client.groupParticipantsUpdate(room.groupId, [room.to], 'remove')
                  clearTimeout(room.timeout)
                  delete client.captcha[room.to]
               })
               return client.reply(room.groupId, `❌ Incorrect captcha code, you have *${3 - room.wrong}* more chances.`, m)
            }
         } else { }
      } catch (e) {
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   group: true,
   botAdmin: true
}