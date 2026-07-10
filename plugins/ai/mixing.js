export const run = {
   usage: ['ai', 'gemini', 'bard', 'mixtral', 'copilot', 'llama', 'deepseek'],
   use: 'query',
   category: 'ai',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Utils
   }) => {
      try {
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, 'apa itu nodejs'), m)
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.neoxr(`/${command === 'ai' ? 'gpt-pro' : command === 'gemini' ? 'gemini-chat' : command === 'bing' ? 'bing-chat' : command}`, {
            q: text
         })
         if (!json.status) return client.reply(m.chat, Utils.jsonFormat(json), m)
         client.reply(m.chat, json.data.message.replace(/\*\*/g, '*'), m)
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true
}