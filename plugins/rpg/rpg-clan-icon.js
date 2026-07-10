export const run = {
   usage: ['seticon'],
   use: 'reply foto',
   category: 'rpg',
   async: async (m, {
      client,
      Utils
   }) => {
      try {
         global.db.clans = global.db?.clans || []
         const clan = global.db.clans.find(v => v.leader === m.sender)
         if (!clan) return m.reply(`🚩 Kamu bukan ketua clan.`)
         const q = m.quoted ? m.quoted : m
         const mime = (q.msg || q).mimetype || ''
         if (!/image/.test(mime)) return client.reply(m.chat, Utils.texted('bold', `🚩 Image not found.`), m)
         client.sendReact(m.chat, '🕒', m.key)
         const buffer = await cropToSquareBuffer(await q.download())
         if (!buffer) throw new Error(global.status.wrong)
         clan.icon = Buffer.from(buffer).toString('base64')
         m.reply(`✅ Icon clan berhasil di set.`)
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true
}

/**
 * Crops an image buffer to a 1:1 (square) aspect ratio.
 * @param {Buffer} inputBuffer - The input image buffer.
 * @returns {Promise<Buffer>} - The cropped image buffer.
 */
const cropToSquareBuffer = async (inputBuffer) => {
   try {
      const Jimp = (await import('jimp')).default
      const image = await Jimp.read(inputBuffer)
      const { width, height } = image.bitmap

      const size = Math.min(width, height)
      const x = Math.floor((width - size) / 2)
      const y = Math.floor((height - size) / 2)

      image.crop(x, y, size, size)

      const outputBuffer = await image.getBufferAsync(Jimp.MIME_JPEG)
      return outputBuffer
   } catch (error) {
      console.error('Error cropping image:', error.message)
      throw error
   }
}
