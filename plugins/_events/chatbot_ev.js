import { Utils } from '@neoxr/wb'
import { watermark } from '../../lib/canvas.js'
import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs'
import bytes from 'bytes'
import Chatbot from '../../lib/chatbot/index.js'

export const run = {
   async: async (m, {
      client,
      body,
      users,
      setting,
      Config,
   }) => {
      try {
         global.db.chatbot = global.db.chatbot ? global.db.chatbot : {}
         let session = global.db.chatbot[m.sender]
         if (!session) {
            global.db.chatbot[m.sender] = {
               id: Utils.uuid(),
               created_at: Date.now()
            }
            session = global.db.chatbot[m.sender]
         }

         const inAnonChat = global.db?.anon?.chats?.find(c => c.a === m.sender || c.b === m.sender)
         const isInMenfess = setting?.menfess?.find(v => v.from === m.sender || v.receiver === m.sender)?.state

         if (
            m.sender != client.decodeJid(client.user.id) &&
            !setting.except.includes(m.sender.replace(/@.+/, '')) &&
            /conversation|extended|video|image|audio|document/igs.test(m.mtype) &&
            !client?.verify?.[m.sender] &&
            !inAnonChat &&
            !isInMenfess
         ) {
            if (setting.chatbot && !Config.evaluate_chars.some(v => body.startsWith(v))) {
               const notice = '🚩 Your limit is not enough to use this feature.'
               const q = m.quoted ? m.quoted : m
               const mimeType = (q.msg || q).mimetype || ''
               const max_size = '2MB'
               const instanceBody = (m.quoted ? (body && typeof body === 'string' ? body : '') + ' ' + (m.quoted?.text || '') : body)?.trim()
               const isBody = instanceBody.replace(new RegExp(`@${client.decodeJid(client.user.id).replace(/@.+/g, '')}`, 'g'), '').trim()

               let isTag = false
               const mentionedJids = [...new Set([...(m.mentionedJid || [])])]
               for (const jid of mentionedJids) {
                  if (jid === client.decodeJid(client.user.id) || jid === client.decodeJid(client.user.lid)) {
                     isTag = true
                     break
                  }
               }

               let isAI = m?.quoted?.id && /AI-/i.test(m?.quoted?.id) || false
               const isDisable = !setting?.chatbot_config?.apikey?.groq ||
                  !setting?.chatbot_config?.apikey?.gemini ||
                  !setting?.chatbot_config?.apikey?.cloudflare?.account ||
                  !setting?.chatbot_config?.apikey?.cloudflare?.token

               if (setting.chatbot && isDisable) return client.reply(m.chat, Utils.texted('bold', `⚠ Cannot activate Chatbot: Groq, Gemini & Cloudflare must be fully configured.`), m).then(() => {
                  setting.chatbot = false
               })

               const chat = new Chatbot({
                  apikey: {
                     gemini: setting?.chatbot_config?.apikey?.gemini,
                     groq: setting?.chatbot_config?.apikey?.groq,
                     cloudflare: setting?.chatbot_config?.apikey?.cloudflare
                  },
                  instruction: setting?.chatbot_config?.instruction,
                  model: {
                     gemini: setting?.chatbot_config?.model?.gemini,
                     groq: setting?.chatbot_config?.model?.groq,
                     cloudflare: setting?.chatbot_config?.model?.cloudflare
                  }
               })

               switch (true) {
                  case /video|image\/(jpe?g|png)/.test(mimeType): {
                     if ((m.isGroup && (isTag || isAI)) || (!m.isGroup && !isTag)) {
                        if (isBody && typeof isBody === 'string') {
                           if (Utils.socmed(isBody)) return
                           if (users.limit < 1) return client.reply(m.chat, Utils.texted('bold', notice), m)
                           if ((q.msg || q).fileLength.low >= bytes(max_size)) return client.reply(m.chat, Utils.texted('bold', `🚩 Maximum media size is ${max_size}.`), m)

                           client.reply(m.chat, 'Analyzing...', m)

                           const buffer = await q.download()
                           const file = {
                              source: buffer,
                              mime: mimeType,
                              ptt: false
                           }

                           const result = await chat.start(isBody, file, session.id)
                           if (!result.status) return client.reply(m.chat, Utils.texted('bold', `❌ ${result.msg}`), m)

                           await wrapper(m, { client, metadata: result.data, session, users, setting, chat })
                        }
                     }
                  }
                     break

                  case /audio/.test(mimeType): {
                     if ((m.isGroup && (isTag || isAI)) || (!m.isGroup && !isTag)) {
                        if (users.limit < 1) return client.reply(m.chat, Utils.texted('bold', notice), m)
                        if ((q.msg || q).fileLength.low >= bytes(max_size)) return client.reply(m.chat, Utils.texted('bold', `🚩 Maximum media size is ${max_size}.`), m)

                        client.reply(m.chat, (q.msg || q).ptt ? 'Listening...' : 'Analyzing...', m)

                        const buffer = await q.download()
                        const file = {
                           source: buffer,
                           mime: mimeType,
                           ptt: (q.msg || q).ptt
                        }

                        const result = await chat.start(isBody, file, session.id)
                        if (!result.status) return client.reply(m.chat, Utils.texted('bold', `❌ ${result.msg}`), m)

                        await wrapper(m, { client, metadata: result.data, session, users, setting, chat })
                     }
                  }
                     break

                  case /document/.test(q.mtype) && /image/.test(mimeType): {
                     if ((m.isGroup && (isTag || isAI)) || (!m.isGroup && !isTag)) {
                        if (isBody && typeof isBody === 'string') {
                           if (Utils.socmed(isBody)) return
                           if (users.limit < 1) return client.reply(m.chat, Utils.texted('bold', notice), m)
                           if ((q.msg || q).fileLength.low >= bytes(max_size)) return client.reply(m.chat, Utils.texted('bold', `🚩 Maximum file size is ${max_size}.`), m)

                           client.reply(m.chat, 'Analyzing...', m)

                           const buffer = await q.download()
                           const file = {
                              source: buffer,
                              mime: mimeType,
                              ptt: false
                           }

                           const result = await chat.start(isBody, file, session.id)
                           if (!result.status) return client.reply(m.chat, Utils.texted('bold', `❌ ${result.msg}`), m)

                           await wrapper(m, { client, metadata: result.data, session, users, setting, chat })
                        }
                     }
                  }
                     break

                  default: {
                     if (/conversation|extended/.test(m.mtype) && isBody && typeof isBody === 'string' && ((m.isGroup && (isTag || isAI)) || (!m.isGroup && !isTag))) {
                        if (Utils.socmed(isBody)) return
                        if (users.limit < 1) return client.reply(m.chat, Utils.texted('bold', notice), m)

                        const result = await chat.start(isBody, null, session.id)
                        if (!result.status) return client.reply(m.chat, Utils.texted('bold', `❌ ${result.msg}`), m)

                        await wrapper(m, { client, metadata: result.data, session, users, setting, chat })
                     }
                  }
               }
            }
         }
      } catch (e) {
         Utils.printError(e)
      }
   },
   error: false
}

const wrapper = (m, { client, metadata, users, setting, chat }) => new Promise(async resolve => {
   try {
      const { context, command, argument, message } = metadata
      const sendMethod = m.isGroup ? client.reply : client.sendFromAI

      if (context === 'NONE') {
         await sendMethod(m.chat, message, m, { isAI: true })
         users.limit -= 1
         return resolve(true)
      }

      if (context === 'EMOTION') {
         if (message) await sendMethod(m.chat, message, m, { isAI: true })
         const { sk_pack, sk_author } = setting
         try {
            if (!fs.existsSync(`./media/sticker/${command.replace('stc_', '')}.webp`)) return
            const buffer = await Utils.fetchAsBuffer(`./media/sticker/${command.replace('stc_', '')}.webp`)
            await client.sendSticker(m.chat, buffer, m, {
               packname: sk_pack || '',
               author: sk_author || ''
            })
         } catch (e) {
            Utils.printError(e)
         }
         users.limit -= 1
         return resolve(true)
      }

      if (context === 'REQUEST') {
         switch (command) {
            case 'cmd_play': {
               if (message) m.reply(message)
               const json = await Api.neoxr('/play', { q: argument })
               if (!json.status) throw new Error(json.msg)
               client.sendFile(m.chat, json.data.url, json.data.filename, '', m, {
                  APIC: await Utils.fetchAsBuffer(json.thumbnail),
                  isAI: true
               })
               break
            }

            case 'cmd_genimg': {
               if (message) m.reply(message)
               const json = await chat.imageGen(argument)
               if (!json.status) throw new Error(json.msg)
               if (!users.premium) {
                  const output = await watermark(json.buffer, fs.readFileSync('./media/image/watermark.png'))
                  client.sendFile(m.chat, output.buffer, '', '', m, { isAI: true })
               } else {
                  client.sendFile(m.chat, json.buffer, '', '', m, { isAI: true })
               }
            }
               break

            case 'cmd_edit': {
               // const q = m.quoted ? m.quoted : m
               // const mime = (q.msg || q).mimetype || ''
               // if (!/image/.test(mime)) return m.reply('Please reply to an image.')

               // if (message) m.reply(message)
               // const mediaBuffer = await q.download()
               // const upload = await Utils.upload(mediaBuffer) 

               // const json = await Api.neoxr('/photo-editor', {
               //    image: upload.url,
               //    q: argument
               // })
               // if (!json.status) throw new Error(json.msg)
               // if (!users.premium) {
               //    const buffer = await Utils.fetchAsBuffer(json.data.url)
               //    const output = await watermark(buffer, fs.readFileSync('./media/image/watermark.png'))
               //    client.sendFile(m.chat, output.buffer, '', '', m, { isAI: true })
               // } else {
               //    client.sendFile(m.chat, json.data.url, '', '', m, { isAI: true })
               // }
               m.reply('Sorry i can\'t edit image now!')
            }
               break

            case 'cmd_pin': {
               if (message) m.reply(message)
               const json = await Api.neoxr('/pinterest', { q: argument })
               if (!json.status) throw new Error(json.msg)
               const imgUrl = Utils.random(json.data)
               client.sendFile(m.chat, imgUrl, '', '', m, { isAI: true })
            }
               break

            case 'cmd_pinimg':
            case 'cmd_pinvid': {
               if (message) m.reply(message)
               const shuffleArray = array => {
                  const shuffledArray = [...array]
                  for (let i = shuffledArray.length - 1; i > 0; i--) {
                     const randomIndex = Math.floor(Math.random() * (i + 1))
                     const temp = shuffledArray[i]
                     shuffledArray[i] = shuffledArray[randomIndex]
                     shuffledArray[randomIndex] = temp
                  }
                  return shuffledArray
               }
               const json = await Api.neoxr('/pinterest-v2', {
                  q: argument,
                  show: 20,
                  type: command === 'cmd_pinimg' ? 'image' : 'video'
               })
               if (!json.status) throw new Error(json.msg)
               const result = shuffleArray(json.data).splice(0, 1)
               if (command === 'cmd_pinimg') {
                  for (const v of result) {
                     client.sendFile(m.chat, v.content[0].url, '', '', m, { isAI: true })
                  }
               } else if (command === 'cmd_pinvid') {
                  for (const v of result) {
                     if (/jpg|gif/.test(v.content[0].url)) continue

                     if (/m3u8/.test(v.content[0].url)) {
                        const output = './temp/' + Utils.filename('mp4')
                        ffmpeg(v.content[0].url)
                           .on("error", error => {
                              m.reply(Utils.texted('bold', `🚩 Conversion failed!`))
                           })
                           .on("end", async () => {
                              client.sendFile(m.chat, output, '', '', m)
                           })
                           .outputOptions("-c copy")
                           .outputOptions("-bsf:a aac_adtstoasc")
                           .output(output)
                           .run()
                     } else {
                        client.sendFile(m.chat, v.content[0].url, '', '', m, { isAI: true })
                     }
                  }
               }
            }
               break

            default: {
               await sendMethod(m.chat, message, m, { isAI: true })
            }
         }

         users.limit -= 1
         resolve(true)
      }
   } catch (e) {
      Utils.printError(e)
      resolve(false)
   }
})