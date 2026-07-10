import * as nsfw from 'nsfwjs'
import { loadImage, createCanvas } from 'canvas'
import sharp from 'sharp'
import crypto from 'crypto'
import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs'
import os from 'os'
import path from 'path'

let modelPromise
async function getModel() {
   if (!modelPromise) modelPromise = nsfw.load('InceptionV3') // "MobileNetV2" | "MobileNetV2Mid" | "InceptionV3"
   return modelPromise
}

const queue = []
let running = 0
const MAX_CONCURRENCY = 2

function runQueue() {
   if (running >= MAX_CONCURRENCY) return
   const job = queue.shift()
   if (!job) return

   running++
   job()
      .catch(() => { })
      .finally(() => {
         running--
         runQueue()
      })
}

function enqueue(fn) {
   return new Promise((resolve, reject) => {
      queue.push(async () => {
         try {
            resolve(await fn())
         } catch (e) {
            reject(e)
         }
      })
      process.nextTick(runQueue)
   })
}

const cache = new Map()
const CACHE_LIMIT = 500

function getCache(hash) {
   return cache.get(hash)
}
function setCache(hash, data) {
   if (cache.size >= CACHE_LIMIT) {
      cache.delete(cache.keys().next().value)
   }
   cache.set(hash, data)
}

async function scanImage(buffer) {
   const hash = crypto.createHash('sha256').update(buffer).digest('hex')
   const cached = getCache(hash)
   if (cached) return { ...cached, cached: true }

   const model = await getModel()
   const resized = await sharp(buffer)
      .resize(512, 512, { fit: 'inside' })
      .toBuffer()

   const img = await loadImage(resized)
   const canvas = createCanvas(img.width, img.height)
   const ctx = canvas.getContext('2d')
   ctx.drawImage(img, 0, 0)

   const predictions = await model.classify(canvas)
   const pick = (n) =>
      predictions.find(p => p.className === n)?.probability || 0

   const score = pick('Porn') + pick('Sexy') + pick('Hentai')

   const result = {
      isNSFW: score >= 0.7,
      score: Math.min(1, score),
      percent: Math.round(score * 100),
      detail: {
         porn: Math.round(pick('Porn') * 100),
         sexy: Math.round(pick('Sexy') * 100),
         hentai: Math.round(pick('Hentai') * 100)
      }
   }

   setCache(hash, result)
   return result
}

async function scanVideo(buffer, frames = 5) {
   const tmp = os.tmpdir()
   const vid = path.join(tmp, `v-${Date.now()}.mp4`)
   const dir = path.join(tmp, `f-${Date.now()}`)
   fs.mkdirSync(dir)

   fs.writeFileSync(vid, buffer)

   await new Promise((res, rej) => {
      ffmpeg(vid)
         .on('end', res)
         .on('error', rej)
         .screenshots({
            count: frames,
            folder: dir,
            size: '512x?'
         })
   })

   let max = 0
   for (const f of fs.readdirSync(dir)) {
      const frame = fs.readFileSync(path.join(dir, f))
      const r = await scanImage(frame)
      max = Math.max(max, r.score)
      if (max >= 0.7) break
   }

   fs.rmSync(vid, { force: true })
   fs.rmSync(dir, { recursive: true, force: true })

   return {
      isNSFW: max >= 0.7,
      score: max,
      percent: Math.round(max * 100)
   }
}

export function detectNSFW(buffer, mime) {
   return enqueue(async () => {
      if (mime?.startsWith('video')) {
         return scanVideo(buffer)
      }
      return scanImage(buffer)
   })
}