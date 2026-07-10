export const run = {
   usage: ['lyric'],
   hidden: ['lirik'],
   use: 'query',
   category: 'searching',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Config,
      Utils
   }) => {
      try {
         client.lyric = client.lyric ? client.lyric : []
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, 'lathi'), m)
         const check = client.lyric.find(v => v.jid == m.sender)
         if (!check && !isNaN(text)) return m.reply(Utils.texted('bold', `🚩 Your session has expired / does not exist, do another search using the keywords you want.`))
         if (check && !isNaN(text)) {
            if (Number(text) > check.results.length) return m.reply(Utils.texted('bold', `🚩 Exceed amount of data.`))
            client.sendReact(m.chat, '🕒', m.key)
            const json = await Api.neoxr('/lyric', {
               q: check.results[Number(text) - 1]
            })
            if (!json.status) return client.reply(m.chat, Utils.jsonFormat(json), m)
            let p = `${json.data.title.toUpperCase()}\n\n`
            p += json.data.lyric
            p += '\n\n' + global.footer
            client.reply(m.chat, p, m)
         } else {
            client.sendReact(m.chat, '🕒', m.key)
            const json = await Api.neoxr('/lyric', {
               q: text
            })
            if (!json.status) return client.reply(m.chat, Utils.jsonFormat(json), m)
            if (!check) {
               client.lyric.push({
                  jid: m.sender,
                  results: json.data.map(v => v.url),
                  created_at: new Date * 1
               })
            } else check.results = json.data.map(v => v.url)
            let p = `To showing lyrics use this command *${isPrefix + command} number*\n`
            p += `*Example* : ${isPrefix + command} 1\n\n`
            json.data.map((v, i) => {
               p += `*${i+1}*. ${v.title}\n`
               p += `◦ *Link* : ${v.url}\n\n`
            }).join('\n\n')
            p += global.footer
            client.reply(m.chat, p, m)
         }
         setInterval(async () => {
            const session = client.lyric.find(v => v.jid == m.sender)
            if (session && new Date - session.created_at > Config.timeout) {
               Utils.removeItem(client.lyric, session)
            }
         }, 60_000)
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true,
   restrict: true
}