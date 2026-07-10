import fs from 'node:fs'

export const run = {
   usage: ['fetch'],
   hidden: ['get'],
   use: 'link',
   category: 'downloader',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      setting,
      Config,
      Utils
   }) => {
      try {
         if (!args || !args[0]) return client.reply(m.chat, Utils.example(isPrefix, command, setting.cover), m)
         client.sendReact(m.chat, '🕒', m.key)
         const [url] = args

         if (url.match('github.com')) {
            const username = url.split(`/`)[3]
            const repository = url.split(`/`)[4]
            const zipball = `https://api.github.com/repos/${username.trim()}/${repository.trim()}/zipball`
            return client.sendFile(m.chat, zipball, `${repository}.zip`, '', m)
         }

         const response = await Utils.getFile(url)

         if (!response.status)
            return client.reply(m.chat, `💀 Failed to fetch: ${response.msg}`, m)

         const chSize = Utils.sizeLimit(response.size, Config.max_upload)
         if (chSize.oversize)
            return client.reply(m.chat, `💀 File size (${response.size}) exceeds the maximum limit, we can't download the file.`, m)

         if (/json/i.test(response.mime)) {
            return m.reply(Utils.jsonFormat(JSON.parse(fs.readFileSync(response.file, 'utf-8'))))
         }
         
         if (/text/i.test(response.mime)) {
            return m.reply(fs.readFileSync(response.file, 'utf-8'))
         }

         client.sendFile(m.chat, fs.readFileSync(response.file), '', '', m)
      } catch (e) {
         console.error(e)
         client.reply(m.chat, `💀 An error occurred: ${e.message}`, m)
      }
   },
   error: false,
   limit: true
}