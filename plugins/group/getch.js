import { format } from 'date-fns'

export const run = {
   usage: ['getch'],
   use: 'link',
   category: 'group',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      Utils
   }) => {
      try {
         if (!args || !args[0]) {
            return m.reply(
               Utils.example(isPrefix, command, 'https://whatsapp.com/channel/0029Va4K0PZ5a245NkngBA2M')
            )
         }

         const match = args[0].match(/\/channel\/([a-zA-Z0-9]+)/)
         if (!match) return m.reply(global.status.invalid)

         const meta = await client.newsletterMetadata('INVITE', match[1])

         let caption = `乂  *C H A N N E L*\n\n`
         caption += `	◦  *ID* : ${meta.id}\n`
         caption += `	◦  *Name* : ${meta.thread_metadata.name.text}\n`
         caption += `	◦  *Subscribers* : ${Utils.formatter(meta.thread_metadata.subscribers_count)}\n`
         caption += `	◦  *Status* : ${meta.state.type}\n`
         caption += `	◦  *Verification* : ${meta.thread_metadata.verification}\n`
         caption += `	◦  *Description* : ${meta.thread_metadata.description.text}\n`
         caption += `	◦  *Created* : ${format(new Date(meta.thread_metadata.creation_time * 1000), 'dd/MM/yy HH:mm:ss')}\n\n`
         caption += global.footer

         client.sendFile(m.chat, 'https://pps.whatsapp.net' + meta.thread_metadata.preview.direct_path, 'image.jpg', caption, m)
      } catch (e) {
         client.reply(m.chat, Utils.texted('bold', `🚩 Invalid channel`), m)
      }
   },
   error: false
}