export default class WordFinder {
   constructor(rows, cols) {
      this.rows = rows
      this.cols = cols
      this.grid = this._generateEmptyGrid()
   }

   _generateEmptyGrid() {
      return Array.from({
         length: this.rows
      }, () =>
         Array.from({
            length: this.cols
         }, () => ' ')
      )
   }

   generateGridFrom(words) {
      this.grid = this._generateEmptyGrid()
      const placedWords = []

      for (const word of words) {
         if (this.addWord(word)) {
            placedWords.push(word)
         } else {
            // console.warn(`Could not place the word: ${word}`);
         }
      }

      this._fillRandomLetters()

      return placedWords
   }

   _fillRandomLetters() {
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      for (let r = 0; r < this.rows; r++) {
         for (let c = 0; c < this.cols; c++) {
            if (this.grid[r][c] === ' ') {
               this.grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)]
            }
         }
      }
   }

   addWord(word) {
      const directions = [
         [1, 0], // right
         [0, 1], // down
         [1, 1], // down-right diagonal
         [-1, 1] // up-right diagonal
      ];

      for (let attempt = 0; attempt < 100; attempt++) { // Retry up to 100 times
         const dir = directions[Math.floor(Math.random() * directions.length)];
         const startRow = Math.floor(Math.random() * this.rows)
         const startCol = Math.floor(Math.random() * this.cols)

         if (this._canPlaceWord(startRow, startCol, word, dir)) {
            this._placeWord(startRow, startCol, word, dir)
            return true
         }
      }
      return false; // Failed to place word after multiple attempts
   }

   _canPlaceWord(row, col, word, [dx, dy]) {
      for (let k = 0; k < word.length; k++) {
         const newRow = row + k * dx
         const newCol = col + k * dy
         if (newRow < 0 || newRow >= this.rows ||
            newCol < 0 || newCol >= this.cols ||
            (this.grid[newRow][newCol] !== word[k] && this.grid[newRow][newCol] !== ' ')) {
            return false;
         }
      }
      return true
   }

   _placeWord(row, col, word, [dx, dy]) {
      for (let k = 0; k < word.length; k++) {
         this.grid[row + k * dx][col + k * dy] = word[k]
      }
   }

   findWord(word) {
      const directions = [
         [1, 0], // right
         [0, 1], // down
         [1, 1], // down-right diagonal
         [-1, 1] // up-right diagonal
      ];

      for (let r = 0; r < this.rows; r++) {
         for (let c = 0; c < this.cols; c++) {
            if (this._searchFrom(r, c, word, directions)) {
               return true
            }
         }
      }
      return false
   }

   _searchFrom(row, col, word, directions) {
      for (let [dx, dy] of directions) {
         let found = true

         for (let k = 0; k < word.length; k++) {
            const newRow = row + k * dx
            const newCol = col + k * dy

            if (newRow < 0 || newRow >= this.rows ||
               newCol < 0 || newCol >= this.cols ||
               this.grid[newRow][newCol] !== word[k]) {
               found = false
               break
            }
         }

         const endRow = row + (word.length - 1) * dx;
         const endCol = col + (word.length - 1) * dy;
         if (found && endRow >= 0 && endRow < this.rows && endCol >= 0 && endCol < this.cols) {
            return true
         }
      }
      return false
   }

   getRandomElements(arr, count) {
      let result = []
      let arrayCopy = [...arr]
      for (let i = 0; i < count; i++) {
         let randomIndex = Math.floor(Math.random() * arrayCopy.length)
         result.push(arrayCopy.splice(randomIndex, 1)[0])
      }
      return result
   }

   printGridAsJSON(placedWords) {
      const gridCopy = this.grid.map(row => row.join(''))
      const result = {
         question: gridCopy,
         answer: placedWords
      }
      return result
   }
}