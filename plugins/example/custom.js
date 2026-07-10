import fs from 'node:fs'

export const run = {
   usage: ['custom1', 'custom2', 'custom3', 'custom4', 'custom5'],
   category: 'example',
   async: async (m, {
      client,
      command,
      Utils
   }) => {
      try {
         switch (command) {
            case 'custom1': {
               client.reply(m.chat, 'Hi!', m, Utils.newsletter)
            }
               break

            case 'custom2': {
               client.sendFile(m.chat, fs.readFileSync('./media/image/default.jpg'), 'default.jpg', 'Hi!', m, {}, Utils.newsletter)
            }
               break

            case 'custom3': {
               client.sendFile(m.chat, fs.readFileSync('./media/image/default.jpg'), 'default.jpg', 'Hi!', m, {
                  document: true
               }, Utils.newsletter)
            }
               break

            case 'custom4': {
               client.sendFile(m.chat, fs.readFileSync('./media/song/1.mp3'), '', '', m, {
                  ptt: true
               }, Utils.newsletter)
            }
               break

            case 'custom5': {
               client.sendFile(m.chat, fs.readFileSync('./media/song/1.mp3'), '', '', m, {}, Utils.newsletter)
            }
               break
         }
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false
}