import { Utils } from '@neoxr/wb'

/**
 * A frozen object representing fish prices and fish inventory.
 * 
 * Contains:
 * - `price`: List of fishes with randomized price values.
 * - `item`: List of fishes with initial inventory count set to 0.
 * 
 * Used for game features related to fishing or trading marine animals.
 */
export const fishs = Object.freeze({
   /**
    * Array of fish price entries.
    * Each object contains:
    * - emoji: Visual representation.
    * - name: Fish name in Bahasa Indonesia.
    * - price: Randomized integer value (buy/sell cost).
    */
   price: [
      { emoji: '🦐', name: 'udang', price: Utils.randomInt(1, 10) },
      { emoji: '🦀', name: 'kepiting', price: Utils.randomInt(1, 20) },
      { emoji: '🦈', name: 'hiu', price: Utils.randomInt(5, 50) },
      { emoji: '🐬', name: 'lumba lumba', price: Utils.randomInt(4, 45) },
      { emoji: '🐡', name: 'ikan buntal', price: Utils.randomInt(1, 15) },
      { emoji: '🐙', name: 'gurita', price: Utils.randomInt(2, 20) },
      { emoji: '🐟', name: 'gurame', price: Utils.randomInt(1, 10) },
      { emoji: '🐠', name: 'gabus', price: Utils.randomInt(1, 10) },
      { emoji: '🦑', name: 'cumi cumi', price: Utils.randomInt(1, 10) }
   ],

   /**
    * Array of fish inventory items.
    * Each object contains:
    * - emoji: Visual representation.
    * - name: Fish name in Bahasa Indonesia.
    * - count: Amount owned, initialized to 0.
    */
   item: [
      { emoji: '🦐', name: 'udang', count: 0 },
      { emoji: '🦀', name: 'kepiting', count: 0 },
      { emoji: '🦈', name: 'hiu', count: 0 },
      { emoji: '🐬', name: 'lumba lumba', count: 0 },
      { emoji: '🐡', name: 'ikan buntal', count: 0 },
      { emoji: '🐙', name: 'gurita', count: 0 },
      { emoji: '🐟', name: 'gurame', count: 0 },
      { emoji: '🐠', name: 'gabus', count: 0 },
      { emoji: '🦑', name: 'cumi cumi', count: 0 }
   ]
})

/**
 * A frozen object representing vegetable and fruit prices and inventory.
 * 
 * Contains:
 * - `price`: List of vegeta (fruits and vegetables) with randomized price values.
 * - `item`: List of vegeta items with initial inventory count set to 0.
 * 
 * Used for game farming or shop trading features.
 */
export const vegetas = Object.freeze({
   /**
    * Array of vegeta price entries.
    * Each object contains:
    * - emoji: Visual representation.
    * - name: Vegeta name in Bahasa Indonesia.
    * - price: Randomized integer value (buy/sell cost).
    */
   price: [
      { emoji: '🍇', name: 'anggur', price: Utils.randomInt(1, 30) },
      { emoji: '🍉', name: 'semangka', price: Utils.randomInt(1, 20) },
      { emoji: '🍊', name: 'jeruk', price: Utils.randomInt(1, 7) },
      { emoji: '🍒', name: 'ceri', price: Utils.randomInt(1, 15) },
      { emoji: '🌽', name: 'jagung', price: Utils.randomInt(1, 7) },
      { emoji: '🥕', name: 'wortel', price: Utils.randomInt(1, 20) },
      { emoji: '🍆', name: 'terong', price: Utils.randomInt(1, 5) },
      { emoji: '🍅', name: 'tomat', price: Utils.randomInt(1, 10) },
      { emoji: '🥒', name: 'ketimun', price: Utils.randomInt(1, 10) },
      { emoji: '🍎', name: 'apel', price: Utils.randomInt(1, 20) },
      { emoji: '🥭', name: 'mangga', price: Utils.randomInt(1, 30) },
      { emoji: '🍓', name: 'stoberi', price: Utils.randomInt(1, 30) },
      { emoji: '🥑', name: 'alpukat', price: Utils.randomInt(1, 15) },
      { emoji: '🪴', name: 'ganja', price: Utils.randomInt(1, 70) }
   ],

   /**
    * Array of vegeta inventory items.
    * Each object contains:
    * - emoji: Visual representation.
    * - name: Vegeta name in Bahasa Indonesia.
    * - count: Amount owned, initialized to 0.
    */
   item: [
      { emoji: '🍇', name: 'anggur', count: 0 },
      { emoji: '🍉', name: 'semangka', count: 0 },
      { emoji: '🍊', name: 'jeruk', count: 0 },
      { emoji: '🍒', name: 'ceri', count: 0 },
      { emoji: '🌽', name: 'jagung', count: 0 },
      { emoji: '🥕', name: 'wortel', count: 0 },
      { emoji: '🍆', name: 'terong', count: 0 },
      { emoji: '🍅', name: 'tomat', count: 0 },
      { emoji: '🥒', name: 'ketimun', count: 0 },
      { emoji: '🍎', name: 'apel', count: 0 },
      { emoji: '🥭', name: 'mangga', count: 0 },
      { emoji: '🍓', name: 'stoberi', count: 0 },
      { emoji: '🥑', name: 'alpukat', count: 0 },
      { emoji: '🪴', name: 'ganja', count: 0 }
   ]
})

export const animals = Object.freeze({
   /**
    * Array of animal price entries.
    * Each object contains:
    * - emoji: Visual representation.
    * - name: Animal name in Bahasa Indonesia.
    * - price: Randomized integer value (buy/sell cost).
    */
   price: [
      { emoji: '🐖', name: 'babi', price: Utils.randomInt(100, 200) },
      { emoji: '🐗', name: 'babi hutan', price: Utils.randomInt(300, 500) },
      { emoji: '🐏', name: 'kambing gunung', price: Utils.randomInt(500, 700) },
      { emoji: '🐑', name: 'domba', price: Utils.randomInt(200, 300) },
      { emoji: '🐄', name: 'sapi', price: Utils.randomInt(300, 500) },
      { emoji: '🐂', name: 'kerbau', price: Utils.randomInt(300, 500) },
      { emoji: '🐐', name: 'kambing', price: Utils.randomInt(100, 300) },
      { emoji: '🐘', name: 'gajah', price: Utils.randomInt(500, 2000) },
      { emoji: '🐪', name: 'unta', price: Utils.randomInt(400, 1000) }
   ],

   /**
    * Array of animal inventory items.
    * Each object contains:
    * - emoji: Visual representation.
    * - name: Animal name in Bahasa Indonesia.
    * - count: Amount owned, initialized to 0.
    */
   item: [
      { emoji: '🐖', name: 'babi', count: 0 },
      { emoji: '🐗', name: 'babi hutan', count: 0 },
      { emoji: '🐏', name: 'kambing gunung', count: 0 },
      { emoji: '🐑', name: 'domba', count: 0 },
      { emoji: '🐄', name: 'sapi', count: 0 },
      { emoji: '🐂', name: 'kerbau', count: 0 },
      { emoji: '🐐', name: 'kambing', count: 0 },
      { emoji: '🐘', name: 'gajah', count: 0 },
      { emoji: '🐪', name: 'unta', count: 0 }
   ]
})

/**
 * Generates random resource rewards for a user based on their pet levels (dog and fox).
 *
 * @param {Object} users - The user object, may contain pet levels such as `dog` and `fox`.
 * @returns {Object} - An object containing randomized reward values for various resources.
 *
 * Notes:
 * - `exp`, `trash`, `potion`, `rock`, `wood`, `string`, `thread` are basic randomized quantities.
 * - `common`, `uncommon`, `mythic`, `legendary`, `diamond` drops are influenced by user's `dog` or `fox` level.
 */
export const resources = (users = {}) => {
   const rewards = {
      reward: {
         // Basic resources (random integers in range)
         exp: Utils.randomInt(10, 300),
         trash: Utils.randomInt(10, 500),
         potion: Utils.randomInt(1, 5),
         rock: Utils.randomInt(1, 5),
         wood: Utils.randomInt(1, 5),
         string: Utils.randomInt(1, 5),
         thread: Utils.randomInt(1, 5),

         // Extra resources affected by pet levels
         common: 2 * ((users.dog && (users.dog > 2 ? 2 : users.dog) * 1.2) || 1),

         // Chance-based items (arrays used to simulate randomness)
         uncommon: [0, 0, 0, 1, 0].concat(
            new Array(5 - (
               (users.dog > 2 && users.dog < 6 && users.dog) || (users.dog > 5 && 5) || 2
            )).fill(0)
         ),

         mythic: [0, 0, 0, 0, 0, 1, 0, 0, 0].concat(
            new Array(8 - (
               (users.dog > 5 && users.dog < 8 && users.dog) || (users.dog > 7 && 8) || 3
            )).fill(0)
         ),

         legendary: [0, 0, 0, 0, 0, 0, 0, 1, 0, 0].concat(
            new Array(10 - (
               (users.dog > 8 && users.dog) || 4
            )).fill(0)
         ),

         // Metal and gem resource chances
         iron: [0, 2, 0, 1, 0, 0],
         gold: [0, 0, 2, 0, 0, 1, 0],
         diamond: [0, 0, 0, 0, 0, 0, 1, 0].concat(
            new Array(5 - (
               (users.fox < 6 && users.fox) || (users.fox > 5 && 5) || 0
            )).fill(0)
         )
      }
   }
   return rewards
}

/**
 * Function to get the stamina cost for crafting a specific item.
 * 
 * This function returns the amount of stamina required to craft an item based on its name.
 * If the item is not listed, it will return 0 by default.
 * 
 * @param {string} item - The name of the item to craft (e.g., 'armor', 'pickaxe', 'sword').
 * @returns {number} - The stamina cost associated with crafting the given item. Returns 0 if the item is not recognized.
 */
export const getStaminaCost = item => {
   const staminaCost = {
      armor: Math.floor(50 * 0.6),        // 30
      pickaxe: Math.floor(25 * 0.6),      // 15
      sword: Math.floor(40 * 0.6),        // 24
      fishingrod: Math.floor(20 * 0.6),   // 12
      knife: Math.floor(15 * 0.6),        // 9
      bow: Math.floor(35 * 0.6),          // 21
      saw: Math.floor(30 * 0.6),          // 18
      boomerang: Math.floor(20 * 0.6)     // 12
   }
   return staminaCost[item.toLowerCase()] || 0
}

/**
 * Returns the player's level name based on their experience points.
 * @param {number} exp - The experience points of the player.
 * @returns {string} - The name of the level corresponding to the given experience.
 */
export const playerLvl = exp => {
   const levels = [
      [524288000, 'Conqueror'], [262144000, 'Champion'], [131072000, 'Ultimate'],
      [65536000, 'Supreme'], [32768000, 'Transcendent'], [16384000, 'Godlike'],
      [8192000, 'Immortal'], [4096000, 'Eternal'], [2048000, 'Divine'],
      [1024000, 'Mythic'], [512000, 'Legendary'], [256000, 'Epic'],
      [128000, 'Heroic'], [64000, 'Grandmaster'], [32000, 'Master'],
      [16000, 'Expert'], [8000, 'Adept'], [4000, 'Journeyman'],
      [2000, 'Apprentice'], [1000, 'Novice']
   ]
   for (let [e, name] of levels) if (exp >= e) return name
   return 'Novice'
}

/**
 * Item level names for each type of equipment.
 * Indexed by level from 1 to 12.
 */
export const itemLvl = {
   armor: [
      '-',
      'Leather Hide',
      'Bandit Garb',
      'Novice Explorer',
      'Apprentice Scout',
      'Wayfarer Gear',
      'Plate Armor',
      'Knight Plate',
      'Paladin Garb',
      'Crusader Armor',
      'Champion Gear',
      'Dragonscale Armor',
      'Guardian Scales'
   ],
   sword: [
      '-',
      'Goblin Slayer',
      'Rusty Blade',
      'Edge of the Woods',
      'Apprentice Edge',
      'Soulreaver',
      'Oathbreaker',
      'Gáe Bolg',
      'Arondight',
      'Dawnbreaker',
      'Duskbringer',
      'Infinity Edge',
      'God Killer'
   ],
   pickaxe: [
      '-',
      'Apprentice Miner Pickaxe',
      'Stone Starter',
      'Rookie Digger',
      'Pickaxe 1.0',
      'Stone Chipper',
      'Iron Clad',
      'Flint Finder',
      'Terrain Tamer',
      'Iron Edge',
      'Prospectors Pick',
      'Hearthstone Harvester',
      'Deep Core Digger'
   ],
   fishingrod: [
      '-',
      'Twig Twister',
      'Bobber Buddy',
      'Minnow Master',
      'Perch Perfect',
      'Bass Beginner',
      'Trout Tracker',
      'Sunfish Snapper',
      'Crappie Catcher',
      'Pike Pro',
      'Summer Slammer',
      'Ocean Oracle',
      'Legendary Lure'
   ],
   knife: [
      '-',
      'Shadow Fang',
      'Night Stalker',
      'Silent Whisper',
      'Phantom Edge',
      'Specter Blade',
      'Ghost Strike',
      'Dark Reaper',
      'Eclipse Slash',
      'Viper Fang',
      'Lunar Cut',
      'Nebula Edge',
      'Astral Blade'
   ],
   bow: [
      '-',
      'Whispering Bow',
      'Shadow Bow',
      'Night Hunter',
      'Storm Bow',
      'Phoenix Feather',
      'Dragon\'s Breath',
      'Moonlit Bow',
      'Starfire Bow',
      'Twilight Striker',
      'Celestial Bow',
      'Eternal Bow'
   ],
   saw: [
      '-',
      'Whisper Blade',
      'Shadow Edge',
      'Silent Cutter',
      'Phantom Tooth',
      'Specter Fang',
      'Ghost Slicer',
      'Dark Reaver',
      'Eclipse Ripper',
      'Viper Claw',
      'Lunar Scythe',
      'Nebula Shredder',
      'Astral Reaver'
   ],
   boomerang: [
      '-',
      'Whispering Wing',
      'Shadow Spinner',
      'Silent Arc',
      'Phantom Loop',
      'Specter Curve',
      'Ghost Circle',
      'Dark Whirl',
      'Eclipse Ring',
      'Viper Swirl',
      'Lunar Disk',
      'Nebula Vortex',
      'Astral Spin'
   ]
}

/**
 * Material requirements to train or craft each item type.
 * The values represent the quantity needed per material.
 */
export const material = {
   pickaxe: Object.freeze({
      rock: 7,
      wood: 20,
      iron: 7,
      string: 20
   }),
   sword: Object.freeze({
      wood: 10,
      iron: 10
   }),
   fishingrod: Object.freeze({
      wood: 10,
      iron: 3,
      string: 20
   }),
   armor: Object.freeze({
      emerald: 10,
      iron: 3,
      diamond: 20
   }),
   knife: Object.freeze({
      wood: 7,
      iron: 7
   }),
   bow: Object.freeze({
      wood: 25,
      iron: 15,
      string: 10,
      thread: 5
   }),
   boomerang: Object.freeze({
      wood: 45
   }),
   saw: Object.freeze({
      wood: 25,
      iron: 20,
      string: 5
   })
}

/**
 * Returns an emoji based on the given string keyword.
 *
 * @param {string} str - The keyword to match against the emoji list.
 * @returns {string} The corresponding emoji, or an empty string if not found.
 */
export const emoticon = str => {
   str = str.toLowerCase()
   const emoji = {
      health: '❤️',
      stamina: '🔋',
      exp: '✨',
      money: '💰',
      bank: '🏦',
      potion: '🥤',
      diamond: '💎',
      common: '📦',
      uncommon: '🛍️',
      mythic: '🎁',
      legendary: '🗃️',
      superior: '💼',
      pet: '🔖',
      trash: '🗑',
      armor: '🛡️',
      sword: '⚔️',
      pickaxe: '⛏️',
      fishingrod: '🎣',
      knife: '🔪',
      bow: '🏹',
      boomerang: '🪃',
      saw: '🪚',
      wood: '🪵',
      rock: '🪨',
      string: '🕸️',
      thread: '🧶',
      petFood: '🍖',
      iron: '⛓️',
      gold: '🪙',
      emerald: '❇️',
      upgrader: '🧰',
      cat: '🐱',
      dog: '🐶',
      rabbit: '🐰',
      pig: '🐷',
      snake: '🐍',
      dragon: '🐲',
      rat: '🐀',
      bone: '🦴',
      carrot: '🥕',
      fish: '🐟',
      fire: '🔥',
      lettuce: '🥬'
   }
   const results = Object.keys(emoji).map(v => [v, new RegExp(v, 'gi')]).filter(v => v[1].test(str))
   if (!results.length) return ''
   return emoji[results[0][0]]
}

/**
 * Returns a detailed explanation text including weapon emojis and example usage.
 *
 * @param {string} prefix - The command prefix.
 * @param {string} command - The command name.
 * @param {string} instruction - Instructional text to be displayed.
 * @returns {string} The formatted explanation text.
 */
export const explain = (prefix, command, instruction) => {
   let text = `${instruction} :\n\n`
   text += `     ◦  ${emoticon('armor')}  Armor\n`
   text += `     ◦  ${emoticon('pickaxe')}  Pickaxe\n`
   text += `     ◦  ${emoticon('sword')}  Sword\n`
   text += `     ◦  ${emoticon('fishingrod')}  Fishingrod\n`
   text += `     ◦  ${emoticon('knife')}  Knife\n`
   text += `     ◦  ${emoticon('bow')}  Bow\n`
   text += `     ◦  ${emoticon('saw')}  Saw\n`
   text += `     ◦  ${emoticon('boomerang')}  Boomerang\n\n`
   text += '> ' + Utils.example(prefix, command, 'pickaxe')
   return text
}

/**
 * Formatter for USD currency.
 * Formats numbers to US Dollar representation.
 */
export const USD = new Intl.NumberFormat('en-US', {
   style: 'currency',
   currency: 'USD',
   minimumFractionDigits: 0,
   maximumFractionDigits: 0
})

/**
 * Calculates the cost of upgrading an item to the next level.
 *
 * @param {string} item - The name of the item to upgrade.
 * @param {number} level - The current level of the item.
 * @returns {number} The total upgrade cost in currency.
 */
export const getUpgradeCost = (item, level) => {
   const lvl = (parseInt(level) + 1) * 500
   const items = {
      pickaxe: 150 * lvl,
      armor: 530 * lvl,
      sword: 350 * lvl,
      fishingrod: 80 * lvl,
      knife: 178 * lvl,
      bow: 276 * lvl,
      boomerang: 480 * lvl,
      saw: 638 * lvl
   }
   return parseInt(items[item])
}

/**
 * Calculates the cost of training an item based on its material requirements and level.
 *
 * @param {string} itemName - The name of the item to be trained.
 * @param {number} [itemLevel=1] - The current level of the item.
 * @returns {{money: number, exp: number, durability: number} | null} Training cost details or null if item not found.
 */
export const getTrainingCost = (itemName, itemLevel = 1) => {
   const mats = material[itemName]
   if (!mats) return null

   let totalUnits = 0
   for (const val of Object.values(mats)) {
      totalUnits += val
   }

   const MATERIAL_VALUE = 1750
   const EXP_PER_UNIT = 157
   const MAX_DURABILITY = 100

   const level = Math.max(1, Math.min(itemLevel, 12))
   const levelMultiplier = 1 + ((level - 1) / 11) * 2

   const money = Math.floor(totalUnits * MATERIAL_VALUE * levelMultiplier)
   const exp = Math.floor(totalUnits * EXP_PER_UNIT * levelMultiplier)
   const durability = Math.floor(MAX_DURABILITY * (0.1 + ((level - 1) / 11) * 0.2))

   return { money, exp, durability }
}

/**
 * Calculates a value based on item and level.
 * Formula: (item * (level + 1)) * 3
 * 
 * @param {number} item - The base item value.
 * @param {number} level - The level multiplier.
 * @returns {number} The calculated value.
 */
export const valueable = (item, level) => (item * (level + 1)) * 3

/**
 * Returns the durability value for a given level index.
 * 
 * @param {number} i - Index from 1 to 12 representing the level.
 * @returns {number} Durability value for the given index.
 */
export const durabilities = i => [0, 9, 18, 27, 36, 45, 54, 63, 72, 81, 90, 100][i - 1]

/**
 * Generates a visual progress bar using block characters.
 * 
 * @param {number} current - The current value.
 * @param {number} [total=100] - The maximum total value.
 * @param {number} [levels=12] - Number of blocks in the progress bar.
 * @returns {string} A string representing the visual progress bar with percentage.
 */
export const bar = (current, total = 100, levels = 12) => {
   const barLength = levels
   const filledBlock = '⣿'
   const emptyBlock = '⣀'
   const percentage = (current / total) * 100
   const filledLength = Math.round((percentage / 100) * barLength)
   const bar = filledBlock.repeat(Math.max(0, filledLength)) + emptyBlock.repeat(Math.max(0, barLength - filledLength))
   const displayPercentage = percentage.toFixed(0)
   return (`[${bar}] ${displayPercentage}%`)
}

/**
 * List of pet foods and their compatibility.
 * Each entry contains:
 * - name: Food name.
 * - for: Pet type the food is meant for.
 * - price: Cost of the food item.
 */
export const foodsPet = [
   { name: 'fish', for: 'cat', price: 10 },
   { name: 'bone', for: 'dog', price: 10 },
   { name: 'carrot', for: 'rabbit', price: 7 },
   { name: 'lettuce', for: 'pig', price: 5 },
   { name: 'rat', for: 'snake', price: 25 },
   { name: 'fire', for: 'dragon', price: 75 }
]

/**
 * List of available pets with their attributes.
 * Each pet object contains:
 * - type: Pet type name.
 * - attack: Attack power.
 * - defense: Defense power.
 * - energy: Initial energy (default 100).
 * - level: Starting level (default 1).
 * - price: Price to acquire the pet.
 */
export const petsList = [
   { type: 'cat', attack: 125, defense: 25, energy: 100, level: 1, price: 15000 },
   { type: 'dog', attack: 130, defense: 50, energy: 100, level: 1, price: 20000 },
   { type: 'rabbit', attack: 120, defense: 70, energy: 100, level: 1, price: 17000 },
   { type: 'pig', attack: 150, defense: 40, energy: 100, level: 1, price: 20000 },
   { type: 'snake', attack: 230, defense: 165, energy: 100, level: 1, price: 75000 },
   { type: 'dragon', attack: 720, defense: 520, energy: 100, level: 1, price: 500000 }
]

/**
 * Predefined pet names based on pet type.
 * Each pet type has an array of name options (index 0 is placeholder "-").
 */
export const petsName = {
   cat: [
      '-',
      'Whiskers',
      'Paws',
      'Shadow',
      'Tigra',
      'Luna',
      'Mittens',
      'Sable',
      'Nyx',
      'Artemis'
   ],
   dog: [
      '-',
      'Buddy',
      'Max',
      'Rex',
      'Rocky',
      'Daisy',
      'Ranger',
      'Zeus',
      'Athena',
      'Apollo'
   ],
   rabbit: [
      '-',
      'Fluffy',
      'Thumper',
      'Nibbles',
      'Clover',
      'Hazel',
      'Willow',
      'Sapphire',
      'Aurora',
      'Merlin'
   ],
   pig: [
      '-',
      'Tuskar',
      'Smokebreath',
      'Emberfang',
      'Molten',
      'Drakehoof',
      'Onyxroot',
      'Blazebringer',
      'Stormtusk',
      'Titanfang'
   ],
   snake: [
      '-',
      'Slither',
      'Hiss',
      'Viper',
      'Asp',
      'Serpent',
      'Cobra',
      'Python',
      'Zula',
      'Hydra'
   ],
   dragon: [
      '-',
      'Ember',
      'Blaze',
      'Storm',
      'Fang',
      'Sapphire',
      'Onyx',
      'Inferno',
      'Zephyr',
      'Titan'
   ]
}

/**
 * Calculates the fight result between a player and an opponent
 * using weighted attributes: attack, defense, and energy.
 * 
 * The function also updates the opponent's defense and energy based on the outcome,
 * and calculates how much energy the player loses (20% of their total energy).
 * 
 * @param {Object} player - The player initiating the attack
 * @param {Object} opponent - The opponent being attacked
 * @param {Object} weights - The weights applied to each attribute
 * @returns {Object} An object containing the score and energyLost
 */
const calculateFightResult = (player, opponent, weights) => {
   let score = (player.attack * weights.attack) - (opponent.defense * weights.defense) + (player.energy * weights.energy)
   let energyLost = Math.floor(player.energy * 0.20)
   let defenseDecrease = Math.max(score * 0.1, 0)
   opponent.defense = Math.max(opponent.defense - defenseDecrease, 0)
   opponent.energy = Math.max(opponent.energy - energyLost, 0)
   return { score, energyLost }
}

/**
* Runs a tournament where each player fights every other player.
* Calculates each player's average score (winning percentage),
* total energy lost, and determines a single winner based on the highest percentage.
* Also adds reward and exp based on their respective weights.
* 
* @param {Array} players - The list of all player objects
* @param {Object} weights - The weights applied to each stat and reward/exp
* @returns {Object} An object containing results for all players and the final winner
*/
export const tournament = (players, weights) => {
   let results = {}
   let playersCopy = JSON.parse(JSON.stringify(players))

   for (let player of playersCopy) {
      let totalScore = 0
      let totalEnergyLost = 0
      let count = 0

      for (let opponent of playersCopy) {
         if (opponent.jid !== player.jid) {
            let { score, energyLost } = calculateFightResult(player, opponent, weights)
            totalScore += score
            totalEnergyLost += energyLost
            count++
         }
      }

      let winningPercentage = count > 0 ? (totalScore / count) : 0

      results[player.jid] = {
         type: player.type,
         winningPercentage,
         totalEnergyLost,
         money: Math.floor(winningPercentage * (weights.money || 10)).toFixed(0),
         exp: Math.floor(winningPercentage * (weights.exp || 1)).toFixed(0),
         isWinner: false
      }
   }

   let highestWinningPercentage = Math.max(...Object.values(results).map(result => result.winningPercentage))
   for (let playerName in results) {
      results[playerName].isWinner = results[playerName].winningPercentage === highestWinningPercentage
   }

   let winnerName = Object.keys(results).find(playerName => results[playerName].isWinner)

   return {
      results,
      winner: winnerName
   }
}

/**
 * Function to generate a random action message.
 * @param {string} attacker - Name of the attacking player.
 * @param {string} target - Name of the target player.
 * @param {string} item - The item used to perform the action.
 * @returns {string} A random action message based on the item used.
 */
export const generateAction = (attacker, target, item) => {
   const actions = {
      knife: [
         `${attacker} menusukkan pisau ke arah ${target} dengan presisi.`,
         `${attacker} menyerang ${target} secara tiba-tiba menggunakan pisau.`,
         `${attacker} melancarkan serangan cepat kepada ${target} dengan pisau tajam.`,
         `${attacker} mengayunkan pisau ke tubuh ${target} dengan terarah.`,
         `${attacker} melukai ${target} dengan tikaman yang dalam.`,
         `${attacker} menghujamkan pisau ke bagian samping tubuh ${target}.`,
         `${attacker} menebas ${target} secara tak terduga.`,
         `${attacker} meluncurkan serangan mendadak kepada ${target} dengan sebilah pisau.`,
         `${attacker} melakukan manuver tajam sebelum menusuk ${target}.`,
         `${attacker} mengincar titik lemah ${target} lalu menyerang dengan pisau.`
      ],
      sword: [
         `${attacker} mengayunkan pedang ke arah ${target} dengan kekuatan penuh.`,
         `${attacker} menebas ${target} secara frontal menggunakan pedangnya.`,
         `${attacker} melakukan serangan tajam dari samping ke arah ${target}.`,
         `${attacker} mengarahkan tebasan pedang langsung ke tubuh ${target}.`,
         `${attacker} memotong jalur gerak ${target} dengan tebasan cepat.`,
         `${attacker} menyerang ${target} dari atas dengan pedang besar.`,
         `${attacker} memutar tubuh dan melancarkan tebasan mematikan ke ${target}.`,
         `${attacker} mendorong mundur ${target} dengan ayunan pedang.`,
         `${attacker} menghujani ${target} dengan serangkaian tebasan.`,
         `${attacker} memanfaatkan momen untuk menebas bagian samping ${target}.`
      ],
      bow: [
         `${attacker} melepaskan anak panah ke arah ${target} dari kejauhan.`,
         `${attacker} membidik dengan tenang lalu menembakkan panah ke tubuh ${target}.`,
         `${attacker} menembakkan beberapa panah secara beruntun ke arah ${target}.`,
         `${attacker} meluncurkan panah dengan kekuatan penuh ke jantung ${target}.`,
         `${attacker} mengarahkan panah api langsung ke posisi ${target}.`,
         `${attacker} bersembunyi lalu menyerang ${target} secara tak terlihat.`,
         `${attacker} menarik busur dengan cepat dan menembakkan panah tepat sasaran.`,
         `${attacker} mengincar kepala ${target} dan melepaskan anak panah.`,
         `${attacker} memanfaatkan medan untuk menyerang ${target} dari sudut tinggi.`,
         `${attacker} menembakkan panah bersudut ke arah ${target} dengan akurasi tinggi.`
      ],
      pickaxe: [
         `${attacker} menghantam ${target} dengan ujung kapak tambangnya.`,
         `${attacker} mengayunkan pacul ke arah ${target} dengan tenaga besar.`,
         `${attacker} menggunakan alat tambangnya untuk menyerang bagian bawah ${target}.`,
         `${attacker} menyeruduk ${target} menggunakan kekuatan dari alat beratnya.`,
         `${attacker} menjatuhkan ${target} dengan hantaman keras dari pacul.`,
         `${attacker} mengarahkan serangan memutar ke tubuh ${target}.`,
         `${attacker} mengincar kaki ${target} dengan ujung pickaxe.`,
         `${attacker} membuat ${target} terkejut dengan pukulan mendadak.`,
         `${attacker} menggunakan ujung tajam pickaxe untuk melukai ${target}.`,
         `${attacker} melancarkan serangan kuat dari belakang kepada ${target}.`
      ],
      armor: [
         `${attacker} mendorong ${target} menggunakan kekuatan armornya.`,
         `${attacker} menahan serangan lalu menyerang balik ${target} dengan tubuh berlapis baja.`,
         `${attacker} memanfaatkan berat armornya untuk menjatuhkan ${target}.`,
         `${attacker} menyeruduk ${target} dengan perisai tubuhnya.`,
         `${attacker} menghalau serangan ${target} dan membalas dengan tabrakan keras.`,
         `${attacker} bertahan dari serangan ${target} dan meluncurkan balasan fisik.`,
         `${attacker} menabrakkan tubuhnya ke ${target} dengan keras.`,
         `${attacker} menangkis lalu menjatuhkan ${target} menggunakan armornya.`,
         `${attacker} membuat ${target} terpental dengan benturan langsung.`,
         `${attacker} memperkuat posisinya dan menyerang ${target} tanpa rasa takut.`
      ],
      fishingrod: [
         `${attacker} menarik ${target} menggunakan kail pancingnya.`,
         `${attacker} melemparkan tali pancing dan mengenai ${target}.`,
         `${attacker} memutar-mutar joran dan menyerang ${target} dengan ujungnya.`,
         `${attacker} menggunakan alat pancingnya untuk menjatuhkan ${target}.`,
         `${attacker} menarik ${target} mendekat dengan tali pancing.`,
         `${attacker} melilitkan tali ke ${target} sebelum menariknya kuat-kuat.`,
         `${attacker} menyentakkan joran hingga mengenai kepala ${target}.`,
         `${attacker} menyergap ${target} dengan kail yang meluncur cepat.`,
         `${attacker} menyeret ${target} menggunakan tarikan tajam.`,
         `${attacker} menjerat kaki ${target} dan membuatnya terjatuh.`
      ],
      saw: [
         `${attacker} menggergaji arah pertahanan ${target} dengan cepat.`,
         `${attacker} mengayunkan gergaji ke tubuh ${target} secara frontal.`,
         `${attacker} membuat luka goresan dalam pada tubuh ${target}.`,
         `${attacker} menebas udara di sekitar ${target} dengan suara gergaji yang memekakkan.`,
         `${attacker} mengejutkan ${target} dengan gerakan cepat dan tajam.`,
         `${attacker} menyerang balik ${target} dengan alat pemotongnya.`,
         `${attacker} menyeret gergaji ke arah kaki ${target}.`,
         `${attacker} memutar badan lalu mengarahkan gergaji ke perut ${target}.`,
         `${attacker} menebas secara vertikal ke arah ${target}.`,
         `${attacker} meluncurkan tebasan tajam ke lengan ${target}.`
      ],
      boomerang: [
         `${attacker} melempar bumerang ke arah ${target} dengan sudut akurat.`,
         `${attacker} menyerang ${target} dari kejauhan lalu menangkap kembali bumerangnya.`,
         `${attacker} menggunakan bumerang untuk menyerang dari samping.`,
         `${attacker} membelokkan arah bumerang hingga mengenai ${target}.`,
         `${attacker} melempar dua bumerang sekaligus ke arah ${target}.`,
         `${attacker} memantulkan bumerang dari dinding ke tubuh ${target}.`,
         `${attacker} membuat ${target} terkejut dengan serangan berputar.`,
         `${attacker} menyerang ${target} dari sudut tak terduga.`,
         `${attacker} melempar bumerang secara berulang untuk menghalangi gerakan ${target}.`,
         `${attacker} mengenai ${target} dengan lemparan melengkung yang tepat sasaran.`
      ]
   }

   const lowerItem = item.toLowerCase()
   const itemActions = actions[lowerItem] || [`${attacker} nyoba pake ${item} ke ${target}, tapi gak kejadian apa-apa.`]
   return itemActions[Math.floor(Math.random() * itemActions.length)]
}

/**
 * Trains the player and increases agility, strength, and stamina (as integers).
 *
 * @param {Object} player - The player object to be trained.
 * @param {number} multiplier - A multiplier value to determine the boost amount.
 * @returns {Object} - The result of the training including stat increases and status.
 */
export const trainPlayer = (multiplier = 1) => {
   if (typeof multiplier !== 'number' || multiplier <= 0) return null

   const agiGain = Math.floor((Math.random() * 2 + 1) * multiplier)   // 1–2 * multiplier
   const strGain = Math.floor((Math.random() * 3 + 1) * multiplier)   // 1–3 * multiplier
   const staGain = Math.floor((Math.random() * 5 + 1) * multiplier)   // 1–5 * multiplier

   const msg = `🧪 Training berhasil:
• +${agiGain} Agility
• +${strGain} Strength
• +${staGain} Stamina`

   return {
      agility: agiGain,
      strength: strGain,
      stamina: staGain
   }
}

/**
 * Determines the clan level and level name based on the given EXP.
 * Level 2 starts from 5000 EXP and each level has a defined EXP threshold.
 *
 * @param {number} exp - The experience points to evaluate.
 * @returns {{ level: number, name: string }} The clan level and its corresponding name.
 */
export const clanLvl = exp => {
   const names = [
      'Newborn', 'Settler', 'Gatherer', 'Explorer', 'Warrior', 'Defender', 'Champion', 'Warlord',
      'Commander', 'Overseer', 'Dominator', 'Highborn', 'Supreme', 'Mythic', 'Elder', 'Sovereign',
      'Legendary', 'Immortal', 'Celestial', 'Ascended', 'Transcended', 'Voidborn', 'Timewalker',
      'Starforged', 'Skydancer', 'Fateshaper', 'Stormbringer', 'Dragonsoul', 'Soulreaver', 'Godhand',
      'Voidseer', 'Runebreaker', 'Lightbringer', 'Darkhowler', 'Chaoswielder', 'Eclipseborn',
      'Thundercaller', 'Voidcaller', 'Blightforged', 'Ironfang', 'Frostheart', 'Sunbreaker',
      'Starcaller', 'Gravemaker', 'Flamekeeper', 'Ashborn', 'Nightreign', 'Netherlord', 'Voidking', 'Godlike'
   ]

   const levels = []
   let baseExp = 7500

   for (let i = 0; i < names.length; i++) {
      const level = i + 1
      const requiredExp = i === 0 ? 0 : Math.floor(5000 + Math.pow(level, 2.3) * 120)
      levels.push({ level, requiredExp, name: names[i] })
   }

   let current = levels[0]

   for (const lvl of levels) {
      if (exp >= lvl.requiredExp) {
         current = lvl
      } else {
         break
      }
   }

   return { level: current.level, name: current.name }
}