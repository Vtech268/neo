class Mapping {
   constructor() {
      this.retry = new Map()
      this.session = new Map()
      this.clone = new Map()
      this.schedule = new Map()
      this.io = new Map()
      this.property = new Map()
      this.market = new Map()
      this.backup = new Map()
   }
}

const mapping = new Mapping
export default mapping
export const retry = mapping.retry
export const session = mapping.session
export const clone = mapping.clone
export const schedule = mapping.schedule
export const io = mapping.io
export const property = mapping.property
export const market = mapping.market
export const backup = mapping.backup