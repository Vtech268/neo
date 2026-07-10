<template>
   <nav class="navbar fixed-top py-3" id="mainNavbar" :class="{ 'scrolled': isScrolled }">
      <div class="container px-3 d-flex justify-content-between align-items-center">
         <h1 class="main-title mb-0">
            <a @click.prevent="$router.push('/')" class="text-decoration-none d-flex align-items-center"
               style="color: inherit; cursor: pointer;">
               <i class="bi bi-arrow-left me-3"></i>
               <span class="d-none d-sm-inline">Back</span>
            </a>
         </h1>
         <Theme />
      </div>
   </nav>

   <div class="container px-3 mb-4">
      <div class="content-card p-3 p-md-4 rounded-3">

         <div class="text-center py-5">
            <h1 class="display-1 fw-bold">404</h1>

            <p class="h4 mb-4">Page Not Found</p>
            <p class="mb-4">Sorry, the page you are looking for does not exist or may have been moved.</p>
           
            <button @click="$router.push('/')" class="btn btn-custom-accent">
               Go to Homepage
            </button>
         </div>

      </div>
   </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
useHead({ title: 'Page not Found', titleTemplate: `%s - ${config.public.title}` })

import { usePageEffects } from '@/composables/usePageEffects'
const { isScrolled } = usePageEffects()
</script>

<style scoped>
.display-1 {
   font-size: 8rem;
}

.btn-primary {
   padding: 0.75rem 1.5rem;
   font-size: 1rem;
}
</style>