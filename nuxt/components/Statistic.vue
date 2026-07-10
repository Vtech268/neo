<template>
   <div class="row mt-4 mb-4">
      <div class="col-12 text-center">
         <h2 class="main-title mb-3">Gateway Statistics</h2>
         <p class="section-subtitle">
            Here's a snapshot of our performance.
         </p>
      </div>

      <div v-if="isLoading" class="col-12 text-center py-5">
         <div class="loader-spinner"></div>
      </div>

      <div v-else-if="isError" class="col-12">
         <div class="alert alert-danger">Failed to load statistics.</div>
      </div>

      <div v-else v-for="stat in formattedStats" :key="stat.label" class="col-6 col-md-3 mb-4">
         <div class="content-card stat-card-faded-icon h-100 rounded-3 p-4">
            <i class="stat-icon-bg" :class="stat.icon"></i>
            <div class="stat-content">
               <div class="stat-value">{{ formatNumberAbbreviated(stat.value) }}</div>
               <div class="stat-label">{{ stat.label }}</div>
            </div>
         </div>
      </div>
   </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const { $api } = useNuxtApp()

const isLoading = ref(true)
const isError = ref(false)
const rawStats = ref({
   message_sent: 0,
   message_received: 0,
   clients: 0,
   features: 0
})

const fetchStats = async () => {
   isLoading.value = true
   isError.value = false
   try {
      const response = await $api('/data/statistic')
      if (response.status && response.data) {
         rawStats.value = response.data
      } else {
         throw new Error("Failed to fetch statistics data")
      }
   } catch (error) {
      console.error(error)
      isError.value = true
   } finally {
      isLoading.value = false
   }
}

const formattedStats = computed(() => {
   return [
      { key: 'message_sent', icon: 'bi-send', label: 'Message Sent' },
      { key: 'message_received', icon: 'bi-chat-left-text', label: 'Message Received' },
      { key: 'users', icon: 'bi-people', label: 'Total Users' },
      { key: 'features', icon: 'bi-code-slash', label: 'Total Features' }
   ].map(item => ({
      ...item,
      value: rawStats.value[item.key] || 0
   }))
})

const formatNumberAbbreviated = (num) => {
   if (num === null || num === undefined || isNaN(num) || num === 0) { return '0+' }
   if (num < 1000) { return `${num.toLocaleString()}+` }
   const suffixes = ["", "k", "M", "B", "T"];
   const i = Math.floor(Math.log(num) / Math.log(1000));
   const abbreviatedValue = parseFloat((num / Math.pow(1000, i)).toFixed(1));
   return `${abbreviatedValue}${suffixes[i]}+`;
}

onMounted(() => {
   fetchStats()
})
</script>

<style scoped>
.section-subtitle {
   font-size: 1.1rem;
   color: var(--dark-secondary-text-color);
   max-width: 650px;
   margin-left: auto;
   margin-right: auto;
   margin-bottom: 2.5rem;
}

body.light-mode .section-subtitle {
   color: #6c757d;
}

.stat-card-faded-icon {
   position: relative;
   overflow: hidden;
   border: 1px solid var(--dark-border-color);
   transition: border-color 0.3s ease;
}

body.light-mode .stat-card-faded-icon {
   border-color: var(--light-border-color);
}

.stat-card-faded-icon:hover {
   border-color: var(--dark-primary-accent);
}

body.light-mode .stat-card-faded-icon:hover {
   border-color: var(--light-primary);
}

.stat-icon-bg {
   position: absolute;
   right: -15px;
   bottom: -15px;
   font-size: 5.5rem;
   opacity: 0.05;
   color: var(--dark-text-color);
   z-index: 1;
   transition: transform 0.3s ease;
}

body.light-mode .stat-icon-bg {
   color: var(--light-text-color);
}

.stat-card-faded-icon:hover .stat-icon-bg {
   transform: scale(1.1) rotate(-5deg);
}

.stat-content {
   position: relative;
   z-index: 2;
}

.stat-value {
   font-weight: 700;
   font-size: 1.75rem;
   color: var(--dark-primary-accent);
   margin-bottom: 0.1rem;
}

body.light-mode .stat-value {
   color: var(--light-primary);
}

.stat-label {
   color: var(--dark-secondary-text-color);
   font-size: 0.9rem;
}

body.light-mode .stat-label {
   color: var(--light-text-color);
   opacity: 0.8;
}

@media (max-width: 767.98px) {
   .stat-value {
      font-size: 1.4rem;
   }

   .stat-icon-bg {
      font-size: 4.5rem;
   }

   .stat-label {
      font-size: 0.8rem;
   }
}
</style>