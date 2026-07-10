import { toJid } from '../../core/utils/index.js'

export const run = {
   usage: ['+mimic', '-mimic'],
   use: 'mention or reply',
   category: 'owner',
   async: async (m, {
      client,
      args,
      text,
      isPrefix,
      command,
      setting,
      Utils
   }) => {
      try {
         const id = m?.mentionedJid?.[0] || m?.quoted?.sender || text.replace(/[()+\s-]/g, '')
         if (!id) return explain(m, { client, isPrefix, command })
         const jid = toJid(isNaN(text) ? (text.startsWith('+') ? text.replace(/[()+\s-]/g, '') : (text).replace(/@.+/, '')) : text)
         let user = null
         if (m.isGroup) {
            user = await (client.getJidFromParticipants(m.chat, id))?.id
            if (!user) user = jid
         } else if (!m.isGroup) {
            user = client.getRealJid(id)
            if (!user) user = jid
         } else {
            user = jid
         }

         if (!user || !user?.endsWith('.net')) throw new Error('Sorry, JID not found!')
         if (!setting.mimic || !Array.isArray(setting.mimic)) {
            setting.mimic = []
         }

         const handling = (jid, lang) => {
            if (command == '+mimic') {
               if (setting.mimic.some(v => v.jid === jid)) return client.reply(m.chat, Utils.texted('bold', `🚩 @${jid.replace(/@.+/, '')} was previously added to mimic.`), m)
               setting.mimic.push({ jid: jid.trim(), lang: lang.trim() })
               client.reply(m.chat, Utils.texted('bold', `🚩 Successfully added @${jid.replace(/@.+/, '')} to mimic.`), m)
            } else if (command == '-mimic') {
               if (!setting.mimic.some(v => v.jid === jid)) return client.reply(m.chat, Utils.texted('bold', `🚩 @${jid.replace(/@.+/, '')} is not in the mimic database.`), m)
               setting.mimic.forEach((data, index) => {
                  if (data.jid === jid) setting.mimic.splice(index, 1)
               })
               client.reply(m.chat, Utils.texted('bold', `🚩 Successfully removing @${jid.replace(/@.+/, '')} from mimic.`), m)
            }
         }

         if (m.quoted) {
            const [lang] = args
            if (!lang && command === '+mimic') throw new Error('🚩 Enter the ISO 639-1 language code from this list: https://www.loc.gov/standards/iso639-2/php/code_list.php')
            handling(user, lang)
         } else if (m.mentionedJid[0]) {
            const [_, lang] = args
            if (!lang && command === '+mimic') throw new Error('🚩 Enter the ISO 639-1 language code from this list: https://www.loc.gov/standards/iso639-2/php/code_list.php')
            handling(user, lang)
         } else if (text && /\|/.test(text)) {
            const [number, lang] = text.split('|')
            const check = (await client.onWhatsApp(String(number).startsWith('0') ? '62' + String(number).slice(1) : number.startsWith('+') ? number.match(/\d+/g).join('') : number))[0] || {}
            if (!check.exists) return client.reply(m.chat, Utils.texted('bold', '🚩 Number not registered on WhatsApp.'), m)
            handling(check.jid, lang)
         } else {
            return explain(m, { client, isPrefix, command })
         }
      } catch (e) {
         m.reply(e.message || Utils.jsonFormat(e))
      }
   },
   owner: true
}

const explain = (m, { client, isPrefix, command }) => {
   let teks = `• *Usage Example* :\n\n`
   teks += `${isPrefix + command} 6285xxxxx | en\n`
   teks += `${isPrefix + command} @0 en\n`
   teks += `${isPrefix + command} en (reply to target's chat)`
   return client.reply(m.chat, teks, m)
}