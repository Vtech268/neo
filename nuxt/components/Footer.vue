<template>
   <footer class="main-footer py-4">
      <div class="container px-3">
         <div class="row align-items-center">

            <div class="col-md-6 text-center text-md-start mb-3 mb-md-0">
               <p class="copyright-text mb-0">
                  &copy; {{ currentYear }} {{ appTitle }}. All rights reserved.
               </p>
            </div>

            <div class="col-md-6 text-center text-md-end">
               <div class="social-links d-flex justify-content-center justify-content-md-end gap-3">
                  <a v-for="link in socialLinks" :key="link.url" :href="link.url" class="footer-link-icon" :title="link.title" target="_blank" rel="noopener noreferrer">
                     <i :class="link.icon"></i>
                  </a>
               </div>
            </div>

         </div>
      </div>
   </footer>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRuntimeConfig } from '#app'

const config = useRuntimeConfig()
const appTitle = computed(() => config.public.title)
const socialLinks = computed(() => config.public.links || [])

const currentYear = ref(new Date().getFullYear())
</script>

<style scoped>
.main-footer {
   position: relative;
   bottom: -25px;
   background-color: var(--dark-card-bg);
   border-top: 1px solid var(--dark-border-color);
   color: var(--dark-secondary-text-color);
   transition: background-color .3s, border-top .3s, color .3s;
}

body.light-mode .main-footer {
   background-color: var(--light-card-bg);
   border-top: 1px solid var(--light-border-color);
   color: #6c757d;
}

.copyright-text {
   font-size: 0.9rem;
}

.footer-link-icon {
   color: var(--dark-secondary-text-color);
   font-size: 1.25rem;
   transition: color 0.2s;
}

.footer-link-icon:hover {
   color: var(--dark-primary-accent);
}

body.light-mode .footer-link-icon {
   color: #6c757d;
}

body.light-mode .footer-link-icon:hover {
   color: var(--light-primary);
}
</style>