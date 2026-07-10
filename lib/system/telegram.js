import axios from 'axios'
import FormData from 'form-data'
import fs from 'fs'
import { Readable } from 'stream'
import mime from 'mime-types'

export default class TelegramFileUploader {
   constructor(botToken) {
      this.botToken = botToken
      this.apiUrl = `https://api.telegram.org/bot${botToken}/`
      this.fileApiUrl = `https://api.telegram.org/file/bot${botToken}/`
   }

   humanSize(bytes, decimals = 2) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i]
   }

   bufferToStream(buffer) {
      const stream = new Readable()
      stream.push(buffer)
      stream.push(null)
      return stream
   }

   async uploadFile(chatId, filePath, filename) {
      const url = `${this.apiUrl}sendDocument`
      const form = new FormData()
      form.append('chat_id', chatId)
      form.append('document', this.bufferToStream(fs.readFileSync(filePath)), filename)

      try {
         const response = await axios.post(url, form, {
            headers: {
               ...form.getHeaders()
            }
         })

         const fileId = response.data.result.audio ? response.data.result.audio.file_id : response.data.result.sticker ? response.data.result.sticker.file_id : response.data.result.video ? response.data.result.video.file_id : response.data.result.document.file_id
         if (!fileId) return {
            creator: global.creator,
            status: false,
            msg: `Couldn't find file ID!`
         }

         const fileResponse = await this.getFileUrl(fileId)
         const filePathOnServer = fileResponse.data.result.file_path
         const fileDownloadUrl = this.fileApiUrl + filePathOnServer

         // Get file size
         const stats = fs.statSync(filePath)
         const fileSizeInBytes = stats.size

         // Get MIME type
         const mimeType = mime.lookup(filePath)
         const fileExtension = mime.extension(mimeType)

         const result = {
            filename: filePathOnServer.split`/`[1],
            bytes: fileSizeInBytes,
            size: this.humanSize(fileSizeInBytes),
            mime: mimeType,
            extension: fileExtension,
            path: filePathOnServer,
            url: fileDownloadUrl
         }

         return {
            creator: global.creator,
            status: true,
            data: result
         }
      } catch (e) {
         return {
            creator: global.creator,
            status: false,
            msg: e.message
         }
      }
   }

   async getFileUrl(fileId) {
      const url = `${this.apiUrl}getFile?file_id=${fileId}`
      return await axios.get(url)
   }
}