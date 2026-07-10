<template>
   <div class="form-check form-switch">
      <ClientOnly>
         <input class="form-check-input" type="checkbox" role="switch" id="themeSwitch" :checked="theme === 'dark'"
            @change="toggleTheme">
         <template #fallback>
            <input class="form-check-input" type="checkbox" role="switch" checked disabled>
         </template>
      </ClientOnly>
      <label class="form-check-label" for="themeSwitch">
         {{ theme === 'dark' ? 'Dark' : 'Light' }}
      </label>
   </div>
</template>

<script setup lang="ts">
import { usePageEffects } from '@/composables/usePageEffects'
const { theme, toggleTheme } = usePageEffects()
</script>