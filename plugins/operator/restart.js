export const run = {
   usage: ['restart'],
   category: 'operator',
   async: async (m, {
      client,
      system,
      Utils
   }) => {
      await client.reply(m.chat, Utils.texted('bold', 'Restarting . . .'), m).then(async () => {
         process.send('reset')
      })
   },
   operator: true
}