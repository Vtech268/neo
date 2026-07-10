function generateMathProblems(num, que = 10) {
   const questions = []
   let prevSolution = null
   for (let i = 0; i < que; i++) {
      let question, answer, mode

      if (i === 0) {
         question = generateRandomProblem(num)
         answer = question.answer
         mode = modes(answer)
      } else {
         question = generateDependentProblem(prevSolution)
         answer = question.answer
         mode = modes(answer)
      }

      questions.push({
         question: question.question,
         answer: answer,
         mode: mode
      });

      prevSolution = answer
   }

   return questions
}

function generateRandomProblem(num) {
   const num1 = num || Math.floor(Math.random() * 99) + 1
   const num2 = Math.floor(Math.random() * num) + 1
   const num3 = Math.floor(Math.random() * num) + 1
   const operations = ['+', '-', '*']
   const operation1 = operations[Math.floor(Math.random() * operations.length)]
   let operation2, operation3
   do {
      operation2 = operations[Math.floor(Math.random() * operations.length)]
   } while (operation2 === operation1)

   do {
      operation3 = operations[Math.floor(Math.random() * operations.length)]
   } while (operation3 === operation1 || operation3 === operation2)

   return {
      question: (`${num1} ${operation1} ${num2} ${operation2} ${num3}`).replace(/[*]/g, '×'),
      answer: eval(`${num1} ${operation1} ${num2} ${operation2} ${num3}`)
   };
}

function generateDependentProblem(prevSolution) {
   const num1 = prevSolution
   const num2 = Math.floor(Math.random() * num1) + 1
   const num3 = Math.floor(Math.random() * num1) + 1

   const operations = ['+', '-']
   const operation1 = operations[Math.floor(Math.random() * operations.length)]
   let operation2;

   do {
      operation2 = operations[Math.floor(Math.random() * operations.length)]
   } while (operation2 === operation1)
   

   return {
      question: `${num1} ${operation1} ${num2} ${operation2} ${num3}`,
      answer: eval(`${num1} ${operation1} ${num2} ${operation2} ${num3}`)
   };
}

function modes(answer) {
   if (answer > 7000) {
      return 'expert'
   } else if (answer > 2500) {
      return 'hard'
   } else {
      return 'easy'
   }
}

export default generateMathProblems