import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'
import { GoogleAIFileManager } from '@google/generative-ai/server'
import FormData from 'form-data'
import fs from 'fs'
import pkg from 'file-type'
const { fromBuffer } = pkg
import mime from 'mime-types'
import axios from 'axios'
import retry from 'async-retry'
import { tmpfiles } from '@neoxr/helper'

class Utils {
   /**
    * Check if a given string is a valid URL.
    * @param {string} url - The URL to validate.
    * @returns {boolean} True if valid URL, false otherwise.
    */
   isUrl = url => {
      try {
         new URL(url)
         return true
      } catch {
         return false
      }
   }

   /**
    * Convert a URL or buffer input into a Buffer.
    * @param {string|Buffer} i - Input data (URL or Buffer).
    * @returns {Promise<Buffer|null>} The Buffer result or null if invalid.
    */
   toBuffer = async i => {
      try {
         const file = Buffer.isBuffer(i) ? i : this.isUrl(i) ? await (await axios.get(i, {
            responseType: 'arraybuffer'
         })).data : null
         return Buffer.from(file)
      } catch (e) {
         return null
      }
   }

   /**
    * Generate a random alphanumeric string.
    * @param {number} length - Desired string length.
    * @returns {string} The generated string.
    */
   randomString = length => {
      const characters = 'abcdefghijklmnopqrstuvwxyz0123456789'
      let result = ''
      for (let i = 0; i < length; i++) {
         const randomIndex = Math.floor(Math.random() * characters.length)
         result += characters[randomIndex]
      }
      return result
   }

   /**
    * Upload a file (Buffer or URL) to an external upload service.
    * @param {Buffer|string} i - The input file as buffer or URL.
    * @param {string} [extension] - Optional file extension override.
    * @returns {Promise<object>} Response object with status and message/data.
    */
   upload = (i, extension) => new Promise(async resolve => {
      try {
         if (!Buffer.isBuffer(i) && !this.isUrl(i)) throw new Error('Only buffer and url formats are allowed')
         const file = Buffer.isBuffer(i) ? i : this.isUrl(i) ? (await axios.get(i, { responseType: 'arraybuffer' })).data : null
         let ext = 'txt'
         const parsed = await fromBuffer(file)
         if (parsed) {
            ext = parsed.ext || 'txt'
         }
         const form = new FormData
         form.append('file', Buffer.from(file), 'file.' + (extension || ext))
         let json = await retry(async () => {
            const response = await (await axios.post('https://s.neoxr.eu/api/upload', form, {
               headers: {
                  ...form.getHeaders()
               }
            })).data
            if (!response.status) throw new Error(response.msg)
            return response
         }, {
            retries: 3,
            factor: 2,
            minTimeout: 1000,
            maxTimeout: 5000,
            onRetry: (e, n) => { }
         })

         if (!json.status) {
            json = await tmpfiles(Buffer.from(file))
         }

         resolve(json)
      } catch (e) {
         console.log(e)
         resolve({
            creator: global.status,
            status: false,
            msg: e.message
         })
      }
   })

   /**
    * Parses a response string into a structured command or context.
    * Supports formats like "cmd_", "stc_", or plain text.
    * @param {string} response - The input message string.
    * @returns {Promise<object>} Parsed data with context, command, argument, and message.
    */
   logic = response => new Promise(resolve => {
      try {
         if (/cmd_/.test(response)) {
            const [message, instruction] = response?.split('◡')
            let [command, ...args] = instruction?.split(' ')
            const q = args.join(' ')
            if (!command?.startsWith('cmd_')) return resolve({
               creator: global.creator,
               status: true,
               data: {
                  context: 'NONE',
                  command: null,
                  argument: q,
                  message: message?.replace(/stc_\S+\s*/, "")
               }
            })
            resolve({
               creator: global.creator,
               status: true,
               data: {
                  context: 'REQUEST',
                  command,
                  argument: q,
                  message: message?.replace(/stc_\S+\s*/, "")
               }
            })
         } else if (/stc_/.test(response) && response.startsWith('stc_')) {
            const [sticker, ...msg] = response?.split(' ')
            const q = msg.join(' ')
            resolve({
               creator: global.creator,
               status: true,
               data: {
                  context: 'EMOTION',
                  command: sticker,
                  argument: null,
                  message: q?.replace(/stc_\S+\s*/, "")
               }
            })
         } else {
            resolve({
               creator: global.creator,
               status: true,
               data: {
                  context: 'NONE',
                  command: null,
                  argument: null,
                  message: response?.replace(/stc_\S+\s*/, "")
               }
            })
         }
      } catch (e) {
         resolve({
            creator: global.creator,
            status: false,
            msg: e.message
         })
      }
   })
}

class Gemini extends Utils {
   /**
    * Initialize Gemini AI with API key and system instruction.
    * @param {string} apiKey - Your Google Generative AI API key.
    * @param {string} instruction - System-level instruction for the model.
    */
   constructor(apiKey, instruction) {
      super()
      this.apiKey = apiKey
      this.genAI = new GoogleGenerativeAI(this.apiKey)
      this.fileManager = new GoogleAIFileManager(this.apiKey)
      this.model = this.genAI.getGenerativeModel({
         model: 'gemini-flash-lite-latest',
         systemInstruction: instruction,
         tools: [{ google_search: {} }]
      })
      this.generationConfig = {
         temperature: 1,
         topP: 0.95,
         topK: 40,
         maxOutputTokens: 8192,
         responseMimeType: 'text/plain'
      }
   }

   /**
    * Upload a file (Buffer or URL) to Gemini and prepare for use.
    * @param {string|Buffer} url - File URL or buffer.
    * @param {string} [mimeType] - Optional MIME type.
    * @returns {Promise<object>} Upload result containing Gemini file reference.
    */
   uploadToGemini = (url, mimeType) => new Promise(async resolve => {
      try {
         const buffer = await this.toBuffer(url)
         if (!buffer) return resolve({
            creator: global.creator,
            status: false,
            message: 'File not found'
         })
         if (buffer.length > 5242880) return resolve({
            creator: global.creator,
            status: false,
            msg: 'File too large, max 5MB'
         })
         mimeType = mimeType || await (await fromBuffer(buffer))?.mime || 'text/plain'
         const fname = `${this.randomString(16)}.${mime.extension(mimeType)}`
         fs.writeFileSync(fname, buffer)
         const uploadResult = await this.fileManager.uploadFile(fname, {
            mimeType,
            displayName: fname,
         })
         fs.unlinkSync(fname)
         const file = uploadResult.file
         resolve({
            creator: global.creator,
            status: true,
            data: {
               file, url
            }
         })
      } catch (e) {
         resolve({
            creator: global.creator,
            status: false,
            msg: e.message
         })
      }
   })

   /**
    * Wait until all provided Gemini files are in ACTIVE state.
    * @param {Array} files - List of Gemini files.
    */
   waitForFilesActive = async (files) => {
      for (const name of files.map((file) => file.name)) {
         let file = await this.fileManager.getFile(name)
         while (file.state === "PROCESSING") {
            process.stdout.write(".")
            await new Promise((resolve) => setTimeout(resolve, 10_000))
            file = await this.fileManager.getFile(name)
         }
         if (file.state !== "ACTIVE") {
            console.log(`File ${file.name} failed to process`)
         }
      }
   }

   /**
    * Start a new chat session with optional history.
    * @param {Array} histories - Chat history to preload.
    * @returns {object} Gemini chat session.
    */
   session = (histories = []) => {
      const chatSession = this.model.startChat({
         generationConfig: this.generationConfig,
         history: [...new Set(histories)]
      })
      return chatSession
   }

   /**
    * Manage the history size and ensure it fits Gemini's input window.
    * @param {Array} array - Full chat history.
    * @returns {Array} Trimmed history.
    */
   historyManager = array => {
      if (array.length >= 8) array.splice(0, 2)
      if (array[0]?.role === 'model') array.splice(0, 1)
      return array
   }

   /**
    * Send a chat message to Gemini with optional history.
    * @param {string} prompt - User input.
    * @param {Array} [history=[]] - Optional chat history.
    * @returns {Promise<object>} Gemini's chat response.
    */
   chat = (prompt, history = []) => new Promise(async resolve => {
      try {
         let histories = history.length > 0 ? history : []
         histories.push({
            role: 'user',
            parts: [{ text: prompt }]
         })

         const is_history = this.historyManager(histories)
         const result = await this.session(is_history).sendMessage(prompt)
         is_history.push(result.response.candidates[0].content)

         if (!result.response.text()) return resolve({
            creator: global.creator,
            status: false,
            msg: 'No response from AI'
         })

         resolve({
            creator: global.creator,
            status: true,
            data: {
               history: [...new Set(is_history)],
               question: prompt,
               message: result.response.text().replace(/\*\*/g, '*').trim()
            }
         })
      } catch (e) {
         resolve({
            creator: global.creator,
            status: false,
            msg: e.message
         })
      }
   })

   /**
    * Send a chat message with a file attachment.
    * @param {string|Buffer} file - The file (URL or buffer).
    * @param {string} prompt - User input.
    * @param {Array} [history=[]] - Optional chat history.
    * @returns {Promise<object>} Gemini's file-based chat response.
    */
   file = (file, prompt, history = []) => new Promise(async resolve => {
      try {
         const drive = await this.uploadToGemini(file)
         if (!drive.status) return resolve(drive)
         const files = [drive.data.file]
         await this.waitForFilesActive(files)
         let histories = history.length > 0 ? history : []
         histories.push({
            role: 'user',
            parts: [{
               fileData: {
                  mimeType: files[0].mimeType,
                  fileUri: files[0].uri
               }
            }, {
               text: prompt
            }]
         })

         const is_history = this.historyManager(histories)
         const result = await this.session(is_history).sendMessage(prompt || '.')
         is_history.push(result.response.candidates[0].content)

         if (!result.response.text()) return resolve({
            creator: global.creator,
            status: false,
            msg: 'No response from AI'
         })

         resolve({
            creator: global.creator,
            status: true,
            data: {
               file: drive.data.url,
               question: prompt,
               history: [...new Set(is_history)],
               message: result.response.text().replace(/\*\*/g, '*').trim()
            }
         })
      } catch (e) {
         resolve({
            creator: global.creator,
            status: false,
            msg: e.message
         })
      }
   })
}

/**
 * Main chatbot function to handle text or file-based prompts using Gemini AI.
 * @param {string} prompt - The user's input.
 * @param {string|Buffer} [file] - Optional file input (URL or buffer).
 * @param {Array} [history=[]] - Optional chat history.
 * @param {string} [system] - Optional system prompt/instruction.
 * @returns {Promise<object>} Gemini response.
 */
const Chatbot = (prompt, file, history = [], system) => new Promise(async resolve => {
   try {
      const AI = new Gemini(
         process.env.GOOGLE_API,
         system || fs.readFileSync('./media/prompt-en.txt', 'utf-8')
      )
      const response = await retry(async () => {
         const json = file
            ? await AI.file(file, prompt, history || [])
            : await AI.chat(prompt, history || [])
         if (!json.status) {
            global.db.autoai = []
            throw new Error(json.msg)
         }
         return json
      }, {
         retries: 3,
         factor: 2,
         minTimeout: 1000,
         maxTimeout: 3000,
         onRetry: (e, n) => { }
      })
      resolve(response)
   } catch (e) {
      resolve({
         creator: global.creator,
         status: false,
         msg: e.message
      })
   }
})

const utils = new Utils
export { utils as Utils, Gemini, Chatbot }