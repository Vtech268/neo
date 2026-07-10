export const run = {
   usage: ['twitter'],
   hidden: ['tw', 'twdl'],
   use: 'link',
   category: 'downloader',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      users,
      Utils,
      Scraper,
      Config
   }) => {
      try {
         if (!args || !args[0]) return client.reply(m.chat, Utils.example(isPrefix, command, 'https://twitter.com/mosidik/status/1475812845249957889?s=20'), m)
         if (!args[0].match(/(x.com|twitter.com)/gi)) return client.reply(m.chat, global.status.invalid, m)
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.neoxr('/twitter', {
            url: args[0]
         })
         let old = new Date()
         if (!json.status) return client.reply(m.chat, Utils.jsonFormat(json), m)
         for (let i = 0; i < json.data.length; i++) {
            if (/jpg|mp4/.test(json.data[i].type)) {
               const size = await Utils.getSizeFromUrl(json.data[i].url)
               const chSize = Utils.sizeLimit(size, users.premium ? Config.max_upload : Config.max_upload_free)
               const isOver = users.premium ? `💀 File size (${size}) exceeds the maximum limit, download it by yourself via this link : ${await (await Scraper.shorten(json.data[i].url)).data.url}` : `⚠️ File size (${size}), you can only download files with a maximum size of ${Config.max_upload_free} MB and for premium users a maximum of ${Config.max_upload} MB.`
               if (chSize.oversize) return client.reply(m.chat, isOver, m)
               client.sendFile(m.chat, json.data[i].url, `file.${json.data[i].type}`, '', m)
               await Utils.delay(1500)
            } else if (json.data[i].type == 'gif') {
               client.sendFile(m.chat, json.data[i].url, 'file.mp4', m, {
                  gif: true
               })
            }
         }
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true
}