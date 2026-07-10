<template>
   <div class="modal fade" id="redeemCodeModal" tabindex="-1" aria-labelledby="redeemCodeModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
         <div class="modal-content">
            <div class="modal-header">
               <h5 class="modal-title" id="redeemCodeModalLabel">Redeem Your Code</h5>
               <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
                  :disabled="isSubmitting"></button>
            </div>
            <form @submit.prevent="handleSubmit">
               <div class="modal-body">
                  <p class="text-secondary small">
                     Enter the redeem code you received to activate your benefits.
                  </p>
                  <div class="mb-3">
                     <label for="redeemCodeInput" class="form-label">Redeem Code</label>
                     <input type="text" class="form-control" id="redeemCodeInput" v-model="redeemCode"
                        placeholder="XXXX-XXXX-XXXX" required :disabled="isSubmitting">
                  </div>
               </div>
               <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"
                     :disabled="isSubmitting">Cancel</button>
                  <button type="submit" class="btn btn-primary d-inline-flex align-items-center"
                     :disabled="isSubmitting || !redeemCode">
                     <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
                     {{ isSubmitting ? 'Redeeming...' : 'Redeem' }}
                  </button>
               </div>
            </form>
         </div>
      </div>
   </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
   isSubmitting: {
      type: Boolean,
      default: false
   }
})

const emit = defineEmits(['submit'])
const redeemCode = ref('')

const handleSubmit = () => {
   if (redeemCode.value.trim()) {
      emit('submit', { code: redeemCode.value.trim() })
   }
}

const reset = () => {
   redeemCode.value = ''
}

defineExpose({ reset })
</script>