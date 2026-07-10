<template>
   <div class="modal fade" id="changeNumberModal" tabindex="-1" aria-labelledby="changeNumberModalLabel"
      aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
         <div class="modal-content">
            <div class="modal-header">
               <h5 class="modal-title" id="changeNumberModalLabel">Change Bot Number</h5>
               <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
               <div class="mb-3">
                  <label for="newBotNumber" class="form-label">New WhatsApp Number</label>
                  <input type="number" class="form-control" id="newBotNumber" v-model="newNumber"
                     placeholder="e.g., 62812xxxx" :disabled="isSubmitting">
                  <small class="form-text">Enter the new number without the '+' sign.</small>
               </div>
               <div class="mb-3">
                  <label class="form-label d-block mb-2">New Connection Method</label>
                  <div class="connection-method btn-group w-100" role="group">
                     <input type="radio" class="btn-check" name="connection-method" id="modal-scan-qr" value="qr"
                        v-model="newMethod" autocomplete="off" :disabled="isSubmitting">
                     <label class="btn btn-outline-secondary" for="modal-scan-qr">
                        <i class="bi bi-qr-code me-2"></i>Scan QR
                     </label>

                     <input type="radio" class="btn-check" name="connection-method" id="modal-pairing-code"
                        value="pairing" v-model="newMethod" autocomplete="off" :disabled="isSubmitting">
                     <label class="btn btn-outline-secondary" for="modal-pairing-code">
                        <i class="bi bi-phone-flip me-2"></i>Pairing Code
                     </label>
                  </div>
               </div>
            </div>
            <div class="modal-footer">
               <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"
                  :disabled="isSubmitting">Cancel</button>
               <button type="button" class="btn btn-primary" @click="handleSubmit" :disabled="isSubmitting">
                  <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-1" role="status"></span>
                  {{ isSubmitting ? 'Changing...' : 'Change' }}
               </button>
            </div>
         </div>
      </div>
   </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
   initialMethod: {
      type: String,
      default: 'qr'
   }
})
const emit = defineEmits(['submit'])

const newNumber = ref('')
const newMethod = ref('qr')
const isSubmitting = ref(false)

watch(() => props.initialMethod, (val) => {
   newMethod.value = val
}, { immediate: true })

const handleSubmit = () => {
   isSubmitting.value = true
   emit('submit', { number: newNumber.value, method: newMethod.value })
}

defineExpose({
   reset() {
      isSubmitting.value = false
      newNumber.value = ''
   }
})
</script>

<style scoped>
.form-text {
   font-size: 0.8rem;
   color: var(--dark-secondary-text-color);
}

body.light-mode .form-text {
   color: #6c757d;
}
</style>