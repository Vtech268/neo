export const run = {
   async: async (m, {
      client,
      body,
      users,
      Config,
      Utils
   }) => {
      try {
         var id = m.chat
         var reward = Utils.randomInt(Config.min_reward, Config.max_reward)
         client.pg = client.pg ? client.pg : {}
         if (m.mtype === 'pollUpdateMessage' && body && typeof body === 'string') {
            const normalize = str => str?.replace(/^[A-Z]\.\s*/, '')?.trim()
            const getAns = str => {
               const match = str.match(/^([A-Za-z])\./)
               return (match ? match[1] : null)?.trim()
            }
            if (Object.values(client.pg).length > 0) {
               let json = JSON.parse(JSON.stringify(client.pg[id][1]))
               if (['Timeout', ''].includes(body)) return !0
               const correctAns = client.pg[id][2]?.find(v => getAns(v) === json.answer) || client.pg[id][2]?.find(v => normalize(v) === json.answer)
               if (getAns(body) === json.answer || normalize(body) === json.answer) {
                  client.sendMessage(m.chat, {
                     delete: {
                        remoteJid: m.chat,
                        fromMe: true,
                        id: client.pg[id][0].id,
                        participant: client.decodeJid(client.user.id)
                     }
                  })
                  let tm = `Soal *"${json.question}"* dijawab benar oleh @${client.decodeJid(m.sender).replace(/@.+/, '')} (+ ${Utils.formatNumber(reward)} Point)\n\n`
                  tm += '✅ ' + correctAns + '\n\n'
                  tm += `*Penjelasan* : ${json.explanation}`
                  client.reply(m.chat, tm)
                  users.point += reward
                  if (client.pg[id]) clearTimeout(client.pg[id][3])
                  delete client.pg[id]
               } else {
                  if (users.point === 0) {
                     let tm = `❌ Dari soal *"${json.question}"* @${client.decodeJid(jid).replace(/@.+/, '')} menjawab *${body}* jawaban yang benar adalah :\n\n`
                     tm += '✅ ' + correctAns + '\n\n'
                     tm += `*Penjelasan* : ${json.explanation}`
                     client.reply(m.chat, tm).then(() => {
                        client.sendMessage(m.chat, {
                           delete: {
                              remoteJid: m.chat,
                              fromMe: true,
                              id: client.pg[id][0].id,
                              participant: client.decodeJid(client.user.id)
                           }
                        })
                        if (client.pg[id]) clearTimeout(client.pg[id][3])
                        delete client.pg[id]
                     })
                  } else {
                     users.point < reward ? users.point = 0 : users.point -= reward
                     let tm = `❌ Dari soal *"${json.question}"* @${client.decodeJid(m.sender).replace(/@.+/, '')} (- ${Utils.formatNumber(reward)}) menjawab *${body}* jawaban yang benar adalah :\n\n`
                     tm += '✅ ' + correctAns + '\n\n'
                     tm += `*Penjelasan* : ${json.explanation}`
                     client.reply(m.chat, tm)
                     client.sendMessage(m.chat, {
                        delete: {
                           remoteJid: m.chat,
                           fromMe: true,
                           id: client.pg[id][0].id,
                           participant: client.decodeJid(client.user.id)
                        }
                     })
                     await Utils.delay(1500)
                     if (client.pg[id]) clearTimeout(client.pg[id][3])
                     delete client.pg[id]
                  }
               }
            }
         }
      } catch (e) {
         console.log(e)
      }
   },
   error: false,
   group: true,
   game: true
}