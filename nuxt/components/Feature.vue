<template>
   <div class="row mt-4">
      <div class="col-12 text-center">
         <h2 class="main-title mb-3">Why Choose Our Gateway?</h2>
         <p class="section-subtitle">
            Discover the powerful features that make our service the best choice for your communication needs.
         </p>
      </div>

      <div class="col-12 col-md-6 col-lg-4 mb-4">
         <div class="content-card feature-card h-100 rounded-3 p-4 text-center">
            <div class="feature-icon-wrapper"><i class="bi bi-code feature-icon text-white"></i></div>
            <h5 class="feature-title">Complete REST API</h5>
            <p class="feature-description">Easily integrate with your existing systems using our clear API
               documentation and ready-to-use code examples.</p>
         </div>
      </div>

      <div class="col-12 col-md-6 col-lg-4 mb-4">
         <div class="content-card feature-card h-100 rounded-3 p-4 text-center">
            <div class="feature-icon-wrapper"><i class="bi bi-rocket-takeoff feature-icon text-white"></i></div>
            <h5 class="feature-title">Fast & Reliable Delivery</h5>
            <p class="feature-description">Our robust infrastructure ensures your messages are delivered instantly
               with a high success rate.</p>
         </div>
      </div>

      <div class="col-12 col-md-6 col-lg-4 mb-4">
         <div class="content-card feature-card h-100 rounded-3 p-4 text-center">
            <div class="feature-icon-wrapper"><i class="bi bi-qr-code-scan feature-icon text-white"></i></div>
            <h5 class="feature-title">Stable Connection</h5>
            <p class="feature-description">Scan the QR code just once. Your WhatsApp account stays connected and
               ready to use 24/7, no re-scans needed.</p>
         </div>
      </div>

      <div class="col-12 col-md-6 col-lg-4 mb-4">
         <div class="content-card feature-card h-100 rounded-3 p-4 text-center">
            <div class="feature-icon-wrapper"><i class="bi bi-broadcast feature-icon text-white"></i></div>
            <h5 class="feature-title">Broadcast & Automation</h5>
            <p class="feature-description">Send bulk messages to your contact lists or create automated reply flows
               to improve your efficiency.</p>
         </div>
      </div>

      <div class="col-12 col-md-6 col-lg-4 mb-4">
         <div class="content-card feature-card h-100 rounded-3 p-4 text-center">
            <div class="feature-icon-wrapper"><i class="bi bi-pie-chart feature-icon text-white"></i></div>
            <h5 class="feature-title">Intuitive Dashboard</h5>
            <p class="feature-description">Monitor delivery status, view message history, and manage your connected
               devices from one easy-to-use dashboard.</p>
         </div>
      </div>

      <div class="col-12 col-md-6 col-lg-4 mb-4">
         <div class="content-card feature-card h-100 rounded-3 p-4 text-center">
            <div class="feature-icon-wrapper"><i class="bi bi-tv feature-icon text-white"></i></div>
            <h5 class="feature-title">Multi-Device Support</h5>
            <p class="feature-description">Connect multiple WhatsApp numbers to a single account and manage them all
               from one centralized platform.</p>
         </div>
      </div>

   </div>
</template>

<style scoped>
.feature-card .feature-icon-wrapper {
   display: inline-flex;
   align-items: center;
   justify-content: center;
   width: 60px;
   height: 60px;
   border-radius: 50%;
   margin-bottom: 1.5rem;
   background-color: var(--dark-primary-accent);
}

.feature-card .feature-icon {
   font-size: 1.75rem;
   line-height: 1;
}

.feature-card {
   transition: transform 0.2s, box-shadow 0.2s;
   border: 1px solid var(--dark-border-color);
}

body.light-mode .feature-card {
   border: 1px solid var(--light-border-color);
}

.section-subtitle {
   font-size: 1.1rem;
   color: var(--dark-secondary-text-color);
   max-width: 650px;
   margin-left: auto;
   margin-right: auto;
   margin-bottom: 2.5rem;
}

body.light-mode .section-subtitle {
   color: #6c757d;
}

.feature-title {
   font-weight: 600;
   font-size: 1.25rem;
   margin-bottom: 0.5rem;
}

.feature-description {
   color: var(--dark-secondary-text-color);
   font-size: 0.9rem;
   margin-bottom: 0;
}

body.light-mode .feature-description {
   color: var(--light-text-color);
   opacity: 0.8;
}

.feature-card:hover {
   transform: translateY(-5px);
   box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

body.light-mode .feature-card:hover {
   box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}
</style>