export const run = {
   usage: ['^list'],
   hidden: ['updatelist'],
   use: 'id | text',
   category: 'store',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      groupSet,
      Utils
   }) => {
      try {
         groupSet.list = groupSet?.list || []
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, 'id | content'), m)
         let [id, ...teks] = text.split`|`
         teks = (teks || []).join`|`
         if (!id) return client.reply(m.chat, Utils.example(isPrefix, command, 'id | content'), m)
         const list = groupSet.list.sort((a, b) => a.created_at - b.created_at)[Number(id) - 1]
         if (!list) return client.reply(m.chat, Utils.texted('bold', `🚩 List not found.`), m)
         list.content = (m.quoted && m.quoted.text) ? m.quoted.text.trim() : teks.trim()
         list.created_at = new Date() * 1
         client.reply(m.chat, Utils.texted('bold', `✅ Successfully updated.`), m)
      } catch (e) {
         console.log(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   group: true
}