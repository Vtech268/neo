export const run = {
   usage: ['meta'],
   use: 'prompt',
   category: 'ai',
   async: async (m, {
      client,
      text,
      Utils
   }) => {
      try {
         if (!text) return client.reply(m.chat, Utils.texted('bold', `🚩 Please provide a prompt.`), m)
         await client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.neoxr('/meta', {
            q: encodeURIComponent(text)
         })
         if (!json.status) return client.reply(m.chat, Utils.texted('bold', `🚩 ${json.msg}`), m)
         if (json?.data?.media) {
            const files = json.data.media.map(v => ({
               url: v.url,
               type: 'image'
            }))
            client.sendAlbumMessage(m.chat, files, m)
         }
         if (json?.data?.message) return m.reply(json.data.message.replace(/\*\*/g, '*'))
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true
}