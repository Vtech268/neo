export const run = {
   usage: ['math'],
   use: 'mode (optional)',
   category: 'games',
   async: async (m, {
      client,
      args,
      isPrefix
   }) => {
      client.math = client.math || {}

      const id = m.chat
      if (id in client.math)
         return client.reply(m.chat, '*^ Soal ini belum terjawab!*', client.math[id][0])

      const availableModes = Object.keys(modes)
      const inputMode = (args[0] || '').toLowerCase()
      const mode = availableModes.includes(inputMode)
         ? inputMode
         : pickRandom(['noob', 'easy', 'medium', 'hard'])

      const math = genMath(mode)

      let text = `乂  *M A T H*\n`
      text += `Berapa hasil dari *${math.str}* ?\n`
      text += `Timeout : [ *${(math.time / 1000).toFixed(2)}s* ]\n`
      text += `Kirim *${isPrefix}skip* untuk menghapus sesi.`

      const msg = await client.reply(m.chat, text.trim(), m)

      client.math[id] = [
         msg, math, 3,
         setTimeout(() => {
            if (client.math[id]) {
               client.reply(
                  m.chat,
                  `*Waktu habis!*\nJawaban : *${math.result}*`,
                  client.math[id][0]
               )
               delete client.math[id]
            }
         }, math.time)
      ]
   },
   group: true,
   game: true
}

const modes = {
   noob: [-3, 3, -3, 3, '+-', 15000, 10],
   easy: [-10, 10, -10, 10, '*/+-', 20000, 40],
   medium: [-40, 40, -20, 20, '*/+-', 40000, 150],
   hard: [-100, 100, -70, 70, '*/+-', 60000, 350],
   extreme: [-999999, 999999, -999999, 999999, '*/', 99999, 9999],
   impossible: [-99999999999, 99999999999, -99999999999, 999999999999, '*/', 30000, 35000],
   impossible2: [-999999999999999, 999999999999999, -999, 999, '/', 30000, 50000]
}

const operators = {
   '+': '+',
   '-': '-',
   '*': '×',
   '/': '÷'
}

const genMath = mode => {
   const [a1, a2, b1, b2, ops, time, bonus] = modes[mode]
   let a = randomInt(a1, a2)
   let b = randomInt(b1, b2)
   const op = pickRandom([...ops])

   let result
   try {
      result = new Function(`return ${a} ${op === '/' ? '*' : op} ${b < 0 ? `(${b})` : b}`)()
   } catch {
      result = NaN
   }

   if (op === '/') [a, result] = [result, a]

   return { str: `${a} ${operators[op]} ${b}`, mode, time, bonus, result }
}

const randomInt = (from, to) => {
   if (from > to) [from, to] = [to, from]
   return Math.floor(Math.random() * (to - from + 1)) + from
}

const pickRandom = list => list[Math.floor(Math.random() * list.length)]