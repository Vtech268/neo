export const run = {
   usage: ['cnn'],
   hidden: ['cnnget'],
   category: 'utilities',
   async: async (m, {
      client,
      args,
      text,
      isPrefix,
      command,
      setting,
      Utils
   }) => {
      try {
         client.cnn = client.cnn ? client.cnn : []
         const check = client.cnn.find(v => v.jid == m.sender)
         // if (!check && !isNaN(text)) return m.reply(Utils.texted('bold', `🚩 Your session has expired / does not exist, do another search using the keywords you want.`))
         if (check && !isNaN(text)) {
            if (Number(text) > check.results.length) return m.reply(Utils.texted('bold', `🚩 Exceed amount of data.`))
            client.sendReact(m.chat, '🕒', m.key)
            const json = await Api.neoxr('/cnn', {
               url: check.results[Number(text) - 1]
            })
            if (!json.status) return client.reply(m.chat, Utils.jsonFormat(json), m)
            let p = `*${json.data.title.toUpperCase()}*\n`
            p += `Author by *${json.data.author}*\n`
            p += `Published at : *${json.data.posted_at}*\n\n`
            p += json.data.content + '\n\n'
            p += `Source : ${json.data.source}`
            client.sendMessageModify(m.chat, p, m, {
               largeThumb: true,
               type: 'preview-link',
               thumbnail: await Utils.fetchAsBuffer(json.data.thumbnail),
               link: json.data.source,
               icon: setting.icon ? Utils.isUrl(setting.icon) ? setting.icon : Buffer.from(setting.icon, 'base64') : null
            })
         } else {
            client.sendReact(m.chat, '🕒', m.key)
            const json = await Api.neoxr('/cnn')
            if (!json.status) return client.reply(m.chat, Utils.jsonFormat(json), m)
            if (!check) {
               client.cnn.push({
                  jid: m.sender,
                  results: json.data.map(v => v.url),
                  created_at: new Date * 1
               })
            } else check.results = json.data.map(v => v.url)
            let p = `To read news use this command *${isPrefix + command} number*\n`
            p += `*Example* : ${isPrefix + command} 1\n\n`
            json.data.map((v, i) => {
               p += `*${i+1}*. ${v.title}\n`
               p += `◦ *Link* : ${v.url}\n\n`
            }).join('\n\n')
            p += global.footer
            client.reply(m.chat, p, m)
         }
         setInterval(async () => {
            const session = client.cnn.find(v => v.jid == m.sender)
            if (session && new Date - session.created_at > global.timer) {
               Utils.removeItem(client.cnn, session)
            }
         }, 60_000)
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true
}