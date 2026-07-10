import { defineStore } from 'pinia'

interface ChallengeState {
   salt: string | null
   ts: number | null
   difficulty: number
   solution: number | null
   isVerified: boolean
   context: string | null
   token: string | null
}

export const useChallengeStore = defineStore('challenge', {
   state: (): ChallengeState => ({
      salt: null,
      ts: null,
      difficulty: 3,
      solution: null,
      isVerified: false,
      context: null,
      token: null
   }),
   actions: {
      setChallenge(data: { salt: string, ts: number, difficulty: number, context: string, token: string }) {
         this.salt = data.salt
         this.ts = data.ts
         this.difficulty = data.difficulty
         this.context = data.context
         this.token = data.token
         this.isVerified = false
         this.solution = null
      },
      setVerified(nonce: number) {
         if (this.salt) {
            this.solution = nonce
            this.isVerified = true
         }
      },
      clearChallenge() {
         this.salt = null
         this.ts = null
         this.difficulty = 3
         this.solution = null
         this.isVerified = false
         this.context = null
         this.token = null
      },
   },
   getters: {
      getChallengePayload: (state) => {
         if (state.isVerified && state.salt && state.ts !== null && state.solution !== null && state.context && state.token) {
            return {
               salt: state.salt,
               ts: state.ts,
               solution: state.solution,
               context: state.context,
               token: state.token
            }
         }
         return null
      },
      challengeString: (state) => state.salt && state.ts !== null ? `${state.salt}:${state.ts}` : null
   }
})