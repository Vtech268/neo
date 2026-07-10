export const run = {
   usage: ['sholat'],
   hidden: ['solat'],
   use: 'city',
   category: 'utilities',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      setting,
      Utils
   }) => {
      try {
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, 'bandung'), m)
         client.sendReact(m.chat, '🕒', m.key)
         let json = await Api.neoxr('/sholat', {
            q: text
         })
         if (!json.status) return client.reply(m.chat, global.status.fail, m)
         let teks = '乂  *S H O L A T*\n\n'
         teks += `“Displays prayer times for the *${Utils.ucword(json.city)}* area as of *${json.date}.*”\n\n`
         for (let v of json.data) teks += `	◦ ${Utils.texted('monospace', Utils.ucword(Object.keys(v)) + ' :')} ${Object.values(v)}\n`
         teks += '\n' + global.footer
         client.sendMessageModify(m.chat, teks, m, {
            largeThumb: true,
            type: 'preview-link',
            thumbnail: await Utils.fetchAsBuffer('https://telegra.ph/file/7f16d028627d675791d68.jpg'),
            icon: setting.icon ? Utils.isUrl(setting.icon) ? setting.icon : Buffer.from(setting.icon, 'base64') : null
         })
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, global.status.error, m)
      }
   },
   error: false
}