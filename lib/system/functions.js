import { Utils } from '@neoxr/wb'
import path from 'path'
import fs from 'node:fs'
import fsPromise from 'fs/promises'
import makeAsZip from 'adm-zip'
import chalk from 'chalk'
import { format } from 'date-fns'
import sharp from 'sharp'
import { pathToFileURL } from 'url'

Utils.fibonacci = (x, y, number, opr) => {
   let value = [x, y]
   for (let i = 1; i <= number; i++) {
      const x1 = value[value.length - 2]
      const x2 = value[value.length - 1]
      value.push(eval(x1 + opr + x2))
   }
   return value
}

Utils.generateCryptarithm = () => {
   const num1 = Math.floor(Math.random() * 90) + 10
   const num2 = Math.floor(Math.random() * 90) + 10
   const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
   const letter1 = letters[Math.floor(Math.random() * letters.length)]
   const letter2 = letters[Math.floor(Math.random() * letters.length)]
   const operations = ['+', '-', '*', '/']
   const operation = operations[Math.floor(Math.random() * operations.length)]
   let result;
   if (operation === '+') {
      result = num1 + num2;
   } else if (operation === '-') {
      result = num1 - num2;
   } else if (operation === '*') {
      result = num1 * num2;
   } else if (operation === '/') {
      result = num1 - (num1 % num2)
      result = result / num2
   } else {
      throw new Error("Invalid operation")
   }
   const num1Str = num1.toString()
   const num2Str = num2.toString()
   const resultStr = result.toString()
   const digitToLetter = {}
   const usedLetters = new Set()
   const allCharacters = num1Str + num2Str + resultStr + letter1 + letter2
   function getUnusedLetter() {
      for (let i = 0; i < letters.length; i++) {
         const letter = letters[i]
         if (!usedLetters.has(letter)) {
            usedLetters.add(letter)
            return letter
         }
      }
      throw new Error("Not enough letters to map all digits")
   }
   for (const character of allCharacters) {
      if (!digitToLetter[character]) {
         digitToLetter[character] = getUnusedLetter()
      }
   }
   const num1Crypt = num1Str.split('').map(digit => digitToLetter[digit]).join('')
   const num2Crypt = num2Str.split('').map(digit => digitToLetter[digit]).join('')
   const resultCrypt = resultStr.split('').map(digit => digitToLetter[digit]).join('')
   function findKeyByValue(obj, value) {
      for (let key in obj) {
         if (obj[key] === value) {
            return key
         }
      }
      return undefined
   }
   return {
      problem: `${num1Crypt} ${operation} ${num2Crypt} = ${resultCrypt}`,
      solution: `${num1} ${operation} ${num2} = ${result}`,
      mapping: digitToLetter,
      game: {
         question: `Jika *${num1Crypt} ${operation.replace(/[*]/g, '×')} ${num2Crypt} = ${resultCrypt}* dan diketahui *(${num2Crypt.split('').map(v => `${v} = ${findKeyByValue(digitToLetter, v)}`).join(', ')})*, jadi *${resultCrypt}* adalah ...?`,
         answer: String(result)
      }
   }
}

Utils.downScale = async (inputPath, scale = 2) => {
   try {
      const Jimp = (await import('jimp')).default
      const image = await Jimp.read(inputPath)
      const newWidth = image.bitmap.width / scale
      const newHeight = image.bitmap.height / scale
      image.resize(newWidth, newHeight)
      const buffer = await image.getBufferAsync(Jimp.MIME_JPEG)
      return buffer
   } catch (error) {
      console.error('Error while downscaling image:', error);
   }
}

Utils.verified = caption => ({
   "key": {
      "fromMe": false,
      "participant": "0@s.whatsapp.net",
      "remoteJid": "0@s.whatsapp.net"
   },
   "message": {
      "newsletterAdminInviteMessage": {
         "newsletterJid": "120363299167245292@newsletter",
         "newsletterName": "Tester",
         "caption": Utils.Styles(caption || 'Verified WhatsApp BOT'),
         "inviteExpiration": "0"
      }
   }
})

Utils.newsletter = {
   "contextInfo": {
      "forwardingScore": 1,
      "isForwarded": true,
      "forwardedNewsletterMessageInfo": {
         "newsletterJid": process.env.NEWSLETTER_ID,
         "serverMessageId": process.env.NEWSLETTER_POSTID,
         "newsletterName": process.env.NEWSLETTER_NAME
      }
   }
}

Utils.cleanUp = () => {
   const tmpFiles = fs.readdirSync('./temp')
   if (tmpFiles.length > 0) {
      tmpFiles.filter(v => !v.endsWith('.file')).map(v => fs.unlinkSync('./temp/' + v))
   }
}

Utils.compressToZip = (sourcePath, outputPath, exclude = []) => {
   try {
      Utils.cleanUp()
      const zip = new makeAsZip()
      if (fs.lstatSync(sourcePath).isDirectory()) {
         zip.addLocalFolder(sourcePath, undefined, (filePath) => {
            const relativePath = path.relative(sourcePath, filePath)
            return !exclude.some((excludedItem) => relativePath.startsWith(excludedItem))
         })
      } else if (fs.lstatSync(sourcePath).isFile()) {
         const fileName = path.basename(sourcePath)
         if (!exclude.includes(fileName)) {
            zip.addLocalFile(sourcePath)
         }
      } else {
         return {
            status: false,
            message: `The source path must be a file or folder.`
         }
      }
      zip.writeZip(outputPath)
      return {
         status: true,
         message: `ZIP file created successfully: ${outputPath}`
      }
   } catch (error) {
      return {
         status: false,
         message: error.message
      }
   }
}

Utils.isBot = id => {
   // Detect message from bot by message ID, you can add another logic here
   return id && ((id.startsWith('3EB0') && id.length === 40) || id.startsWith('BAE') || /[-]/.test(id) || /neoxr/i.test(id))
}

Utils.hasRestrictedLinks = body => {
   try {
      const regex = /\bhttps?:\/\/(?:chat\.whatsapp\.com\/[a-zA-Z0-9]+|wa\.me\/[0-9]+|whatsapp\.com\/channel\/[a-zA-Z0-9]+)/gi;
      return body?.match(regex)?.length > 0
   } catch (e) {
      return false
   }
}

Utils.socmed = url => {
   const regex = [
      /^(?:https?:\/\/(web\.|www\.|m\.)?(facebook|fb)\.(com|watch)\S+)?$/,
      /^(?:https?:\/\/)?(?:www\.)?(?:instagram\.com\/)(?:tv\/|p\/|reel\/)(?:\S+)?$/,
      /^(?:https?:\/\/)?(?:www\.)?(?:instagram\.com\/)(?:stories\/)(?:\S+)?$/,
      /^(?:https?:\/\/)?(?:www\.)?(?:instagram\.com\/)(?:s\/)(?:\S+)?$/,
      /^(?:https?:\/\/)?(?:www\.)?(?:mediafire\.com\/)(?:\S+)?$/,
      /pin(?:terest)?(?:\.it|\.com)/,
      /^(?:https?:\/\/)?(?:www\.|vt\.|vm\.|t\.)?(?:tiktok\.com\/)(?:\S+)?$/,
      /http(?:s)?:\/\/(?:www\.|mobile\.)?twitter\.com\/([a-zA-Z0-9_]+)/,
      /^(?:https?:\/\/)?(?:www\.|m\.|music\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/,
      /^(?:https?:\/\/)?(?:podcasts\.)?(?:google\.com\/)(?:feed\/)(?:\S+)?$/
   ]
   return regex.some(v => /tiktok/.test(url) ? url.match(v) && !/tiktoklite/gis.test(url) : url.match(v))
}

Utils.greeting = () => {
   let time = parseInt(format(Date.now(), 'HH'))
   let res = `Don't forget to sleep`
   if (time >= 3) res = `Good Evening`
   if (time > 6) res = `Good Morning`
   if (time >= 11) res = `Good Afternoon`
   if (time >= 18) res = `Good Night`
   return res
}

Utils.role = level => {
   let roles = '-'
   if (level <= 2) {
      roles = 'Newbie ㋡'
   } else if (level <= 4) {
      roles = 'Beginner Grade 1 ⚊¹'
   } else if (level <= 6) {
      roles = 'Beginner Grade 2 ⚊²'
   } else if (level <= 8) {
      roles = 'Beginner Grade 3 ⚊³'
   } else if (level <= 10) {
      roles = 'Beginner Grade 4 ⚊⁴'
   } else if (level <= 12) {
      roles = 'Private Grade 1 ⚌¹'
   } else if (level <= 14) {
      roles = 'Private Grade 2 ⚌²'
   } else if (level <= 16) {
      roles = 'Private Grade 3 ⚌³'
   } else if (level <= 18) {
      roles = 'Private Grade 4 ⚌⁴'
   } else if (level <= 20) {
      roles = 'Private Grade 5 ⚌⁵'
   } else if (level <= 22) {
      roles = 'Corporal Grade 1 ☰¹'
   } else if (level <= 24) {
      roles = 'Corporal Grade 2 ☰²'
   } else if (level <= 26) {
      roles = 'Corporal Grade 3 ☰³'
   } else if (level <= 28) {
      roles = 'Corporal Grade 4 ☰⁴'
   } else if (level <= 30) {
      roles = 'Corporal Grade 5 ☰⁵'
   } else if (level <= 32) {
      roles = 'Sergeant Grade 1 ≣¹'
   } else if (level <= 34) {
      roles = 'Sergeant Grade 2 ≣²'
   } else if (level <= 36) {
      roles = 'Sergeant Grade 3 ≣³'
   } else if (level <= 38) {
      roles = 'Sergeant Grade 4 ≣⁴'
   } else if (level <= 40) {
      roles = 'Sergeant Grade 5 ≣⁵'
   } else if (level <= 42) {
      roles = 'Staff Grade 1 ﹀¹'
   } else if (level <= 44) {
      roles = 'Staff Grade 2 ﹀²'
   } else if (level <= 46) {
      roles = 'Staff Grade 3 ﹀³'
   } else if (level <= 48) {
      roles = 'Staff Grade 4 ﹀⁴'
   } else if (level <= 50) {
      roles = 'Staff Grade 5 ﹀⁵'
   } else if (level <= 52) {
      roles = 'Sergeant Grade 1 ︾¹'
   } else if (level <= 54) {
      roles = 'Sergeant Grade 2 ︾²'
   } else if (level <= 56) {
      roles = 'Sergeant Grade 3 ︾³'
   } else if (level <= 58) {
      roles = 'Sergeant Grade 4 ︾⁴'
   } else if (level <= 60) {
      roles = 'Sergeant Grade 5 ︾⁵'
   } else if (level <= 62) {
      roles = '2nd Lt. Grade 1 ♢¹ '
   } else if (level <= 64) {
      roles = '2nd Lt. Grade 2 ♢²'
   } else if (level <= 66) {
      roles = '2nd Lt. Grade 3 ♢³'
   } else if (level <= 68) {
      roles = '2nd Lt. Grade 4 ♢⁴'
   } else if (level <= 70) {
      roles = '2nd Lt. Grade 5 ♢⁵'
   } else if (level <= 72) {
      roles = '1st Lt. Grade 1 ♢♢¹'
   } else if (level <= 74) {
      roles = '1st Lt. Grade 2 ♢♢²'
   } else if (level <= 76) {
      roles = '1st Lt. Grade 3 ♢♢³'
   } else if (level <= 78) {
      roles = '1st Lt. Grade 4 ♢♢⁴'
   } else if (level <= 80) {
      roles = '1st Lt. Grade 5 ♢♢⁵'
   } else if (level <= 82) {
      roles = 'Major Grade 1 ✷¹'
   } else if (level <= 84) {
      roles = 'Major Grade 2 ✷²'
   } else if (level <= 86) {
      roles = 'Major Grade 3 ✷³'
   } else if (level <= 88) {
      roles = 'Major Grade 4 ✷⁴'
   } else if (level <= 90) {
      roles = 'Major Grade 5 ✷⁵'
   } else if (level <= 92) {
      roles = 'Colonel Grade 1 ✷✷¹'
   } else if (level <= 94) {
      roles = 'Colonel Grade 2 ✷✷²'
   } else if (level <= 96) {
      roles = 'Colonel Grade 3 ✷✷³'
   } else if (level <= 98) {
      roles = 'Colonel Grade 4 ✷✷⁴'
   } else if (level <= 100) {
      roles = 'Colonel Grade 5 ✷✷⁵'
   } else if (level <= 102) {
      roles = 'Brigadier Early ✰'
   } else if (level <= 104) {
      roles = 'Brigadier Silver ✩'
   } else if (level <= 106) {
      roles = 'Brigadier gold ✯'
   } else if (level <= 108) {
      roles = 'Brigadier Platinum ✬'
   } else if (level <= 110) {
      roles = 'Brigadier Diamond ✪'
   } else if (level <= 112) {
      roles = 'Major General Early ✰'
   } else if (level <= 114) {
      roles = 'Major General Silver ✩'
   } else if (level <= 116) {
      roles = 'Major General gold ✯'
   } else if (level <= 118) {
      roles = 'Major General Platinum ✬'
   } else if (level <= 120) {
      roles = 'Major General Diamond ✪'
   } else if (level <= 122) {
      roles = 'Lt. General Early ✰'
   } else if (level <= 124) {
      roles = 'Lt. General Silver ✩'
   } else if (level <= 126) {
      roles = 'Lt. General gold ✯'
   } else if (level <= 128) {
      roles = 'Lt. General Platinum ✬'
   } else if (level <= 130) {
      roles = 'Lt. General Diamond ✪'
   } else if (level <= 132) {
      roles = 'General Early ✰'
   } else if (level <= 134) {
      roles = 'General Silver ✩'
   } else if (level <= 136) {
      roles = 'General gold ✯'
   } else if (level <= 138) {
      roles = 'General Platinum ✬'
   } else if (level <= 140) {
      roles = 'General Diamond ✪'
   } else if (level <= 142) {
      roles = 'Commander Early ★'
   } else if (level <= 144) {
      roles = 'Commander Intermediate ⍣'
   } else if (level <= 146) {
      roles = 'Commander Elite ≛'
   } else if (level <= 148) {
      roles = 'The Commander Hero ⍟'
   } else if (level <= 152) {
      roles = 'Legends 忍'
   } else if (level <= 154) {
      roles = 'Legends 忍'
   } else if (level <= 156) {
      roles = 'Legends 忍'
   } else if (level <= 158) {
      roles = 'Legends 忍'
   } else if (level <= 160) {
      roles = 'Legends 忍'
   } else if (level <= 162) {
      roles = 'Legends 忍'
   } else if (level <= 164) {
      roles = 'Legends 忍'
   } else if (level <= 166) {
      roles = 'Legends 忍'
   } else if (level <= 168) {
      roles = 'Legends 忍'
   } else if (level <= 170) {
      roles = 'Legends 忍'
   } else if (level <= 172) {
      roles = 'Legends 忍'
   } else if (level <= 174) {
      roles = 'Legends 忍'
   } else if (level <= 176) {
      roles = 'Legends 忍'
   } else if (level <= 178) {
      roles = 'Legends 忍'
   } else if (level <= 180) {
      roles = 'Legends 忍'
   } else if (level <= 182) {
      roles = 'Legends 忍'
   } else if (level <= 184) {
      roles = 'Legends 忍'
   } else if (level <= 186) {
      roles = 'Legends 忍'
   } else if (level <= 188) {
      roles = 'Legends 忍'
   } else if (level <= 190) {
      roles = 'Legends 忍'
   } else if (level <= 192) {
      roles = 'Legends 忍'
   } else if (level <= 194) {
      roles = 'Legends 忍'
   } else if (level <= 196) {
      roles = 'Legends 忍'
   } else if (level <= 198) {
      roles = 'Legends 忍'
   } else if (level <= 200) {
      roles = 'Legends 忍'
   } else if (level <= 210) {
      roles = 'Legends 忍'
   } else if (level <= 220) {
      roles = 'Legends 忍'
   } else if (level <= 230) {
      roles = 'Legends 忍'
   } else if (level <= 240) {
      roles = 'Legends 忍'
   } else if (level <= 250) {
      roles = 'Legends 忍'
   } else if (level <= 260) {
      roles = 'Legends 忍'
   } else if (level <= 270) {
      roles = 'Legends 忍'
   } else if (level <= 280) {
      roles = 'Legends 忍'
   } else if (level <= 290) {
      roles = 'Legends 忍'
   } else if (level <= 300) {
      roles = 'Legends 忍'
   } else if (level <= 310) {
      roles = 'Legends 忍'
   } else if (level <= 320) {
      roles = 'Legends 忍'
   } else if (level <= 330) {
      roles = 'Legends 忍'
   } else if (level <= 340) {
      roles = 'Legends 忍'
   } else if (level <= 350) {
      roles = 'Legends 忍'
   } else if (level <= 360) {
      roles = 'Legends 忍'
   } else if (level <= 370) {
      roles = 'Legends 忍'
   } else if (level <= 380) {
      roles = 'Legends 忍'
   } else if (level <= 390) {
      roles = 'Legends 忍'
   } else if (level <= 400) {
      roles = 'Legends 忍'
   } else if (level <= 410) {
      roles = 'Legends 忍'
   } else if (level <= 420) {
      roles = 'Legends 忍'
   } else if (level <= 430) {
      roles = 'Legends 忍'
   } else if (level <= 440) {
      roles = 'Legends 忍'
   } else if (level <= 450) {
      roles = 'Legends 忍'
   } else if (level <= 460) {
      roles = 'Legends 忍'
   } else if (level <= 470) {
      roles = 'Legends 忍'
   } else if (level <= 480) {
      roles = 'Legends 忍'
   } else if (level <= 490) {
      roles = 'Legends 忍'
   } else if (level <= 500) {
      roles = 'Legends 忍'
   } else if (level <= 600) {
      roles = 'Legends 忍'
   } else if (level <= 700) {
      roles = 'Legends 忍'
   } else if (level <= 800) {
      roles = 'Legends 忍'
   } else if (level <= 900) {
      roles = 'Legends 忍'
   } else if (level <= 1000) {
      roles = 'Legends 忍'
   } else if (level <= 2000) {
      roles = 'Legends 忍'
   } else if (level <= 3000) {
      roles = 'Legends 忍'
   } else if (level <= 4000) {
      roles = 'Legends 忍'
   } else if (level <= 5000) {
      roles = 'Legends 忍'
   } else if (level <= 6000) {
      roles = 'Legends 忍'
   } else if (level <= 7000) {
      roles = 'Legends 忍'
   } else if (level <= 8000) {
      roles = 'Legends 忍'
   } else if (level <= 9000) {
      roles = 'Legends 忍'
   } else if (level <= 10000) {
      roles = 'Legends 忍'
   }
   return roles
}

Utils.socmed = url => {
   const regex = [
      /^(?:https?:\/\/(web\.|www\.|m\.)?(facebook|fb)\.(com|watch)\S+)?$/,
      /^(?:https?:\/\/)?(?:www\.)?(?:instagram\.com\/)(?:tv\/|p\/|reel\/)(?:\S+)?$/,
      /^(?:https?:\/\/)?(?:www\.)?(?:instagram\.com\/)(?:stories\/)(?:\S+)?$/,
      /^(?:https?:\/\/)?(?:www\.)?(?:instagram\.com\/)(?:s\/)(?:\S+)?$/,
      /^(?:https?:\/\/)?(?:www\.)?(?:mediafire\.com\/)(?:\S+)?$/,
      /pin(?:terest)?(?:\.it|\.com)/,
      /^(?:https?:\/\/)?(?:www\.|vt\.|vm\.|t\.)?(?:tiktok\.com\/)(?:\S+)?$/,
      /http(?:s)?:\/\/(?:www\.|mobile\.)?twitter\.com\/([a-zA-Z0-9_]+)/,
      /^(?:https?:\/\/)?(?:www\.|m\.|music\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/,
      /^(?:https?:\/\/)?(?:podcasts\.)?(?:google\.com\/)(?:feed\/)(?:\S+)?$/
   ]
   return regex.some(v => /tiktok/.test(url) ? url.match(v) && !/tiktoklite/gis.test(url) : url.match(v))
}

Utils.igFixed = (url) => {
   let count = url.split('/')
   if (count.length == 7) {
      let username = count[3]
      let destruct = Utils.removeItem(count, username)
      return destruct.map(v => v).join('/')
   } else return url
}

Utils.ttFixed = (url) => {
   if (!url.match(/(tiktok.com\/t\/)/g)) return url
   let id = url.split('/t/')[1]
   return 'https://vm.tiktok.com/' + id
}

Utils.convertWebp2Jpeg = async buffer => {
   try {
      const outputBuffer = await sharp(buffer)
         .jpeg()
         .toBuffer()

      return outputBuffer
   } catch (err) {
      return null
   }
}

Utils.watchThisFile = (filePath, callback) => {
   const fileUrl = pathToFileURL(filePath).href

   const loadModule = async () => {
      try {
         const module = await import(`${fileUrl}?update=${Date.now()}`)
         if (callback) {
            callback(module)
         }
      } catch (error) {
         console.error(
            chalk.redBright.bold('[ ERROR ]'),
            format(new Date(), 'dd/MM/yyyy HH:mm:ss'),
            `~ Failed to reload ${filePath}:`,
            error.message
         )
      }
   }

   loadModule()

   fs.watchFile(filePath, { persistent: true, interval: 1000 }, (curr, prev) => {
      if (curr.mtime.getTime() !== prev.mtime.getTime()) {
         console.log(
            chalk.magenta.bold('[ RELOAD ]'),
            format(new Date(), 'dd/MM/yyyy HH:mm:ss'),
            chalk.bold(`~ File reloaded: ${filePath}`)
         )
         loadModule()
      }
   })
}

Utils.getFolderSize = async folderPath => {
   let totalSize = 0

   try {
      async function calculateSize(dir) {
         const files = await fsPromise.readdir(dir)

         for (const file of files) {
            const filePath = path.join(dir, file)
            const stats = await fsPromise.stat(filePath)

            if (stats.isFile()) {
               totalSize += stats.size
            } else if (stats.isDirectory()) {
               await calculateSize(filePath)
            }
         }
      }

      await calculateSize(folderPath)
      return totalSize
   } catch (e) {
      return totalSize
   }
}

Utils.renameDatabaseSqlite = async (oldPath, newPath) => {
   const extensions = ['', '-shm', '-wal']

   for (const ext of extensions) {
      try {
         await fsPromise.rename(oldPath + ext, newPath + ext)
      } catch (e) {
         if (e.code !== 'ENOENT') {
            throw e
         }
      }
   }
}