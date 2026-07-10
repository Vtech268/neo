<template>
   <div class="container px-3 my-4">
      <div class="text-center mb-4">
         <h1 class="main-title mb-1">Welcome Back!</h1>
         <p class="text-secondary">Please sign in to access your {{ config.public.title }} dashboard</p>
      </div>
      <div class="row g-4">
         <div class="col-12 col-lg-6">
            <div class="content-card p-4 p-md-5 rounded-3">
               <div class="btn-group form-type-selector w-100 mb-4" role="group">
                  <input type="radio" class="btn-check" name="form-type" id="type-password" value="password"
                     v-model="selectedForm" autocomplete="off">
                  <label class="btn btn-outline-custom-accent" for="type-password">Login</label>
                  <input type="radio" class="btn-check" name="form-type" id="type-token" value="token"
                     v-model="selectedForm" autocomplete="off">
                  <label class="btn btn-outline-custom-accent" for="type-token">Token</label>
                  <input type="radio" class="btn-check" name="form-type" id="type-connect" value="connect"
                     v-model="selectedForm" autocomplete="off">
                  <label class="btn btn-outline-custom-accent" for="type-connect">Connect</label>
               </div>

               <Transition name="fade" mode="out-in">
                  <div v-if="selectedForm === 'password'" :key="'password'">
                     <form @submit.prevent="loginByPassword">
                        <div class="mb-3">
                           <label for="username" class="form-label">Username</label>
                           <input type="text" class="form-control" id="username" v-model="username"
                              placeholder="Enter your username">
                        </div>
                        <div class="mb-3">
                           <div class="d-flex justify-content-between align-items-center">
                              <label for="password" class="form-label mb-0">Password</label>
                              <NuxtLink to="/auth/forgot" class="forgot-password-link">Forgot Password?</NuxtLink>
                           </div>
                           <div class="input-group input-group-password mt-2">
                              <input :type="passwordFieldType" class="form-control" id="password" v-model="password"
                                 placeholder="Enter your password">
                              <button class="btn btn-outline-secondary input-icon-button" type="button"
                                 @click="togglePasswordVisibility">
                                 <i class="bi" :class="showPassword ? 'bi-eye' : 'bi-eye-slash'"></i>
                              </button>
                           </div>
                        </div>

                        <div class="form-check mb-4">
                           <input class="form-check-input" type="checkbox" id="loginAsOperator"
                              v-model="loginAsOperator">
                           <label class="form-check-label" for="loginAsOperator">Login as Operator</label>
                        </div>

                        <button type="submit" class="btn btn-custom-accent w-100" :disabled="loading">
                           <span v-if="loading" class="spinner-border spinner-border-sm me-1" role="status"></span>
                           {{ loading ? 'Processing...' : 'Log In' }}
                        </button>
                     </form>
                  </div>

                  <div v-else-if="selectedForm === 'token'" :key="'token'">
                     <div class="alert alert-info small">Use this method to quickly access your client dashboard.</div>
                     <form @submit.prevent="loginByToken">
                        <div class="mb-3">
                           <label for="token" class="form-label">Token</label>
                           <div class="input-group input-group-password">
                              <input :type="tokenFieldType" class="form-control" id="token" v-model="token"
                                 placeholder="Enter your token">
                              <button class="btn btn-outline-secondary input-icon-button" type="button"
                                 @click="toggleTokenVisibility">
                                 <i class="bi" :class="showToken ? 'bi-eye' : 'bi-eye-slash'"></i>
                              </button>
                           </div>
                        </div>
                        <button type="submit" class="btn btn-custom-accent w-100 mb-3" :disabled="loading">
                           <span v-if="loading" class="spinner-border spinner-border-sm me-1" role="status"></span>
                           {{ loading ? 'Processing...' : 'Log In' }}
                        </button>
                     </form>
                  </div>

                  <div v-else-if="selectedForm === 'connect'" :key="'connect'">
                     <form @submit.prevent="connectWhatsApp">
                        <div class="mb-3">
                           <label for="connectUsername" class="form-label">Username</label>
                           <input type="text" class="form-control" :class="{ 'is-invalid': usernameError }"
                              id="connectUsername" v-model="username" placeholder="e.g. ambatukam">
                           <div v-if="usernameError" class="invalid-feedback">
                              {{ usernameError }}
                           </div>
                        </div>
                        <div class="mb-3">
                           <label for="connectEmail" class="form-label">Email</label>
                           <input type="email" class="form-control" :class="{ 'is-invalid': emailError }"
                              id="connectEmail" v-model="email" placeholder="Enter your email address">
                           <div v-if="emailError" class="invalid-feedback">
                              {{ emailError }}
                           </div>
                        </div>
                        <div class="mb-3">
                           <label for="connectPassword" class="form-label">Password</label>
                           <div class="input-group input-group-password">
                              <input :type="passwordFieldType" class="form-control" id="connectPassword"
                                 v-model="password" placeholder="Set a password (min 8 char)">
                              <button class="btn btn-outline-secondary input-icon-button" type="button"
                                 @click="togglePasswordVisibility">
                                 <i class="bi" :class="showPassword ? 'bi-eye' : 'bi-eye-slash'"></i>
                              </button>
                           </div>
                           <div class="mt-2" v-if="password.length > 0">
                              <div class="progress" style="height: 5px;">
                                 <div class="progress-bar" role="progressbar"
                                    :class="`bg-${passwordStrength === 3 ? 'success' : passwordStrength === 2 ? 'warning' : 'danger'}`"
                                    :style="`width: ${passwordStrength * 33.33}%`" aria-valuenow="0" aria-valuemin="0"
                                    aria-valuemax="100"></div>
                              </div>
                              <small class="form-text"
                                 :class="`text-${passwordStrength === 3 ? 'success' : passwordStrength === 2 ? 'warning' : 'danger'}`">
                                 Strength: {{ passwordStrengthText }}
                                 <span v-if="password.length > 0 && passwordStrength < 3" class="text-danger">(Required
                                    Strong)</span>
                              </small>
                           </div>
                        </div>

                        <div class="mb-3">
                           <label for="whatsappNumber" class="form-label">Bot Number</label>
                           <input type="number" class="form-control" id="whatsappNumber" v-model="waConnect.number"
                              placeholder="e.g. 62812xxxx" :disabled="waConnect.loading">
                        </div>
                        <div class="mb-3">
                           <label for="ownerNumber" class="form-label">Owner Number</label>
                           <input type="number" class="form-control" id="ownerNumber" v-model="waConnect.owner"
                              placeholder="e.g. 62812xxxx" :disabled="waConnect.loading || waConnect.sameAsNumber">
                           <div class="form-check mt-2">
                              <input class="form-check-input" type="checkbox" id="sameAsNumberCheck"
                                 v-model="waConnect.sameAsNumber">
                              <label class="form-check-label" for="sameAsNumberCheck">Same as Bot Number</label>
                           </div>
                        </div>
                        <div class="mb-3">
                           <label for="bot_type" class="form-label">Bot Type</label>
                           <select class="form-select" id="bot_type" v-model="waConnect.bot_type"
                              :disabled="waConnect.loading">
                              <option v-for="type in bot_types" :key="type.id" :value="type.id">
                                 {{ type.name }}
                              </option>
                           </select>
                        </div>
                        <div class="mb-4">
                           <label class="form-label d-block mb-2">Connection Method</label>
                           <div class="connection-method btn-group w-100" role="group">
                              <input type="radio" class="btn-check" name="connection-method" id="scan-qr" value="qr"
                                 v-model="waConnect.method" autocomplete="off"
                                 :disabled="waConnect.loading || !!waConnect.pairingCode">
                              <label class="btn btn-outline-secondary" for="scan-qr">
                                 <i class="bi bi-qr-code me-2"></i>Scan QR
                              </label>
                              <input type="radio" class="btn-check" name="connection-method" id="pairing-code"
                                 value="pairing" v-model="waConnect.method" autocomplete="off"
                                 :disabled="waConnect.loading">
                              <label class="btn btn-outline-secondary" for="pairing-code">
                                 <i class="bi bi-phone-flip me-2"></i>Pairing Code
                              </label>
                           </div>
                        </div>

                        <div class="mb-4">
                           <Challenge v-if="challengeStore.salt" :challenge="challengeStore.challengeString"
                              :difficulty="challengeStore.difficulty"
                              :bind-context="JSON.stringify(payloadForChallenge)" @verified="onChallengeVerified" />
                        </div>

                        <button type="submit" class="btn btn-custom-accent w-100"
                           :disabled="waConnect.loading || !!waConnect.qrCode || !!waConnect.pairingCode || (challengeStore.salt !== null && !challengeStore.isVerified) || (selectedForm === 'connect' && (!isUsernameValid || !isEmailValid || passwordStrength < 3))">
                           <span v-if="waConnect.loading" class="spinner-border spinner-border-sm me-1"
                              role="status"></span>
                           {{ waConnect.loading ? 'Connecting...' : 'Start Connect' }}
                        </button>
                     </form>
                  </div>
               </Transition>
            </div>
         </div>
         <div class="col-12 col-lg-6">
            <div class="content-card rounded-3 connect-display-card">
               <div class="card-header-custom">
                  <h5 class="main-title mb-0">Connection Status</h5>
               </div>
               <div class="card-body-custom d-flex flex-column align-items-center justify-content-center text-center">
                  <div v-if="!waConnect.loading && !waConnect.qrCode && !waConnect.pairingCode" class="py-5">
                     <i class="bi bi-qr-code-scan display-1 text-secondary"></i>
                     <p class="mt-3 text-secondary">QR Code or Pairing Code will appear here.</p>
                  </div>
                  <div v-if="waConnect.loading" class="py-5">
                     <div class="loader-spinner"></div>
                     <p class="mt-3">Waiting for connection...</p>
                  </div>
                  <div v-if="waConnect.qrCode" class="qr-code-wrapper">
                     <p class="fw-bold">Scan this QR code with your WhatsApp</p>
                     <img :src="`data:image/png;base64,${waConnect.qrCode}`" alt="QR Code" class="img-fluid rounded">
                     <p class="text-danger mt-3 fs-6" v-if="waConnect.status.message !== 'info'">Don't close this page
                        until you are connected!</p>
                  </div>
                  <div v-if="waConnect.pairingCode" class="pairing-code-wrapper">
                     <p class="fw-bold">Enter this code in your WhatsApp</p>
                     <div class="pairing-code-boxes">
                        <span v-for="(char, index) in waConnect.pairingCode.split('')" :key="index" class="code-box">{{
                           char }}</span>
                     </div>
                     <p class="text-danger mt-3 fs-6" v-if="waConnect.status.message !== 'info'">Don't close this page
                        until you are connected!</p>
                  </div>
                  <div class="alert mt-3 w-100" v-if="waConnect.status.message"
                     :class="`alert-${waConnect.status.type}`" role="alert">{{ waConnect.status.message }}</div>
               </div>
            </div>
         </div>
      </div>
   </div>
</template>
<script setup lang="ts">
import { ref, onMounted, reactive, onUnmounted, watch, computed } from 'vue'
import Swal from 'sweetalert2'
import { useAuth } from '@/composables/useAuth'
import { useChallengeStore } from '~/stores/challenge'
import CryptoJS from 'crypto-js'
import type { Pinia } from 'pinia'

const config = useRuntimeConfig()
useHead({ title: 'Login', titleTemplate: `%s - ${config.public.title}` })

const { setAuth } = useAuth()
const { $api, $pinia } = useNuxtApp()
const router = useRouter()
const socket = useSocket()
const challengeStore = useChallengeStore($pinia as Pinia)

const selectedForm = ref<'password' | 'token' | 'connect'>('password')
const loading = ref(false)
const email = ref('')
const username = ref('')
const password = ref('')
const loginAsOperator = ref(false)
const token = ref('')

const emailError = ref<string | null>(null)
const usernameError = ref<string | null>(null)

const isEmailValid = computed(() => emailError.value === null && email.value.trim().length > 0)
const isUsernameValid = computed(() => usernameError.value === null && username.value.trim().length > 0)

const validateEmail = (value: string) => {
   if (!value || value.trim() === '') {
      emailError.value = 'Email is required.'
      return
   }
   if (!/^[^\s@]+@gmail\.com$/.test(value)) {
      emailError.value = 'Enter a valid Gmail address (e.g., example@gmail.com).'
      return
   }
   emailError.value = null
}

const validateUsername = (value: string) => {
   if (!value || value.trim() === '') {
      usernameError.value = 'Username is required.'
      return
   }
   if (value.length < 6 || value.length > 25) {
      usernameError.value = 'Username must be between 6 and 25 characters.'
      return
   }
   if (!/^[a-zA-Z0-9_.]+$/.test(value)) {
      usernameError.value = 'Username can only contain letters, numbers, underscores, and dots.'
      return
   }
   usernameError.value = null
}

watch(email, (newValue) => {
   if (selectedForm.value === 'connect') {
      validateEmail(newValue)
   }
})

watch(username, (newValue) => {
   if (selectedForm.value === 'connect') {
      validateUsername(newValue)
   }
})

const showPassword = ref(false)
const showToken = ref(false)

const passwordFieldType = computed(() => showPassword.value ? 'text' : 'password')
const tokenFieldType = computed(() => showToken.value ? 'text' : 'password')

const passwordMinLength = 8
const passwordStrength = ref(0)
const passwordStrengthText = computed(() => {
   if (passwordStrength.value === 3) return 'Strong'
   if (passwordStrength.value === 2) return 'Medium'
   if (passwordStrength.value === 1) return 'Weak'
   return ''
})

const checkPasswordStrength = (p: string) => {
   let strength = 0
   if (p.length >= passwordMinLength) strength = 1
   if (p.length >= passwordMinLength && /[A-Z]/.test(p)) strength++
   if (p.length >= passwordMinLength && /\d/.test(p)) strength++

   if (strength > 3) strength = 3
   passwordStrength.value = strength
}

const togglePasswordVisibility = () => {
   showPassword.value = !showPassword.value
}
const toggleTokenVisibility = () => {
   showToken.value = !showToken.value
}

const bot_types = computed(() => {
   return config.public.bot_type as any
})

const payloadForChallenge = computed(() => ({
   number: waConnect.number,
   owner: waConnect.owner,
   method: waConnect.method,
   bot_type: waConnect.bot_type,
   email: email.value,
   username: username.value,
   password: password.value
}))

const waConnect = reactive({
   number: '',
   owner: '',
   sameAsNumber: true,
   method: 'qr',
   bot_type: 'original',
   qrCode: '',
   pairingCode: '',
   status: { type: 'info', message: '' },
   loading: false,
   listeningTo: '',
})

watch(() => waConnect.sameAsNumber, (isSame) => {
   if (isSame) waConnect.owner = waConnect.number
})
watch(() => waConnect.number, (newNumber) => {
   if (waConnect.sameAsNumber) waConnect.owner = newNumber
})

watch(selectedForm, (newForm, oldForm) => {
   passwordStrength.value = 0
   usernameError.value = null
   emailError.value = null

   if (newForm !== oldForm) {
      email.value = ''
      username.value = ''
      password.value = ''
   }

   if (newForm !== 'connect') {
      waConnect.qrCode = ''
      waConnect.pairingCode = ''
      waConnect.status.message = ''
      waConnect.loading = false
      challengeStore.clearChallenge()

      if (socket && waConnect.listeningTo) {
         socket.off(`connect.${waConnect.listeningTo}`)
         socket.off(`status.${waConnect.listeningTo}`)
         waConnect.listeningTo = ''
      }
   } else {
      challengeStore.clearChallenge()
   }
})

watch(password, (newPassword) => {
   if (selectedForm.value === 'connect') {
      checkPasswordStrength(newPassword)
   }
})

const onWaUpdate = (data: { jid: string, qr: string, code: string }) => {
   waConnect.loading = false
   if (data.qr) {
      waConnect.qrCode = data.qr
      waConnect.pairingCode = ''
      waConnect.status = { type: 'info', message: 'Please scan the QR code.' }
   }
   if (data.code) {
      waConnect.qrCode = ''
      waConnect.pairingCode = data.code
      waConnect.status = { type: 'info', message: 'Enter the code on your device.' }
   }
}

const onStatusUpdate = (data: { jid: string, status: string, message: string }) => {
   waConnect.loading = false
   waConnect.qrCode = ''
   waConnect.pairingCode = ''
   if (data.status === 'success') {
      waConnect.status = { type: 'success', message: data.message }
   } else {
      waConnect.status = { type: 'danger', message: data.message }
   }
}

onMounted(() => {
   waConnect.method = 'qr'
})

onUnmounted(() => {
   if (socket && waConnect.listeningTo) {
      socket.off(`connect.${waConnect.number}`, onWaUpdate)
      socket.off(`status.${waConnect.number}`, onStatusUpdate)
   }
})

const navigateOnSuccess = () => {
   Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Login successful!',
      showConfirmButton: false,
      timer: 1000,
      timerProgressBar: true,
      willClose: () => router.push('/dashboard')
   })
}

const handleLoginError = (e: any) => {
   Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'error',
      title: e.data?.message || 'Something went wrong!',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
   })
}

const loginByPassword = async () => {
   if (!username.value || !password.value) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: 'Username and Password are required.', showConfirmButton: false, timer: 2000 })
      return
   }
   loading.value = true
   try {
      const payload = {
         username: username.value,
         password: password.value,
         type: loginAsOperator.value ? 1 : 2,
         isOperator: loginAsOperator.value
      }

      const json = await $api('/action/login', { method: 'POST', body: payload })
      if (!json.status) throw { data: json }
      setAuth({ token: json.data.token, type: String(json.data.type), jid: json.data.jid })
      navigateOnSuccess()
   } catch (e: any) {
      handleLoginError(e)
   } finally {
      loading.value = false
   }
}

const loginByToken = async () => {
   if (!token.value) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: 'Token is required.', showConfirmButton: false, timer: 2000 })
      return
   }
   loading.value = true
   try {
      const json = await $api('/action/login', { method: 'POST', body: { token: token.value, type: 2 } })
      if (!json.status) throw { data: json }
      setAuth({ token: json.data.token, type: String(json.data.type), jid: json.data.jid })
      navigateOnSuccess()
   } catch (e: any) {
      handleLoginError(e)
   } finally {
      loading.value = false
   }
}

const onChallengeVerified = (nonce: number) => {
   challengeStore.setVerified(nonce)
   connectWhatsApp()
}

const connectWhatsApp = async () => {
   validateEmail(email.value)
   validateUsername(username.value)

   if (!isEmailValid.value || !isUsernameValid.value || passwordStrength.value < 3 || !waConnect.number || !waConnect.owner) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: 'Please fill all fields correctly.', showConfirmButton: false, timer: 2000 })
      return
   }

   if (challengeStore.salt && !challengeStore.isVerified) return

   waConnect.loading = true

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
      const json = await $api('/action/connect', {
         method: 'POST',
         body: payload,
         headers: headers
      })
      if (json.status) {
         if (socket) {
            if (waConnect.listeningTo) {
               socket.off(`connect.${waConnect.listeningTo}`)
               socket.off(`status.${waConnect.listeningTo}`)
            }
            socket.on(`connect.${waConnect.number}`, onWaUpdate)
            socket.on(`status.${waConnect.number}`, onStatusUpdate)
            waConnect.listeningTo = waConnect.number
         }
         waConnect.qrCode = ''
         waConnect.pairingCode = ''
         waConnect.status = { type: 'info', message: '' }
         challengeStore.clearChallenge()
      } else {
         throw { data: json }
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

               waConnect.loading = false
            } catch (e) {
               waConnect.status = { type: 'danger', message: 'Security challenge decryption failed.' }
               waConnect.loading = false
            }
         }
      } else {
         waConnect.status = { type: 'danger', message: error.data?.message || 'Failed to start connection process.' }
         waConnect.loading = false
         challengeStore.clearChallenge()
      }
   }
}
</script>