export const run = {
   usage: ['checkapi'],
   category: 'miscs',
   async: async (m, {
      client,
      setting,
      Utils
   }) => {
      try {
         const json = await Api.neoxr('/check')
         if (!json.status) return m.reply(Utils.jsonFormat(json))
         let caption = `乂 A P I K E Y\n\n`
         caption += `   ◦  *Name* : ${json.data.name}\n`
         caption += `   ◦  *Limit* : (${json.data.limit} / ${json.data.total})\n`
         caption += `   ◦  *Premium* : ${json.data.premium ? '√' : '×'}\n`
         caption += `   ◦  *Expired* : ${json.data.expired_at}\n\n`
         caption += global.footer
         client.sendMessageModify(m.chat, caption, m, {
            largeThumb: true,
            type: 'preview-link',
            thumbnail: json.data.url,
            icon: setting.icon ? Utils.isUrl(setting.icon) ? setting.icon : Buffer.from(setting.icon, 'base64') : null
         })
      } catch (e) {
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false
}