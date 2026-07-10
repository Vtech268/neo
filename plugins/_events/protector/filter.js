import { models } from '../../../lib/system/models.js'

export const run = {
   async: async (m, {
      client,
      body,
      groupSet,
      setting,
      isAdmin,
      isBotAdmin,
      Utils
   }) => {
      try {
         const { toxic } = setting
         let member = groupSet?.member?.[m.sender]
         if (!member) {
            member = { ...models.member }
         } else if (!('warning' in member)) member.warning = 0

         const isToxic = (body && detectBadword(body.toLowerCase(), toxic))

         if (groupSet.filter && isBotAdmin && !isAdmin && !m.fromMe && isToxic) {
            member.warning += 1

            if (member?.warning >= 5) {
               await client.reply(m.chat, Utils.texted('italic', `🚩 Warning : [ 5 / 5 ]`), m)

               await client.groupParticipantsUpdate(m.chat, [m.sender], 'remove')

               if (groupSet.member?.[m.sender]) {
                  delete groupSet.member[m.sender]
               }

               return client.sendMessage(m.chat, {
                  delete: {
                     remoteJid: m.chat,
                     fromMe: isBotAdmin ? false : true,
                     id: m.key.id,
                     participant: m.sender
                  }
               })
            }

            let pr = `乂  *W A R N I N G* \n\n`
            pr += `You got +1 warning point : [ ${member?.warning} / 5 ]\n\n`
            pr += `> If you get 5 warning points you will be removed from this group.`

            await m.reply(pr)

            return client.sendMessage(m.chat, {
               delete: {
                  remoteJid: m.chat,
                  fromMe: isBotAdmin ? false : true,
                  id: m.key.id,
                  participant: m.sender
               }
            })
         }
      } catch (e) {
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   group: true,
   exception: true
}


/**
 * Detects the presence of bad words in a given input string
 * 
 * This function normalizes the input text to account for character substitutions
 * (e.g., 'o' and '0' are treated as the same), then checks whether any words 
 * in the provided bad words list appear in the normalized input
 * 
 * @param {string} input - The text to be analyzed
 * @param {string[]} badwords - An array of bad words to check against
 * @returns {boolean} - Returns true if a bad word is detected, otherwise false
 */
const detectBadword = (input, badwords, badEmojis = []) => {
   const mapSimilar = {
      'i': 'l1',
      'l': 'i1',
      '1': 'il',
      'o': '0',
      '0': 'o',
      'a': '4',
      '4': 'a',
      'e': '3',
      '3': 'e',
      'b': '8',
      '8': 'b',
      's': '5',
      '5': 's',
      't': '7',
      '7': 't',
      'g': '9',
      '9': 'g'
   }

   /**
    * Normalizes a string by:
    * - converting to lowercase
    * - removing non-alphanumerics (excluding emojis)
    * - mapping similar characters
    */
   const normalize = (str) => {
      return str
         .toLowerCase()
         .replace(/[^a-z0-9\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}]/gu, '') // keep emojis
         .split('')
         .map(c => {
            for (const [key, val] of Object.entries(mapSimilar)) {
               if (key === c || val.includes(c)) return key
            }
            return c
         })
         .join('')
   }

   const normalizedInput = normalize(input)

   const hasBadWord = badwords.some(word => {
      const normalizedWord = normalize(word)
      return normalizedInput.includes(normalizedWord)
   })

   const hasBadEmoji = badEmojis.some(emoji => input.includes(emoji))

   return hasBadWord || hasBadEmoji
}