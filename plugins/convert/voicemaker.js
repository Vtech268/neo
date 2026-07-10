import { readFileSync as read, unlinkSync as remove, writeFileSync as create } from 'fs'
import { exec } from 'child_process'

export const run = {
   usage: ['voicemale', 'voicefemale'],
   use: 'text | pitch',
   category: 'converter',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Utils
   }) => {
      try {
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, 'i love you'), m)
         client.sendReact(m.chat, '🕒', m.key)
         const [t, p] = text.split`|`
         if (t.trim().length > 500) return m.reply(Utils.texted('bold', `🚩 Max 500 character.`))
         if (p && isNaN(p)) return m.reply(Utils.texted('bold', `🚩 Pitch must be a number.`))
         const json = await Api.neoxr('/voicemaker', {
            text: t.trim(),
            gender: command.split('voice').pop()
         })
         if (!json.status) return m.reply(Utils.jsonFormat(json))
         const filePath = await Utils.getFile(json.data.url)
         if (!filePath) return m.reply(Utils.texted('bold', `🚩 Error.`))
         const result = Utils.filename('mp3')
         if (!p) return client.sendFile(m.chat, read(filePath.file), 'audio.mp3', '', m).then(() => {
            remove(filePath.file)
         })
         exec(`ffmpeg -i ${filePath.file} -filter_complex "asetrate=44100*(1 + ${p}/100),aresample=44100" ${result}`, async (err, stderr, stdout) => {
            if (err) return client.reply(m.chat, Utils.texted('bold', `🚩 Conversion failed.`), m)
            let buff = read(result)
            client.sendFile(m.chat, buff, 'audio.mp3', '', m).then(() => {
               remove(result)
               remove(filePath.file)
            })
         })
      } catch (e) {
         client.reply(m.chat, Utils.texted('bold', `🚩 Error.`), m)
      }
   },
   error: false,
   limit: true
}