export const run = {
   usage: ['admin'],
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      participants,
      Utils
   }) => {
      try {
         const [json] = await client.groupParticipantsUpdate(m.chat, [m.sender], 'promote')
         if (json.status === '200') return m.reply(Utils.texted('bold', `✅ Done`))
         m.reply(Utils.texted('bold', '❌ Action failed'))
      } catch (e) {
         console.log(e)
         m.reply(Utils.texted('bold', '❌ Error'))
      }
   },
   group: true,
   owner: true,
   botAdmin: true
}