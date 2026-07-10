<template>
   <div class="content-card rounded-3 mb-4">
      <div class="card-body-custom">
         <div class="d-flex align-items-center">
            <div class="action-icon-wrapper">
               <i class="action-icon bi bi-ticket-detailed"></i>
            </div>
            <div class="text-content">
               <div class="action-title">Have a Redeem Code?</div>
               <div class="action-description">Enter your code here to claim your plan or credits.</div>
            </div>
            <button class="btn btn-custom-accent ms-auto px-4" @click="$emit('openRedeemModal')">
               Redeem
            </button>
         </div>
      </div>
   </div>
</template>

<script setup>
defineEmits(['openRedeemModal']);
</script>

<style scoped>
.action-icon-wrapper {
   flex-shrink: 0;
   width: 45px;
   height: 45px;
   background-color: var(--dark-bg);
   border: 1px solid var(--dark-border-color);
   border-radius: .375rem;
   display: flex;
   align-items: center;
   justify-content: center;
   margin-right: 1rem;
}

.action-icon {
   font-size: 1.75rem;
   color: var(--dark-primary-accent);
}

.text-content {
   min-width: 0;
}

.action-title {
   font-weight: 600;
   color: var(--dark-text-color);
}

.action-description {
   font-size: 0.85rem;
   color: var(--dark-secondary-text-color);
}

body.light-mode .action-icon-wrapper {
   background-color: var(--light-bg);
   border-color: var(--light-border-color);
}

body.light-mode .action-icon {
   color: var(--light-primary);
}

body.light-mode .action-title {
   color: var(--light-text-color);
}

body.light-mode .action-description {
   color: #6c757d;
}
</style>