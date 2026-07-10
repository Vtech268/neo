export const run = {
   usage: ['ad'],
   category: 'store',
   async: async (m, {
      client,
      setting,
      Utils
   }) => {
      try {
         setting.schedules = setting.schedules ? setting.schedules : []
         const data = setting.schedules?.filter(v => v.type === 'bc')
         if (data?.length < 1) return client.reply(m.chat, Utils.texted('bold', `🚩 Ad empty.`), m)
         let text = data.sort((a, b) => {
            const [ah, am] = a.time.split(':').map(Number)
            const [bh, bm] = b.time.split(':').map(Number)
            return ah * 60 + am - (bh * 60 + bm)
         }).map((v, i) => {
            if (i == 0) {
               return `┌  ◦  ${v.time}`
            } else if (i == data.sort((a, b) => {
               const [ah, am] = a.time.split(':').map(Number)
               const [bh, bm] = b.time.split(':').map(Number)
               return ah * 60 + am - (bh * 60 + bm)
            }).length - 1) {
               return `└  ◦  ${v.time}`
            } else {
               return `│  ◦  ${v.time}`
            }
         }).join('\n')
         m.reply(text)
      } catch (e) {
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false
}