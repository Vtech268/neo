export default class TicTacToe {
   constructor(sessionId, board = null, currentPlayer = '❌') {
      this.sessionId = sessionId;
      this.board = board || Array(9).fill('🔢'); // Placeholder for empty cells
      this.currentPlayer = currentPlayer;
      this.playerNames = {
         '❌': null,
         '⭕': 'neoxr'
      }; // O is replaced by ⭕
   }

   makeMove(name, position) {
      position = position - 1; // Convert 1-based index to 0-based index

      if (this.checkWinner() || this.isBoardFull()) {
         return {
            success: false,
            message: '🚩 Game over',
            sessionId: this.sessionId
         }
      }

      if (position < 0 || position >= this.board.length) {
         return {
            success: false,
            message: '🚩 Invalid position.',
            sessionId: this.sessionId
         }
      }

      if (this.board[position] !== '🔢') {
         return {
            success: false,
            message: '🚩 Position already occupied.',
            sessionId: this.sessionId
         }
      }

      if (this.currentPlayer === '❌' && !this.playerNames['❌']) {
         this.playerNames['❌'] = name
      }

      this.board[position] = this.currentPlayer;
      this.currentPlayer = this.currentPlayer === '❌' ? '⭕' : '❌'
      return {
         success: true,
         sessionId: this.sessionId
      }
   }

   // Method to get a valid empty position
   getValidPosition() {
      const availablePositions = this.board
         .map((cell, index) => (cell === '🔢' ? index : null))
         .filter(index => index !== null)

      if (availablePositions.length === 0) {
         return null;
      }

      return availablePositions[Math.floor(Math.random() * availablePositions.length)] + 1; // Convert 0-based index to 1-based index
   }

   checkWinner() {
      const winningCombinations = [
         [0, 1, 2],
         [3, 4, 5],
         [6, 7, 8],
         [0, 3, 6],
         [1, 4, 7],
         [2, 5, 8],
         [0, 4, 8],
         [2, 4, 6]
      ];

      for (let combination of winningCombinations) {
         const [a, b, c] = combination
         if (this.board[a] !== '🔢' && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
            return this.board[a]
         }
      }
      return null
   }

   isBoardFull() {
      return this.board.every(cell => cell !== '🔢')
   }

   resetGame() {
      this.board.fill('🔢')
      this.currentPlayer = '❌'
      this.playerNames = {
         '❌': null,
         '⭕': 'neoxr'
      }
   }

   getBoard() {
      return this.board.map((cell, index) => cell === '🔢' ? `${index + 1}️⃣` : cell)
   }

   getCurrentPlayer() {
      return this.currentPlayer
   }

   getPlayerNames() {
      return this.playerNames
   }

   getWinner() {
      const winner = this.checkWinner()
      if (winner) {
         return JSON.stringify({
            winner: this.playerNames[winner],
            symbol: winner,
            sessionId: this.sessionId
         })
      } else if (this.isBoardFull()) {
         return JSON.stringify({
            result: "Draw",
            sessionId: this.sessionId
         })
      } else {
         return JSON.stringify({
            result: "No winner yet",
            sessionId: this.sessionId
         })
      }
   }

   computerMove(isInitialMove = false) {
      const position = isInitialMove ? this.getValidPosition() : this.findBestMove()
      if (position !== null) {
         this.makeMove('neoxr', position)
      } else {
         console.error('No valid position available for the computer.')
      }
   }

   // NiggaMax algorithm to find the best move for the computer
   findBestMove() {
      let bestVal = -Infinity
      let bestMove = null

      for (let i = 0; i < this.board.length; i++) {
         if (this.board[i] === '🔢') {
            this.board[i] = '⭕'
            let moveVal = -this.negamax(0, false)
            this.board[i] = '🔢'

            if (moveVal > bestVal) {
               bestMove = i
               bestVal = moveVal
            }
         }
      }
      return bestMove !== null ? bestMove + 1 : null
   }

   // Negamax algorithm implementation
   negamax(depth, isMax) {
      const score = this.evaluate()

      if (score === 10) return score - depth
      if (score === -10) return score + depth
      if (this.isBoardFull()) return 0

      let best = -Infinity;

      for (let i = 0; i < this.board.length; i++) {
         if (this.board[i] === '🔢') {
            this.board[i] = isMax ? '⭕' : '❌'
            best = Math.max(best, -this.negamax(depth + 1, !isMax))
            this.board[i] = '🔢'
         }
      }
      return best
   }

   evaluate() {
      const winner = this.checkWinner()
      if (winner === '⭕') return 10
      if (winner === '❌') return -10
      return 0
   }

   getGameState() {
      return {
         sessionId: this.sessionId,
         board: this.board,
         currentPlayer: this.currentPlayer
      }
   }
}