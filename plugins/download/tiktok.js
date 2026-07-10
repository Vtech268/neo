import { fromUnixTime, format } from 'date-fns'

export const run = {
   usage: ['tiktok', 'tikmp3', 'tikwm'],
   hidden: ['tt'],
   use: 'link',
   category: 'downloader',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      Utils
   }) => {
      try {
         if (!args || !args[0]) return client.reply(m.chat, Utils.example(isPrefix, command, 'https://vm.tiktok.com/ZSR7c5G6y/'), m)
         if (!args[0].match('tiktok.com')) return client.reply(m.chat, global.status.invalid, m)
         client.sendReact(m.chat, '🕒', m.key)
         let old = new Date()
         const json = await Api.neoxr('/tiktok', {
            url: Utils.ttFixed(args[0])
         })
         if (!json.status) return m.reply(Utils.jsonFormat(json))
         if (command == 'tiktok' || command == 'tt') {
            // if (json.data.video) return client.sendFile(m.chat, json.data.video, 'video.mp4', `🍟 *Fetching* : ${((new Date - old) * 1)} ms`, m)
            let caption = `乂  *T I K T O K*\n\n`
            caption += `	◦  *ID* : ${json?.data?.id || '-'}\n`
            caption += `	◦  *Author* : ${json?.data?.author?.nickname || '-'} (@${json?.data?.author?.uniqueId || '-'})\n`
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
            if (json.data.video) return client.sendFile(m.chat, json.data.video, 'video.mp4', caption, m)
            if (json.data.photo) {
               const files = json.data.photo.map(v => ({
                  url: v,
                  type: 'image'
               }))
               client.sendAlbumMessage(m.chat, files, m)
            }
         }
         if (command == 'tikwm') return client.sendFile(m.chat, json.data.videoWM, 'video.mp4', `🍟 *Fetching* : ${((new Date - old) * 1)} ms`, m)
         if (command == 'tikmp3') return !json.data.audio ? client.reply(m.chat, global.status.fail, m) : client.sendFile(m.chat, json.data.audio, 'audio.mp3', '', m)
      } catch (e) {
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true
}