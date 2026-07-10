<template>
   <div class="container px-3 my-4">
      <div class="row justify-content-center">
         <div class="col-12 col-md-7 col-lg-6">
            <div class="text-center mb-4">
               <h1 class="main-title mb-1">Reset Password</h1>
               <p class="text-secondary">Create a new, strong password for your account.</p>
            </div>

            <div class="content-card p-4 p-md-5 rounded-3">

               <div v-if="isVerifying" class="text-center py-4">
                  <div class="loader-spinner mb-3"></div>
                  <p class="text-secondary mb-0">Verifying your secure link...</p>
               </div>

               <div v-else-if="!isTokenValid" class="text-center py-4">
                  <div class="error-icon-wrapper mb-3">
                     <i class="bi bi-x-lg"></i>
                  </div>
                  <h5 class="text-danger mb-2">Link Expired or Invalid</h5>
                  <p class="text-secondary small mb-4">
                     This password reset link is no longer valid. It may have expired or already been used.
                  </p>
                  <NuxtLink to="/auth/forgot" class="btn btn-custom-accent w-100">
                     Request New Link
                  </NuxtLink>
                  <div class="mt-3">
                     <NuxtLink to="/auth/login" class="back-link">Back to Login</NuxtLink>
                  </div>
               </div>

               <form v-else @submit.prevent="handleReset">
                  <div class="mb-3">
                     <label for="password" class="form-label">New Password</label>
                     <div class="input-group input-group-password">
                        <input :type="passwordFieldType" class="form-control" id="password" v-model="password"
                           placeholder="Enter new password" :class="{ 'is-invalid': passwordError }">
                        <button class="btn btn-outline-secondary input-icon-button" type="button"
                           @click="togglePasswordVisibility">
                           <i class="bi" :class="showPassword ? 'bi-eye' : 'bi-eye-slash'"></i>
                        </button>
                     </div>

                     <div class="mt-2" v-if="password.length > 0">
                        <div class="progress" style="height: 5px;">
                           <div class="progress-bar" role="progressbar"
                              :class="`bg-${passwordStrength === 3 ? 'success' : passwordStrength === 2 ? 'warning' : 'danger'}`"
                              :style="`width: ${passwordStrength * 33.33}%`"></div>
                        </div>
                        <small class="form-text"
                           :class="`text-${passwordStrength === 3 ? 'success' : passwordStrength === 2 ? 'warning' : 'danger'}`">
                           Strength: {{ passwordStrengthText }}
                           <span v-if="passwordStrength < 3" class="text-danger">(Required Strong)</span>
                        </small>
                     </div>
                  </div>

                  <div class="mb-4">
                     <label for="confirmPassword" class="form-label">Confirm Password</label>
                     <div class="input-group input-group-password">
                        <input :type="confirmPasswordFieldType" class="form-control" id="confirmPassword"
                           v-model="confirmPassword" placeholder="Repeat new password"
                           :class="{ 'is-invalid': confirmError }">
                        <button class="btn btn-outline-secondary input-icon-button" type="button"
                           @click="toggleConfirmPasswordVisibility">
                           <i class="bi" :class="showConfirmPassword ? 'bi-eye' : 'bi-eye-slash'"></i>
                        </button>
                     </div>
                     <div v-if="confirmError" class="invalid-feedback">
                        {{ confirmError }}
                     </div>
                  </div>

                  <button type="submit" class="btn btn-custom-accent w-100 mb-3" :disabled="loading || !isFormValid">
                     <span v-if="loading" class="spinner-border spinner-border-sm me-1" role="status"></span>
                     {{ loading ? 'Resetting...' : 'Reset Password' }}
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Swal from 'sweetalert2'

const config = useRuntimeConfig()
useHead({ title: 'Reset Password', titleTemplate: `%s - ${config.public.title}` })

const { $api } = useNuxtApp()
const route = useRoute()
const router = useRouter()

const isVerifying = ref(true)
const isTokenValid = ref(false)

const token = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const passwordFieldType = computed(() => showPassword.value ? 'text' : 'password')
const confirmPasswordFieldType = computed(() => showConfirmPassword.value ? 'text' : 'password')

const togglePasswordVisibility = () => showPassword.value = !showPassword.value
const toggleConfirmPasswordVisibility = () => showConfirmPassword.value = !showConfirmPassword.value

const passwordStrength = ref(0)
const passwordStrengthText = computed(() => {
   if (passwordStrength.value === 3) return 'Strong'
   if (passwordStrength.value === 2) return 'Medium'
   if (passwordStrength.value === 1) return 'Weak'
   return ''
})

const checkPasswordStrength = (p: string) => {
   let strength = 0
   if (p.length >= 8) strength = 1
   if (p.length >= 8 && /[A-Z]/.test(p)) strength++
   if (p.length >= 8 && /\d/.test(p)) strength++
   if (strength > 3) strength = 3
   passwordStrength.value = strength
}

watch(password, (val) => {
   checkPasswordStrength(val)
})

const passwordError = computed(() => {
   if (password.value.length > 0 && passwordStrength.value < 3) return true
   return false
})

const confirmError = computed(() => {
   if (confirmPassword.value.length > 0 && confirmPassword.value !== password.value) {
      return "Passwords do not match."
   }
   return null
})

const isFormValid = computed(() => {
   return token.value &&
      passwordStrength.value === 3 &&
      password.value === confirmPassword.value &&
      password.value.length > 0
})

const verifyToken = async (tokenToCheck: string) => {
   isVerifying.value = true
   try {
      const response = await $api('/action/verify-token', {
         method: 'POST',
         body: { token: tokenToCheck }
      })

      if (response.status) {
         isTokenValid.value = true
      } else {
         isTokenValid.value = false
      }
   } catch (error) {
      console.error('Token verification failed:', error)
      isTokenValid.value = false
   } finally {
      setTimeout(() => {
         isVerifying.value = false
      }, 500)
   }
}

onMounted(() => {
   watch(
      () => route.query.token,
      (newQueryToken) => {
         const extractedToken = Array.isArray(newQueryToken) ? newQueryToken[0] : newQueryToken

         if (!extractedToken) {
            isVerifying.value = false
            isTokenValid.value = false
         } else {
            if (token.value !== String(extractedToken)) {
               token.value = String(extractedToken)
               verifyToken(token.value)
            }
         }
      },
      { immediate: true }
   )
})

const handleReset = async () => {
   if (!isFormValid.value) return

   loading.value = true

   try {
      const response = await $api('/action/reset-password', {
         method: 'POST',
         body: {
            token: token.value,
            password: password.value,
            confirm: confirmPassword.value
         }
      })

      if (response.status) {
         Swal.fire({
            icon: 'success',
            title: 'Password Reset Successful',
            text: 'You can now log in with your new password.',
            confirmButtonText: 'Login Now',
            allowOutsideClick: false
         }).then(() => {
            router.push('/auth/login')
         })
      } else {
         throw { data: response }
      }
   } catch (error: any) {
      Swal.fire({
         icon: 'error',
         title: 'Reset Failed',
         text: error.data?.message || error.message || 'Failed to reset password.'
      })
   } finally {
      loading.value = false
   }
}
</script>

<style scoped>
.loader-spinner {
   width: 40px;
   height: 40px;
   border: 3px solid var(--dark-border-color);
   border-bottom-color: var(--dark-primary-accent);
   border-radius: 50%;
   display: inline-block;
   animation: rotation 1s linear infinite;
}

body.light-mode .loader-spinner {
   border-color: var(--light-border-color);
   border-bottom-color: var(--light-primary);
}

@keyframes rotation {
   0% {
      transform: rotate(0deg);
   }

   100% {
      transform: rotate(360deg);
   }
}

.error-icon-wrapper {
   width: 60px;
   height: 60px;
   border-radius: 50%;
   background-color: rgba(220, 53, 69, 0.1);
   color: #dc3545;
   display: flex;
   align-items: center;
   justify-content: center;
   margin: 0 auto;
   font-size: 2rem;
}

.input-group-password {
   border: 1px solid var(--dark-border-color);
   border-radius: .375rem;
   transition: border-color .15s ease-in-out, box-shadow .15s ease-in-out;
}

.input-group-password .form-control,
.input-group-password .input-icon-button {
   border: none;
   box-shadow: none;
}

.input-group-password:focus-within {
   border-color: var(--dark-primary-accent);
}

body.light-mode .input-group-password {
   border-color: var(--light-border-color);
}

body.light-mode .input-group-password:focus-within {
   border-color: var(--light-primary);
}

.input-icon-button {
   background-color: transparent;
}

.input-icon-button i {
   font-weight: normal !important;
}

.form-control.is-invalid {
   border-color: #dc3545 !important;
   background-image: none;
}

.input-group-password:has(.is-invalid) {
   border-color: #dc3545 !important;
}

.invalid-feedback {
   display: block;
   color: #dc3545;
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

.progress {
   background-color: var(--dark-border-color);
   transition: background-color .3s;
}

body.light-mode .progress {
   background-color: var(--light-border-color);
}

.progress-bar.bg-danger {
   background-color: #dc3545 !important;
}

.progress-bar.bg-warning {
   background-color: #ffc107 !important;
}

.progress-bar.bg-success {
   background-color: var(--dark-primary-accent) !important;
}

body.light-mode .progress-bar.bg-success {
   background-color: var(--light-primary) !important;
}

.form-text.text-danger {
   color: #dc3545 !important;
}

.form-text.text-warning {
   color: #f3e970 !important;
}

.form-text.text-success {
   color: var(--dark-primary-accent) !important;
}

body.light-mode .form-text.text-danger {
   color: #dc3545 !important;
}

body.light-mode .form-text.text-warning {
   color: #664d03 !important;
}

body.light-mode .form-text.text-success {
   color: var(--light-primary) !important;
}

.progress+.form-text {
   font-size: 0.75rem;
   margin-top: 0.3rem !important;
}
</style>
