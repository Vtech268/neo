import Chatbot from '../../lib/chatbot/index.js'

const chatbot = new Chatbot({
   apikey: {},
   instruction: '',
   model: {}
})

export const run = [{
   usage: ['setgeminikey', 'setgroqkey'],
   use: 'apikey',
   category: 'owner',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      setting,
      Utils
   }) => {
      try {
         if (!args || !args[0]) return client.reply(m.chat, Utils.example(isPrefix, command, 'xxxxxxxxxxxxxxxxxxxx'), m)
         const provider = command.match(/set(.+)key/i)?.[1]?.toLowerCase()
         if (!['gemini', 'groq'].includes(provider)) return client.reply(m.chat, Utils.texted('bold', `🚩 Invalid provider.`), m)
         setting.chatbot_config.apikey[provider] = args[0]
         client.reply(m.chat, Utils.texted('bold', `✅ ${provider.toUpperCase()} API key has been successfully set.`), m)
      } catch {
         return client.reply(m.chat, Utils.texted('bold', `🚩 Failed to set API key.`), m)
      }
   },
   owner: true
}, {
   usage: ['setcfauth'],
   use: 'account token',
   category: 'owner',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      setting,
      Utils
   }) => {
      try {
         if (args?.length < 2) return client.reply(m.chat, Utils.example(isPrefix, command, '36exxx nvVUxxxxx'), m)
         const [account, token] = args
         setting.chatbot_config.apikey.cloudflare = {
            account, token
         }
         client.reply(m.chat, Utils.texted('bold', `✅ Cloudflare Auth has been successfully set.`), m)
      } catch {
         return client.reply(m.chat, Utils.texted('bold', `🚩 Failed to set API key.`), m)
      }
   },
   owner: true
}, {
   usage: ['setinstruction'],
   use: 'text',
   category: 'owner',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      setting,
      Utils
   }) => {
      try {
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, 'You are a helpful assistant.'), m)
         const length = text.length
         if (length < 30) return client.reply(m.chat, Utils.texted('bold', `🚩 Instruction must be at least 30 characters.`), m)
         if (length > 100) return client.reply(m.chat, Utils.texted('bold', `🚩 Instruction must not exceed 100 characters.`), m)
         setting.chatbot_config.instruction = text
         client.reply(m.chat, Utils.texted('bold', `✅ Instruction has been successfully updated.`), m)
      } catch {
         return client.reply(m.chat, Utils.texted('bold', `🚩 Failed to set instruction.`), m)
      }
   },
   owner: true
}, {
   usage: ['setmodel'],
   category: 'owner',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      setting,
      Utils
   }) => {
      try {
         if (args?.length < 1) {
            const buttons = [{
               name: 'single_select',
               buttonParamsJson: JSON.stringify({
                  title: 'Gemini Model',
                  sections: [{
                     rows: chatbot.getModels().data.gemini.map(v => ({
                        title: v.name,
                        description: `Limit : ${v.limits.request} | Token : ${v.limits.token}`,
                        id: `${isPrefix + command} gemini ${v.id}`
                     }))
                  }]
               })
            }, {
               name: 'single_select',
               buttonParamsJson: JSON.stringify({
                  title: 'Groq Model',
                  sections: [{
                     rows: chatbot.getModels().data.groq.map(v => ({
                        title: v.name,
                        description: `Limit : ${v.limits.request} | Token : ${v.limits.token}`,
                        id: `${isPrefix + command} groq ${v.id}`
                     }))
                  }]
               })
            }, {
               name: 'single_select',
               buttonParamsJson: JSON.stringify({
                  title: 'Cloudflare Model',
                  sections: [{
                     rows: chatbot.getModels().data.cloudflare.text.map(v => ({
                        title: v.name,
                        description: `Global Limit : ${chatbot.getModels().data.cloudflare.limit} | Type : LLM`,
                        id: `${isPrefix + command} cloudflare ${v.id} text`
                     })).concat(chatbot.getModels().data.cloudflare.genimg.map(v => ({
                        title: v.name,
                        description: `Global Limit : ${chatbot.getModels().data.cloudflare.limit} | Type : Image Gen`,
                        id: `${isPrefix + command} cloudflare ${v.id} image`
                     })))
                  }]
               })
            }]

            const getModelName = (provider, model, type) => {
               if (provider === 'cloudflare') {
                  return chatbot.getModels().data.cloudflare[type].find(v => v.id === model)?.name
               } else {
                  return chatbot.getModels().data[provider].find(v => v.id === model)?.name
               }
            }

            let print = `Groq is the primary provider, with Cloudflare AI as the secondary fallback and Gemini as the final fallback.\n\n`
            print += `Current Setting :\n\n`
            print += `◦ *Gemini* : ${getModelName('gemini', setting.chatbot_config.model.gemini)}\n`
            print += `◦ *Groq* : ${getModelName('groq', setting.chatbot_config.model.groq)}\n`
            print += `◦ *Cloudflare (LLM)* : ${getModelName('cloudflare', setting.chatbot_config.model?.cloudflare?.text || '-', 'text') || '-'}\n`
            print += `◦ *Cloudflare (Image Gen)* : ${getModelName('cloudflare', setting.chatbot_config.model?.cloudflare?.image || '-', 'genimg') || '-'}`
            client.sendIAMessage(m.chat, buttons, m, {
               header: '',
               content: print,
               footer: ''
            })
         } else {
            const [provider, model, type] = args
            if (provider === 'cloudflare') {
               setting.chatbot_config.model[provider][type] = model
               client.reply(m.chat, Utils.texted('bold', `✅ ${provider.toUpperCase()} ${type} model has been successfully updated.`), m)
            } else {
               setting.chatbot_config.model[provider] = model
               client.reply(m.chat, Utils.texted('bold', `✅ ${provider.toUpperCase()} model has been successfully updated.`), m)
            }
         }
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, Utils.texted('bold', `🚩 Failed to set model.`), m)
      }
   },
   owner: true
}]