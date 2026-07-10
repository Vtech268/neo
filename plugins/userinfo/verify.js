import nodemailer from 'nodemailer'

export const run = {
   usage: ['reg'],
   use: 'email',
   category: 'user info',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      hostJid,
      clientJid,
      findJid,
      Config,
      Utils
   }) => {
      try {
         client.verify = client?.verify || {}
         const timeout = 180000
         const users = hostJid ? global.db.users : findJid.bot(clientJid) ? findJid.bot(clientJid)?.data?.users : global.db.users
         if (users.find(v => v.jid === m.sender)?.verified === undefined) {
            const user = users.find(v => v.jid === m.sender)
            if (user) user.verified = false
            return
         }
         if (client.verify[m.sender]) return m.reply(Utils.texted('bold', `❌ Previously you have requested a verification code, check your email!`))
         const user = users.find(v => v.jid === m.sender)
         if (!user) return client.reply(m.chat, Utils.texted('bold', `❌ Your number is not in the database.`), m)
         if (user?.verified) return client.reply(m.chat, Utils.texted('bold', `✅ Your number already verified.`), m)
         if (!args || !args[0]) return client.reply(m.chat, Utils.example(isPrefix, command, 'neoxrbot@gmail.com'), m)
         if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/ig.test(args[0])) return client.reply(m.chat, Utils.texted('bold', '🚩 Invalid email.'), m)
         const emails = users.filter(v => v.email).map(v => v.email)
         if (emails.includes(args[0])) return client.reply(m.chat, Utils.texted('bold', '🚩 Email already registered.'), m)
         client.sendReact(m.chat, '🕒', m.key)
         const code = `${Utils.randomInt(100, 900)}${Utils.randomInt(100, 900)}`
         user.codeExpire = new Date * 1
         user.code = code
         user.email = args[0]
         const transport = nodemailer.createTransport({
            service: process.env.USER_EMAIL_PROVIDER,
            auth: {
               user: process.env.USER_EMAIL,
               pass: process.env.USER_APP_PASSWORD
            }
         })
         const mailOptions = {
            from: {
               name: process.env.USER_NAME,
               address: process.env.USER_EMAIL
            },
            to: args[0],
            subject: 'Email Verification',
            html: `<div style="padding:20px;border:1px dashed #222;font-size:15px"><tt>Hi <b>${m.pushName} 😘</b><br><br>Confirm your email to be able to use ${process.env.USER_NAME}. Send this code to the bot and it will expire in 3 minutes.<br><center><h1>${code}</h1></center>Or copy and paste the URL below into your browser : <a href="https://wa.me/${client.decodeJid(client.user.id).split('@')[0]}?text=${code}">https://wa.me/${client.decodeJid(client.user.id).split('@')[0]}?text=${code}</a><br><br><hr style="border:0px; border-top:1px dashed #222"><br>Regards, <b>${Config.owner_name}</b></tt></div>`
         }
         transport.sendMail(mailOptions, async function (err, data) {
            if (err) return m.reply(Utils.texted('bold', `❌ Your server not supported to send email (Can\'t access SMTP)!`))
            client.verify[m.chat] = {
               chat: await client.reply(m.chat, Utils.texted('bold', `✅ Verification code has been sent, please check your inbox or spam folder.`), m),
               to: m.sender,
               code: code,
               timeout: setTimeout(() => {
                  if (client.verify[m.chat]) return client.reply(m.chat, Utils.texted('bold', `⚠ Your verification code has expired.`), client.verify[m.chat]?.chat, { disappear: 8400 }).then(async () => {
                     user.codeExpire = -1
                     user.code = ''
                     user.email = ''
                     user.attempt = 0
                     clearTimeout(client.verify[m.chat].timeout)
                     delete client.verify[m.chat]
                  })
               }, timeout),
               type: 'email'
            }
         })
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   private: true
}