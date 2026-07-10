export const run = {
   usage: ['changeown'],
   use: 'number pin',
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
         if (args?.length < 2) return m.reply(Utils.example(isPrefix, command, '6282xxxx 1234'))
         await client.sendReact(m.chat, '🕒', m.key)
         const [newNumber, pin] = args
         const json = await client.changeOwner({ current_number: Config.owner, new_number: newNumber, pin })
         if (!json.status) return m.reply(json.message)
         m.reply(Utils.texted('bold', `✅ Owner number has been successfully changed.`))
      } catch (e) {
         m.reply(Utils.jsonFormat(e))
      }
   },
   error: false,
   operator: true,
   private: true
}