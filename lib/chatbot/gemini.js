import { Utils } from '@neoxr/wb'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { GoogleAIFileManager } from '@google/generative-ai/server'
import mime from 'mime-types'
import fs from 'fs'
import path from 'path'
import pkg from 'file-type'
const { fromBuffer } = pkg

export default class GeminiHandler {
   constructor({ apikey, instruction, model } = {}) {
      this.apiKey = apikey
      this.instruction = instruction
      this.model = model

      this.googleGenAI = new GoogleGenerativeAI(this.apiKey)
      this.fileManager = new GoogleAIFileManager(this.apiKey)

      this.client = this.googleGenAI.getGenerativeModel({
         model: this.model,
         systemInstruction: this.instruction
      })

      this.config = {
         temperature: 1,
         topP: 0.95,
         topK: 40,
         maxOutputTokens: 8192,
         responseMimeType: 'text/plain'
      }
   }

   toGeminiHistory(history) {
      let filtered = history.filter(msg => msg.role !== 'system')

      while (filtered.length > 0 && filtered[0].role === 'assistant') {
         filtered.shift()
      }

      return filtered.map(msg => ({
         role: msg.role === 'assistant' ? 'model' : 'user',
         parts: [{ text: msg.content }]
      }))
   }

   uploadToGemini = async (source) => {
      try {
         let buffer
         if (Buffer.isBuffer(source)) {
            buffer = source
         } else if (typeof source === 'string' && (source.startsWith('http') || source.startsWith('https'))) {
            buffer = await Utils.fetchAsBuffer(source)
         }

         if (!buffer) throw new Error('File buffer is empty or invalid source')
         if (buffer.length > 10 * 1024 * 1024) throw new Error('File too large, max 10MB')

         const type = await fromBuffer(buffer)
         const mimeType = type?.mime || 'image/jpeg'
         const ext = mime.extension(mimeType) || 'jpg'
         const fname = path.join(process.cwd(), '.cache', `${Utils.uuid()}.${ext}`)

         if (!fs.existsSync(path.dirname(fname))) fs.mkdirSync(path.dirname(fname), { recursive: true })

         fs.writeFileSync(fname, buffer)

         const uploadResult = await this.fileManager.uploadFile(fname, {
            mimeType,
            displayName: fname,
         })

         fs.unlinkSync(fname)

         const file = uploadResult.file
         return {
            status: true,
            data: {
               mime: mimeType,
               fileUri: file.uri,
               name: file.name
            }
         }
      } catch (e) {
         return {
            status: false,
            msg: e.message
         }
      }
   }

   waitForFilesActive = async (fileData) => {
      try {
         let file = await this.fileManager.getFile(fileData.name)
         while (file.state === 'PROCESSING') {
            await new Promise((resolve) => setTimeout(resolve, 2000))
            file = await this.fileManager.getFile(fileData.name)
         }
         if (file.state !== 'ACTIVE') {
            throw new Error(`File ${file.name} failed to process`)
         }
         return true
      } catch (e) {
         throw e
      }
   }

   chat = async (prompt, history = [], fileSource = null) => {
      try {
         const geminiHistory = this.toGeminiHistory(history)

         const chatSession = this.client.startChat({
            generationConfig: this.config,
            history: geminiHistory
         })

         let msgParts = []
         let logContent = prompt

         if (fileSource) {
            const upload = await this.uploadToGemini(fileSource)
            if (!upload.status) return { status: false, msg: `Upload failed: ${upload.msg}` }
            await this.waitForFilesActive(upload.data)
            msgParts.push({
               fileData: {
                  mimeType: upload.data.mime,
                  fileUri: upload.data.fileUri
               }
            })
            logContent = `[Attached File: ${upload.data.mime}] ${prompt}`
         }

         msgParts.push({ text: prompt || '.' })

         const result = await chatSession.sendMessage(msgParts)

         const reply = result.response.text()
         if (!reply) throw new Error('No response from Gemini.')

         history.push({
            role: 'user',
            content: logContent
         })

         history.push({
            role: 'assistant',
            content: reply
         })

         return {
            status: true,
            data: {
               platform: 'gemini',
               prompt,
               message: reply.replace(/\*\*/g, '*').trim(),
               history
            }
         }
      } catch (e) {
         Utils.printError(e)
         return {
            status: false,
            msg: e.message
         }
      }
   }
}