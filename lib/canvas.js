import { createCanvas, loadImage, registerFont } from 'canvas'
import path from 'path'
import { Utils } from '@neoxr/wb'

// Register the font
registerFont(path.join(process.cwd(), 'media/font/bebasneue.ttf'), { family: 'Bebas Neue' })
registerFont(path.join(process.cwd(), 'media/font/truestory.ttf'), { family: 'True Story' })
registerFont(path.join(process.cwd(), 'media/font/ihatcs.ttf'), { family: 'IHatcs' })
registerFont(path.join(process.cwd(), 'media/font/nk57.otf'), { family: 'NK57' })


/**
 * Generate a welcome image with a 16:9 canvas, rounded profile picture, overlay, and customizable text.
 * @param {string} background - Path or URL to the background image.
 * @param {string|Buffer} profile - Path, URL, or Buffer of the profile image.
 * @param {string} title - Title text to display below the profile image.
 * @param {string} description - Description text displayed below the title.
 * @returns {Promise<Object>} - Returns an object containing the image buffer and metadata.
 */
export const greater = async (background = 'https://qu.ax/pvbVP.jpg', profile = 'https://qu.ax/uPqo.jpg', title = 'Welcome to Chatbot', description = 'Let\'t enjoy with us!') => {
   try {
      const canvasWidth = 1280 / 2 // Canvas width
      const canvasHeight = 720 / 2 // Canvas height
      const canvasRatio = canvasWidth / canvasHeight
      const profileSize = 120 // Diameter of the profile picture
      const borderSize = 6 // Border width for the profile picture
      const overlayMargin = 27 // Margin for the overlay from the canvas edge

      const canvas = createCanvas(canvasWidth, canvasHeight)
      const ctx = canvas.getContext('2d')

      // Load the background image
      let _fileBackground = Buffer.isBuffer(background) ? background : Utils.isUrl(background) ? await Utils.fetchAsBuffer(background) : background
      const backgroundImage = await loadImage(_fileBackground)
      const bgWidth = backgroundImage.width
      const bgHeight = backgroundImage.height
      const bgRatio = bgWidth / bgHeight

      // Calculate cropping dimensions for 16:9
      let cropWidth = bgWidth
      let cropHeight = bgHeight
      let offsetX = 0
      let offsetY = 0

      if (bgRatio > canvasRatio) {
         // Background is wider than 16:9, crop width
         cropWidth = bgHeight * canvasRatio
         offsetX = (bgWidth - cropWidth) / 2
      } else if (bgRatio < canvasRatio) {
         // Background is taller than 16:9, crop height
         cropHeight = bgWidth / canvasRatio
         offsetY = (bgHeight - cropHeight) / 2
      }

      // Draw the cropped background
      ctx.drawImage(
         backgroundImage,
         offsetX, offsetY, cropWidth, cropHeight, // Crop source
         0, 0, canvasWidth, canvasHeight          // Draw destination
      )

      // Draw the overlay with rounded corners
      const overlayWidth = canvasWidth - 2 * overlayMargin
      const overlayHeight = canvasHeight - 2 * overlayMargin
      const overlayX = overlayMargin
      const overlayY = overlayMargin

      const overlayRadius = 30
      ctx.fillStyle = 'rgba(150, 150, 150, 0.30)'
      ctx.beginPath()
      ctx.moveTo(overlayX + overlayRadius, overlayY)
      ctx.lineTo(overlayX + overlayWidth - overlayRadius, overlayY)
      ctx.quadraticCurveTo(overlayX + overlayWidth, overlayY, overlayX + overlayWidth, overlayY + overlayRadius)
      ctx.lineTo(overlayX + overlayWidth, overlayY + overlayHeight - overlayRadius)
      ctx.quadraticCurveTo(overlayX + overlayWidth, overlayY + overlayHeight, overlayX + overlayWidth - overlayRadius, overlayY + overlayHeight)
      ctx.lineTo(overlayX + overlayRadius, overlayY + overlayHeight)
      ctx.quadraticCurveTo(overlayX, overlayY + overlayHeight, overlayX, overlayY + overlayHeight - overlayRadius)
      ctx.lineTo(overlayX, overlayY + overlayRadius)
      ctx.quadraticCurveTo(overlayX, overlayY, overlayX + overlayRadius, overlayY)
      ctx.closePath()
      ctx.fill()

      // Load and draw the profile image with rounded corners and border
      let _fileProfile = Buffer.isBuffer(profile) ? profile : Utils.isUrl(profile) ? await Utils.fetchAsBuffer(profile) : profile
      const profileImage = await loadImage(_fileProfile)

      ctx.save()
      const profileX = (canvasWidth - profileSize) / 2
      const profileY = (canvasHeight - profileSize) / 2 - 60

      ctx.beginPath()
      ctx.arc(profileX + profileSize / 2, profileY + profileSize / 2, profileSize / 2 + borderSize, 0, Math.PI * 2)
      ctx.fillStyle = '#FFFFFF'
      ctx.fill()

      ctx.beginPath()
      ctx.arc(profileX + profileSize / 2, profileY + profileSize / 2, profileSize / 2, 0, Math.PI * 2)
      ctx.closePath()
      ctx.clip()
      ctx.drawImage(profileImage, profileX, profileY, profileSize, profileSize)
      ctx.restore()

      // Draw the title text
      const titleY = profileY + profileSize + 72
      const descriptionY = titleY + 67

      ctx.fillStyle = '#FFFFFF'
      ctx.textDrawingMode = "glyph"
      ctx.font = 'bold 40px "True Story"'
      ctx.textAlign = 'center'
      ctx.fillText(title, canvasWidth / 2, titleY)

      // Draw underline for the title
      const titleWidth = ctx.measureText(title).width
      const underlineY = titleY + 10

      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo((canvasWidth / 2) - (titleWidth / 2), underlineY)
      ctx.lineTo((canvasWidth / 2) + (titleWidth / 2), underlineY)
      ctx.stroke()

      // Draw the description text
      ctx.textDrawingMode = "glyph"
      ctx.font = '25px "Bebas Neue"'
      ctx.fillText(description, canvasWidth / 2, descriptionY)

      // Save the result
      const buffer = canvas.toBuffer('image/png')
      return buffer
   } catch (error) {
      console.error('Error processing image:', error)
      return null
   }
}

/**
* Generates a CAPTCHA image buffer using Canvas with randomly positioned and colored characters
* @returns {Buffer} - PNG image buffer of the CAPTCHA
*/
export const captcha = () => {
   const width = 450
   const height = 240
   const canvas = createCanvas(width, height)
   const ctx = canvas.getContext('2d')

   const text = (function generateCaptchaText(length = 6) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      let text = ''
      for (let i = 0; i < length; i++) {
         text += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return text
   })()

   // Background
   ctx.fillStyle = '#f0f0f0'
   ctx.fillRect(0, 0, width, height)

   // Noise lines
   for (let i = 0; i < 5; i++) {
      ctx.beginPath()
      ctx.moveTo(Math.random() * width, Math.random() * height)
      ctx.lineTo(Math.random() * width, Math.random() * height)
      ctx.strokeStyle = `rgba(0,0,0,${Math.random()})`
      ctx.stroke()
   }

   // Set text alignment
   ctx.textBaseline = 'middle'
   ctx.textAlign = 'center'

   const charSpacing = width / (text.length + 1)
   const centerY = height / 2

   for (let i = 0; i < text.length; i++) {
      const fontSize = 70 + Math.random() * 8
      ctx.font = `${fontSize}px IHatcs`
      ctx.fillStyle = `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`

      const x = charSpacing * (i + 1)
      const y = centerY + (Math.random() - 0.5) * 30

      ctx.save()
      ctx.translate(x, y)
      ctx.rotate((Math.random() - 0.5) * 0.4)
      ctx.fillText(text[i], 0, 0)
      ctx.restore()
   }

   return {
      text, image: canvas.toBuffer('image/png')
   }
}

/**
* Generate a receipt image with a background, item list, and total amount.
* 
* @param {Object} options - Options for receipt generation
* @param {string} options.store - Store name
* @param {string} options.invoice - Invoice ID
* @param {string} options.date - Date string (e.g., '04/05/2025')
* @param {string} options.status - Status of payment ('unpaid', 'paid', etc.)
* @param {string} options.qr - QR Image (optional)
* @param {Array<{ name: string, unit: number, price: number }>} options.items - Array of purchased items
* @param {number} options.total - Total amount of purchase
* 
* @returns {Promise<void>} - Outout the receipt as buffer
*/
export const receipt = async ({ store, invoice, date, status, qr, items, total }) => {
   const width = 600
   const height = (qr ? 900 : 450) + (80 * items.length) // auto-height
   const canvas = createCanvas(width, height)
   const ctx = canvas.getContext('2d')
   const background = await loadImage(path.join(process.cwd(), 'media/image/canvas.jpg'))
   ctx.drawImage(background, 0, 0, width, height)

   // Default font
   ctx.font = '28px NK57'
   ctx.fillStyle = 'black'

   // Header: Store name (bold)
   ctx.font = 'bold 32px NK57'
   ctx.fillText(store, 40, 70)

   // Invoice ID (right-aligned)
   ctx.font = '25px NK57'
   ctx.fillStyle = '#888'
   const invText = `#${invoice}`
   const invWidth = ctx.measureText(invText).width
   ctx.fillText(invText, width - invWidth - 40, 65)

   // Date & status
   const dateText = date + ' - '
   const statusText = status.toUpperCase()

   ctx.font = '20px NK57'
   ctx.fillStyle = '#999'

   // Measure date text width
   const dateWidth = ctx.measureText(dateText).width

   // Render date
   ctx.fillText(dateText, 40, 110)

   // Status color based on value
   let statusColor = '#999'
   if (statusText === 'UNPAID') statusColor = '#dc3545'
   else if (statusText === 'PAID') statusColor = '#28a745'

   // QR Code size: 80% of canvas width
   let y = 0
   if (qr) {
      const qrImage = await loadImage(qr || path.join(process.cwd(), 'media/image/qr.png'))
      const qrSize = width * 0.8
      const qrX = (width - qrSize) / 2
      const qrY = 170
      ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize)

      // Spacer after QR code
      y += qrY + qrSize + 30
   } else {
      y += 250
   }

   ctx.fillStyle = statusColor
   ctx.fillText(statusText, 40 + dateWidth, 110)

   // Spacer before table
   y += 30

   // Dotted line
   ctx.beginPath()
   for (let x = 40; x < width - 40; x += 15) {
      ctx.moveTo(x, y)
      ctx.lineTo(x + 7, y)
   }
   ctx.strokeStyle = '#aaa'
   ctx.stroke()

   y += 60

   // Table header
   ctx.fillStyle = '#888'
   ctx.fillText('PRODUCT', 40, y)
   // ctx.fillText('UNIT', 330, y)
   ctx.fillText('PRICE', width - 110, y)

   y += 40
   ctx.fillStyle = 'black'

   // Item rows
   for (const item of items) {
      ctx.font = '20px NK57'
      ctx.fillStyle = 'black'
      ctx.fillText(item.name, 40, y)

      ctx.font = '19px NK57'
      ctx.fillStyle = '#666'
      ctx.fillText(`${item.unit}`, 40, y + 30)

      const priceStr = item.price.toLocaleString()
      const priceW = ctx.measureText(priceStr).width
      ctx.fillStyle = 'black'
      ctx.fillText(priceStr, width - 40 - priceW, y)

      y += 70 // ini mengatur jarak antar blok item
   }

   // Total
   y += 10
   ctx.fillText(total.toLocaleString(), width - 40 - ctx.measureText(total.toLocaleString()).width, y)

   // Bottom dotted line
   y += 30
   ctx.beginPath()
   for (let x = 40; x < width - 40; x += 15) {
      ctx.moveTo(x, y)
      ctx.lineTo(x + 7, y)
   }
   ctx.stroke()

   const buffer = canvas.toBuffer('image/png')
   return { buffer }
}

/**
 * Add watermark PNG to a 1:1 image and save result
 * @param {string} inputPath - Path to the original image (1:1)
 * @param {string} watermarkPath - Path to the watermark PNG
 * @param {number} opacity - Opacity of watermark (0-1), default 0.3
 * @param {number} scale - Scale of watermark (0-1), default 0.3
 */
export const watermark = async (inputPath, watermarkPath, opacity = 0.5, scale = 0.2) => {
   const baseImage = await loadImage(inputPath)
   const watermark = await loadImage(watermarkPath)

   const canvas = createCanvas(baseImage.width, baseImage.height)
   const ctx = canvas.getContext('2d')

   // Draw base image
   ctx.drawImage(baseImage, 0, 0)

   // Set watermark opacity
   ctx.globalAlpha = opacity

   // Resize watermark
   const wmWidth = baseImage.width * scale
   const aspectRatio = watermark.height / watermark.width
   const wmHeight = wmWidth * aspectRatio

   // Position (bottom-right with margin)
   const margin = 20
   const x = baseImage.width - wmWidth - margin + 10
   const y = baseImage.height - wmHeight - margin + 20

   // Draw watermark
   ctx.drawImage(watermark, x, y, wmWidth, wmHeight)

   // Reset opacity
   ctx.globalAlpha = 1.0

   // Output to file
   const buffer = canvas.toBuffer('image/png')
   return { buffer }
}

/**
 * Generates an image with a single centered letter, a random background color,
 * and saves it as a PNG file.
 *
 * @param {string} letter - The letter to render in the center of the image
 * @param {number} size - Width and height of the image in pixels (default: 512)
 */
export const generatePicture = (letter, size = 512) => {
   const canvas = createCanvas(size, size)
   const ctx = canvas.getContext('2d')

   // Generate random background color
   const bgColor = (function getRandomColor() {
      const letters = '0123456789ABCDEF'
      let color = '#'
      for (let i = 0; i < 6; i++) {
         color += letters[Math.floor(Math.random() * 16)]
      }
      return color
   })()
   ctx.fillStyle = bgColor
   ctx.fillRect(0, 0, size, size)

   // Draw the letter in the center using the custom font
   ctx.fillStyle = 'white'
   ctx.font = `${size * 0.6}px Bebas Neue`
   ctx.textAlign = 'center'
   ctx.textBaseline = 'middle'
   ctx.fillText(letter.toUpperCase(), size / 2, size / 2)

   // Output to file
   const buffer = canvas.toBuffer('image/png')
   return { buffer }
}

/**
 * Draws a progress slider image based on the user's balance and available packages.
 *
 * The slider displays a series of milestones representing different premium packages.
 * The progress bar shows how close the user's balance is to reaching the next package.
 *
 * @param {number} balance - The user's current balance.
 * @param {array} packages - The package list.
 */
export const progressSlider = (balance = 0, packages = []) => {
   const width = 1280
   const height = 720
   const canvas = createCanvas(width, height)
   const ctx = canvas.getContext('2d')

   // Customize vertical position of the slider
   const topOffset = 360 // Change this to move slider up/down
   const barY = topOffset
   const barHeight = 10
   const radius = 36
   const margin = 160
   const gap = (width - 2 * margin) / (packages.length - 1)
   const labelOffsetY = 60

   const positions = packages.map((_, i) => margin + i * gap)

   // Find the current range the balance fits in
   let startIndex = 0
   for (let i = 0; i < packages.length - 1; i++) {
      if (balance >= packages[i].price && balance < packages[i + 1].price) {
         startIndex = i
         break
      } else if (balance >= packages[packages.length - 1].price) {
         startIndex = packages.length - 1
      }
   }

   // Calculate progress position between milestones
   let progressX = positions[0]
   if (startIndex === packages.length - 1) {
      progressX = positions[startIndex]
   } else {
      const startPkg = packages[startIndex]
      const endPkg = packages[startIndex + 1]
      const startX = positions[startIndex]
      const endX = positions[startIndex + 1]
      const percent = (balance - startPkg.price) / (endPkg.price - startPkg.price)
      progressX = startX + percent * (endX - startX)
   }

   // Background
   ctx.fillStyle = '#0D1224'
   ctx.fillRect(0, 0, width, height)

   // Base bar
   ctx.strokeStyle = '#2c3244'
   ctx.lineWidth = barHeight
   ctx.beginPath()
   ctx.moveTo(positions[0], barY)
   ctx.lineTo(positions[positions.length - 1], barY)
   ctx.stroke()

   // Active progress bar
   ctx.strokeStyle = '#ffffff'
   ctx.beginPath()
   ctx.moveTo(positions[0], barY)
   ctx.lineTo(progressX, barY)
   ctx.stroke()

   // Dots and labels
   packages.forEach((pkg, i) => {
      const x = positions[i]

      // White dot
      ctx.beginPath()
      ctx.arc(x, barY, radius / 2, 0, 2 * Math.PI)
      ctx.fillStyle = '#ffffff'
      ctx.fill()
      ctx.closePath()

      // Yellow label above dot
      ctx.fillStyle = '#FFD700'
      ctx.font = 'bold 32px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(pkg._id, x, barY - labelOffsetY)
   })

   // Output to file
   const buffer = canvas.toBuffer('image/png')
   return { buffer }
}