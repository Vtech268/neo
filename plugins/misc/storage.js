import { Converter } from '@neoxr/wb'
import axios from 'axios'
import mime from 'mime-types'
import fs from 'fs'
import bytes from 'bytes'
import { crypty } from '@neoxr/helper'
import { format } from 'date-fns'

export const run = {
   usage: ['storage'],
   hidden: ['save', 'getfile', 'delfile', 'files', 'drop', 'fileinfo'],
   category: 'miscs',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      isOwner,
      ctx,
      setting,
      hostJid,
      clientJid,
      findJid,
      Utils
   }) => {
      try {
         const data = hostJid ? global.db : findJid.bot(clientJid)?.data

         const commands = ctx.commands
         const MAX_FILE_SIZE = 20 // Max Upload: 20 MB (Don't change it!)

         if (command === 'save') {
            const q = m.quoted ? m.quoted : m
            if (/conversation|extended/.test(q.mtype)) return client.reply(m.chat, Utils.texted('bold', `🚩 Media files not found.`), m)
            const file = await Utils.getFile(await q.download())

            if (!text) return client.reply(m.chat, Utils.texted('bold', `🚩 Give name of the file to be saved.`), m)
            if (text.length > 30) return client.reply(m.chat, Utils.texted('bold', `🚩 File name is too long, max 30 characters.`), m)
            if (commands.includes(text)) return client.reply(m.chat, Utils.texted('bold', `🚩 Unable to save file with name of bot command.`), m)
            if (setting.prefix.includes(text.charAt(0)) || text.charAt(0) === setting.onlyprefix) return client.reply(m.chat, Utils.texted('bold', `🚩 File name cannot start with a prefix.`), m)

            const chSize = Utils.sizeLimit(file.size, MAX_FILE_SIZE)
            if (chSize.oversize) return client.reply(m.chat, Utils.texted('bold', `🚩 File size cannot be more than ${MAX_FILE_SIZE} MB.`), m)

            const check = data.storage.some(v => v.name === text.toLowerCase().trim())
            if (check) return client.reply(m.chat, Utils.texted('bold', `🚩 File already exists in the database.`), m)
            await client.sendReact(m.chat, '🕒', m.key)

            const extension = /audio/.test(q.mimetype) ? 'mp3' : /video/.test(q.mimetype) ? 'mp4' : mime.extension(q.mimetype)
            const filename = Utils.uuid() + '.' + extension
            const safeDelete = (path) => {
               if (fs.existsSync(path)) fs.unlinkSync(path)
            }

            if (extension === 'mp3') {
               const buffer = await Converter.toAudio(await q.download())
               const upload = await crypty(buffer)
               if (!upload.status) return client.reply(m.chat, Utils.texted('bold', `🚩 Can't save file, check your storage configuration.`), m)

               data.storage.push({
                  _id: Utils.uuid(),
                  name: text.toLowerCase().trim(),
                  filename,
                  mime: file.mime,
                  ptt: /audio/.test(file.mime) ? (q.ptt ? true : false) : false,
                  bytes: file.bytes,
                  size: file.size,
                  author: m.sender,
                  uploaded_at: Date.now(),
                  url: upload.data.url
               })
               client.reply(m.chat, `🚩 File successfully saved with name : *${text} (${file.size})*, to get files use *${isPrefix}getfile*`, m).then(() => safeDelete(filename))
            } else {
               const upload = await crypty(fs.readFileSync(file.file))
               if (!upload.status) return client.reply(m.chat, Utils.texted('bold', `🚩 Can't save file, check back your storage configuration.`), m)

               data.storage.push({
                  _id: Utils.uuid(),
                  name: text.toLowerCase().trim(),
                  filename: file.filename,
                  mime: file.mime,
                  ptt: /audio/.test(file.mime) ? (q.ptt ? true : false) : false,
                  bytes: file.bytes,
                  size: file.size,
                  author: m.sender,
                  uploaded_at: Date.now(),
                  url: upload.data.url
               })
               client.reply(m.chat, `🚩 File successfully saved with name : *${text} (${file.size})*, to get files use *${isPrefix}getfile*`, m).then(() => safeDelete(file.file))
            }
         } else if (command === 'getfile') {
            if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, 'meow'), m)

            const files = data.storage.find(v => v.name === text.toLowerCase().trim())
            if (!files) return client.reply(m.chat, Utils.texted('bold', `🚩 File named "${text}" does not exist in the database.`), m)

            let file = null
            if (files.url.includes('qu.ax')) {
               const fileUrl = (files.url.match(/\./g) || []).length === 1 ? `${files.url}.${mime.extension(files.mime)?.replace('jpeg', 'jpg')}` : files.url
               const { data: chunk } = await axios.get(fileUrl, {
                  responseType: 'arraybuffer',
                  headers: {
                     'Referer': 'https://qu.ax/'
                  }
               })

               file = Buffer.from(chunk)
            } else {
               file = files.url
            }

            if (/audio/.test(files.mime)) {
               client.sendFile(m.chat, file, files.filename, '', m, {
                  ptt: files.ptt
               })
            } else if (/webp/.test(files.mime)) {
               client.sendSticker(m.chat, file, m, {
                  packname: setting.sk_pack,
                  author: setting.sk_author
               })
            } else {
               client.sendFile(m.chat, file, files.filename, '', m)
            }
         } else if (command === 'delfile') {
            if (!isOwner) return m.reply(global.status.owner)
            if (!text) return client.reply(m.chat, Utils.texted('bold', `🚩 Give name of the file to be delele.`), m)

            const files = data.storage.find(v => v.name === text.toLowerCase().trim())
            if (!files) return m.reply(Utils.texted('bold', `🚩 File not found.`))

            Utils.removeItem(data.storage, files)
            m.reply(Utils.texted('bold', `🚩 File removed!`))
         } else if (command === 'files') {
            if (data.storage.length < 1) return client.reply(m.chat, Utils.texted('bold', `🚩 No files saved.`), m)
            let text = `乂 *F I L E S*\n\n`
            text += data.storage.map((v, i) => {
               if (i == 0) {
                  return `┌  ◦  ${v.name} (${v.size})`
               } else if (i == data.storage.length - 1) {
                  return `└  ◦  ${v.name} (${v.size})`
               } else {
                  return `│  ◦  ${v.name} (${v.size})`
               }
            }).join('\n')
            m.reply(text + '\n\n' + global.footer)
         } else if (command === 'drop') {
            if (!isOwner) return m.reply(global.status.owner)
            data.storage = []
            m.reply(Utils.texted('bold', `🚩 All files were successfully deleted!`))
         } else if (command === 'fileinfo') {
            if (!text) return client.reply(m.chat, Utils.texted('bold', `🚩 Give name of the file to be delele.`), m)

            const files = data.storage.find(v => v.name === text.toLowerCase().trim())
            if (!files) return m.reply(Utils.texted('bold', `🚩 File not found.`))

            let teks = ''

            const { _id, bytes, uploaded_at, url, ...file } = files

            for (let i in file) {
               teks += i === 'author' ? `◦  ${Utils.ucword(i)} : @${files[i]?.replace(/@.+/, '')}\n` : `◦  ${Utils.ucword(i)} : ${files[i]}\n`
            }
            teks += `◦  Uploaded At : ${format(uploaded_at, 'EEEE, dd/MM/yy HH:mm')}\n\n`
            teks += `> To get file you can send *${isPrefix}getfile ${text}* or send *${text}* without command.`

            m.reply(teks.trim())
         } else if (command === 'storage') {
            if (data.storage.length < 1) return client.reply(m.chat, Utils.texted('bold', `🚩 No files saved.`), m)
            let size = 0
            data.storage.map(v => size += bytes(v.size))
            let teks = `Use the following command to save media files to Cloud Storage :\n\n`
            teks += `➠ *${isPrefix}files* ~ See all files saved\n`
            teks += `➠ *${isPrefix}save filename* ~ Save files\n`
            teks += `➠ *${isPrefix}getfile filename* ~ Get files in the database\n`
            teks += `➠ *${isPrefix}fileinfo filename* ~ Get files information\n`
            teks += `➠ *${isPrefix}delfile filename* ~ Delete files\n`
            teks += `➠ *${isPrefix}drop* ~ delete all files\n\n`
            teks += `💾 Total Size : [ *${Utils.formatSize(size)}* ]`
            m.reply(teks)
         }
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true
}