import { Utils } from '@neoxr/wb'
import path from 'path'
import fs from 'fs'
import Cloudflare from './cloudflare.js'
import Groq from './groq.js'
import Gemini from './gemini.js'

const LOGS = path.join(process.cwd(), '.cache', 'completions')
if (!fs.existsSync(LOGS)) fs.mkdirSync(LOGS, { recursive: true })

const MODEL_MAP = {
   groq: [
      { id: 'groq/compound', name: 'Compound', limits: { request: '30/min - 250/day', token: '1M' } },
      { id: 'groq/compound-mini', name: 'Compound Mini', limits: { request: '30/min - 250/day', token: '1M' } }
   ],
   gemini: [
      { id: 'gemma-4-26b-a4b-it', name: 'Gemma 4 26B', limits: { request: '30/min', token: '1M' } },
      { id: 'gemma-4-31b-it', name: 'Gemma 4 31B', limits: { request: '30/min', token: '1M' } },
      { id: 'gemini-robotics-er-1.6-preview', name: 'Gemini Robotics ER 1.6', limits: { request: '20/min', token: '1M' } },
      { id: 'gemini-flash-latest', name: 'Gemini Flash', limits: { request: '20/min', token: '1M' } },
      { id: 'gemini-flash-lite-latest', name: 'Gemini Flash Lite', limits: { request: '20/min', token: '1M' } },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', limits: { request: '20/min', token: '1M' } },
      { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', limits: { request: '10/min', token: '1M' } },
      { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro', limits: { request: '-', token: '1M' }, shouldPremium: true },
      { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash Preview', limits: { request: '10/min', token: '1M' } },
      { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro Preview', limits: { request: '10/min', token: '1M' } },
      { id: 'gemini-3.1-flash-lite-preview', name: 'Gemini 3.1 Flash Lite', limits: { request: '10/min', token: '1M' } },
   ],
   cloudflare: {
      limit: '10,000 Neurons/day',
      text: [
         { id: '@cf/meta/llama-3.1-8b-instruct-fast', name: 'Llama 3.1 8B (Fast)' },
         { id: '@cf/meta/llama-3.3-70b-instruct-fp8-fast', name: 'Llama 3.3 70B Fp8 (Fast)' },
         { id: '@cf/meta/llama-4-scout-17b-16e-instruct', name: 'Llama 4 Scout 17B 16E' },
         { id: '@hf/mistral/mistral-7b-instruct-v0.2', name: 'Mistral 7B V0.2' },
         { id: '@cf/mistralai/mistral-small-3.1-24b-instruct', name: 'Mistral Small 3.1 24B' },
         { id: '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b', name: 'Deepseek R1 Distill' },
         { id: '@cf/microsoft/phi-2', name: 'Phi 2' },
         { id: '@cf/google/gemma-3-12b-it', name: 'Gemma 3 12B' },
         { id: '@cf/moonshotai/kimi-k2.5', name: 'Kimi K2.5' },
         { id: '@cf/moonshotai/kimi-k2.6', name: 'Kimi K2.6' }
      ],
      genimg: [
         { id: '@cf/leonardo/lucid-origin', name: 'Leonardo Lucid Origin', quality: 'Good' },
         { id: '@cf/leonardo/phoenix-1.0', name: 'Leonardo Pheonix 0.1', quality: 'Good' },
         { id: '@cf/lykon/dreamshaper-8-lcm', name: 'Dreamshaper 8 LCM', quality: 'Low' },
         { id: '@cf/black-forest-labs/flux-1-schnell', name: 'Flux 1 Schnell', quality: 'Good' },
         { id: '@cf/stabilityai/stable-diffusion-xl-base-1.0', name: 'Stable Diffusion XL (Base)', quality: 'Medium' },
         { id: '@cf/bytedance/stable-diffusion-xl-lightning', name: 'Stable Diffusion XL (Lightning)', quality: 'Low' },
      ]
   }
}

export default class Chatbot {
   constructor({ apikey = {}, instruction, model = {} }) {
      this.apikey = {
         gemini: apikey?.gemini,
         groq: apikey?.groq,
         cloudflare: apikey?.cloudflare
      }

      try {
         const fileContent = fs.readFileSync(path.join(process.cwd(), `lib/chatbot/prompt-${process.env.PROMPT_LANG || 'id'}.txt`), 'utf-8')
         this.instruction = (instruction ? instruction + ' ' : '') + fileContent
      } catch (e) {
         this.instruction = instruction || 'You are a helpful assistant.'
      }

      this.model = {
         gemini: model?.gemini,
         groq: model?.groq,
         cloudflare: {
            text: model?.cloudflare?.text,
            image: '@cf/llava-hf/llava-1.5-7b-hf',
            audio: '@cf/openai/whisper',
            genimg: model?.cloudflare?.image
         }
      }

      if (this.apikey?.gemini) {
         this.gemini = new Gemini({
            apikey: this.apikey.gemini,
            instruction: this.instruction,
            model: this.model.gemini
         })
      }

      if (this.apikey?.groq) {
         this.groq = new Groq({
            apikey: this.apikey.groq,
            instruction: this.instruction,
            model: this.model.groq
         })
      }

      this.cloudflare = new Cloudflare({
         apikey: this.apikey.cloudflare,
         instruction: this.instruction,
         model: this.model.cloudflare
      })
   }

   getModels = () => ({
      creator: global.creator,
      status: true,
      data: MODEL_MAP
   })

   loadHistory = (id) => {
      const filePath = path.join(LOGS, `${id}.json`)
      if (fs.existsSync(filePath)) {
         try {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
            return Array.isArray(data) ? data : []
         } catch {
            return []
         }
      }
      return []
   }

   saveHistory = (id, history) => {
      const filePath = path.join(LOGS, `${id}.json`)
      try {
         fs.writeFileSync(filePath, JSON.stringify(history, null, 2))
      } catch (e) {
         console.error(`Failed to save history for ${id}`)
      }
   }

   logicParser = (response, id) => {
      try {
         const cleanMsg = (msg) => msg?.replace(/stc_\S+\s*/g, "").trim()

         if (/cmd_/.test(response)) {
            const [messagePart, instructionPart] = response?.split('◡')

            let [command, ...args] = (instructionPart || '').trim().split(' ')
            const argument = args.join(' ')
            const message = cleanMsg(messagePart)

            if (!command?.startsWith('cmd_')) {
               return {
                  creator: global.creator,
                  status: true,
                  data: {
                     session: id,
                     context: 'NONE',
                     command: null,
                     argument: argument,
                     message: message
                  }
               }
            }

            return {
               creator: global.creator,
               status: true,
               data: {
                  session: id,
                  context: 'REQUEST',
                  command: command,
                  argument: argument,
                  message: message
               }
            }
         } else if (/stc_/.test(response) && response.trim().startsWith('stc_')) {
            const [sticker, ...msgParts] = response.trim().split(' ')
            const message = cleanMsg(msgParts.join(' '))

            return {
               creator: global.creator,
               status: true,
               data: {
                  session: id,
                  context: 'EMOTION',
                  command: sticker,
                  argument: null,
                  message: message
               }
            }
         } else {
            return {
               creator: global.creator,
               status: true,
               data: {
                  session: id,
                  context: 'NONE',
                  command: null,
                  argument: null,
                  message: cleanMsg(response)
               }
            }
         }
      } catch (e) {
         return {
            creator: global.creator,
            status: false,
            msg: e.message
         }
      }
   }

   imageGen = async prompt => {
      if (this.cloudflare) {
         return await this.cloudflare.runGenImg(prompt)
      } else {
         return {
            status: false,
            msg: 'No provider available'
         }
      }
   }

   start = async (prompt, file = {}, id = null) => {
      try {
         if (!id) id = Utils.uuid()

         let history = this.loadHistory(id)

         if (history.length > 0 && history[history.length - 1].role === 'user' && history[history.length - 1].content === prompt) {
            history.pop()
         }

         history = history.filter(m => m.role !== 'system')

         while (history.length > 0 && history[0].role !== 'user') {
            history.shift()
         }

         if (history.length > 10) {
            history = history.slice(-10)
         }

         let response = { status: false, msg: 'No provider available' }

         if (file && file.ptt && file.source) {
            if (this.groq) {
               const transcript = await this.groq.transcript(file.source)
               if (transcript.status) {
                  prompt = transcript.data.text
                  response = await this.groq.chat(prompt, history)
               }
            }

            if (!response.status && this.cloudflare) {
               response = await this.cloudflare.chat(prompt, history, file.source)
            }

            if (!response.status && this.gemini) {
               if (prompt) response = await this.gemini.chat(prompt, history)
            }
         } else if (file && file.source) {
            if (/image\/(png|jpg|jpeg)/.test(file.mime) && this.cloudflare) {
               response = await this.cloudflare.chat(prompt, history, file.source)
               if (!response.status && this.gemini) {
                  response = await this.gemini.chat(prompt, history, file.source)
               }
            } else if (this.gemini) {
               response = await this.gemini.chat(prompt, history, file.source)
            }
         } else {
            if (this.groq) {
               response = await this.groq.chat(prompt, history)
            }

            if (!response.status && this.cloudflare) {
               response = await this.cloudflare.chat(prompt, history)
            }

            if (!response.status && this.gemini) {
               response = await this.gemini.chat(prompt, history)
            }
         }

         if (!response.status) return response

         const cleanHistoryToSave = response.data.history.filter(m => m.role !== 'system')
         this.saveHistory(id, cleanHistoryToSave)

         return this.logicParser(response.data.message, id)
      } catch (e) {
         Utils.printError(e)
         return {
            creator: global.creator,
            status: false,
            msg: e.message
         }
      }
   }
}