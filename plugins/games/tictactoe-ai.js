import TicTacToe from '../../lib/games/tictactoe-ai.js'

export const run = {
   usage: ['tictactoe-ai'],
   hidden: ['ttt-ai', 'endttt'],
   category: 'games',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Utils
   }) => {
      try {
         const computerName = 'Neoxr BOT'
         global.gameSessions = global.gameSessions ? global.gameSessions : {}
         client.ttt = client.ttt ? client.ttt : []
         const id = m.sender
         if (['tictactoe-ai', 'ttt-ai'].includes(command)) {
            const session = client.ttt.find(v => v.sessionId === id)
            if (session) return client.reply(m.chat, '.', session.last)
            client.ttt.push({
               sessionId: m.sender,
               moves: null,
               last: null,
               move: false
            })
            const instance = client.ttt.find(v => v.sessionId === id)
            if (!gameSessions[id]) {
               gameSessions[id] = new TicTacToe(id, null, '⭕')
            }
            const game = gameSessions[id]
            const logMove = (id, player, position, message = '') => {
               instance.moves = {
                  player,
                  position,
                  board: game.getBoard().slice(),
                  winner: JSON.parse(game.getWinner()),
                  message
               }
            }
            const computerMove = (random = false) => {
               // const computerPosition = game.getValidPosition()
               // if (computerPosition !== null) {
               //    let result = game.makeMove('neoxr', computerPosition)
               //    if (!result.success) {
               //       logMove('neoxr', computerPosition, result.message)
               //    } else {
               //       logMove('neoxr', computerPosition)
               //    }
               // } else {
               //    console.error('No valid position available for the computer.')
               // }
               game.computerMove(random);
               logMove(computerName, game.board.findIndex(cell => cell !== '🔢' && !isNaN(cell)) + 1);
            }
            computerMove(true)
            let str = `乂  *T I C T A C T O E*\n\n`
            str += `Game TicTacToe User vs Computer, silahkan dimulai.\n\n`
            str += `${instance.moves.board.slice(0, 3).join('')}\n`
            str += `${instance.moves.board.slice(3, 6).join('')}\n`
            str += `${instance.moves.board.slice(6).join('')}\n\n`
            str += `You : ❌ ${computerName} : ⭕\n`
            str += `> Silahkan @${m.sender.replace(/@.+/, '')} tentukan poisi, kirim *${isPrefix}endttt* untuk menghapus sesi.`
            m.reply(str).then(isChat => {
               instance.move = true
               instance.last = isChat
            })
         } else {
            const session = client.ttt.find(v => v.sessionId === id)
            if (!session) return
            delete gameSessions[id]
            Utils.removeItem(client.ttt, session)
            m.reply(`✅ Sesi berhasil dihapus.`)
         }
      } catch (e) {
         console.log(e)
      }
   },
   error: false,
   group: true,
   game: true
}