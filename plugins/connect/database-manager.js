import { encrypt, decrypt } from '../../core/utils/index.js'
import fs from 'node:fs'
import { models } from '../../lib/system/models.js'

export const run = {
   usage: ['backupdb', 'restoredb'],
   category: 'bot hosting',
   async: async (m, {
      client,
      command,
      Config,
      system,
      Utils
   }) => {
      try {
         if (!global.db?.bots?.length) return client.reply(m.chat, Utils.texted('bold', `🚩 No bots connected.`), m)
         let bot = global.db.bots.get(client.decodeJid(client.user.id))
         if (bot.connector.sessionOpts.owner !== m.sender) return client.reply(m.chat, Utils.texted('bold', `🚩 You can't access this feature.`), m)

         await client.sendReact(m.chat, '🕒', m.key)

         if (command === 'backupdb') {
            const data = await system.proxy.backup(models.structure, Config.database, bot.jid)
            const now = new Intl.DateTimeFormat('en-CA', { timeZone: process.env.TZ, hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date()).replace(', ', '_').replace(/:/g, '-')
            const buffer = Buffer.from(JSON.stringify(encrypt(data)))
            const filename = `backup-${bot.connector.sessionOpts.number}-${now}.json`
            await client.sendFile(m.chat, buffer, filename, '', m)
         } else if (command === 'restoredb') {
            if (m.quoted && /document/.test(m.quoted.mtype) && /json/.test(m.quoted.fileName)) {
               const fn = await Utils.getFile(await m.quoted.download())
               if (!fn.status) return m.reply(Utils.texted('bold', '❌ File cannot be downloaded.'))

               let json
               try {
                  json = JSON.parse(fs.readFileSync(fn.file, 'utf-8'))
               } catch (err) {
                  return m.reply(Utils.texted('bold', '❌ Invalid JSON file format.'))
               }

               let decrypted
               try {
                  decrypted = decrypt(json)
               } catch (err) {
                  return m.reply(Utils.texted('bold', '❌ Failed to decrypt backup, file may be corrupted or invalid.'))
               }

               await system.proxy.restore(models.structure, decrypted, Config.database, bot.jid)
               m.reply('✅ Database was successfully restored.')
            } else m.reply(Utils.texted('bold', '🚩 Reply to the backup file first then reply with this feature.'))
         }
      } catch (e) {
         client.reply(m.chat, Utils.texted('bold', `🚩 ${e.message}.`), m)
      }
   },
   error: false,
   owner: true,
   private: true
}