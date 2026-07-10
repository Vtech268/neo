export const run = {
   usage: ['documentation'],
   hidden: ['docs'],
   category: 'bot hosting',
   async: async (m, {
      client,
      isPrefix,
      Config,
      Utils
   }) => {
      try {
         m.reply(explain(isPrefix))
      } catch (e) {
         client.reply(m.chat, Utils.texted('bold', `🚩 ${e.message}.`), m)
      }
   },
   error: false
}

const explain = (prefix) => {
 return `📘 *WhatsApp Gateway API Documentation*
 
All endpoints use the *POST* method and require a valid token for authorization.  
If you don’t have a token yet, send *${prefix}token* or *${prefix}token main* (for main bot).
  
---
 
▦ *Endpoint* : \`/v1/text\`  
Send a simple text message to a WhatsApp number.  

*Parameters* :
 - \`number\` _(required)_ — WhatsApp number (String or Number)
 - \`text\` _(required)_ — Message content (String)
 
---
 
▦ *Endpoint* : \`/v1/media\`  
Send a media message to a WhatsApp number. 

*Parameters* :
 - \`number\` _(required)_ — WhatsApp number
 - \`url\` _(required)_ — Direct media URL
 - \`caption\` _(optional)_ — Caption text
 
---
 
▦ *Endpoint* : \`/v1/file\`  
Send a document message to a WhatsApp number.  

*Parameters* :
 - \`number\` _(required)_ — WhatsApp number
 - \`url\` _(required)_ — File URL
 - \`filename\` _(required)_ — File name to display
 - \`caption\` _(optional)_ — Caption text
 
---
 
▦ *Endpoint* : \`/v1/voice\`  
Send a voice note message to a WhatsApp number. 

*Parameters* :
 - \`number\` _(required)_ — WhatsApp number
 - \`url\` _(required)_ — Direct audio file URL
 
---
 
▦ *Endpoint* : \`/v1/button\`  
Send a button message to a WhatsApp number.  

*Parameters* :
 - \`number\` _(required)_ — WhatsApp number
 - \`media\` _(optional)_ — Media URL (image, etc.)
 - \`text\` _(required)_ — Message text
 - \`button\` _(required)_ — Button object (Array of options)
 
Example button structure :
 \`\`\`
 [
   { "text": "Promo", "command": ".promo" },
   { "text": "Claim", "command": ".claim" }
 ]
 \`\`\``
}

