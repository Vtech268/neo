import translate from 'translate-google-api'

export const run = {
   async: async (m, {
      client,
      setting,
      Utils
   }) => {
      try {
         if (!setting.mimic || !Array.isArray(setting.mimic)) {
            setting.mimic = []
         }

         const fn = setting.mimic.find(v => v.jid === m.sender)

         if (fn && typeof m.text === 'string') {
            const data = m.text?.replace(new RegExp('\n', 'g'), '‾')
            const result = await translate(data, { to: fn.lang || 'en' })
            client.reply(m.chat, result[0].replace(new RegExp('‾', 'g'), '\n'), m)
         }
      } catch (e) {
         client.reply(m.chat, `🚩 ${e.message}` || Utils.jsonFormat(e), m)
      }
   },
   error: false,
   group: true
}