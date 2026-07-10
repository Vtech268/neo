import { Converter } from '@neoxr/wb'
import { format } from 'date-fns'
import { lookup } from 'mime-types'

export const run = {
   usage: ['terabox'],
   hidden: ['tb'],
   use: 'link',
   category: 'downloader',
   async: async (m, {
      client,
      args,
      text,
      isPrefix,
      command,
      users,
      Config,
      Utils
   }) => {
      try {
         client.terabox = client.terabox ? client.terabox : []
         const check = client.terabox.find(v => v.jid == m.sender)
         if (!args || !args[0]) return client.reply(m.chat, Utils.example(isPrefix, command, 'https://terabox.com/s/12R4ItzFJkI7919sdEzl0YA'), m)
         if (Utils.isUrl(args[0])) {
            if (!args[0].match('tera')) return client.reply(m.chat, global.status.invalid, m)
            client.sendReact(m.chat, '🕒', m.key)
            const json = await Api.neoxr('/terabox', {
               url: args[0]
            })
            if (!json.status) return client.reply(m.chat, Utils.jsonFormat(json), m)
            if (json.data.length === 1) {
               const chSize = Utils.sizeLimit(json.data[0].size, users.premium ? Config.max_upload : Config.max_upload_free)
               const isOver = users.premium ? `💀 File size (${json.data[0].size}) exceeds the maximum limit.` : `⚠️ File size (${json.data[0].size}), you can only download files with a maximum size of ${Config.max_upload_free} MB and for premium users a maximum of ${Config.max_upload} MB.`
               if (chSize.oversize) return client.reply(m.chat, isOver, m)
               let caption = `乂  *T E R A B O X*\n\n`
               caption += '	◦  *ID* : ' + json.data[0].fs_id + '\n'
               caption += '	◦  *Name* : ' + json.data[0].server_filename + '\n'
               caption += '   ◦  *Size* : ' + json.data[0].size + '\n'
               caption += '	◦  *Extension* : ' + json.data[0].server_filename?.split('.')?.pop() + '\n'
               caption += '	◦  *Mime* : ' + lookup(json.data[0].server_filename?.split('.')?.pop()) + '\n'
               caption += '	◦  *Uploaded* : ' + format(new Date(json.data[0].server_mtime * 1000), 'EEEE, dd/MM/yyyy - HH:mm') + '\n\n'
               caption += global.footer
               const shouldSendDocument = !/mp4|jpg/.test(lookup(json.data[0].server_filename?.split('.')?.pop())) ? { document: true } : { document: (json.data[0].size).replace(/MB/g, '')?.trim() > 99 }
               const isFile = /mp4/.test(lookup(json.data[0].server_filename?.split('.')?.pop())) ? await Converter.toVideo(json.data[0].dlink) : json.data[0].dlink
               client.sendFile(m.chat, isFile, json.data[0].server_filename, caption, m, {
                  ...shouldSendDocument
               })
               return
            } else {
               if (!check) {
                  client.terabox.push({
                     jid: m.sender,
                     results: json.data,
                     created_at: new Date * 1
                  })
               } else check.results = json.data
               let p = `To get file use this command *${isPrefix + command} number*\n`
               p += `*Example* : ${isPrefix + command} 1\n\n`
               json.data.map((v, i) => {
                  p += `*${i + 1}*. ${v.fs_id}\n`
                  p += `◦ *Filename* : ${v.server_filename}\n`
                  p += `◦ *Size* : ${v.size}\n`
                  p += `◦ *Uploaded* : ${format(v.server_mtime * 1000, 'EEEE, dd/MM/yyyy - HH:mm')}\n\n`
               }).join('\n\n')
               p += global.footer
               client.reply(m.chat, p, m)
            }
         } else {
            if (!check && !isNaN(text)) return m.reply(Utils.texted('bold', `🚩 Your session has expired / does not exist, do another search using the keywords you want.`))
            if (check && !isNaN(text)) {
               if (Number(text) > check.results.length) return m.reply(Utils.texted('bold', `🚩 Exceed amount of data.`))
               client.sendReact(m.chat, '🕒', m.key)
               const file = check.results[Number(text) - 1]
               const chSize = Utils.sizeLimit(file.size, users.premium ? Config.max_upload : Config.max_upload_free)
               const isOver = users.premium ? `💀 File size (${file.size}) exceeds the maximum limit.` : `⚠️ File size (${file.size}), you can only download files with a maximum size of ${Config.max_upload_free} MB and for premium users a maximum of ${Config.max_upload} MB.`
               if (chSize.oversize) return client.reply(m.chat, isOver, m)
               let caption = `乂  *T E R A B O X*\n\n`
               caption += '	◦  *ID* : ' + file.fs_id + '\n'
               caption += '	◦  *Name* : ' + file.server_filename + '\n'
               caption += '   ◦  *Size* : ' + file.size + '\n'
               caption += '	◦  *Extension* : ' + file.server_filename?.split('.')?.pop() + '\n'
               caption += '	◦  *Mime* : ' + lookup(file.server_filename?.split('.')?.pop()) + '\n'
               caption += '	◦  *Uploaded* : ' + format(file.server_mtime * 1000, 'EEEE, dd/MM/yyyy - HH:mm') + '\n\n'
               caption += global.footer
               const shouldSendDocument = !/mp4|jpg/.test(lookup(file.server_filename?.split('.')?.pop())) ? { document: true } : { document: (file.size).replace(/MB/g, '')?.trim() > 99 }
               const isFile = /mp4/.test(lookup(file.server_filename?.split('.')?.pop())) ? await Converter.toVideo(file.dlink) : file.dlink
               client.sendFile(m.chat, isFile, file.server_filename, caption, m, {
                  ...shouldSendDocument
               })
            }
         }
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true
}