<template>
   <div class="modal fade" :id="id" tabindex="-1" :aria-labelledby="`${id}Label`" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
         <div class="modal-content">
            <div class="modal-header">
               <h5 class="modal-title" :id="`${id}Label`">{{ title }}</h5>
               <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
               <div class="mb-3">
                  <label for="botNumberInput" class="form-label">Bot Number (e.g., 6281234567890)</label>
                  <input type="text" class="form-control font-monospace" id="botNumberInput"
                     placeholder="Enter number without +" v-model="botNumber" :disabled="isSubmitting">
               </div>
            </div>
            <div class="modal-footer">
               <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"
                  :disabled="isSubmitting">Cancel</button>
               <button type="button" class="btn btn-custom-accent" @click="handleSubmit" :disabled="isSubmitting">
                  <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-1" role="status"
                     aria-hidden="true"></span>
                  {{ isSubmitting ? 'Saving...' : 'Save' }}
               </button>
            </div>
         </div>
      </div>
   </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
   id: { type: String, required: true },
   title: { type: String, default: 'Bot Configuration' },
   initialNumber: { type: String, default: '' }
})

const emit = defineEmits(['submit'])

const botNumber = ref('')
const isSubmitting = ref(false)

watch(() => props.initialNumber, (newVal) => {
   botNumber.value = newVal
})

onMounted(() => {
   botNumber.value = props.initialNumber
})

const handleSubmit = async () => {
   isSubmitting.value = true
   emit('submit', botNumber.value)
}

defineExpose({
   resetState() {
      isSubmitting.value = false
   }
})
</script>