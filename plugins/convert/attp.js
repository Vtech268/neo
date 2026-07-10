export const run = {
   usage: ['attp', 'attp2', 'attp3'],
   use: 'text',
   category: 'converter',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      setting,
      Utils
   }) => {
      try {
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, 'neoxr bot'), m)
         if (text.length > 150) return client.reply(m.chat, Utils.texted('bold', `🚩 Max 150 character.`), m)
         client.sendReact(m.chat, '🕒', m.key)
         if (['attp', 'attp2'].includes(command)) {
            var json = await Api.neoxr(`/${command}`, {
               text,
               color: JSON.stringify([
                  "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF", // Main color
                  "#FF6347", "#FFD700", "#98FB98", "#8A2BE2", "#DC143C", "#FF8C00"  // Additional color
               ])
            })
         } else {
            var json = await Api.neoxr(`/${command}`, {
               text,
               color: Utils.random([
                  "FDE2E2", // Soft Pink
                  "FFF1CF", // Soft Yellow
                  "CDEDEB", // Soft Teal
                  "E8DFF5", // Soft Lavender
                  "FADCD9", // Soft Peach
                  "D6ECF3", // Soft Sky Blue
                  "FFF8E6", // Soft Ivory
                  "FBE6C5", // Soft Sand
                  "F2F2F2", // Soft Gray
                  "FFEEF2"  // Soft Blush
               ])
            })
         }
         if (!json.status) return client.reply(m.chat, Utils.texted('bold', `🚩 Can't convert text to sticker.`), m)
         const buffer = await Utils.fetchAsBuffer(json.data.url)
         await client.sendSticker(m.chat, buffer, m, {
            packname: setting.sk_pack,
            author: setting.sk_author
         })
      } catch (e) {
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true
}