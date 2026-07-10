import { createHash, randomBytes } from 'crypto'
import CryptoJS from 'crypto-js'

const challengeCache = new Map()
const CHALLENGE_TIMEOUT_MS = 5 * 60 * 1000
const DIFFICULTY_LEVEL = 3
const EXPIRY_DURATION_MS = 3 * 60 * 1000

setInterval(() => {
   const now = Date.now()
   for (const [token, data] of challengeCache.entries()) {
      if (now - data.ts > CHALLENGE_TIMEOUT_MS) {
         challengeCache.delete(token)
      }
   }
}, 60000)

export default async (req, res, next) => {
   try {
      const serverBindContext = JSON.stringify(req.body)
      const challengeHeader = req.headers['x-request-challenge']

      if (challengeHeader) {
         let challengeData
         try {
            const bytes = CryptoJS.AES.decrypt(challengeHeader, process.env.CHALLENGE_PASSWORD)
            const decryptedString = bytes.toString(CryptoJS.enc.Utf8)
            
            if (!decryptedString) throw new Error('Decryption failed')
            
            challengeData = JSON.parse(decryptedString)
         } catch (e) {
            return res.status(400).json({
               creator: global.creator,
               status: false,
               message: 'Invalid or tampered challenge header.'
            })
         }

         const { salt, ts, solution, context, token } = challengeData

         if (!salt || !ts || solution == null || !context || !token) {
            return res.status(400).json({
               creator: global.creator,
               status: false,
               message: 'Security challenge data is incomplete.'
            })
         }

         const cachedChallenge = challengeCache.get(token)
         if (!cachedChallenge) {
            return res.status(403).json({
               creator: global.creator,
               status: false,
               message: 'Invalid security token or challenge has expired.'
            })
         }

         if (cachedChallenge.context !== context || cachedChallenge.context !== serverBindContext) {
            challengeCache.delete(token)
            return res.status(403).json({
               creator: global.creator,
               status: false,
               message: 'Challenge context mismatch. Request blocked.'
            })
         }

         if ((Date.now() - cachedChallenge.ts) > EXPIRY_DURATION_MS) {
            challengeCache.delete(token)
            return res.status(403).json({
               creator: global.creator,
               status: false,
               message: 'Security challenge expired. Please try again.'
            })
         }

         const attempt = `${salt}:${ts}:${context}:${solution}`
         const prefix = '0'.repeat(DIFFICULTY_LEVEL)
         const hash = createHash('sha256').update(attempt).digest('hex')

         if (!hash.startsWith(prefix)) {
            challengeCache.delete(token)
            return res.status(403).json({
               creator: global.creator,
               status: false,
               message: 'Invalid token. Request blocked.'
            })
         }

         challengeCache.delete(token)
         next()
      } else {
         const salt = randomBytes(16).toString('hex')
         const ts = Date.now()
         const token = randomBytes(24).toString('hex')

         challengeCache.set(token, {
            salt,
            ts,
            context: serverBindContext
         })

         setTimeout(() => {
            challengeCache.delete(token)
         }, EXPIRY_DURATION_MS)

         const challengeData = {
            salt,
            ts,
            difficulty: DIFFICULTY_LEVEL,
            token
         }

         const encryptedChallenge = CryptoJS.AES.encrypt(JSON.stringify(challengeData), process.env.CHALLENGE_PASSWORD).toString()

         res.setHeader('x-response-challenge', encryptedChallenge)
         return res.status(428).json({
            creator: global.creator,
            status: false,
            message: 'A security challenge is required to proceed.'
         })
      }
   } catch (e) {
      if (!res.headersSent) {
         res.status(500).json({
            creator: global.creator,
            status: false,
            message: e.message
         })
      }
   }
}