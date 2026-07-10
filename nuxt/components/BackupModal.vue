<template>
   <div class="modal fade" id="backupModal" tabindex="-1" aria-labelledby="backupModalLabel" aria-hidden="true"
      data-bs-backdrop="static" data-bs-keyboard="false">
      <div class="modal-dialog modal-dialog-centered">
         <div class="modal-content text-center">

            <div v-if="isLoading" class="modal-body p-4">
               <div class="spinner-border text-primary-custom mb-3" role="status">
                  <span class="visually-hidden">Loading...</span>
               </div>
               <h5 class="modal-title mb-1">Creating Backup</h5>
               <p class="text-secondary small">Encrypting and preparing your data, please wait...</p>
            </div>

            <div v-if="!isLoading && backupData" class="modal-body p-4">
               <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
                  style="position: absolute; top: 1rem; right: 1rem;"></button>
               <div class="success-icon-wrapper">
                  <i class="bi bi-check2"></i>
               </div>
               <h5 class="modal-title mt-3 mb-1">Backup Successful!</h5>
               <p class="text-secondary small mb-3">Your encrypted backup file is ready to download.</p>
               <div class="backup-details">
                  <div class="detail-item">
                     <i class="bi bi-file-earmark-zip"></i>
                     <span>{{ backupData.original }}</span>
                  </div>
                  <div class="detail-item">
                     <i class="bi bi-hdd"></i>
                     <span>{{ backupData.size }}</span>
                  </div>
               </div>

               <a :href="backupData.downloadUrl" class="btn btn-custom-accent w-100 mt-4" download>
                  <i class="bi bi-download me-2"></i> Download Now
               </a>
            </div>

            <div v-if="!isLoading && error" class="modal-body p-4">
               <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
                  style="position: absolute; top: 1rem; right: 1rem;"></button>
               <div class="error-icon-wrapper">
                  <i class="bi bi-x-lg"></i>
               </div>
               <h5 class="modal-title mt-3 mb-1 text-danger">Backup Failed</h5>
               <p class="text-secondary small">{{ error }}</p>
               <button type="button" class="btn btn-secondary w-100 mt-3" data-bs-dismiss="modal">Close</button>
            </div>

         </div>
      </div>
   </div>
</template>

<script setup>
defineProps({
   isLoading: Boolean,
   backupData: Object,
   error: String
})
</script>