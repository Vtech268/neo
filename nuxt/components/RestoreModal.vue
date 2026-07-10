<template>
   <div class="modal fade" id="restoreModal" tabindex="-1" aria-labelledby="restoreModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
         <div class="modal-content">
            <div class="modal-header">
               <h5 class="modal-title" id="restoreModalLabel">Restore Database</h5>
               <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
                  :disabled="isRestoring"></button>
            </div>
            <form @submit.prevent="handleSubmit">
               <div class="modal-body">
                  <div class="alert alert-warning small">
                     <strong>Warning:</strong> Restoring a backup will overwrite all current user, group, chat, setting and etc.
                     This action cannot be undone.
                  </div>
                  <div class="mb-4">
                     <label class="form-label">Upload Backup File</label>
                     <div class="drop-zone" :class="{ 'is-dragging': isDragging }" @dragover.prevent="isDragging = true"
                        @dragleave.prevent="isDragging = false" @drop.prevent="handleDrop">
                        <input class="d-none" type="file" id="restoreFile" @change="handleFileChange"
                           accept="application/json" ref="fileInputRef">
                        <div class="drop-zone-prompt">
                           <i class="bi bi-upload fs-1"></i>
                           <p class="mb-0 mt-2"><strong>Drag & drop a .json file here</strong></p>
                           <p class="small text-secondary mb-2">or</p>
                           <label for="restoreFile" class="btn btn-sm btn-secondary">Browse File</label>
                           <p v-if="selectedFile" class="mt-2 small font-monospace">{{ selectedFile.name }}</p>
                        </div>
                     </div>
                  </div>

                  <div class="mb-3">
                     <Challenge v-if="challengeStore.salt" :challenge="challengeStore.challengeString"
                        :difficulty="challengeStore.difficulty" :bind-context="challengeContext"
                        @verified="onChallengeVerified" />
                  </div>
               </div>
               <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"
                     :disabled="isRestoring">Cancel</button>
                  <button type="submit" class="btn btn-primary"
                     :disabled="isRestoring || !selectedFile || (challengeStore.salt && !challengeStore.isVerified)">
                     <span v-if="isRestoring" class="spinner-border spinner-border-sm me-2"></span>
                     {{ isRestoring ? 'Restoring...' : 'Restore Now' }}
                  </button>
               </div>
            </form>
         </div>
      </div>
   </div>
</template>

<script setup>
import { ref } from 'vue'

const isDragging = ref(false)
const fileInputRef = ref(null)

const props = defineProps({
   isRestoring: Boolean,
   challengeStore: Object,
   challengeContext: String,
   selectedFile: Object
})

const emit = defineEmits(['fileSelected', 'challengeVerified', 'submit'])

const handleFileSelect = (file) => {
   if (!file) return
   emit('fileSelected', file)
}

const handleFileChange = (event) => handleFileSelect(event.target.files[0])

const handleDrop = (event) => {
   isDragging.value = false
   handleFileSelect(event.dataTransfer.files[0])
}

const onChallengeVerified = (nonce) => emit('challengeVerified', nonce)

const handleSubmit = () => emit('submit')

const reset = () => {
   if (fileInputRef.value) fileInputRef.value.value = ''
}

defineExpose({ reset })
</script>