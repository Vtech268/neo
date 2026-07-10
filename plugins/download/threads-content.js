import { fromUnixTime, format } from 'date-fns'

export const run = {
   usage: ['thcontent'],
   use: 'query',
   category: 'downloader',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Utils,
      Scraper
   }) => {
      try {
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, 'cat'), m)
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.neoxr('/threads-content', {
            q: text
         })

         if (!json.status) return m.reply(Utils.jsonFormat(json))

         switch (json.data.__type) {
            case 'video':
            case 'image': {
               let caption = `${json.data.caption?.trim()}\n\n`
               caption += `> Posted by *@${json.data.author.username}*, Published At : ${format(fromUnixTime(json.data.taken_at), 'dd/MM/yyyy mm:ss')}`
               let url = json.data.media[0].url
               if (json.data.__type === 'image') {
                  const result = await Scraper.toJpg(url)
                  url = result.data.url
               }
               client.sendFile(m.chat, url, '', caption, m)
               break
            }

            case 'carousel': {
               let caption = `${json.data.caption?.trim()}\n\n`
               caption += `> Posted by *@${json.data.author.username}*, Published At : ${format(fromUnixTime(json.data.taken_at), 'dd/MM/yyyy mm:ss')}`
               const files = json.data.media.map(v => ({
                  url: v.url,
                  type: v.type === 'jpg' ? 'image' : 'video',
                  caption
               }))
               client.sendAlbumMessage(m.chat, files, m)
               break
            }

            case 'text': {
               let caption = `${json.data.caption?.trim()}\n\n`
               caption += `> Posted by *@${json.data.author.username}*, Published At : ${format(fromUnixTime(json.data.taken_at), 'dd/MM/yyyy mm:ss')}`
               m.reply(caption)
            }
         }
      } catch (e) {
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true
}