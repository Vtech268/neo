import fs from 'node:fs'
import path from 'path'

export const run = {
   usage: ['saveplugin'],
   hidden: ['sp'],
   category: 'operator',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      Utils
   }) => {
      try {
         if (!args || !args[0]) return m.reply(Utils.example(isPrefix, command, 'owner/hidetag.js code'))
         const dir = args[0].startsWith('/') ? `./plugins/${args[0]}` : `./plugins/${args[0]}`
         if (m?.quoted) {
            var code = m.quoted?.text
            if (!code) return m.reply(Utils.example(isPrefix, command, 'owner/hidetag.js code'))
         } else {
            if (args.length < 2) return m.reply(Utils.example(isPrefix, command, 'owner/hidetag.js code'))
            var code = args.slice(1).join(' ')
         }
         const dir_path = path.dirname(dir)
         if (!fs.existsSync(dir_path)) {
            fs.mkdirSync(dir_path, {
               recursive: true
            })
         }
         fs.writeFile(dir, code, 'utf-8', (err) => {
            if (err) return m.reply(Utils.jsonFormat(err))
            // Update the file's last modified time
            fs.utimesSync(dir, new Date(), new Date())
            m.react('✅')
         })
      } catch (e) {
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   operator: true
}