export const run = {
   usage: ['ava'],
   use: 'mention or reply',
   category: 'group',
   async: async (m, {
      client,
      text,
      Utils
   }) => {
      const target = client.getJid(m, text)
      if (!target) return
      let avatar = null
      try {
         avatar = await client.profilePictureUrl(target, 'image')
      } catch { } finally {
         if (!avatar) return client.reply(m.chat, Utils.texted('bold', `🚩 Target didn't put a profile picture.`), m)
         client.sendFile(m.chat, avatar, '', '', m)
      }

   },
   error: false
}