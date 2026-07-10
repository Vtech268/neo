import { imgkub } from '@neoxr/helper'

export const run = {
   usage: ['+task'],
   use: 'time | content | type',
   category: 'store',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      setting,
      schedule,
      Utils
   }) => {
      try {
         setting.schedules = setting.schedules || []

         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, '04:30 | time to wake up | pc'), m)

         let [time, content, type] = text.split`|`
         if (!time || !content) return client.reply(m.chat, Utils.example(isPrefix, command, '04:30 | time to wake up | pc'), m)

         const isType = type?.trim()?.toLowerCase() || 'pc'

         if (!['gc', 'pc'].includes(isType)) return client.reply(m.chat, Utils.texted('bold', `🚩 Invalid type, choose: 'gc' or 'pc'`), m)

         const MAX_DELAY = 24 * 24 * 60 * 60 * 1000

         const parsed = time.includes('/')
            ? (() => {
               const [timePart, datePart] = time.trim().split(' ')
               const [h, m] = timePart.split(':').map(Number)
               const [d, mo, y] = datePart.split('/').map(Number)
               return new Date(y, mo - 1, d, h, m, 0)
            })()
            : (() => {
               const [h, m] = time.trim().split(':').map(Number)
               const now = new Date()
               const future = new Date(now)
               future.setHours(h, m, 0, 0)
               if (future <= now) future.setDate(future.getDate() + 1)
               return future
            })()

         const now = new Date()
         const delay = parsed - now

         if (delay > MAX_DELAY) {
            return client.reply(m.chat, Utils.texted('bold', `🚩 Maximum task delay is 24 days. Please pick an earlier time.`), m)
         }

         if (delay < 0) {
            return client.reply(m.chat, Utils.texted('bold', `🚩 The time you set is already in the past.`), m)
         }

         const createSchedule = async (type = 'pc') => {
            let mediaUrl = null
            let q = m.quoted ? m.quoted : m
            let mime = (q.msg || q).mimetype || ''
            if (/video|image\/(jpe?g|png)/.test(mime)) {
               let buffer = await q.download()
               if (!buffer) return client.reply(m.chat, global.status.wrong, m)
               let upload = await imgkub(buffer)
               mediaUrl = upload.data.url
            }

            setting.schedules.push({
               jid: isType === 'pc' ? m.sender : isType === 'gc' ? m.chat : null,
               time: time.trim(),
               mediaUrl: mediaUrl,
               content: content.trim(),
               type: isType
            })

            await client.reply(m.chat, Utils.texted('bold', `🚩 Task added successfully.`), m)

            schedule.reloadDynamicTasks()
         }

         if (type === 'gc') {
            if (!m.isGroup) return client.reply(m.chat, Utils.texted('bold', `🚩 This type can only be used in groups.`), m)
            const exists = setting.schedules.some(v => v.time.trim() === time.trim() && v.type === 'gc')
            if (exists) return client.reply(m.chat, Utils.texted('bold', `🚩 A task for ${time.trim()} already exists.`), m)
            createSchedule(isType)
         } else {
            const exists = setting.schedules.some(v => v.time.trim() === time.trim() && v.type === 'pc')
            if (exists) return client.reply(m.chat, Utils.texted('bold', `🚩 A task for ${time.trim()} already exists.`), m)
            createSchedule(isType)
         }
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false
}