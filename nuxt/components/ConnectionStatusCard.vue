<template>
   <div class="content-card rounded-3 connect-display-card">
      <div class="card-header-custom">
         <h5 class="main-title mb-0">Connection Status</h5>
      </div>
      <div class="card-body-custom d-flex flex-column align-items-center justify-content-center text-center">
         <div v-if="!loading && !qrCode && !pairingCode" class="py-5">
            <i class="bi bi-qr-code-scan display-1 text-secondary"></i>
            <p class="mt-3 text-secondary">Click "Start" on the control panel to begin the connection process.</p>
         </div>
         <div v-if="loading" class="py-5">
            <div class="loader-spinner"></div>
            <p class="mt-3">Waiting for connection...</p>
         </div>
         <div v-if="qrCode" class="qr-code-wrapper">
            <p class="fw-bold">Scan this QR code</p><img :src="`data:image/png;base64,${qrCode}`" alt="QR Code" class="img-fluid rounded">
         </div>
         <div v-if="pairingCode" class="pairing-code-wrapper">
            <p class="fw-bold">Enter this code in your WhatsApp</p>
            <div class="pairing-code-boxes">
               <span v-for="(char, index) in pairingCode.split('')" :key="index" class="code-box">{{ char }}</span>
            </div>
         </div>
         <div class="alert mt-3 w-100" v-if="statusMessage" :class="`alert-${statusType}`" role="alert">{{ statusMessage }}</div>
      </div>
   </div>
</template>

<script setup>
const props = defineProps({
   loading: Boolean,
   qrCode: String,
   pairingCode: String,
   statusMessage: String,
   statusType: String,
})
</script>

<style scoped>
.connect-display-card .card-body-custom {
   min-height: 350px;
}
.qr-code-wrapper img {
   max-width: 250px;
}
.pairing-code-boxes {
   display: flex;
   gap: 0.5rem;
   flex-wrap: wrap;
   justify-content: center;
}
.code-box {
   display: flex;
   align-items: center;
   justify-content: center;
   width: 27px;
   height: 27px;
   background-color: var(--dark-bg);
   border: 1px solid var(--dark-border-color);
   border-radius: .375rem;
   font-family: 'Hanken Grotesk', sans-serif;
   font-size: 15px;
   font-weight: 700;
   color: var(--dark-primary-accent);
}
body.light-mode .code-box {
   background-color: var(--light-bg);
   border-color: var(--light-border-color);
   color: var(--light-primary);
}
</style>