import * as cheerio from 'cheerio'
import fs from 'fs'
const data = JSON.parse(fs.readFileSync('./extractor/heroml-raw.json'))

async function getAudio(hero) {
   try {
      const html = await (await fetch(`https://mobile-legends.fandom.com/wiki/${hero}/Audio/id`)).text()
      const $ = cheerio.load(html)
      const data = []
      $('audio').each((i, e) => {
         if (new RegExp(hero, 'gis').test($(e).attr('src'))) data.push($(e).attr('src'))
      })
      return data
   } catch (e) {
      console.error(e)
      return []
   }
}

const dataWithAudio = []
for (const hero of data.filter(v => !v.audio)) {
   const result = await getAudio(hero.name)
   if (result.length) {
      console.log(`[FETCH AUDIO] Hero: ${hero.name} ~ Found: ${result.length}`)
      dataWithAudio.push({ ...hero, audio: result })
   }
}

fs.writeFileSync('./media/json/heroml.json', JSON.stringify(dataWithAudio))