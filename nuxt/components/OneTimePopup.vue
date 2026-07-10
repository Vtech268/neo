<template>
   <transition name="fade">
      <div v-if="showPopup" class="mobile-prompt-overlay">
         <div class="prompt-wrapper">
            <button @click="dismissPopup" class="close-popup-btn" aria-label="Close">
               <i class="bi bi-x-lg"></i>
            </button>
            <div class="prompt-card content-card">
               <h5 class="mb-2">Stay Updated!</h5>
               <p class="prompt-text">
                  Follow our WhatsApp Channel to get the latest news, feature updates, and special offers directly.
               </p>
               <div class="d-flex gap-2 mt-4">
                  <button @click="dismissPopup" class="btn btn-secondary w-100">
                     Maybe Later
                  </button>
                  <a :href="channelURL" target="_blank" rel="noopener noreferrer" @click="handleFollowClick"
                     class="btn btn-custom-accent fw-bold w-100">
                     <i class="bi bi-bell me-2"></i>Follow
                  </a>
               </div>
            </div>
            <span class="sparkle"></span>
            <span class="sparkle"></span>
            <span class="sparkle"></span>
            <span class="sparkle"></span>
            <span class="sparkle"></span>
            <span class="sparkle"></span>
         </div>
      </div>
   </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'
const config = useRuntimeConfig()

const channelURL = config.public.popupURL
const showPopup = ref(false)
const storageKey = 'popup_dismissed'

const dismissPopup = () => {
   localStorage.setItem(storageKey, 'true')
   showPopup.value = false
}

const handleFollowClick = () => {
   dismissPopup()
}

onMounted(() => {
   const isBrowser = typeof window !== 'undefined'
   if (isBrowser) {
      const isMobile = window.innerWidth < 768
      const hasDismissed = localStorage.getItem(storageKey) === 'true'
      if (isMobile && !hasDismissed) {
         setTimeout(() => {
            showPopup.value = true
         }, 1500)
      }
   }
})
</script>