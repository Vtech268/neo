import { models } from '../../lib/system/models.js'
import init from '../../lib/system/init.js'

export const run = {
   usage: ['rpg'],
   use: 'options',
   category: 'rpg',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      users,
      Utils
   }) => {
      try {
         const [confirm] = args
         if (confirm === '-y') {
            if (users?.rpg) return m.reply('❌ Your data already exists!')
            let player = global.db.players.find(v => v.jid === m.sender)
            if (player) {
               init.execute(player, models.players)
            } else {
               global.db.players.push({
                  jid: m.sender,
                  name: m.pushName,
                  ...(init.getModel(models?.players || {}))
               })
            }

            users.rpg = true

            await m.reply('✅ Data created!')
         } else m.reply(explain(isPrefix, command))
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   group: true,
   game: true
}

const explain = (isPrefix, comamnd) => {
   return `乂  *R P G - G A M E S*

Permainan ini sama halnya dengan game RPG pada umunya yang terdapat di PS2 atau Nintendo bedanya ini versi chat bot WhatsApp. Terdapat beberapa aktivitas yang umum seperti :

- Koleksi item (Senjata & Resource)
- Memelihara hewan & Pertarungan hewan peliharaan
- Berserker (Bertarung dengan pemain lain dalam sebuah turnamen)
- Upgrade senjata, item dan hewan peliharaan
- Klaim harian, bulanan dan mingguan
- Sistem clan
- Adapun mengumpulkan item dengan sedikit tantangan dengan Adventure dan Dungeon

Karena permainan ini berbais chat berikut adalah penjelasan fungsi beberapa command/perintahnya berdasarkan kategori yang mungkin tidak dipahami :

▦ Mengumpulkan Resource

Resource bisa di dapatkan dengan perintah/command *${isPrefix}daily*, *${isPrefix}weekly*, *${isPrefix}monthly* dan *${isPrefix}mining* selain itu ada 2 perintah/command yang lain yaitu *${isPrefix}adventure* dan *${isPrefix}dungeon*, ke-2 perintah tersebut membutuhkan stamina dan health.

> Pertanyaan :

1. Apa fungsi resource? _Resource berfungsi untuk crafting/upgrade senjata_
2. Untuk apa senjata? _Senjata digunakan untuk mengikuti turnamen_
3. Bagaimana cara mendapatkan Stamina dan Health? _Stamina bisa ditingkatkan dengan perintah/command *${isPrefix}gym* dan Health dengan perintah/command *${isPrefix}heal* potion_
4. Bagaimana cara mendapatkan potion? _Dengan membelinya_

Untuk melihat item yang bisa dijual kirim *${isPrefix}collection* dan yang tidak bisa dijual selain trash (sampah) kirim *${isPrefix}inventory*

▦ Mendapatkan Uang

Karena ada beberapa item yang harus di beli dan uprade item pun membutuhkan uang jadi berikut ini cara untuk mendapatkannya :

- *${isPrefix}farming* ~ Bertani untuk mendapatkan sayuran dan buah, hasil bertani tersimpan di *${isPrefix}warehouse*
- *${isPrefix}fishing* ~ Memancing untuk mendapatkan ikan, hasil memancing tersimpan di *${isPrefix}pool*
- *${isPrefix}hunting* ~ Berburu untuk mendapatkan hewan buruan, hasil berburu terisimpan di *${isPrefix}cage*

Ke-3 aktivitas tersebut bisa menghasilkan uang dengan mudah dengan cara menjual hasilnya, tapi jika mendapatkan hasil yang ilegal seperti tanaman ilegal atau hewan yang di lindungi pemain akan mendapatkan denda.

▦ Hewan Peliharaan

Seperti halnya di dunia nyata sistem ini memungkinkan pemain bisa mempunyai hewan peliharaan, namun disini hewan peliharan (Pet) bisa digunakan untuk bertarung, dan ini adalah beberapa perintah untuk sistem ini :

- *${isPrefix}petshop* ~ Melihat daftar hewan peliharaan yang tersedia
- *${isPrefix}buypet* ~ Membeli hewan peliharaan
- *${isPrefix}foodshop* ~ Melihat daftar makanan untuk hewan peliharaan
- *${isPrefix}buyfood* ~ Membeli makan untuk hewan peliharaan
- *${isPrefix}feed* ~ Memberi makan hewan peliharaan
- *${isPrefix}petbattle* ~ Mengikuti pertarungan hewan peliharaan

▦ Persenjataan

Senjata adalah item yang tidak bisa di beli tapi bisa didapatkan dengan cara Crafting (Di rakit) dari resource yang di miliki pemain, dan setiap senjata membutuhkan resource yang berbeda.

Untuk crafting kirim *${isPrefix}craft*, menambahkan durability gunakan *${isPrefix}training* dan *${isPrefix}upgrade* untuk upgrade senjata.

▦ Crate

Crate adalah drop box yang berisikan item & resource, untuk melihat daftar crate kirim perintah/command *${isPrefix}crate* sedangkan untuk membukanya gunakan perintah/command *${isPrefix}opencrate*

▦ Clan

Clan ini hanya sebagai tanda pertemanan antar permain. Untuk bergabung atau membuat clan di wajibkan berada di level tertentu.

▦ Sistem Leveling

Leveling pada permainan ini di tentukan dari banyaknya EXP semakin banyak semakin tinggi level pemain, EXP bisa didapatkan dari Adventure, Dungeon, dll.`
}