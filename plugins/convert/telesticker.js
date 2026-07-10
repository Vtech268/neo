export const run = {
   usage: ['telesticker'],
   hidden: ['telestik', 'telestick'],
   use: 'link',
   category: 'converter',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      setting,
      Utils
   }) => {
      try {
         if (!args || !args[0]) return client.reply(m.chat, Utils.example(isPrefix, command, 'https://t.me/addstickers/NonromanticBear'), m)
         client.sendReact(m.chat, '🕒', m.key)

         const json = await Api.neoxr('/telesticker', {
            url: args[0]
         })
         if (!json.status) return m.reply(Utils.jsonFormat(json))

         try {
            const allStickers = json.data || []
            const chunkSize = 60
            const totalParts = Math.ceil(allStickers.length / chunkSize)

            for (let i = 0; i < totalParts; i++) {
               const chunk = allStickers.slice(i * chunkSize, (i + 1) * chunkSize)
               const stickers = []

               for (const v of chunk) {
                  stickers.push({
                     data: { url: v.url },
                     emojis: v.emoji ? [v.emoji] : []
                  })
               }

               const baseName = json.metadata.title
               const packName = totalParts > 1
                  ? `${baseName} (${i + 1}/${totalParts})`
                  : baseName

               client.sendStickerPack(m.chat, stickers, m, {
                  name: packName,
                  publisher: setting.sk_author,
                  description: 'Telegram Sticker to WhatsApp',
                  cover: await Utils.fetchAsBuffer('./media/image/thumb.jpg'),
                  exif: {
                     packname: setting.sk_pack,
                     author: setting.sk_author
                  }
               })
            }
         } catch {
            for (let v of json.data) {
               const buffer = await Utils.fetchAsBuffer(v.url)
               client.sendSticker(m.chat, buffer, m, {
                  packname: setting.sk_pack,
                  author: setting.sk_author,
               })
               await Utils.delay(1500)
            }
         }
      } catch (e) {
         console.error(e)
         return client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true
}