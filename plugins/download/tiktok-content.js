import { fromUnixTime, format } from 'date-fns'

export const run = {
   usage: ['ttcontent'],
   use: 'query',
   category: 'downloader',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Utils
   }) => {
      try {
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, 'cat'), m)
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.neoxr('/tiktok-content', {
            q: text
         })
         if (!json.status) return m.reply(Utils.jsonFormat(json))
         let caption = `乂  *T I K T O K*\n\n`
         caption += `	◦  *ID* : ${json?.data?.id || '-'}\n`
         caption += `	◦  *Author* : ${json?.data?.author?.nickname || '-'} (@${json?.data?.author?.unique_id || '-'})\n`
         caption += `	◦  *Views* : ${Utils.h2k(json?.data?.statistic?.views || 0)}\n`
         caption += `	◦  *Likes* : ${Utils.h2k(json?.data?.statistic?.likes || 0)}\n`
         caption += `	◦  *Comments* : ${Utils.h2k(json?.data?.statistic?.comments || 0)}\n`
         caption += `	◦  *Shares* : ${Utils.h2k(json?.data?.statistic?.shares || 0)}\n`
         caption += `	◦  *Saved* : ${Utils.h2k(json?.data?.statistic?.saved || 0)}\n`
         caption += `	◦  *Posted At* : ${format(fromUnixTime(json?.data?.published || 0), 'dd/MM/yyyy mm:ss')}\n\n`
         caption += `乂  *M U S I C*\n\n`
         caption += `	◦  *Title* : ${json?.data?.music?.title || '-'}\n`
         caption += `	◦  *Author* : ${json?.data?.music?.author || '-'}\n`
         caption += `	◦  *Duration* : ${json?.data?.music?.duration || 0} seconds\n`
         caption += `	◦  *Original* : ${json?.data?.music?.original ? 'Yes' : 'No'}\n`
         caption += `	◦  *Copyright* : ${json?.data?.music?.copyright ? 'Yes' : 'No'}\n\n`
         caption += `乂  *C A P T I O N*\n\n`
         caption += (json?.data?.caption || '-')
         client.sendFile(m.chat, json.data.videoUrl, 'video.mp4', caption, m)
      } catch (e) {
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true
}