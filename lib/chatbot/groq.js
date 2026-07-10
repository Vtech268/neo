import { Utils } from '@neoxr/wb'
import { Groq as GroqSDK } from 'groq-sdk'
import fs from 'fs'
import path from 'path'

export default class GroqHandler {
   constructor({ apikey, instruction, model } = {}) {
      this.apiKey = process.env.GROQ_API || apikey
      this.instruction = instruction
      this.model = model

      this.client = new GroqSDK({
         apiKey: this.apiKey
      })

      this.config = {
         model: this.model,
         temperature: 1,
         max_completion_tokens: 8192,
         top_p: 1
      }
   }

   session = async (history) =>
      this.client.chat.completions.create({
         messages: history,
         ...this.config
      })

   transcript = async (source) => {
      let tempFile = null
      try {
         if (!source) throw new Error('No source URL provided')
         
         const buffer = await Utils.fetchAsBuffer(source)
         if (!buffer) throw new Error('Failed to fetch audio buffer')

         const filename = `transcribe_${Utils.uuid()}.mp3`
         tempFile = path.join(process.cwd(), '.cache', filename)
         
         const dir = path.dirname(tempFile)
         if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
         
         fs.writeFileSync(tempFile, buffer)

         const response = await this.client.audio.transcriptions.create({
            file: fs.createReadStream(tempFile),
            model: 'whisper-large-v3',
            temperature: 0,
            response_format: 'verbose_json',
         })

         if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile)

         if (!response?.text) throw new Error('No response from Groq. (Text Not Found)')

         return {
            status: true,
            data: {
               text: response.text
            }
         }
      } catch (e) {
         if (tempFile && fs.existsSync(tempFile)) fs.unlinkSync(tempFile)
         
         Utils.printError(e)
         return {
            status: false,
            msg: e.message
         }
      }
   }

   chat = async (prompt, history = []) => {
      try {
         if (history.length === 0 || history[0].role !== 'system') {
            history.unshift({ role: 'system', content: this.instruction })
         }

         history.push({
            role: 'user',
            content: prompt
         })

         const completion = await this.session(history)
         const reply = completion?.choices?.[0]?.message?.content

         if (!reply) {
            throw new Error('Sorry, Groq assistant not available right now...')
         }

         history.push({
            role: 'assistant',
            content: reply
         })

         return {
            status: true,
            data: {
               platform: 'groq',
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