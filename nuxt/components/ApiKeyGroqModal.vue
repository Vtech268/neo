<template>
   <div class="modal fade" id="apiKeyGroqModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
         <div class="modal-content">
            <div class="modal-header border-0 pb-0">
               <h5 class="modal-title fw-bold">Get Your Groq Key</h5>
               <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body pt-2">
               <p class="text-secondary small mb-4">Follow these steps to generate your API key.</p>

               <div class="timeline">
                  <div class="timeline-item">
                     <div class="timeline-marker">1</div>
                     <div class="timeline-content">
                        <h6 class="fw-bold mb-1">Visit Groq Cloud</h6>
                        <p class="small text-secondary mb-2">Open the official dashboard.</p>
                        <a href="https://console.groq.com/keys" target="_blank" class="btn btn-sm btn-outline-custom">
                           <i class="bi bi-box-arrow-up-right me-1"></i> Open Groq Console
                        </a>
                     </div>
                  </div>

                  <div class="timeline-item">
                     <div class="timeline-marker">2</div>
                     <div class="timeline-content">
                        <h6 class="fw-bold mb-1">Create API Key</h6>
                        <p class="small text-secondary mb-0">Sign in, then click <strong>"Create API key"</strong>
                           button.</p>
                     </div>
                  </div>

                  <div class="timeline-item">
                     <div class="timeline-marker">3</div>
                     <div class="timeline-content">
                        <h6 class="fw-bold mb-1">Copy & Paste</h6>
                        <p class="small text-secondary mb-0">Copy the string starting with <code>gsk_...</code> and
                           paste it into the settings field.</p>
                     </div>
                  </div>
               </div>
            </div>
            <div class="modal-footer border-0 pt-0">
               <button type="button" class="btn btn-custom-accent w-100" data-bs-dismiss="modal">I Got It</button>
            </div>
         </div>
      </div>
   </div>
</template>

<style scoped>
.modal-content {
   background-color: var(--dark-card-bg);
   color: var(--dark-text-color);
   border: 1px solid var(--dark-border-color);
   border-radius: 1rem;
}

body.light-mode .modal-content {
   background-color: var(--light-card-bg);
   color: var(--light-text-color);
   border-color: var(--light-border-color);
}
</style>