import fsPromise from 'fs/promises'
import { models } from '../../lib/system/models.js'

export const run = {
   usage: ['restore'],
   category: 'operator',
   async: async (m, {
      client,
      system,
      Config,
      Utils
   }) => {
      try {
         if (m.quoted && /document/.test(m.quoted.mtype) && /json/.test(m.quoted.fileName)) {
            await client.sendReact(m.chat, '🕒', m.key)
            const fn = await Utils.getFile(await m.quoted.download())
            if (!fn.status) return m.reply(Utils.texted('bold', '🚩 File cannot be downloaded.'))
            const data = await fsPromise.readFile(fn.file, 'utf-8')
            await system.proxy.restore(models.structure, data, Config.database)
            m.reply('✅ Database was successfully restored.')
         } else m.reply(Utils.texted('bold', '🚩 Reply to the backup file first then reply with this feature.'))
      } catch (e) {
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: true,
   operator: true
}