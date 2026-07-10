<template>
   <div class="container px-3 my-4">
      <div class="row justify-content-center">
         <div class="col-12 col-md-7 col-lg-6">
            <div class="text-center mb-4">
               <h1 class="main-title mb-1">Forgot Password?</h1>
               <p class="text-secondary">Choose how you want to reset your password.</p>
            </div>

            <div class="content-card p-4 p-md-5 rounded-3">
               <form @submit.prevent="handleForgot">

                  <div class="btn-group form-type-selector w-100 mb-4" role="group">
                     <input type="radio" class="btn-check" name="reset-method" id="method-email" value="email"
                        v-model="selectedMethod" autocomplete="off">
                     <label class="btn btn-outline-custom-accent" for="method-email">
                        Email
                     </label>

                     <input type="radio" class="btn-check" name="reset-method" id="method-whatsapp" value="whatsapp"
                        v-model="selectedMethod" autocomplete="off">
                     <label class="btn btn-outline-custom-accent" for="method-whatsapp">
                        WhatsApp
                     </label>
                  </div>

                  <div class="mb-4">
                     <label for="email" class="form-label">Email Address</label>
                     <input type="email" class="form-control" :class="{ 'is-invalid': emailError }" id="email"
                        v-model="email" placeholder="Enter your registered email">
                     <div v-if="emailError" class="invalid-feedback">
                        {{ emailError }}
                     </div>
                  </div>

                  <Transition name="fade">
                     <div v-if="selectedMethod === 'whatsapp'" class="alert alert-warning d-flex align-items-start mb-4"
                        role="alert">
                        <i class="bi bi-exclamation-triangle-fill me-2 mt-1"></i>
                        <div class="small">
                           <strong>Important:</strong> The password reset link will be sent to the <strong>Owner's
                              WhatsApp number</strong>. Please ensure the Bot is currently active/connected to receive
                           the message.
                        </div>
                     </div>
                  </Transition>

                  <div class="mb-4">
                     <Challenge v-if="challengeStore.salt" :challenge="challengeStore.challengeString"
                        :difficulty="challengeStore.difficulty" :bind-context="JSON.stringify(payloadForChallenge)"
                        @verified="onChallengeVerified" />
                  </div>

                  <button type="submit" class="btn btn-custom-accent w-100 mb-3"
                     :disabled="loading || (challengeStore.salt !== null && !challengeStore.isVerified)">
                     <span v-if="loading" class="spinner-border spinner-border-sm me-1" role="status"></span>
                     {{ loading ? 'Sending...' : (selectedMethod === 'whatsapp' ? 'Send to WhatsApp' : 'Send to Email')
                     }}
                  </button>

                  <div class="text-center">
                     <NuxtLink to="/auth/login" class="back-link">
                        <i class="bi bi-arrow-left me-1"></i> Back to Login
                     </NuxtLink>
                  </div>
               </form>
            </div>
         </div>
      </div>
   </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted } from 'vue'
import Swal from 'sweetalert2'
import { useChallengeStore } from '~/stores/challenge'
import CryptoJS from 'crypto-js'
import type { Pinia } from 'pinia'

const config = useRuntimeConfig()
useHead({ title: 'Forgot Password', titleTemplate: `%s - ${config.public.title}` })

const { $api, $pinia } = useNuxtApp()
const challengeStore = useChallengeStore($pinia as Pinia)

const loading = ref(false)
const email = ref('')
const emailError = ref<string | null>(null)
const selectedMethod = ref<'email' | 'whatsapp'>('email')

const isEmailValid = computed(() => emailError.value === null && email.value.trim().length > 0)

const payloadForChallenge = computed(() => ({
   email: email.value,
   via: selectedMethod.value
}))

const validateEmail = (value: string) => {
   if (!value || value.trim() === '') {
      emailError.value = 'Email is required.'
      return
   }
   if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      emailError.value = 'Enter a valid email address.'
      return
   }
   emailError.value = null
}

watch(email, (newValue) => {
   validateEmail(newValue)
})

watch(selectedMethod, () => {
   challengeStore.clearChallenge()
})

const onChallengeVerified = (nonce: number) => {
   challengeStore.setVerified(nonce)
   handleForgot()
}

const handleForgot = async () => {
   validateEmail(email.value)

   if (!isEmailValid.value) {
      return
   }

   if (challengeStore.salt && !challengeStore.isVerified) return

   loading.value = true

   const payload = payloadForChallenge.value

   const headers: Record<string, string> = {}

   if (challengeStore.isVerified) {
      const challengeData = {
         ...challengeStore.getChallengePayload,
         context: JSON.stringify(payload)
      }
      const rawJson = JSON.stringify(challengeData)
      const encryptedPayload = CryptoJS.AES.encrypt(rawJson, config.public.cp).toString()
      headers['x-request-challenge'] = encryptedPayload
   }

   try {
      const response = await $api('/action/forgot-password', {
         method: 'POST',
         body: payload,
         headers: headers
      })

      if (response.status) {
         challengeStore.clearChallenge()

         const successMessage = selectedMethod.value === 'whatsapp'
            ? 'We have sent the reset link to the Owner\'s WhatsApp number.'
            : 'We have sent password reset instructions to your email.'

         Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: response.message || successMessage,
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true
         })
      } else {
         throw { data: response }
      }
   } catch (error: any) {
      if (error.response && error.response.status === 428) {
         const challengeHeader = error.response.headers.get('x-response-challenge')
         if (challengeHeader) {
            try {
               const bytes = CryptoJS.AES.decrypt(challengeHeader, config.public.cp)
               const decryptedString = bytes.toString(CryptoJS.enc.Utf8)
               const d = JSON.parse(decryptedString)

               challengeStore.setChallenge({
                  salt: d.salt,
                  ts: d.ts,
                  difficulty: d.difficulty,
                  context: JSON.stringify(payload),
                  token: d.token
               })
            } catch (e) {
               Swal.fire({
                  toast: true,
                  position: 'top-end',
                  icon: 'error',
                  title: 'Security challenge decryption failed.',
                  showConfirmButton: false,
                  timer: 1000,
                  timerProgressBar: true
               })
            }
         }
      } else {
         challengeStore.clearChallenge()
         Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'error',
            title: error.data?.message || 'An error occurred while processing your request.',
            showConfirmButton: false,
            timer: 1000,
            timerProgressBar: true
         })
      }
   } finally {
      loading.value = false
   }
}

onMounted(() => {
   challengeStore.clearChallenge()
})
</script>

<style scoped>
.form-type-selector .btn-outline-custom-accent {
   --bs-btn-color: var(--dark-secondary-text-color);
   --bs-btn-border-color: var(--dark-border-color);
   --bs-btn-hover-bg: var(--dark-border-color);
   --bs-btn-hover-color: var(--dark-text-color);
   --bs-btn-active-bg: var(--dark-primary-accent);
   --bs-btn-active-border-color: var(--dark-primary-accent);
   --bs-btn-active-color: #000
}

.form-type-selector .btn-check:checked+.btn-outline-custom-accent {
   background-color: var(--dark-primary-accent);
   border-color: var(--dark-primary-accent);
   color: #000
}

body.light-mode .form-type-selector .btn-outline-custom-accent {
   --bs-btn-color: #6c757d;
   --bs-btn-border-color: var(--light-border-color);
   --bs-btn-hover-bg: #e9ecef;
   --bs-btn-hover-color: var(--light-text-color);
   --bs-btn-active-bg: var(--light-primary);
   --bs-btn-active-border-color: var(--light-primary);
   --bs-btn-active-color: #fff
}

body.light-mode .form-type-selector .btn-check:checked+.btn-outline-custom-accent {
   background-color: var(--light-primary);
   border-color: var(--light-primary);
   color: #fff
}

.form-control.is-invalid {
   border-color: #dc3545 !important;
}

.invalid-feedback {
   display: block;
   color: #e3828c;
   font-size: 0.8rem;
   margin-top: 0.25rem;
}

body.light-mode .invalid-feedback {
   color: #dc3545;
}

.back-link {
   color: var(--dark-secondary-text-color);
   text-decoration: none;
   font-size: 0.9rem;
   transition: color 0.2s ease;
}

.back-link:hover {
   color: var(--dark-primary-accent);
}

body.light-mode .back-link {
   color: #6c757d;
}

body.light-mode .back-link:hover {
   color: var(--light-primary);
}

.alert-warning {
   background-color: rgba(255, 193, 7, 0.15);
   border-color: rgba(255, 193, 7, 0.3);
   color: #ffc107;
}

body.light-mode .alert-warning {
   background-color: #fff3cd;
   border-color: #ffecb5;
   color: #664d03;
}

.fade-enter-active,
.fade-leave-active {
   transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
   opacity: 0;
}
</style>
