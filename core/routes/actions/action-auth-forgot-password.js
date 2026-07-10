import { Instance, Config, Utils } from '@neoxr/wb'
import requestIp from 'request-ip'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'

const rateLimitCache = new Map()

export const routes = {
   category: 'action',
   path: '/action/forgot-password',
   method: 'post',
   parameter: ['email', 'via'],
   execution: async (req, res, next) => {
      try {
         const ip = requestIp.getClientIp(req)
         const now = Date.now()
         const timeout = 60 * 1000

         if (rateLimitCache.has(ip)) {
            const expirationTime = rateLimitCache.get(ip)
            if (now < expirationTime) {
               const timeLeft = Math.ceil((expirationTime - now) / 1000)
               return res.status(429).json({
                  creator: global.creator,
                  status: false,
                  message: `Too many requests. Please wait ${timeLeft} seconds.`
               })
            }
         }

         rateLimitCache.set(ip, now + timeout)

         setTimeout(() => {
            rateLimitCache.delete(ip)
         }, timeout)

         const { email, via } = req.body

         const bot = global.db?.bots?.find(v =>
            v.connector?.override?.email === email
         )

         if (!bot)
            return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'Account not found.'
            })

         const token = jwt.sign({ email, ip }, process.env.JWT_SECRET, { expiresIn: '5m' })

         const protocol = req.headers['x-forwarded-proto'] || req.protocol
         const host = req.headers['x-forwarded-host'] || req.get('Host')
         const resetUrl = `${protocol}://${host}/auth/reset-password?token=${token}`.replace('http://', 'https://')

         if (via === 'email') {
            if (process.env.USER_NAME && process.env.USER_EMAIL && process.env.USER_APP_PASSWORD && process.env.USER_EMAIL_PROVIDER) {
               try {
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
                     to: email,
                     subject: 'Reset Password',
                     html: `<div style="padding:20px;border:1px dashed #222;font-size:15px"><tt>Hi <b>${bot.connector.sessionOpts?.owner_name} 😘</b><br><br>We received a request to reset your password. <a href="${resetUrl}">Click here</a> to reset your password.<br><br><hr style="border:0px; border-top:1px dashed #222"><br>Regards, <b>${Config.owner_name}</b></tt></div>`
                  }

                  await transport.sendMail(mailOptions)

                  return res.json({
                     creator: global.creator,
                     status: true,
                     message: 'Link has been sent to your email'
                  })
               } catch (e) {
                  res.status(500).json({
                     creator: global.creator,
                     status: false,
                     message: 'Message cannot be sent.'
                  })
               }
            } else {
               res.status(400).json({
                  creator: global.creator,
                  status: false,
                  message: 'Email service is not configured.'
               })
            }
         } else if (via === 'whatsapp') {
            if (!bot.is_connected) return res.status(400).json({
               creator: global.creator,
               status: false,
               message: 'Your bot is not connected.'
            })

            const client = Instance.getSocketByJid(bot.jid)
            if (!client) return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'Bot not found'
            })

            let msg = `Hi ${bot.connector.sessionOpts?.owner_name} 😘\n\n`
            msg += 'We received a request to reset your password.\n'
            msg += `Click here to reset your password: ${resetUrl}`

            await client.reply(bot.connector.sessionOpts.owner, msg, null)
            return res.json({
               creator: global.creator,
               status: true,
               message: 'Link has been sent to your WhatsApp'
            })
         } else return res.status(400).json({
            creator: global.creator,
            status: false,
            message: 'Invalid reset password method.'
         })

      } catch (e) {
         Utils.printError(e)
         if (!res.headersSent) {
            res.status(500).json({
               creator: global.creator,
               status: false,
               message: e.message
            })
         }
      }
   },
   error: false,
   challenge: true
}