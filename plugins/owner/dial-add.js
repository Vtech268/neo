export const run = {
   usage: ['+dial'],
   use: 'title | content',
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
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, 'web api | https://api.neoxr.my.id'), m)
         let [title, ...content] = text.split `|`
         content = (content || []).join `|`
         if (!title) return client.reply(m.chat, Utils.example(isPrefix, command, 'web api | https://api.neoxr.my.id'), m)
         const resp = setting.dial.some(v => v.title === title.trim())
         if (resp) return client.reply(m.chat, Utils.texted('bold', `🚩 Dial already exist.`), m)
         setting.dial.push({
            title: title.trim(),
            response: (m.quoted && m.quoted.text) ? m.quoted.text.trim() : content.trim(),
            created_at: new Date * 1,
            updated_at: new Date * 1
         })
         client.reply(m.chat, Utils.texted('bold', `🚩 Dial successfully added.`), m)
      } catch (e) {
         console.log(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   owner: true
}