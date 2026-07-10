export const run = {
   usage: ['gempa'],
   category: 'utilities',
   async: async (m, {
      client,
      Utils
   }) => {
      try {
         client.sendReact(m.chat, '🕒', m.key)
         let json = await Api.neoxr('/gempa')
         if (!json.status) return client.reply(m.chat, Utils.jsonFormat(json), m)
         let caption = `乂  *G E M P A*\n\n`
         caption += `	◦  *Lintang* : ${json.data.lintang}\n`
         caption += `	◦  *Bujur* : ${json.data.bujur}\n`
         caption += `	◦  *Skala* : ${json.data.magnitudo}\n`
         caption += `	◦  *Kedalaman* : ${json.data.kedalaman}\n`
         caption += `	◦  *Waktu* : ${json.data.waktu}\n`
         caption += `	◦  *Pusat Gempa* : ${json.data.wilayah}\n`
         caption += `	◦  *Zona Gempa* : ${json.data.zona}\n`
         caption += `	◦  *Arahan* : ${json.data.arahan}\n`
         caption += `	◦  *Saran BMKG* : ${json.data.saran}\n\n`
         caption += global.footer
         client.sendFile(m.chat, json.data.map, 'map.jpg', caption, m)
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false
}