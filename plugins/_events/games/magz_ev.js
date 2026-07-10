import fs from 'node:fs'

export const run = {
   async: async (m, {
      client,
      body,
      prefixes,
      Config,
      Utils
   }) => {
      try {
         client.magz = client.magz || {}
         const room = Object.values(client.magz).find(r => r.player.includes(m.sender) && r.id === m.chat && r.playing)

         if (!room || !body || prefixes.includes(body.charAt(0))) return
         if (m.sender !== room.player[room.currentPlayerIndex]) return

         const scores = room.leaderboard[m.sender]
         const answer = body.toUpperCase().split(' ')[0].trim()

         clearTimeout(room.time)

         const processWrongAnswer = async (errorMsg) => {
            scores.wrongAns += 1
            const activePlayers = room.player.filter(p => room.leaderboard[p].wrongAns < 3)

            if (scores.wrongAns >= 3) {
               if (activePlayers.length <= 1) {
                  const winnerMsg = activePlayers.length === 1 ? `${activePlayers[0] === 'bot' ? `🤖 @${client.decodeJid(client.user?.id)?.replace(/@.+/, '')}` : '@' + activePlayers[0].split('@')[0]} wins!` : 'Everyone is eliminated.'
                  let endReason = `🚩 ${errorMsg}\n\n💀 @${m.sender.split('@')[0]} is eliminated!\n\n`
                  if (room.words.length > 0) endReason += `Last answered word: *${room.words[room.words.length - 1]}*\n\n`
                  endReason += `🎉 Game Over! ${winnerMsg}`
                  await room.endGame(endReason)
                  return true
               } else {
                  do {
                     room.currentPlayerIndex = (room.currentPlayerIndex + 1) % room.player.length
                  } while (room.leaderboard[room.player[room.currentPlayerIndex]].wrongAns >= 3)

                  const nextPlayer = room.player[room.currentPlayerIndex]

                  let teks = `🚩 ${errorMsg}\n\n`
                  teks += `💀 You have been eliminated for 3 mistakes!\n\n`
                  teks += `Next word must start with the letters : *${room.answer}*\n`
                  teks += `Current turn : ${nextPlayer === 'bot' ? `🤖 @${client.decodeJid(client.user?.id)?.replace(/@.+/, '')}` : '@' + nextPlayer.split('@')[0]}\n`
                  teks += `Word : [ ${room.playTimes} / ${room.maxRounds} ]`

                  room.msg = await client.reply(m.chat, teks, m)

                  if (nextPlayer === 'bot') {
                     room.time = setTimeout(room.execBotTurn, Utils.randomInt(2000, 4000))
                  } else {
                     room.time = setTimeout(room.handleTimeout, 30000)
                  }
                  return false
               }
            }

            room.time = setTimeout(room.handleTimeout, 30000)
            await client.reply(m.chat, `🚩 ${errorMsg}\n\nRemaining attempts : *${3 - scores.wrongAns}*`, m)
            return false
         }

         if (room.words.includes(answer)) {
            await processWrongAnswer(`The word "${answer}" has already been used.`)
            return
         }

         if (!answer.startsWith(room.answer)) {
            await processWrongAnswer(`Incorrect! The word must start with the letters *"${room.answer}"*.`)
            return
         }

         const kbbi = JSON.parse(fs.readFileSync('./media/json/kbbi.json', 'utf-8'))
         if (!kbbi.includes(answer.toLowerCase())) {
            await processWrongAnswer(`The word "${answer}" is not found in the KBBI dictionary.`)
            return
         }

         const reward = Utils.randomInt(Config.min_reward || 500, Config.max_reward || 5000)
         scores.score += reward
         scores.correctAns += 1
         room.words.push(answer)
         room.playTimes += 1

         if (room.playTimes > room.maxRounds) {
            await room.endGame(`The max limit of ${room.maxRounds} rounds has been reached!`)
            return
         }

         const wordLen = answer.length
         const takeChars = wordLen >= 7 ? 3 : wordLen >= 4 ? 2 : 1
         room.answer = answer.slice(-takeChars).toUpperCase()

         do {
            room.currentPlayerIndex = (room.currentPlayerIndex + 1) % room.player.length
         } while (room.leaderboard[room.player[room.currentPlayerIndex]].wrongAns >= 3)

         const nextPlayer = room.player[room.currentPlayerIndex]

         if (nextPlayer === 'bot') {
            let teks = `乂  *M A G Z*\n\nNext word must start with the letters : *${room.answer}*\n\n*+ ${Utils.formatNumber(reward)} Point*\nWord : [ ${room.playTimes} / ${room.maxRounds} ]\n\n🤖 @${client.decodeJid(client.user?.id)?.replace(/@.+/, '')} is thinking...`
            room.msg = await client.reply(m.chat, teks, m)
            room.time = setTimeout(room.execBotTurn, Utils.randomInt(2000, 4000))
         } else {
            let teks = `乂  *M A G Z*\n\nNext word must start with the letters : *${room.answer}*\n\n*+ ${Utils.formatNumber(reward)} Point*\nWord : [ ${room.playTimes} / ${room.maxRounds} ]\nCurrent turn : @${nextPlayer.split('@')[0]}`
            room.msg = await client.reply(m.chat, teks, m)
            room.time = setTimeout(room.handleTimeout, 30000)
         }

      } catch (e) {
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   group: true,
   game: true
}