import crypto from 'crypto'
import { stringify, parse } from 'flatted'

export const toJid = input => {
   const i = String(input)
   if (i.endsWith('@s.whatsapp.net')) return i
   return `${i}@s.whatsapp.net`
}

export const parsingData = (type, jid) => {
   let data = null, bot = null

   if (jid) {
      bot = global?.db?.bots?.find(v =>
         v.jid === jid || v.connector?.sessionOpts?.owner === jid
      )
   }

   if (type === 1) {
      data = {
         users: global?.db?.users || [],
         chats: global?.db?.chats || [],
         groups: global?.db?.groups || [],
         setting: global?.db?.setting || {},
         statistic: global?.db?.statistic || {},
         bot,
         bots: global?.db?.bots || []
      }
   }

   if (type === 2) {
      data = {
         users: bot?.data?.users || [],
         chats: bot?.data?.chats || [],
         groups: bot?.data?.groups || [],
         setting: bot?.data?.setting || {},
         statistic: bot?.data?.statistic || {},
         bot,
         bots: []
      }
   }

   return data
}

export const encrypt = data => {
   const json = stringify(data)
   const iv = crypto.randomBytes(12)
   const key = crypto.createHash('sha256').update(process.env.JWT_SECRET).digest()
   const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
   let encrypted = cipher.update(json, 'utf8', 'base64')
   encrypted += cipher.final('base64')
   const authTag = cipher.getAuthTag()
   return {
      iv: iv.toString('base64'),
      data: encrypted,
      tag: authTag.toString('base64')
   }
}

export const decrypt = payload => {
   const key = crypto.createHash('sha256').update(process.env.JWT_SECRET).digest()
   const iv = Buffer.from(payload.iv, 'base64')
   const tag = Buffer.from(payload.tag, 'base64')
   const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
   decipher.setAuthTag(tag)
   let decrypted = decipher.update(payload.data, 'base64', 'utf8')
   decrypted += decipher.final('utf8')
   return parse(decrypted)
}