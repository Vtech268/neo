export const run = {
   usage: ['^product'],
   use: 'id | text',
   category: 'store',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      setting,
      Utils
   }) => {
      try {
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, 'id | content'), m)
         let [id, ...teks] = text.split `|`
         teks = (teks || []).join `|`
         if (!id) return client.reply(m.chat, Utils.example(isPrefix, command, 'id | content'), m)
         const product = setting.product.sort((a, b) => a.created_at - b.created_at)[Number(id) - 1]
         if (!product) return client.reply(m.chat, Utils.texted('bold', `🚩 Product not found.`), m)
         product.content = (m.quoted && m.quoted.text) ? m.quoted.text.trim() : teks.trim()
         product.created_at = new Date() * 1
         client.reply(m.chat, Utils.texted('bold', `✅ Successfully updated.`), m)
      } catch (e) {
         console.log(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   owner: true
}