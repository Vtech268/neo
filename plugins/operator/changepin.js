export const run = {
   usage: ['changepin'],
   use: 'old new',
   category: 'operator',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      Config,
      Utils
   }) => {
      try {
         if (args?.length < 2) return m.reply(Utils.example(isPrefix, command, '1234 5678'))
         await client.sendReact(m.chat, '🕒', m.key)
         const [oldPin, newPin] = args
         const json = await client.changePin({ number: Config.owner, current_pin: oldPin, new_pin: newPin })
         if (!json.status) return m.reply(json.message)
         m.reply(Utils.texted('bold', `✅ Your PIN has been successfully changed.`))
      } catch (e) {
         m.reply(Utils.jsonFormat(e))
      }
   },
   error: false,
   operator: true,
   private: true
}