export const run = {
   usage: ['-redeem'],
   hidden: ['-code'],
   use: 'code',
   category: 'owner',
   async: async (m, {
      args,
      isPrefix,
      command,
      setting,
      Utils
   }) => {
      try {
         setting.codes = setting.codes || []

         if (!args || !args[0]) return m.reply(Utils.example(isPrefix, command, 'free86'))

         const [code] = args
         const fnCode = setting.codes.find(c => c.code.toLowerCase() === code.toLowerCase())
         if (!fnCode) return m.reply(`❌ Code *${code}* is not available`)

         Utils.removeItem(setting.codes, fnCode)
         m.reply(`✅ Code *${code}* has been deleted`)
      } catch (e) {
         m.reply(e.message || Utils.jsonFormat(e))
      }
   },
   owner: true
}