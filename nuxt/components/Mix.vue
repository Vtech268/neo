<template>
   <div class="row g-3 mb-4">
      <div class="col-md-6">
         <NuxtLink to="/playground" class="card-link">
            <div class="content-card rounded-3 action-box h-100">
               <div class="card-body-custom">
                  <div class="d-flex align-items-center">
                     <div class="action-icon-wrapper">
                        <i class="action-icon bi bi-cloud-fog2"></i>
                     </div>
                     <div class="text-content">
                        <div class="action-title">Playground</div>
                        <div class="action-description mb-0">Explore and test our API endpoints.</div>
                     </div>
                     <div class="link-indicator ms-auto">
                        <i class="bi bi-arrow-right-short"></i>
                     </div>
                  </div>
               </div>
            </div>
         </NuxtLink>
      </div>
   </div>
</template>

<style scoped>
.card-link {
   text-decoration: none;
   color: inherit;
}

.action-box {
   transition: border-color 0.2s ease, transform 0.2s ease;
}

.action-box:hover {
   border-color: var(--dark-primary-accent);
   transform: translateY(-3px);
}

body.light-mode .action-box:hover {
   border-color: var(--light-primary);
}

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
   transition: background-color 0.2s ease, border-color 0.2s ease;
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
   line-height: 1.2;
}

.link-indicator {
   display: flex;
   align-items: center;
   font-size: 0.9rem;
   font-weight: 500;
   color: var(--dark-secondary-text-color);
   transition: color 0.2s ease;
}

.action-box:hover .link-indicator {
   color: var(--dark-primary-accent);
}

.link-indicator i {
   font-size: 1.5rem;
   line-height: 1;
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

body.light-mode .action-box:hover .link-indicator {
   color: var(--light-primary);
}
</style>