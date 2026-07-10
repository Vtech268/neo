<template>
   <div class="content-card rounded-3 h-100 d-flex flex-column">
      <div class="card-header-custom d-flex justify-content-between align-items-center">
         <h5 class="main-title mb-0">Console</h5>
         <div class="d-flex align-items-center gap-3">
            <span class="badge" :class="socketStatus.class" style="font-size: 0.8rem; padding: 0.4em 0.7em">
               {{ socketStatus.text }}
            </span>
            <div class="form-check form-switch">
               <input class="form-check-input" type="checkbox" role="switch" id="wrap-logs" v-model="localWrapLogs"
                  @change="$emit('update:wrapLogs', localWrapLogs)">
               <label class="form-check-label small" for="wrap-logs">Wrap</label>
            </div>
         </div>
      </div>
      <div class="card-body-custom flex-grow-1 d-flex flex-column">
         <div ref="logContainer" class="form-control flex-grow-1 p-3 rounded terminal-output"
            :class="{ 'no-wrap': !wrapLogs }" style="max-height: 400px; overflow-y: auto">
            <div class="log-entry"><span class="text-secondary" v-html="welcomeMessage"></span></div>
            <div v-for="(log, index) in logs" :key="index" class="log-entry">
               <div class="log-line">
                  <span class="text-secondary">[{{ log.timestamp }}] </span>
                  <span :class="log.isCmd ? 'text-warning' : (log.type === 'SYSTEM' ? 'text-danger' : 'text-success')">
                     [{{ log.isCmd ? ' CMD ' : (log.type === 'SYSTEM' ? ' SYS ' : ' MSG ').toUpperCase().substring(0,
                        5).padEnd(5, ' ') }}]
                  </span>
                  <span class="text-info ms-1">{{ log.at }}</span>
                  <span class="text-secondary ms-2">{{ log.type }} {{ log.size }}</span>
                  <span class="text-light ms-2">from </span>
                  <span class="text-warning">[{{ log.from }}]</span>
                  <span v-if="log.self" class="text-danger ms-2">Self</span>
                  <span class="text-light ms-2">in </span>
                  <span class="text-info">[{{ log.in_name || log.in }}]</span>
               </div>
               <div class="log-body ps-3"><span class="text-light" v-html="formatWhatsAppText(log.body)"></span></div>
            </div>
         </div>
         <div class="d-flex justify-content-between align-items-center mt-3">
            <div class="d-flex gap-2">
               <button @click="$emit('control', 'start')" :disabled="isAction - loading || isConnected"
                  class="btn btn-sm btn-custom-accent d-inline-flex align-items-center justify-content-center action-btn">
                  <span v-if="loadingStates.start" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="bi bi-play me-2"></i>
                  Start
               </button>
               <button @click="$emit('control', 'stop')" :disabled="isAction - loading || !isConnected"
                  class="btn btn-sm btn-warning text-black d-inline-flex align-items-center justify-content-center action-btn">
                  <span v-if="loadingStates.stop" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="bi bi-pause-fill me-2"></i>
                  Stop
               </button>
               <button @click="$emit('confirm-logout')" :disabled="isAction - loading || !isConnected"
                  class="btn btn-sm btn-danger d-inline-flex align-items-center justify-content-center action-btn">
                  <span v-if="loadingStates.logout" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="bi bi-power me-2"></i>
                  Logout
               </button>
            </div>
         </div>
      </div>
   </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
   logs: Array,
   welcomeMessage: String,
   loadingStates: Object,
   'isAction-loading': Boolean,
   isConnected: Boolean,
   socketStatus: Object,
   wrapLogs: Boolean
})

const emit = defineEmits(['control', 'confirm-logout', 'update:wrapLogs'])

const logContainer = ref(null)
const localWrapLogs = ref(props.wrapLogs)

watch(() => props.logs, () => {
   scrollToBottom()
}, { deep: true })

const formatWhatsAppText = (text) => {
   if (typeof text !== 'string' || !text) return '-'
   let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
   html = html.replace(/\*(.*?)\*/gs, '<b>$1</b>').replace(/_(.*?)_/gs, '<i>$1</i>').replace(/~(.*?)~/gs, '<s>$1</s>').replace(/```(.*?)```/gs, '<code class="terminal-mono d-block my-1">$1</code>').replace(/`(.*?)`/gs, '<code class="terminal-mono">$1</code>')
   html = html.replace(/\n/g, '<br>')
   return html
}

const scrollToBottom = () => {
   nextTick(() => {
      if (logContainer.value) {
         logContainer.value.scrollTop = logContainer.value.scrollHeight
      }
   })
}
</script>

<style scoped>
.action-btn {
   min-width: 85px;
}

.terminal-output {
   background-color: var(--dark-bg);
   color: var(--dark-text-color);
   font-family: 'Courier New', Courier, monospace;
   font-size: 0.85rem;
   white-space: pre-wrap;
   word-wrap: break-word;
   min-height: 300px;
   height: 400px;
   max-height: 400px;
   overflow-y: auto;
}

.terminal-output.no-wrap {
   white-space: pre;
   word-wrap: normal;
   overflow-x: auto;
}

body.light-mode .terminal-output {
   background-color: var(--light-bg);
   color: var(--light-text-color);
}

.log-entry {
   margin-bottom: 5px;
}

.log-line {
   display: block;
   word-break: break-all;
}

.log-body {
   padding-left: 20px;
   word-break: break-all;
}

.text-warning {
   color: #f3e970 !important;
}

.text-success {
   color: #75b98a !important;
}

.text-info {
   color: #6ea8fe !important;
}

.text-danger {
   color: #e3828c !important;
}

.text-secondary {
   color: var(--dark-secondary-text-color) !important;
}

.text-light {
   color: var(--dark-text-color) !important;
}

body.light-mode .text-warning {
   color: #664d03 !important;
}

body.light-mode .text-success {
   color: #0f5132 !important;
}

body.light-mode .text-info {
   color: #055160 !important;
}

body.light-mode .text-danger {
   color: #842029 !important;
}

body.light-mode .text-secondary {
   color: #6c757d !important;
}

body.light-mode .text-light {
   color: var(--light-text-color) !important;
}

.terminal-mono {
   background-color: var(--dark-card-bg);
   padding: 1px 4px;
   border-radius: 3px;
}

body.light-mode .terminal-mono {
   background-color: #e9ecef;
}
</style>