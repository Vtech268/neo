export const run = {
   usage: ['det', 'dec'],
   use: 'id | text',
   category: 'owner',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      setting,
      Utils
   }) => {
      try {
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, '1 | neoxr'), m)
         let [id, ...teks] = text.split `|`
         teks = (teks || []).join `|`
         if (!id) return client.reply(m.chat, Utils.example(isPrefix, command, '1 | neoxr'), m)
         const is_dial = setting.dial.sort((a, b) => a.created_at - b.created_at)[Number(id.trim()) - 1]
         if (!is_dial) return client.reply(m.chat, Utils.texted('bold', `🚩 Dial not found.`), m)
         if (command == 'det') {
            is_dial.title = (m.quoted && m.quoted.text) ? m.quoted.text.trim() : teks.trim()
         } else if (command === 'dec') {
            is_dial.response = (m.quoted && m.quoted.text) ? m.quoted.text.trim() : teks.trim()
         }
         is_dial.updated_at = new Date() * 1
         client.reply(m.chat, Utils.texted('bold', `✅ Successfully updated.`), m)
      } catch (e) {
         console.log(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   owner: true
}