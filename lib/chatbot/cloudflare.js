import { Utils } from '@neoxr/wb'
import axios from 'axios'
import pkg from 'file-type'
const { fromBuffer } = pkg

export default class CloudflareHandler {
   constructor({ apikey, instruction, model } = {}) {
      this.accountId = apikey?.account
      this.token = apikey?.token

      this.instruction = instruction

      this.models = {
         text: model?.text,
         audio: model?.audio,
         image: model?.image,
         genimg: model?.genimg
      }

      this.client = axios.create({
         baseURL: `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/ai/run/`,
         headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
         }
      })
   }

   toUint8Array = (buffer) => {
      return Array.from(new Uint8Array(buffer))
   }

   runGenImg = async (prompt) => {
      try {
         if (['@cf/leonardo/phoenix-1.0', '@cf/lykon/dreamshaper-8-lcm', '@cf/stabilityai/stable-diffusion-xl-base-1.0', '@cf/bytedance/stable-diffusion-xl-lightning'].includes(this.models.genimg)) {
            const response = await this.client.post(this.models.genimg, { prompt }, { responseType: 'arraybuffer' })
            return { status: true, buffer: Buffer.from(response.data) }
         } else {
            const response = await this.client.post(this.models.genimg, { prompt })
            return { status: true, buffer: Buffer.from(response.data.result.image, 'base64') }
         }
      } catch (e) {
         return { status: false, msg: e.response?.data?.errors?.[0]?.message || 'Neuron limit reached or prompt is not allowed.' }
      }
   }

   runAudio = async (buffer) => {
      try {
         const response = await this.client.post(this.models.audio, {
            audio: this.toUint8Array(buffer)
         })
         return { status: true, text: response.data.result.text }
      } catch (e) {
         return { status: false, msg: e.response?.data?.errors?.[0]?.message || e.message }
      }
   }

   runVision = async (prompt, buffer) => {
      try {
         const payload = {
            prompt: prompt || 'Describe this image',
            image: this.toUint8Array(buffer)
         }
         const response = await this.client.post(this.models.image, payload)
         return { status: true, text: response.data.result.description }
      } catch (e) {
         return { status: false, msg: e.response?.data?.errors?.[0]?.message || e.message }
      }
   }

   runText = async (history) => {
      try {
         const response = await this.client.post(this.models.text, { messages: history })
         return { status: true, text: response?.data?.result?.choices[0]?.message?.content || response.data.result.response?.replace(/<think>[\s\S]*?<\/think>\s*/g, '') }
      } catch (e) {
         return { status: false, msg: e.response?.data?.errors?.[0]?.message || e.message }
      }
   }

   chat = async (prompt, history = [], fileSource = null) => {
      try {
         if (history.length === 0 || history[0].role !== 'system') {
            history.unshift({ role: 'system', content: this.instruction })
         }

         let reply = ''
         let logContent = prompt

         if (fileSource) {
            let buffer
            if (Buffer.isBuffer(fileSource)) {
               buffer = fileSource
            } else if (typeof fileSource === 'string' && Utils.isUrl(fileSource)) {
               buffer = await Utils.fetchAsBuffer(fileSource)
            }

            if (!buffer) throw new Error('Invalid file source or buffer')

            const type = await fromBuffer(buffer)
            const mime = type?.mime || ''

            if (mime.startsWith('audio')) {
               const trans = await this.runAudio(buffer)
               if (!trans.status) throw new Error(`Whisper Error: ${trans.msg}`)
               prompt = prompt ? `${prompt}\n\n[Transcript]: ${trans.text}` : trans.text
               logContent = `[Audio Transcript] ${prompt}`
            } else if (mime.startsWith('image')) {
               const vision = await this.runVision(prompt, buffer)
               if (!vision.status) throw new Error(`Vision Error: ${vision.msg}`)
               reply = vision.text
               logContent = `[Image Sent] ${prompt || 'Describe this image'}`
            }
         }

         if (!reply) {
            history.push({
               role: 'user',
               content: prompt
            })

            const textGen = await this.runText(history)
            if (!textGen.status) throw new Error(`Error: ${textGen.msg}`)
            reply = textGen.text
         } else {
            history.push({
               role: 'user',
               content: logContent
            })
         }

         history.push({
            role: 'assistant',
            content: reply
         })

         return {
            status: true,
            data: {
               platform: 'cloudflare',
               prompt,
               message: reply.trim(),
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
