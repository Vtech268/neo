import fs from 'node:fs'

export const run = {
   usage: ['getplugin'],
   hidden: ['gp'],
   category: 'operator',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      Utils
   }) => {
      try {
         if (!args || !args[0]) return m.reply(Utils.example(isPrefix, command, 'plugins/owner/hidetag.js'))
         const dir = args[0].startsWith('/') ? `.${args[0]}` : `./${args[0]}`
         if (!dir.endsWith('.js')) return m.reply(Utils.texted('bold', `🚩 Plugin doesn't exists.`))
         if (!fs.existsSync(dir)) return m.reply(Utils.texted('bold', `🚩 Plugin doesn't exists.`))
         client.sendMetaMsg(m.chat, [{
            text: '',
            code: {
               language: 'javascript',
               code: fs.readFileSync(dir, 'utf-8')
            }
         }], m)
      } catch (e) {
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   operator: true
}