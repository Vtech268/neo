<template>
   <div class="modal fade" id="updateMethodModal" tabindex="-1" aria-labelledby="updateMethodModalLabel"
      aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
         <div class="modal-content">
            <div class="modal-header">
               <h5 class="modal-title" id="updateMethodModalLabel">Change Connection Method</h5>
               <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
                  :disabled="isSubmitting"></button>
            </div>
            <form @submit.prevent="handleSubmit">
               <div class="modal-body">
                  <p class="text-secondary small">
                     Select the connection method you want to use the next time you start the bot.
                  </p>
                  <div class="connection-method btn-group w-100" role="group">
                     <input type="radio" class="btn-check" name="method" id="method-qr" value="qr"
                        v-model="selectedMethod" autocomplete="off" :disabled="isSubmitting">
                     <label class="btn btn-outline-secondary" for="method-qr">
                        <i class="bi bi-qr-code me-2"></i>Scan QR
                     </label>

                     <input type="radio" class="btn-check" name="method" id="method-pairing" value="pairing"
                        v-model="selectedMethod" autocomplete="off" :disabled="isSubmitting">
                     <label class="btn btn-outline-secondary" for="method-pairing">
                        <i class="bi bi-phone-flip me-2"></i>Pairing Code
                     </label>
                  </div>
               </div>
               <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"
                     :disabled="isSubmitting">Cancel</button>

                  <button type="submit" class="btn btn-primary d-inline-flex align-items-center"
                     :disabled="isSubmitting">
                     <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
                     {{ isSubmitting ? 'Updating...' : 'Update Method' }}
                  </button>
               </div>
            </form>
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
   },
   isSubmitting: {
      type: Boolean,
      default: false
   }
})

const emit = defineEmits(['submit'])

const selectedMethod = ref(props.initialMethod)

watch(() => props.initialMethod, (newValue) => {
   selectedMethod.value = newValue
})

const handleSubmit = () => {
   if (props.isSubmitting) return
   if (selectedMethod.value) {
      emit('submit', { method: selectedMethod.value })
   }
}

const reset = () => {
   selectedMethod.value = props.initialMethod
}

defineExpose({ reset })
</script>