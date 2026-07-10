import fs from 'node:fs'

export const run = {
   usage: ['magz'],
   hidden: ['create', 'in', 'out', 'begin'],
   category: 'games',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      users,
      Config,
      Utils
   }) => {
      try {
         if (users.point < 1000) return client.reply(m.chat, Utils.texted('bold', `🚩 You don't have enough points to play Magz.`), m)
         
         client.magz = client.magz || {}
         const id = m.chat
         
         if (command === 'magz') return client.reply(m.chat, info(isPrefix), m)
         
         if (command === 'create') {
            const check = Object.values(client.magz).find(room => room.id === m.chat)
            if (check) return client.reply(m.chat, Utils.texted('bold', `🚩 A session already exists with the code : "${check.code}"`), m)
            
            let maxRounds = args[0] ? parseInt(args[0]) : 10
            if (isNaN(maxRounds) || maxRounds < 10) maxRounds = 10
            if (maxRounds > 50) maxRounds = 50
            
            const code = Utils.makeId(4)
            let teks = `Magz game session created with code : *${code}*\n`
            teks += `Max Rounds : *${maxRounds}*\n\n`
            teks += `🚩 Send *${isPrefix}begin* to start the game. You can also invite your friends to join by sending *${isPrefix}in*`
            
            client.magz[id] = {
               id,
               code,
               player: [m.sender],
               playing: false,
               maxRounds
            }
            return client.reply(m.chat, teks, m)
         }
         
         if (command === 'in') {
            const check = Object.values(client.magz).find(room => room.id === m.chat)
            if (!check) return client.reply(m.chat, Utils.texted('bold', `🚩 No Magz session found, send ${isPrefix}create to make one.`), m)
            if (check.playing) return client.reply(m.chat, Utils.texted('bold', `🚩 You can't join, the game has already started.`), m)
            if (check.player.includes(m.sender)) return client.reply(m.chat, Utils.texted('bold', `🚩 You have already joined this session.`), m)
            if (check.player.length >= 5) return client.reply(m.chat, Utils.texted('bold', `🚩 The session is full (Max 5 players).`), m)
            
            check.player.push(m.sender)
            return client.reply(m.chat, `Successfully joined the session. Total players: *${check.player.length}/5*`, m)
         }
         
         if (command === 'out') {
            const check = Object.values(client.magz).find(room => room.id === m.chat)
            if (!check) return client.reply(m.chat, Utils.texted('bold', `🚩 No Magz session found.`), m)
            if (check.playing) return client.reply(m.chat, Utils.texted('bold', `🚩 You can't leave, the game has already started.`), m)
            if (!check.player.includes(m.sender)) return client.reply(m.chat, Utils.texted('bold', `🚩 You are not in this session.`), m)
            if (check.player[0] === m.sender) {
               delete client.magz[id]
               return client.reply(m.chat, `Session successfully deleted because the creator left.`, m)
            }
            
            check.player.splice(check.player.indexOf(m.sender), 1)
            return client.reply(m.chat, `Successfully left the session. Total players: *${check.player.length}/5*`, m)
         }
         
         if (command === 'begin') {
            const check = Object.values(client.magz).find(room => room.id === m.chat)
            if (!check) return client.reply(m.chat, Utils.texted('bold', `🚩 No Magz session found.`), m)
            if (check.playing) return client.reply(m.chat, Utils.texted('bold', `🚩 The game has already started.`), m)
            if (check.player[0] !== m.sender) return client.reply(m.chat, Utils.texted('bold', `🚩 Only the session creator can start the game.`), m)
            
            const isVsBot = check.player.length === 1
            if (isVsBot) check.player.push('bot')
            
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
            const char = characters.charAt(Math.floor(Math.random() * characters.length))
            
            const leaderboard = {}
            check.player.forEach(v => {
               if (v !== 'bot') {
                  if (global.db && global.db.users && global.db.users[v]) global.db.users[v].point -= 1000
               }
               leaderboard[v] = { score: 0, correctAns: 0, wrongAns: 0 }
            })
            
            client.magz[id] = {
               ...check,
               leaderboard,
               words: [],
               playTimes: 1,
               answer: char,
               playing: true,
               currentPlayerIndex: 0,
               vsBot: isVsBot
            }
            
            const room = client.magz[id]
            const kbbi = JSON.parse(fs.readFileSync('./media/json/kbbi.json', 'utf-8'))
            
            room.endGame = async (forcedReason = null) => {
               clearTimeout(room.time)
               let teks = `乂  *M A G Z*\n\n`
               if (forcedReason) teks += `${forcedReason}\n\n`
               
               const finalPeople = Object.entries(room.leaderboard).sort((a, b) => b[1].score - a[1].score)
               teks += `乂  *S C O R E*\n\n`
               teks += finalPeople.map(([user, data], i) => `${i + 1}. ${user === 'bot' ? `@${client.decodeJid(client.user?.id)?.replace(/@.+/, '')}` : '@' + user.split('@')[0]} ${data.wrongAns >= 3 ? '💀' : (i === 0 ? '🥇' : i === 1 ? '🥈' : '')}\n    *( × )* : ${data.wrongAns}  –  *( √ )* : ${data.correctAns}  –  *Score* : ${Utils.formatNumber(data.score)}`).join('\n')
               teks += `\n\n🎉 Game finished!`
               
               await client.reply(room.id, teks, null)
               
               finalPeople.forEach(([user, data]) => {
                  if (user !== 'bot' && global.db && global.db.users && global.db.users[user]) {
                     global.db.users[user].point += data.score
                  }
               })
               delete client.magz[room.id]
            }
            
            room.execBotTurn = async () => {
               const validWords = kbbi.filter(w => w.toUpperCase().startsWith(room.answer) && !room.words.includes(w.toUpperCase()))
               if (validWords.length === 0) {
                  room.leaderboard['bot'].wrongAns = 3
                  const activePlayers = room.player.filter(p => room.leaderboard[p].wrongAns < 3)
                  const winnerMsg = activePlayers.length === 1 ? `@${activePlayers[0].split('@')[0]} wins!` : 'Everyone is eliminated.'
                  await room.endGame(`🤖 @${client.decodeJid(client.user?.id)?.replace(/@.+/, '')} cannot find any more words starting with *${room.answer}* and is eliminated!\n\n🎉 Game Over! ${winnerMsg}`)
                  return
               }
               
               const botWord = validWords[Math.floor(Math.random() * validWords.length)].toUpperCase()
               const reward = Utils.randomInt(Config.min_reward || 500, Config.max_reward || 5000)
               
               room.leaderboard['bot'].score += reward
               room.leaderboard['bot'].correctAns += 1
               room.words.push(botWord)
               room.playTimes += 1
               
               if (room.playTimes > room.maxRounds) {
                  await room.endGame(`The max limit of ${room.maxRounds} rounds has been reached!`)
                  return
               }
               
               const wordLen = botWord.length
               const takeChars = wordLen >= 7 ? 3 : wordLen >= 4 ? 2 : 1
               room.answer = botWord.slice(-takeChars).toUpperCase()
               
               do {
                  room.currentPlayerIndex = (room.currentPlayerIndex + 1) % room.player.length
               } while (room.leaderboard[room.player[room.currentPlayerIndex]].wrongAns >= 3)
               
               let teks = `🤖 @${client.decodeJid(client.user?.id)?.replace(/@.+/, '')} answered : *${botWord}*\n\nNext word must start with the letters : *${room.answer}*\n\nWord : [ ${room.playTimes} / ${room.maxRounds} ]\nCurrent turn : @${room.player[room.currentPlayerIndex].split('@')[0]}`
               room.msg = await client.reply(room.id, teks, null)
               room.time = setTimeout(room.handleTimeout, 30000)
            }
            
            room.handleTimeout = async () => {
               if (!client.magz[room.id]) return
               
               const currentPlayer = room.player[room.currentPlayerIndex]
               
               do {
                  room.currentPlayerIndex = (room.currentPlayerIndex + 1) % room.player.length
               } while (room.leaderboard[room.player[room.currentPlayerIndex]].wrongAns >= 3)
               
               const nextPlayer = room.player[room.currentPlayerIndex]
               
               let timeoutTeks = `乂  *M A G Z*\n\n`
               timeoutTeks += `🚩 Time is up! ${currentPlayer === 'bot' ? `🤖 @${client.decodeJid(client.user?.id)?.replace(/@.+/, '')}` : '@' + currentPlayer.split('@')[0]}'s turn is skipped.\n\n`
               timeoutTeks += `Next word must start with the letters : *${room.answer}*\n`
               timeoutTeks += `Current turn : ${nextPlayer === 'bot' ? `🤖 @${client.decodeJid(client.user?.id)?.replace(/@.+/, '')}` : '@' + nextPlayer.split('@')[0]}\n`
               timeoutTeks += `Word : [ ${room.playTimes} / ${room.maxRounds} ]`
               
               room.chat = await client.reply(room.id, timeoutTeks, null)
               
               if (nextPlayer === 'bot') {
                  room.time = setTimeout(room.execBotTurn, Utils.randomInt(2000, 4000))
               } else {
                  room.time = setTimeout(room.handleTimeout, 30000)
               }
            }
            
            let teks = `乂  *M A G Z${isVsBot ? ' (VS BOT)' : ''}*\n\n`
            teks += `🎉 Game started! First word must start with the letter : *${char}*\n\n`
            teks += `Word : [ ${room.playTimes} / ${room.maxRounds} ]\n`
            teks += `Current turn : @${room.player[room.currentPlayerIndex].split('@')[0]}\n\n`
            teks += `Type your answer directly without replying to this message.`
            
            room.chat = await client.reply(m.chat, teks, m)
            room.time = setTimeout(room.handleTimeout, 30000)
         }
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   group: true,
   limit: true,
   game: true
}

const info = (prefix) => {
   return `乂  *M A G Z*\n   \nMagz game is a *"Word Chain"* game, the concept is to make words that exist in the KBBI dictionary. Here are the rules:\n\n➠ 1,000 points are required to play this game.\n➠ Minimum 1 player in a session (Will trigger VS Bot mode if solo).\n➠ The game is played in *Survival Mode* until 1 player remains or max rounds are reached.\n➠ Each turn has a 30-second time limit. If a player fails to answer, their turn is simply skipped (no strike).\n➠ If a player makes 3 mistakes (wrong word/wrong letter), they are eliminated.\n➠ The next word must begin with the last 1, 2, or 3 letters of the previous word.\n\n*Commands:*\n➠ *${prefix}create <rounds>* : Create a game session (e.g., .create 50). Default is 10, max is 50.\n➠ *${prefix}in* : Join a game session.\n➠ *${prefix}out* : Leave a game session.\n➠ *${prefix}begin* : Start the game.`
}