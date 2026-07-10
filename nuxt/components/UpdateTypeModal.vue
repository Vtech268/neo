<template>
   <div class="modal fade" id="updateTypeModal" tabindex="-1" aria-labelledby="updateTypeModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
         <div class="modal-content">
            <div class="modal-header">
               <h5 class="modal-title" id="updateTypeModalLabel">Update Bot Type</h5>
               <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
                  :disabled="isSubmitting"></button>
            </div>

            <form @submit.prevent="handleSubmit">
               <div class="modal-body">
                  <div class="mb-3">
                     <label for="botTypeSelect" class="form-label">Bot Type</label>
                     <select class="form-select" id="botTypeSelect" v-model="botType" :disabled="isSubmitting" required>
                        <option v-for="type in botTypes" :key="type.id" :value="type.id">
                           {{ type.name }}
                        </option>
                     </select>
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
   initialBotType: {
      type: String,
      default: 'original'
   },
   botTypes: {
      type: Array,
      default: () => []
   },
   isSubmitting: {
      type: Boolean,
      default: false
   }
})

const emit = defineEmits(['submit'])

const botType = ref(props.initialBotType)

watch(
   () => props.initialBotType,
   (newValue) => {
      botType.value = newValue || 'original'
   }
)

const handleSubmit = () => {
   if (props.isSubmitting) return
   emit('submit', {
      bot_type: botType.value
   })
}
</script>