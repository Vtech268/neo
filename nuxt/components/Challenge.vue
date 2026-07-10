<template>
   <div class="pow-challenge-box" :class="{
      'verified': isVerified,
      'verifying': isVerifying,
      'clickable': !isVerified && !isVerifying
   }" @click="startVerification">
      <i class="bi bi-shield-lock-fill pow-bg-icon"></i>
      <div class="pow-content">
         <div class="pow-checkbox">
            <span v-if="isVerifying" class="spinner-border spinner-border-sm" role="status"></span>
            <i v-else-if="isVerified" class="bi bi-check-lg"></i>
         </div>
         <div class="pow-text">
            <div v-if="isVerifying" class="pow-title">Verifying...</div>
            <div v-else-if="isVerified" class="pow-title">You are verified</div>
            <div v-else class="pow-title">Click to verify</div>
            <div class="pow-subtitle">Simple security check by Neoxr Creative</div>
         </div>
      </div>
   </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue'

const props = defineProps<{
   challenge: string | null,
   difficulty: number,
   bindContext: string | null
}>()

const emit = defineEmits(['verified'])

const isVerifying = ref(false)
const isVerified = ref(false)

const startVerification = () => {
   if (isVerified.value || isVerifying.value || !props.challenge || !props.bindContext) return

   isVerifying.value = true

   setTimeout(() => {
      if (props.challenge && props.bindContext) {
         solveChallenge(props.challenge, props.difficulty, props.bindContext)
      }
   }, 50)
}

const solveChallenge = async (challengeData: string, difficulty: number, bindContext: string) => {
   let nonce = 0
   const prefix = '0'.repeat(difficulty)
   const encoder = new TextEncoder()

   while (true) {
      const attempt = `${challengeData}:${bindContext}:${nonce}`

      const data = encoder.encode(attempt)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hexHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

      if (hexHash.startsWith(prefix)) {
         isVerifying.value = false
         isVerified.value = true
         emit('verified', nonce)
         break
      }
      nonce++

      if (nonce % 10000 === 0) {
         await new Promise(resolve => setTimeout(resolve, 0))
      }
   }
}

watch(() => props.challenge, () => {
   isVerified.value = false
   isVerifying.value = false
})

watch(() => props.bindContext, () => {
   isVerified.value = false
   isVerifying.value = false
})
</script>

<style scoped>
.pow-challenge-box {
   position: relative;
   overflow: hidden;
   width: 100%;
   background-color: var(--dark-bg);
   border: 1px solid var(--dark-border-color);
   border-radius: .375rem;
   padding: 1rem 1.25rem;
   transition: all 0.2s ease-in-out;
   color: var(--dark-secondary-text-color);
}

body.light-mode .pow-challenge-box {
   background-color: var(--light-bg);
   border-color: var(--light-border-color);
   color: #6c757d;
}

.pow-challenge-box.clickable {
   cursor: pointer;
}

.pow-challenge-box.clickable:hover {
   border-color: var(--dark-primary-accent);
   background-color: var(--dark-card-bg);
}

body.light-mode .pow-challenge-box.clickable:hover {
   border-color: var(--light-primary);
   background-color: var(--light-card-bg);
}

.pow-challenge-box.verifying {
   cursor: default;
}

.pow-challenge-box.verified {
   cursor: default;
   border-color: rgba(0, 168, 132, 0.5);
   background-color: var(--dark-card-bg);
}

body.light-mode .pow-challenge-box.verified {
   border-color: rgba(34, 34, 34, 0.5);
}

.pow-bg-icon {
   position: absolute;
   bottom: -1rem;
   right: -0.5rem;
   font-size: 6rem;
   color: var(--dark-border-color);
   opacity: 0.2;
   pointer-events: none;
   transform: rotate(-15deg);
   transition: color 0.3s ease, opacity 0.3s ease;
   z-index: 1;
}

.verified .pow-bg-icon {
   color: var(--dark-primary-accent);
   opacity: 0.1;
}

body.light-mode .pow-bg-icon {
   color: var(--light-border-color);
}

body.light-mode .verified .pow-bg-icon {
   color: var(--light-primary);
   opacity: 0.1;
}

.pow-content {
   position: relative;
   z-index: 2;
   display: flex;
   align-items: center;
   gap: 1rem;
}

.pow-checkbox {
   flex-shrink: 0;
   width: 30px;
   height: 30px;
   border: 2px solid var(--dark-border-color);
   background-color: transparent;
   border-radius: 4px;
   display: flex;
   align-items: center;
   justify-content: center;
   transition: all 0.2s ease-in-out;
}

.clickable:hover .pow-checkbox {
   border-color: var(--dark-primary-accent);
}

body.light-mode .clickable:hover .pow-checkbox {
   border-color: var(--light-primary);
}

.verifying .pow-checkbox {
   border-color: var(--dark-primary-accent);
}

body.light-mode .verifying .pow-checkbox {
   border-color: var(--light-primary);
}

.verified .pow-checkbox {
   border-color: var(--dark-primary-accent);
   background-color: var(--dark-primary-accent);
   color: #000;
   font-size: 1.2rem;
}

body.light-mode .verified .pow-checkbox {
   border-color: var(--light-primary);
   background-color: var(--light-primary);
   color: #fff;
}

.pow-text {
   font-weight: 500;
}

.pow-title {
   color: var(--dark-text-color);
   font-weight: 600;
}

body.light-mode .pow-title {
   color: var(--light-text-color);
}

.verified .pow-title {
   color: var(--dark-primary-accent);
}

body.light-mode .verified .pow-title {
   color: var(--light-primary);
}

.pow-subtitle {
   font-size: 0.8rem;
   color: var(--dark-secondary-text-color);
}

body.light-mode .pow-subtitle {
   color: #6c757d;
}
</style>