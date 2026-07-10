export const run = {
   usage: ['soundcloud'],
   hidden: ['scdl'],
   use: 'query / link',
   category: 'downloader',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Utils
   }) => {
      try {
         if (!text) return client.reply(m.chat, `• ${Utils.texted('bold', `Example`)} :\n\n${isPrefix + command} tak ingin usai\n${isPrefix + command} https://soundcloud.com/jebe-788/raim-laode-komang`, m)

         if (!(client.soundcloud instanceof Map)) {
            client.soundcloud = new Map()
         }

         const check = client.soundcloud.get(m.sender)

         if (check && text.match('soundcloud.com')) {
            client.sendReact(m.chat, '🕒', m.key)
            const json = await Api.neoxr('/soundcloud', {
               url: text
            })
            if (!json.status) return client.reply(m.chat, Utils.jsonFormat(json), m)
            return client.sendFile(m.chat, json.data.url, json.data.title + '.mp3', '', m, {
               document: true
            })
         }

         if (!check && !isNaN(text)) return m.reply(Utils.texted('bold', `🚩 Your session has expired / does not exist, do another search using the keywords you want.`))

         if (check && !isNaN(text)) {
            if (Number(text) > check.results.length) return m.reply(Utils.texted('bold', `🚩 Exceed amount of data.`))
            client.sendReact(m.chat, '🕒', m.key)
            const json = await Api.neoxr('/soundcloud', {
               url: check.results[Number(text) - 1]
            })
            if (!json.status) return client.reply(m.chat, Utils.jsonFormat(json), m)
            client.sendFile(m.chat, json.data.url, json.data.title + '.mp3', '', m, {
               document: true
            })

         } else {
            client.sendReact(m.chat, '🕒', m.key)
            const json = await Api.neoxr('/soundcloud-search', {
               q: text
            })
            if (!json.status) return client.reply(m.chat, Utils.jsonFormat(json), m)
            if (text.match('soundcloud.com')) return client.sendFile(m.chat, json.data.url, json.data.title + '.mp3', '', m, {
               document: true
            })

            const newSession = {
               results: json.data.map(v => v.url),
               created_at: new Date() * 1
            }
            client.soundcloud.set(m.sender, newSession)

            let p = `To download use this command *${isPrefix + command} number*\n`
            p += `*Example* : ${isPrefix + command} 1\n\n`
            json.data.forEach((v, i) => {
               p += `*${i + 1}*. ${v.artist + ' – ' + v.title}\n`
               p += `◦ *Link* : ${v.url}\n\n`
            })
            p += global.footer
            client.reply(m.chat, p, m)
         }

         setInterval(async () => {
            for (const [jid, session] of client.soundcloud.entries()) {
               if (session && new Date() - session.created_at > global.timer) {
                  client.soundcloud.delete(jid)
               }
            }
         }, 60_000)

      } catch (e) {
         console.log(e)
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true
}