import { format } from 'date-fns'

export const run = {
   async: async (m, {
      client,
      body,
      setting,
      Config,
      Utils
   }) => {
      try {
         if (
            (body && Config.evaluate_chars.some(v => body.startsWith(v))) ||
            (body && Utils.socmed(body)) ||
            !/conversation|extended|interactiveResponseMessage/.test(m.mtype)
         ) return

         setting.dial = setting.dial || []

         const content = setting.dial.sort((a, b) => a.created_at - b.created_at)[Number(body) - 1]

         if (content && !setting.lock) {
            let p = `*${content.title.toUpperCase()}*\n`
            p += `*Updated* : ${format(new Date(content.updated_at), 'dd/MM/yyyy HH:mm:ss')} WIB\n\n`
            p += content.response
            m.reply(p)
         }
      } catch (e) {
         console.log(e)
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   private: true
}
