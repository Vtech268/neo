<template>
   <div class="modal fade" id="updateOwnerModal" tabindex="-1" aria-labelledby="updateOwnerModalLabel"
      aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
         <div class="modal-content">
            <div class="modal-header">
               <h5 class="modal-title" id="updateOwnerModalLabel">Update Owner Details</h5>
               <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
                  :disabled="isSubmitting"></button>
            </div>

            <form @submit.prevent="handleSubmit">
               <div class="modal-body">
                  <div class="mb-3">
                     <label for="ownerName" class="form-label">Name</label>
                     <input type="text" class="form-control" id="ownerName" v-model="ownerName"
                        placeholder="Enter new owner name" required :disabled="isSubmitting">
                  </div>
                  <div class="mb-3">
                     <label for="ownerNumber" class="form-label">Number</label>
                     <input type="number" class="form-control" id="ownerNumber" v-model="ownerNumber"
                        placeholder="e.g. 62812xxxx" required :disabled="isSubmitting">
                  </div>
               </div>

               <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"
                     :disabled="isSubmitting">Cancel</button>
                  <button type="submit" class="btn btn-primary d-inline-flex align-items-center"
                     :disabled="isSubmitting">
                     <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status"
                        aria-hidden="true">
                     </span>
                     {{ isSubmitting ? 'Updating...' : 'Update' }}
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
   initialOwnerName: {
      type: String,
      default: ''
   },
   initialOwnerNumber: {
      type: String,
      default: ''
   },
   isSubmitting: {
      type: Boolean,
      default: false
   }
})

const emit = defineEmits(['submit'])

const ownerName = ref(props.initialOwnerName)
const ownerNumber = ref(props.initialOwnerNumber)

watch(
   () => props.initialOwnerName,
   (newValue) => {
      ownerName.value = newValue
   }
)

watch(
   () => props.initialOwnerNumber,
   (newValue) => {
      ownerNumber.value = newValue
   }
)

const handleSubmit = () => {
   if (props.isSubmitting) return

   if (ownerName.value.trim() && ownerNumber.value) {
      emit('submit', {
         owner_name: ownerName.value.trim(),
         owner_number: String(ownerNumber.value).trim()
      })
   }
}

const reset = () => {
   ownerName.value = props.initialOwnerName
   ownerNumber.value = props.initialOwnerNumber
}

defineExpose({ reset })
</script>