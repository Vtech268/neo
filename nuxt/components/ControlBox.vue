<template>
   <div class="row g-3 mb-4">
      <div v-for="control in controls" :key="control.path" class="col-6 col-md-3">
         <NuxtLink :to="control.path" class="control-card-vertical">
            <div class="icon-wrapper">
               <i :class="control.icon"></i>
            </div>
            <span class="label">{{ control.label }}</span>
         </NuxtLink>
      </div>
   </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const controls = ref([
   { label: 'Documentation', path: '/docs', icon: 'bi bi-file-earmark-text' },
   { label: 'Plugins', path: '/dashboard/plugins', icon: 'bi bi-puzzle' },
   { label: 'Commands', path: '/dashboard/commands', icon: 'bi bi-terminal' },
   { label: 'Setting', path: '/dashboard/setting', icon: 'bi bi-gear' }
])
</script>

<style scoped>
.control-card-vertical {
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   padding: 1.5rem;
   background-color: var(--dark-card-bg);
   border: 1px solid var(--dark-border-color);
   border-radius: .375rem;
   text-decoration: none;
   transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
   height: 100%;
}

body.light-mode .control-card-vertical {
   background-color: var(--light-card-bg);
   border-color: var(--light-border-color);
}

.control-card-vertical:hover {
   transform: translateY(-5px);
   box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
   border-color: var(--dark-primary-accent);
}

body.light-mode .control-card-vertical:hover {
   border-color: var(--light-primary);
}

.control-card-vertical .icon-wrapper {
   font-size: 2rem;
   color: var(--dark-primary-accent);
   margin-bottom: 0.75rem;
}

body.light-mode .control-card-vertical .icon-wrapper {
   color: var(--light-primary);
}

.control-card-vertical .label {
   font-weight: 600;
   font-size: 1rem;
   color: var(--dark-text-color);
}

body.light-mode .control-card-vertical .label {
   color: var(--light-text-color);
}
</style>