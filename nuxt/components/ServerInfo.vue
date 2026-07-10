<template>
   <div class="row mt-4 mb-4">
      <div class="col-12 text-center">
         <h2 class="main-title mb-3">System Information</h2>
         <p class="section-subtitle">
            Real-time server performance and resource utilization.
         </p>
      </div>

      <div v-if="!isConnected" class="col-12 text-center py-5">
         <div class="loader-spinner"></div>
         <p class="mt-3 text-custom-muted">Connecting to server metrics...</p>
      </div>

      <div v-else class="col-12 row mx-0 px-0">
         <div class="col-12 col-md-6 mb-4">
            <div class="content-card stat-card-faded-icon h-100 rounded-3 p-4 d-flex flex-column">
               <i class="stat-icon-bg bi bi-cpu"></i>
               <div class="stat-content d-flex flex-column h-100">
                  <div>
                     <span class="stat-label d-block mb-2">CPU Usage</span>
                     <div class="progress animated-progress mb-2">
                        <div class="progress-bar progress-bar-custom" role="progressbar"
                           :style="{ width: stats.cpuUsage + '%' }"></div>
                     </div>
                     <div class="text-custom-muted small mb-3">{{ stats.cpuModel }} ({{ stats.cores }} Cores)</div>
                  </div>

                  <div class="mt-auto">
                     <span class="stat-value fs-2">{{ stats.cpuUsage }}%</span>
                  </div>
               </div>
            </div>
         </div>

         <div class="col-12 col-md-6 mb-4">
            <div class="content-card stat-card-faded-icon h-100 rounded-3 p-4 d-flex flex-column">
               <i class="stat-icon-bg bi bi-memory"></i>
               <div class="stat-content d-flex flex-column h-100">
                  <div>
                     <span class="stat-label d-block mb-2">Heap Memory</span>
                     <div class="progress animated-progress mb-2">
                        <div class="progress-bar progress-bar-custom" role="progressbar"
                           :style="{ width: ramPercentage + '%' }"></div>
                     </div>
                     <div class="text-custom-muted small mb-3">Total System Memory : {{ formatBytes(stats.totalMem) }}
                     </div>
                  </div>

                  <div class="mt-auto">
                     <span class="stat-value fs-3">{{ formatBytes(stats.heapUsed) }} / {{ formatBytes(stats.heapTotal)
                        }}</span>
                  </div>
               </div>
            </div>
         </div>

         <div class="col-12 col-md-6 mb-4">
            <div class="content-card stat-card-faded-icon h-100 rounded-3 p-4 d-flex flex-column">
               <i class="stat-icon-bg bi bi-hdd-network"></i>
               <div class="stat-content d-flex flex-column h-100">
                  <div>
                     <span class="stat-label d-block mb-2">External Memory (C++ Bindings)</span>
                     <div class="progress animated-progress mb-3">
                        <div class="progress-bar progress-bar-custom" role="progressbar" style="width: 100%"></div>
                     </div>
                  </div>

                  <div class="mt-auto">
                     <span class="stat-value fs-3">{{ formatBytes(stats.external) }}</span>
                  </div>
               </div>
            </div>
         </div>

         <div class="col-12 col-md-6 mb-4">
            <div class="content-card stat-card-faded-icon h-100 rounded-3 p-4 d-flex flex-column">
               <i class="stat-icon-bg bi bi-layers"></i>
               <div class="stat-content d-flex flex-column h-100">
                  <div>
                     <span class="stat-label d-block mb-2">Array Buffers</span>
                     <div class="progress animated-progress mb-3">
                        <div class="progress-bar progress-bar-custom" role="progressbar" style="width: 100%"></div>
                     </div>
                  </div>

                  <div class="mt-auto">
                     <span class="stat-value fs-3">{{ formatBytes(stats.arrayBuffers) }}</span>
                  </div>
               </div>
            </div>
         </div>

         <div class="col-6 col-md-4 mb-4">
            <div class="content-card stat-card-faded-icon h-100 rounded-3 p-4 d-flex flex-column">
               <i class="stat-icon-bg bi bi-clock-history"></i>
               <div class="stat-content d-flex flex-column h-100">
                  <div>
                     <span class="stat-label d-block mb-3">Server Uptime</span>
                  </div>
                  <div class="mt-auto">
                     <div class="stat-value fs-4">{{ formatUptime(stats.uptime) }}</div>
                  </div>
               </div>
            </div>
         </div>

         <div class="col-6 col-md-4 mb-4">
            <div class="content-card stat-card-faded-icon h-100 rounded-3 p-4 d-flex flex-column">
               <i class="stat-icon-bg bi bi-hexagon-fill"></i>
               <div class="stat-content d-flex flex-column h-100">
                  <div>
                     <span class="stat-label d-block mb-3">Node.js Engine</span>
                  </div>
                  <div class="mt-auto">
                     <div class="stat-value fs-4">{{ stats.nodeVersion }}</div>
                  </div>
               </div>
            </div>
         </div>

         <div class="col-12 col-md-4 mb-4">
            <div class="content-card stat-card-faded-icon h-100 rounded-3 p-4 d-flex flex-column">
               <i class="stat-icon-bg bi bi-pc-display"></i>
               <div class="stat-content d-flex flex-column h-100">
                  <div>
                     <span class="stat-label d-block mb-3">Operating System</span>
                  </div>
                  <div class="mt-auto">
                     <div class="stat-value fs-4 text-capitalize">{{ stats.platform }} ({{ stats.arch }})</div>
                  </div>
               </div>
            </div>
         </div>

      </div>
   </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { io } from 'socket.io-client'

const isConnected = ref(false)
let socket = null

const stats = ref({
   cpuUsage: 0,
   cpuModel: 'Loading...',
   cores: 0,
   heapUsed: 0,
   heapTotal: 0,
   external: 0,
   arrayBuffers: 0,
   totalMem: 0,
   uptime: 0,
   platform: '...',
   arch: '...',
   nodeVersion: '...'
})

const ramPercentage = computed(() => {
   if (stats.value.heapTotal === 0) return 0
   return ((stats.value.heapUsed / stats.value.heapTotal) * 100).toFixed(1)
})

const formatBytes = (bytes) => {
   if (!bytes || bytes === 0) return '0 B'
   const k = 1024
   const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
   const i = Math.floor(Math.log(bytes) / Math.log(k))
   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatUptime = (seconds) => {
   const d = Math.floor(seconds / (3600 * 24))
   const h = Math.floor(seconds % (3600 * 24) / 3600)
   const m = Math.floor(seconds % 3600 / 60)

   if (d > 0) return `${d}d ${h}h`
   return `${h}h ${m}m`
}

onMounted(() => {
   socket = io({
      transports: ['websocket'],
   })

   socket.on('connect', () => {
      isConnected.value = true
   })

   socket.on('server_metrics', (data) => {
      stats.value = data
   })

   socket.on('disconnect', () => {
      isConnected.value = false
   })
})

onUnmounted(() => {
   if (socket) {
      socket.disconnect()
   }
})
</script>

<style scoped>
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
   color: var(--dark-primary-accent);
}

body.light-mode .stat-value {
   color: var(--light-primary);
}

.stat-label {
   color: var(--dark-secondary-text-color);
   font-size: 0.95rem;
   font-weight: 500;
}

body.light-mode .stat-label {
   color: var(--light-text-color);
   opacity: 0.8;
}

.animated-progress {
   height: 8px;
   background-color: rgba(255, 255, 255, 0.1);
   border-radius: 10px;
   overflow: hidden;
}

body.light-mode .animated-progress {
   background-color: rgba(0, 0, 0, 0.05);
}

.progress-bar-custom {
   background-color: var(--dark-primary-accent);
   transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
   border-radius: 10px;
}

body.light-mode .progress-bar-custom {
   background-color: var(--light-primary);
}

.text-custom-muted {
   color: var(--dark-secondary-text-color);
}

body.light-mode .text-custom-muted {
   color: #6c757d;
}
</style>