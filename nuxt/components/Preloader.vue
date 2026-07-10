<template>
   <transition name="fade">
      <div v-if="show" class="preloader-overlay">
         <div class="preloader-content">
            <div class="brand-wrapper mb-4">
               <i class="bi bi-whatsapp brand-icon"></i>
               <h1 class="brand-title">{{ titleString }}</h1>
            </div>

            <div class="loader-track">
               <div class="line-loader" :style="{ width: progress + '%' }"></div>
            </div>

            <div class="loading-info mt-3">
               <span class="loading-text">Loading assets...</span>
            </div>
         </div>
      </div>
   </transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRuntimeConfig } from '#app'

const config = useRuntimeConfig()
const show = ref(true)
const progress = ref(0)
let progressInterval: ReturnType<typeof setInterval> | null = null

const audioSrc = 'https://cdn.neoxr.eu/audio/chicken.mp3'
let audio: HTMLAudioElement | null = null

const titleString = config.public.title || 'Wapify'

onMounted(() => {
   if (process.client) {
      document.body.style.overflow = 'hidden'
      audio = new Audio(audioSrc)
      audio.load()
   }

   progressInterval = setInterval(() => {
      if (progress.value < 100) {
         const increment = Math.floor(Math.random() * 5) + 1
         progress.value = Math.min(progress.value + increment, 100)
      } else {
         if (progressInterval) clearInterval(progressInterval)
         if (audio) {
            audio.play().catch((error) => {
               console.warn("Audio autoplay blocked by browser policy:", error)
            })
         }

         setTimeout(() => {
            show.value = false
            if (process.client) document.body.style.overflow = ''
         }, 500)
      }
   }, 50)
})

onBeforeUnmount(() => {
   if (progressInterval) clearInterval(progressInterval)
   if (process.client) document.body.style.overflow = ''
   if (audio) {
      audio.pause()
      audio.currentTime = 0
   }
})
</script>

<style scoped>
.preloader-overlay {
   position: fixed;
   top: 0;
   left: 0;
   width: 100%;
   height: 100%;
   background-color: var(--dark-bg);
   z-index: 9999;
   display: flex;
   justify-content: center;
   align-items: center;
   flex-direction: column;
}

body.light-mode .preloader-overlay {
   background-color: var(--light-bg);
}

.preloader-content {
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   width: 100%;
   max-width: 300px;
}

.brand-wrapper {
   display: flex;
   align-items: center;
   gap: 10px;
   animation: pulse 2s infinite ease-in-out;
}

.brand-icon {
   font-size: 1.5rem;
   color: var(--dark-primary-accent);
   animation: wave 1.5s infinite ease-in-out;
}

.brand-title {
   font-size: 1.5rem;
   font-weight: 700;
   margin: 0;
   color: var(--dark-text-color);
   letter-spacing: 1px;
   display: flex;
}

body.light-mode .brand-icon {
   color: var(--light-primary);
}

body.light-mode .brand-title {
   color: var(--light-text-color);
}

.loader-track {
   width: 100%;
   height: 4px;
   background-color: var(--dark-border-color);
   border-radius: 4px;
   overflow: hidden;
   position: relative;
}

body.light-mode .loader-track {
   background-color: var(--light-border-color);
}

.line-loader {
   position: absolute;
   top: 0;
   left: 0;
   height: 100%;
   border-radius: 4px;
   background-color: var(--dark-primary-accent);
   transition: width 0.1s linear;
}

body.light-mode .line-loader {
   background-color: var(--light-primary);
}

.loading-info {
   display: flex;
   justify-content: center; 
   width: 100%;
   margin-top: 0.5rem;
   font-size: 0.85rem;
   color: var(--dark-secondary-text-color);
}

body.light-mode .loading-info {
   color: #6c757d;
}

@keyframes pulse {
   0%, 100% {
      opacity: 1;
      transform: scale(1);
   }
   50% {
      opacity: 0.8;
      transform: scale(0.98);
   }
}

.fade-leave-active {
   transition: opacity 0.5s ease, transform 0.5s ease;
}

.fade-leave-to {
   opacity: 0;
   transform: scale(1.05);
}
</style>