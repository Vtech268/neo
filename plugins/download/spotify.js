export const run = {
   usage: ['spotify'],
   use: 'query / link',
   category: 'downloader',
   async: async (m, {
      client,
      args,
      text,
      isPrefix,
      command,
      setting,
      Config,
      Utils
   }) => {
      try {
         if (!(client.spotify instanceof Map)) {
            client.spotify = new Map()
         }

         const check = client.spotify.get(m.sender)

         if (!args || !args[0]) return client.reply(m.chat, Utils.example(isPrefix, command, 'https://open.spotify.com/track/6cHCixTkEFATjcu5ig8a7I'), m)
         client.sendReact(m.chat, '🕒', m.key)

         if (args[0].match('open.spotify.com') && /track/.test(args[0])) {
            const json = await Api.neoxr('/spotify', {
               url: args[0]
            })
            if (!json.status) return client.reply(m.chat, Utils.jsonFormat(json), m)
            let caption = `乂  *S P O T I F Y*\n\n`
            caption += `	◦  *Title* : ${json.data.title}\n`
            caption += `	◦  *Artist* : ${json.data.artist.name}\n`
            caption += `	◦  *Duration* : ${json.data.duration}\n`
            caption += `	◦  *Source* : ${args[0]}\n\n`
            caption += global.footer
            client.sendMessageModify(m.chat, caption, m, {
               largeThumb: true,
               type: 'preview-link',
               thumbnail: await Utils.fetchAsBuffer(json.data.thumbnail),
               icon: setting.icon ? Utils.isUrl(setting.icon) ? setting.icon : Buffer.from(setting.icon, 'base64') : null
            }).then(async () => {
               client.sendFile(m.chat, json.data.url, json.data.title + '.mp3', '', m, {
                  document: true,
                  APIC: await Utils.fetchAsBuffer(json.data.thumbnail)
               })
            })

         } else if (args[0].match('open.spotify.com') && /playlist/.test(args[0])) {

            if (check && !isNaN(text)) {
               if (Number(text) > check.results.length) return m.reply(Utils.texted('bold', `🚩 Exceed amount of data.`))
               client.sendReact(m.chat, '🕒', m.key)
               const json = await Api.neoxr('/spotify', {
                  url: check.results[Number(text) - 1]
               })
               if (!json.status) return client.reply(m.chat, Utils.jsonFormat(json), m)
               let caption = `乂  *S P O T I F Y*\n\n`
               caption += `	◦  *Title* : ${json.data.title}\n`
               caption += `	◦  *Artist* : ${json.data.artist.name}\n`
               caption += `	◦  *Duration* : ${json.data.duration}\n`
               caption += `	◦  *Source* : ${check.results[Number(text) - 1]}\n\n`
               caption += global.footer
               client.sendMessageModify(m.chat, caption, m, {
                  largeThumb: true,
                  type: 'preview-link',
                  thumbnail: await Utils.fetchAsBuffer(json.data.thumbnail),
                  icon: setting.icon ? Utils.isUrl(setting.icon) ? setting.icon : Buffer.from(setting.icon, 'base64') : null
               }).then(async () => {
                  client.sendFile(m.chat, json.data.url, json.data.title + '.mp3', '', m, {
                     document: true,
                     APIC: await Utils.fetchAsBuffer(json.data.thumbnail)
                  })
               })

            } else {
               client.sendReact(m.chat, '🕒', m.key)
               const json = await Api.neoxr('/spotify', {
                  url: args[0]
               })
               if (!json.status) return client.reply(m.chat, Utils.jsonFormat(json), m)

               const newSession = {
                  results: json.tracks.map(v => v.url),
                  created_at: new Date() * 1
               }
               client.spotify.set(m.sender, newSession)

               let p = `To get song use this command *${isPrefix + command} number*\n`
               p += `*Example* : ${isPrefix + command} 1\n\n`
               json.tracks.forEach((v, i) => {
                  p += `*${i + 1}*. ${v.title}\n`
                  p += `◦ *Artists* : ${v.artists}\n`
                  p += `◦ *Album* : ${v.album}\n\n`
               })
               p += global.footer
               client.reply(m.chat, p, m)
            }
         } else {

            if (!check && !isNaN(text)) return m.reply(Utils.texted('bold', `🚩 Your session has expired / does not exist, do another search using the keywords you want.`))

            if (check && !isNaN(text)) {
               if (Number(text) > check.results.length) return m.reply(Utils.texted('bold', `🚩 Exceed amount of data.`))
               client.sendReact(m.chat, '🕒', m.key)

               const json = await Api.neoxr('/spotify', {
                  url: check.results[Number(text) - 1]
               })
               if (!json.status) return client.reply(m.chat, Utils.jsonFormat(json), m)
               let caption = `乂  *S P O T I F Y*\n\n`
               caption += `	◦  *Title* : ${json.data.title}\n`
               caption += `	◦  *Artist* : ${json.data.artist.name}\n`
               caption += `	◦  *Duration* : ${json.data.duration}\n`
               caption += `	◦  *Source* : ${check.results[Number(text) - 1]}\n\n`
               caption += global.footer
               client.sendMessageModify(m.chat, caption, m, {
                  largeThumb: true,
                  type: 'preview-link',
                  thumbnail: await Utils.fetchAsBuffer(json.data.thumbnail),
                  icon: setting.icon ? Utils.isUrl(setting.icon) ? setting.icon : Buffer.from(setting.icon, 'base64') : null
               }).then(async () => {
                  client.sendFile(m.chat, json.data.url, json.data.title + '.mp3', '', m, {
                     document: true,
                     APIC: await Utils.fetchAsBuffer(json.data.thumbnail)
                  })
               })

            } else {
               client.sendReact(m.chat, '🕒', m.key)
               const json = await Api.neoxr('/spotify-search', {
                  q: text
               })
               if (!json.status) return client.reply(m.chat, Utils.jsonFormat(json), m)

               const newSession = {
                  results: json.data.map(v => v.url),
                  created_at: new Date() * 1
               }
               client.spotify.set(m.sender, newSession)

               let p = `To get information use this command *${isPrefix + command} number*\n`
               p += `*Example* : ${isPrefix + command} 1\n\n`
               json.data.forEach((v, i) => {
                  p += `*${i + 1}*. ${v.title}\n`
                  p += `◦ *Duration* : ${v.duration}\n`
                  p += `◦ *Popularity* : ${v.popularity}\n\n`
               })
               p += global.footer
               client.reply(m.chat, p, m)
            }
         }

         setInterval(async () => {
            for (const [jid, session] of client.spotify.entries()) {
               if (session && new Date() - session.created_at > Config.timeout) {
                  client.spotify.delete(jid)
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