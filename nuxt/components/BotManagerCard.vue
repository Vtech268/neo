<template>
   <div class="content-card rounded-3 mb-4">
      <div class="card-header-custom d-flex justify-content-between align-items-center">
         <h5 class="main-title mb-0">My Bot</h5>
         <div v-if="accountData" class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-secondary" @click="$emit('openUpdateOwnerModal')">
               Owner
            </button>
            <button class="btn btn-sm btn-outline-secondary" @click="$emit('openUpdateTypeModal')"
               :disabled="accountData.is_connected">
               Type
            </button>
            <button class="btn btn-sm btn-outline-secondary" @click="$emit('openChangeModal')"
               :disabled="accountData.is_connected">
               Change Number
            </button>
         </div>
      </div>
      <div class="card-body-custom">
         <div v-if="isLoading" class="text-center py-5">
            <div class="loader-spinner"></div>
            <p class="mt-2">Fetching account data...</p>
         </div>
         <transition name="fade">
            <div v-if="!isLoading">
               <div v-if="!accountData" class="alert alert-danger d-flex align-items-center mb-0">
                  <i class="fas fa-exclamation-circle me-3 fa-lg"></i>
                  <div>Could not load account data or no bot is active.</div>
               </div>
               <div v-else class="bot-detail-wrapper">
                  <div class="d-flex justify-content-between align-items-center pb-3 mb-3">
                     <h4 class="mb-0 bot-number-text"><i class="fas fa-hashtag me-2 text-primary-custom"></i> {{
                        formatPhoneNumber(accountData.jid) }}</h4>
                     <span class="badge py-2 px-3" :class="statusInfo.class">{{ statusInfo.text }}</span>
                  </div>
                  <div class="row g-3 mb-4">
                     <div class="col-6 col-md-3">
                        <p class="label mb-0">Method:</p>
                        <div class="d-flex align-items-center">
                           <p class="value font-weight-500 mb-0 me-2">{{ formatMethod(accountData.method) }}</p>
                           <button v-if="accountData.is_logout" class="btn btn-sm btn-outline-secondary btn-icon"
                              @click="$emit('openUpdateMethodModal')" title="Change Method">
                              <i class="bi bi-shuffle"></i>
                           </button>
                        </div>
                     </div>
                     <div class="col-6 col-md-3">
                        <p class="label mb-0">Runtime:</p>
                        <p class="value font-weight-500 mb-0">{{ runtime }}</p>
                     </div>
                     <div class="col-6 col-md-3">
                        <p class="label mb-0">Expiry:</p>
                        <p class="value font-weight-500 mb-0">{{ formatExpiry(accountData.expired) }}</p>
                     </div>
                     <div class="col-6 col-md-3">
                        <p class="label mb-0">WA Version:</p>
                        <p class="value font-weight-500 mb-0">{{ accountData.wa_version?.join('.') || 'N/A' }}</p>
                     </div>
                  </div>
                  <div v-if="accountData.token" class="mb-4">
                     <p class="label mb-1">Token (x-neoxr-token):</p>
                     <div class="input-group">
                        <input type="text" class="form-control font-monospace small" :value="accountData.token" readonly
                           ref="tokenInput" />
                        <button @click="copyToken" class="btn"
                           :class="isCopied ? 'btn-success' : 'btn-outline-secondary'" type="button"><i
                              :class="isCopied ? 'bi bi-check-lg' : 'bi bi-clipboard'"></i></button>
                     </div>
                  </div>
                  <div class="row g-3">
                     <div class="col-6">
                        <div class="stat-card-simple">
                           <div class="value">{{ accountData.message_received?.toLocaleString() || 0 }}</div>
                           <div class="label">Received Messages</div>
                        </div>
                     </div>
                     <div class="col-6">
                        <div class="stat-card-simple">
                           <div class="value">{{ accountData.massage_sent?.toLocaleString() || 0 }}</div>
                           <div class="label">Sent Messages</div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </transition>
      </div>
   </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Swal from 'sweetalert2'
import { parsePhoneNumberFromString } from 'libphonenumber-js'

const props = defineProps({
   accountData: Object,
   isLoading: Boolean,
   runtime: String,
})

const emit = defineEmits(['openChangeModal', 'openUpdateOwnerModal', 'openUpdateMethodModal'])

const tokenInput = ref(null)
const isCopied = ref(false)

const statusInfo = computed(() => {
   if (!props.accountData) return { text: 'Unknown', class: 'bg-secondary' }
   if (props.accountData.is_connected) return { text: 'Active', class: 'bg-success' }
   if (props.accountData.is_logout || props.accountData.stop) return { text: 'Offline', class: 'bg-danger' }
   return { text: 'Inactive', class: 'bg-warning text-dark' }
})

const formatPhoneNumber = (jid = '') => {
   if (!jid) return 'N/A'
   const numberPart = jid.split('@')[0]
   const phoneNumber = parsePhoneNumberFromString('+' + numberPart)
   return phoneNumber?.isValid() ? phoneNumber.formatInternational() : `+${numberPart}`
}

const formatMethod = (method) => {
   if (!method) return 'N/A'
   if (method.toLowerCase() === 'pairing') return 'Pairing'
   if (method.toLowerCase() === 'qr') return 'QR'
   return method
}

const formatExpiry = (timestamp) => {
   if (!timestamp || timestamp === 0) return '-'
   return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
   })
}

const copyToken = () => {
   if (tokenInput.value) {
      tokenInput.value.select()
      document.execCommand('copy')
      isCopied.value = true
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Token copied!', showConfirmButton: false, timer: 3000, timerProgressBar: true, willClose: () => { isCopied.value = false } })
   }
}
</script>

<style scoped>
.bot-detail-wrapper .label {
   font-size: 0.85rem;
   color: var(--dark-secondary-text-color);
   margin-bottom: 0.1rem;
}

body.light-mode .bot-detail-wrapper .label {
   color: #6c757d;
}

.bot-detail-wrapper .value {
   font-size: 1rem;
   font-weight: 600;
}

.font-weight-500 {
   font-weight: 500 !important;
}

.bot-number-text {
   color: var(--dark-text-color) !important;
}

body.light-mode .bot-number-text {
   color: var(--light-text-color) !important;
}

.btn-icon {
   padding: 0.1rem 0.5rem;
   line-height: 1;
}

.btn-icon i {
   font-size: 13px
}
</style>