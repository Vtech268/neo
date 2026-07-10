import fs from 'node:fs'

export const run = {
   usage: ['backupsc'],
   category: 'operator',
   async: async (m, {
      client,
      Utils
   }) => {
      try {
         client.sendReact(m.chat, '🕒', m.key)
         const DIR = './temp'
         const FILENAME = `backup_${new Date().toISOString().replace(/:/g, '-')}.zip`
         const DONT_ZIP = ['nuxt/node_modules', 'nuxt/.nuxt', 'nuxt/.output', 'node_modules', '.git', 'session', '.cache']
         const backup = await Utils.compressToZip(process.cwd(), DIR + '/' + FILENAME, DONT_ZIP)
         if (!backup.status) return m.reply(Utils.jsonFormat(backup))
         const buffer = fs.readFileSync(DIR + '/' + FILENAME)
         client.sendFile(m.chat, buffer, FILENAME, '', m).then(() => Utils.cleanUp())
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   operator: true,
   private: true
}