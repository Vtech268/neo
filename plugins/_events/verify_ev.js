import { captcha } from '../../lib/canvas.js'

export const run = {
   async: async (m, {
      client,
      body,
      users,
      setting,
      isOwner,
      prefixes,
      Utils
   }) => {
      try {
         client.verify = client?.verify || {}
         const isShouldVerify = !users?.banned && !users?.verified && setting?.verify && !isOwner
         const timeout = 180000

         if (isShouldVerify && body === '1') {
            if (client.verify?.[m.chat]) {
               const activeType = client.verify[m.chat].type === 'email' ? 'Email' : 'Captcha'
               return client.reply(m.chat, Utils.texted('bold', `⚠ You already have an active ${activeType} verification process. Please complete it or wait for it to expire.`), m)
            }

            const code = captcha()
            const caption = `Complete verification by replying with the captcha code from the image.`

            await client.sendMessageModify(m.chat, caption, null, {
               largeThumb: true,
               type: 'preview-link',
               thumbnail: code.image,
               icon: setting.icon ? Utils.isUrl(setting.icon) ? setting.icon : Buffer.from(setting.icon, 'base64') : null
            }, { disappear: 8400 }).then(() => {
               users.codeExpire = new Date * 1
               users.code = code.text
               users.email = ''
            })

            client.verify[m.chat] = {
               chat: null,
               to: m.sender,
               code: code,
               type: 'captcha',
               timeout: setTimeout(() => {
                  if (client.verify[m.chat]) {
                     client.reply(m.chat, Utils.texted('bold', `⚠ Your verification code has expired.`), client.verify?.[m.chat]?.chat, { disappear: 8400 }).then(async () => {
                        users.codeExpire = -1
                        users.code = ''
                        users.email = ''
                        users.attempt = 0
                        delete client.verify[m.chat]
                     })
                  }
               }, timeout)
            }
            return 
         }

         if (isShouldVerify && body === '2') {
            if (client.verify?.[m.chat]) {
               const activeType = client.verify[m.chat].type === 'email' ? 'Email' : 'Captcha'
               return client.reply(m.chat, Utils.texted('bold', `⚠ You already have an active ${activeType} verification process. Please complete it or wait for it to expire.`), m)
            }

            let note = `You have selected *Email Verification*. Send your active email address using this command :\n\n`
            note += `${prefixes[0]}reg <email>`
            return m.reply(note)
         }

         if (body && users.code && !users.verified && (!client.verify?.[m.chat]?.type || client.verify?.[m.chat]?.type === 'captcha')) {
            if (users.jid === m.sender && users.code != body.trim()) return client.reply(m.chat, Utils.texted('bold', '❌ Your verification code is wrong.'), m)
            if (new Date - users.codeExpire > timeout) return client.reply(m.chat, Utils.texted('bold', '⚠ Your verification code has expired.'), m).then(() => {
               users.codeExpire = -1
               users.code = ''
               users.email = ''
               users.attempt = 0
            })
            return client.reply(m.chat, Utils.texted('bold', `✅ Your number has been successfully verified (+50 Limit)`), m).then(() => {
               users.codeExpire = -1
               users.code = ''
               users.attempt = 0
               users.verified = true
               users.limit += 50
               if (client?.verify?.[m.chat]?.timeout) {
                  clearTimeout(client.verify[m.chat].timeout)
                  delete client.verify[m.chat]
               }
            })
         }

         if (body?.length === 6 && /\d{6}/.test(body) && !users.verified && client.verify?.[m.chat]?.type === 'email') {
            if (users.jid === m.sender && users.code != body.trim()) return client.reply(m.chat, Utils.texted('bold', '❌ Your verification code is wrong.'), m)
            if (new Date - users.codeExpire > timeout) return client.reply(m.chat, Utils.texted('bold', '⚠ Your verification code has expired.'), m).then(() => {
               users.codeExpire = -1
               users.code = ''
               users.email = ''
               users.attempt = 0
            })
            return client.reply(m.chat, Utils.texted('bold', `✅ Your number has been successfully verified (+50 Limit)`), m).then(() => {
               users.codeExpire = -1
               users.code = ''
               users.attempt = 0
               users.verified = true
               users.limit += 50
               if (client?.verify?.[m.chat]?.timeout) {
                  clearTimeout(client.verify[m.chat].timeout)
                  delete client.verify[m.chat]
               }
            })
         }
      } catch (e) {
         console.error(e)
      }
   },
   error: false,
   // private: true
}