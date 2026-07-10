import TicTacToe from '../../../lib/games/tictactoe-ai.js'

export const run = {
   async: async (m, {
      client,
      body,
      users,
      Utils
   }) => {
      try {
         client.ttt = client.ttt ? client.ttt : []
         const computerName = 'Neoxr BOT'
         const id = m.sender
         const reward = Utils.randomInt(1500, 10000)
         const session = client.ttt.find(v => v.sessionId === id)
         if (session) {
            if (!gameSessions[id]) {
               gameSessions[id] = new TicTacToe(id)
            }
            const game = gameSessions[id]

            const logMove = (id, player, position, message = '') => {
               session.moves = {
                  player,
                  position,
                  board: game.getBoard().slice(),
                  winner: JSON.parse(game.getWinner()),
                  message
               }
            }

            const playerMove = (position) => {
               let result = game.makeMove('Player', position)
               if (!result.success) return result
               return result
            }

            if (session.move) {
               if (game.checkWinner() || game.isBoardFull()) {
                  let str = `乂  *T I C T A C T O E*\n\n`
                  str += `${session.moves.board.slice(0, 3).join('')}\n`
                  str += `${session.moves.board.slice(3, 6).join('')}\n`
                  str += `${session.moves.board.slice(6).join('')}\n\n`
                  str += `You : ❌ ${computerName} : ⭕\n`
                  if (session.moves.winner.winner) {
                     if (session.moves.winner.winner === 'Player') {
                        users.point += reward
                        str += `> Congratulations @${id.replace(/@.+/, '')}, you win! +${Utils.formatter(reward)} Points`
                     } else {
                        users.point -= users.point < reward ? 0 : reward
                        str += `> Computer (${computerName}) win!`
                     }
                  } else if (session.moves.winner.result && !/yet/.test(session.moves.winner.result)) {
                     str += `> Status : ${session.moves.winner.result}`
                  }
                  m.reply(str.trim()).then(() => {
                     delete gameSessions[id]
                     Utils.removeItem(client.ttt, session)
                  })
                  return
               }
               // console.log(session.moves ? session.moves.winner : '')
               const json = playerMove(parseInt(body))
               if (!json.success) return m.reply(json.message)
               session.move = false
               const computerPosition = game.getValidPosition()
               if (computerPosition !== null) {
                  let result = game.makeMove(computerName, computerPosition)
                  if (!result.success) {
                     logMove(id, computerName, computerPosition, result.message)
                  } else {
                     logMove(id, computerName, computerPosition)
                  }
               } else {
                  console.error('No valid position available for the computer.')
               }
               if (game.checkWinner() || game.isBoardFull()) {
                  let str = `乂  *T I C T A C T O E*\n\n`
                  str += `${session.moves.board.slice(0, 3).join('')}\n`
                  str += `${session.moves.board.slice(3, 6).join('')}\n`
                  str += `${session.moves.board.slice(6).join('')}\n\n`
                  str += `You : ❌ ${computerName} : ⭕\n`
                  if (session.moves.winner.winner) {
                     if (session.moves.winner.winner === 'Player') {
                        users.point += reward
                        str += `> Congratulations @${id.replace(/@.+/, '')}, you win! +${Utils.formatter(reward)} Points`
                     } else {
                        users.point -= users.point < reward ? 0 : reward
                        str += `> Computer (${computerName}) win!`
                     }
                  } else if (session.moves.winner.result && !/yet/.test(session.moves.winner.result)) {
                     str += `> Status : ${session.moves.winner.result}`
                  }
                  m.reply(str.trim()).then(() => {
                     delete gameSessions[id]
                     Utils.removeItem(client.ttt, session)
                  })
                  return
               }
               session.move = true
               let str = `乂  *T I C T A C T O E*\n\n`
               str += `${session.moves.board.slice(0, 3).join('')}\n`
               str += `${session.moves.board.slice(3, 6).join('')}\n`
               str += `${session.moves.board.slice(6).join('')}\n\n`
               str += `You : ❌ ${computerName} : ⭕\n`
               if (session.moves.winner.winner) {
                  if (session.moves.winner.winner === 'Player') {
                     users.point += reward
                     str += `> Congratulations @${id.replace(/@.+/, '')}, you win! +${Utils.formatter(reward)} Points`
                  } else {
                     users.point -= users.point < reward ? 0 : reward
                     str += `> Computer (${computerName}) win!`
                  }
               } else if (session.moves.winner.result && !/yet/.test(session.moves.winner.result)) {
                  str += `> Status : ${session.moves.winner.result}`
               }
               m.reply(str.trim()).then(isChat => {
                  session.moves.last = isChat
               })
            }
         }
      } catch (e) {
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   group: true,
   game: true
}