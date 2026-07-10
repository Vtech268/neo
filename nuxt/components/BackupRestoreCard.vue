<template>
   <div class="row g-3 mb-4">
      <div class="col-md-6">
         <div class="action-box-faded rounded-3" @click="$emit('openBackupModal')" role="button" tabindex="0">
            <div class="action-box-content">
               <div class="action-icon-wrapper">
                  <i class="action-icon bi bi-database-down"></i>
               </div>
               <div class="text-content">
                  <div class="action-title">Create Backup</div>
                  <div class="action-description">Save an encrypted copy of your data.</div>
               </div>
            </div>
         </div>
      </div>
      <div class="col-md-6">
         <div class="action-box-faded rounded-3" @click="$emit('openRestoreModal')" role="button" tabindex="0">
            <div class="action-box-content">
               <div class="action-icon-wrapper">
                  <i class="action-icon bi bi-database-up"></i>
               </div>
               <div class="text-content">
                  <div class="action-title">Restore from Backup</div>
                  <div class="action-description">Overwrite data from a .json file.</div>
               </div>
            </div>
         </div>
      </div>
   </div>
</template>

<script setup>
defineEmits(['openBackupModal', 'openRestoreModal'])
</script>

<style scoped>
/* Faded Icon Alay sih ini */

/* .col-md-6:nth-child(1) .action-box-faded::before {
   content: '\F8B2';
}

.col-md-6:nth-child(2) .action-box-faded::before {
   content: '\F8C2';
} */
</style>