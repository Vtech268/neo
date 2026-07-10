import fs from 'node:fs'

export const run = {
   usage: ['deleteplugin'],
   hidden: ['delplugin', 'dp'],
   category: 'operator',
   async: async (m, {
      args,
      isPrefix,
      command,
      Utils
   }) => {
      try {
         if (!args || !args[0]) return m.reply(Utils.example(isPrefix, command, 'plugins/owner/hidetag.js'))
         const dir = args[0].startsWith('/') ? `.${args[0]}` : `./${args[0]}`
         if (!dir.endsWith('.js')) return m.reply(Utils.texted('bold', `🚩 File must be a .js plugin.`))
         if (!fs.existsSync(dir)) return m.reply(Utils.texted('bold', `🚩 Plugin not found.`))
         await fs.promises.unlink(dir)
         m.reply(Utils.texted('bold', `✅ Plugin successfully deleted: ${dir}`))
      } catch (e) {
         return m.reply(Utils.jsonFormat(e))
      }
   },
   operator: true
}