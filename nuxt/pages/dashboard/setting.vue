<template>
   <div>
      <div class="container px-3 mb-4 mt-1">

         <div v-if="isLoading" class="text-center py-5">
            <div class="loader-spinner"></div>
            <p class="mt-3">Fetching data...</p>
         </div>

         <div v-else-if="isError" class="alert alert-danger">
            Failed to load settings. Please try again later.
         </div>

         <div v-else>
            <div v-if="type === '1' && setupData" class="content-card rounded-3 mb-4">
               <div class="card-header-custom">
                  <h5 class="main-title mb-0">Security</h5>
               </div>
               <div class="card-body-custom">
                  <div class="row g-3">
                     <div class="col-md-6">
                        <label for="sec-username" class="form-label">Admin Username</label>
                        <input type="text" id="sec-username" class="form-control"
                           :class="{ 'is-invalid': securityErrors.username }" v-model="setupData.username">
                        <div v-if="securityErrors.username" class="invalid-feedback-custom">{{ securityErrors.username
                           }}</div>
                     </div>
                     <div class="col-md-6">
                        <label for="sec-password" class="form-label">Admin Password</label>
                        <div class="input-group input-group-password">
                           <input :type="passwordFieldType" id="sec-password" class="form-control"
                              :class="{ 'is-invalid': securityErrors.password }" v-model="setupData.password"
                              placeholder="Enter new password or leave blank">
                           <button class="btn btn-outline-secondary input-icon-button" type="button"
                              @click="togglePasswordVisibility">
                              <i class="bi" :class="showPassword ? 'bi-eye' : 'bi-eye-slash'"></i>
                           </button>
                        </div>
                        <div v-if="securityErrors.password" class="invalid-feedback-custom">{{ securityErrors.password
                           }}</div>
                     </div>
                     <div class="col-12">
                        <label class="form-label">Operators</label>
                        <p class="form-text mt-0 mb-2">Enter operator numbers separated by commas. (e.g. 6285xxxx,
                           6287xxxx)</p>
                        <input type="text" class="form-control" :class="{ 'is-invalid': securityErrors.operators }"
                           v-model="localOperatorsInput" @input="updateOperators">
                        <div v-if="securityErrors.operators" class="invalid-feedback-custom">{{ securityErrors.operators
                           }}</div>
                     </div>
                     <div class="col-12">
                        <label for="ads" class="form-label">Ads</label>
                        <textarea id="ads" class="form-control" v-model="setupData.ads" rows="4"
                           placeholder="Enter your ads payload here..."></textarea>
                     </div>
                  </div>
                  <div class="text-end mt-4">
                     <button class="btn btn-custom-accent px-4" @click="saveSecuritySettings"
                        :disabled="isSavingSecurity">
                        <span v-if="isSavingSecurity" class="spinner-border spinner-border-sm me-2"></span>
                        {{ isSavingSecurity ? 'Saving...' : 'Save Security' }}
                     </button>
                  </div>
               </div>
            </div>

            <div v-if="type === '2' && credentialData" class="content-card rounded-3 mb-4">
               <div class="card-header-custom">
                  <h5 class="main-title mb-0">My Credentials</h5>
               </div>
               <div class="card-body-custom">
                  <div v-if="passwordIsRequired" class="alert alert-warning mb-4">
                     <strong>Security Alert:</strong> You have not set a password yet. Please create a strong password
                     to secure your account.
                  </div>

                  <form @submit.prevent="saveCredentialSettings">
                     <div class="row g-3">
                        <div class="col-md-6">
                           <label for="cred-username" class="form-label">Username</label>
                           <input type="text" id="cred-username" class="form-control"
                              :class="{ 'is-invalid': usernameError }" v-model="credentialData.username">
                           <div v-if="usernameError" class="invalid-feedback-custom">{{ usernameError }}</div>
                        </div>
                        <div class="col-md-6">
                           <label for="cred-email" class="form-label">Email</label>
                           <input type="email" id="cred-email" class="form-control"
                              :class="{ 'is-invalid': emailError }" v-model="credentialData.email">
                           <div v-if="emailError" class="invalid-feedback-custom">{{ emailError }}</div>
                        </div>
                        <div class="col-12">
                           <label for="cred-password" class="form-label">{{ passwordIsRequired ? 'Set Password' : 'New Password' }}</label>
                           <div class="input-group input-group-password">
                              <input :type="passwordFieldType" class="form-control" id="cred-password"
                                 v-model="credentialData.password"
                                 :placeholder="passwordIsRequired ? 'Create a strong password' : 'Leave blank to keep current password'">
                              <button class="btn btn-outline-secondary input-icon-button" type="button"
                                 @click="togglePasswordVisibility">
                                 <i class="bi" :class="showPassword ? 'bi-eye' : 'bi-eye-slash'"></i>
                              </button>
                           </div>
                           <div class="mt-2" v-if="credentialData.password.length > 0 || passwordIsRequired">
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
                     </div>
                     <div class="text-end mt-4">
                        <button type="submit" class="btn btn-custom-accent px-4"
                           :disabled="isSavingCredential || !isCredentialFormValid">
                           <span v-if="isSavingCredential" class="spinner-border spinner-border-sm me-2"></span>
                           {{ isSavingCredential ? 'Saving...' : 'Save Credentials' }}
                        </button>
                     </div>
                  </form>
               </div>
            </div>

            <div class="content-card rounded-3 mb-4">
               <div class="card-header-custom">
                  <h5 class="main-title mb-0">Chatbot AI</h5>
               </div>
               <div class="card-body-custom">
                  <div class="row g-0">
                     <div class="col-md-4 pe-md-4">
                        <div class="switch-wrapper mb-3">
                           <label for="chatbot-active" class="switch-label">Enable Chatbot</label>
                           <div class="form-check form-switch status-switch">
                              <input class="form-check-input" type="checkbox" role="switch" id="chatbot-active"
                                 v-model="chatbotConfig.chatbot">
                           </div>
                        </div>

                        <div v-if="chatbotConfig.chatbot" class="status-box active">
                           <i class="bi bi-robot status-icon"></i>
                           <div>
                              <div class="status-title">Chatbot is Active</div>
                              <p class="status-text">AI will respond to messages automatically.</p>
                           </div>
                        </div>
                        <div v-else class="status-box inactive">
                           <i class="bi bi-robot status-icon" style="opacity: 0.5;"></i>
                           <div>
                              <div class="status-title">Chatbot is Inactive</div>
                              <p class="status-text">Turn on to enable AI auto-responses.</p>
                           </div>
                        </div>
                     </div>

                     <div class="col-md-8 pt-4 pt-md-0 ps-md-4 border-start-md">
                        <fieldset :disabled="!chatbotConfig.chatbot">
                           <div class="mb-3">
                              <label class="form-label">AI Provider</label>
                              <div class="btn-group w-100" role="group">
                                 <input type="radio" class="btn-check" name="ai-provider" id="provider-groq"
                                    value="groq" v-model="selectedProvider">
                                 <label class="btn btn-outline-secondary" for="provider-groq">Groq</label>
                                 <input type="radio" class="btn-check" name="ai-provider" id="provider-gemini"
                                    value="gemini" v-model="selectedProvider">
                                 <label class="btn btn-outline-secondary" for="provider-gemini">Gemini</label>
                                 <input type="radio" class="btn-check" name="ai-provider" id="provider-cloudflare"
                                    value="cloudflare" v-model="selectedProvider">
                                 <label class="btn btn-outline-secondary" for="provider-cloudflare">Cloudflare</label>
                              </div>
                           </div>

                           <div v-if="selectedProvider === 'groq'">
                              <div class="mb-3">
                                 <label class="form-label">Groq API Key</label>
                                 <input type="text" class="form-control"
                                    v-model="chatbotConfig.chatbot_config.apikey.groq" placeholder="gsk_...">
                                 <div class="alert alert-info d-flex align-items-center mt-2 mb-0 py-2 px-3 small">
                                    <i class="bi bi-info-circle-fill me-2 fs-6"></i>
                                    <div>
                                       How to get a Groq API key? <strong><a href="#"
                                             @click.prevent="openGroqModal">Click Here</a></strong>
                                    </div>
                                 </div>
                              </div>
                              <div class="mb-3">
                                 <label class="form-label">Model</label>
                                 <select class="form-select" v-model="chatbotConfig.chatbot_config.model.groq">
                                    <option value="" disabled>Select a model...</option>
                                    <option v-for="model in aiModels.groq" :key="model.id" :value="model.id">
                                       {{ model.name }}
                                    </option>
                                 </select>
                                 <div v-if="selectedGroqModelLimit"
                                    class="alert alert-info d-flex align-items-center mt-2 mb-0 py-2 px-3 small">
                                    <i class="bi bi-info-circle-fill me-2 fs-6"></i>
                                    <div>
                                       <strong>Limit :</strong> {{ selectedGroqModelLimit }}
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <div v-if="selectedProvider === 'gemini'">
                              <div class="mb-3">
                                 <label class="form-label">Gemini API Key</label>
                                 <input type="text" class="form-control"
                                    v-model="chatbotConfig.chatbot_config.apikey.gemini" placeholder="AIza...">
                                 <div class="alert alert-info d-flex align-items-center mt-2 mb-0 py-2 px-3 small">
                                    <i class="bi bi-info-circle-fill me-2 fs-6"></i>
                                    <div>
                                       How to get a Gemini API key? <strong><a href="#"
                                             @click.prevent="openGeminiModal">Click Here</a></strong>
                                    </div>
                                 </div>
                              </div>
                              <div class="mb-3">
                                 <label class="form-label">Model</label>
                                 <select class="form-select" v-model="chatbotConfig.chatbot_config.model.gemini">
                                    <option value="" disabled>Select a model...</option>
                                    <option v-for="model in aiModels.gemini" :key="model.id" :value="model.id">
                                       {{ model.name }} <span v-if="model.shouldPremium">(Premium)</span>
                                    </option>
                                 </select>
                                 <div v-if="selectedGeminiModelLimit"
                                    class="alert alert-info d-flex align-items-center mt-2 mb-0 py-2 px-3 small">
                                    <i class="bi bi-info-circle-fill me-2 fs-6"></i>
                                    <div>
                                       <strong>Limit :</strong> {{ selectedGeminiModelLimit }}
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <div v-if="selectedProvider === 'cloudflare'">
                              <div class="row g-2 mb-2">
                                 <div class="col-md-6">
                                    <label class="form-label">Account ID</label>
                                    <input type="text" class="form-control"
                                       v-model="chatbotConfig.chatbot_config.apikey.cloudflare.account"
                                       placeholder="Account ID">
                                 </div>
                                 <div class="col-md-6">
                                    <label class="form-label">API Token</label>
                                    <input type="text" class="form-control"
                                       v-model="chatbotConfig.chatbot_config.apikey.cloudflare.token"
                                       placeholder="API Token">
                                 </div>
                              </div>
                              <div class="alert alert-info d-flex align-items-center mt-1 mb-3 py-2 px-3 small">
                                 <i class="bi bi-info-circle-fill me-2 fs-6"></i>
                                 <div>
                                    How to get a Cloudflare Account ID & API Token? <strong><a href="#"
                                          @click.prevent="openCloudflareModal">Click Here</a></strong>
                                 </div>
                              </div>
                              <div class="mb-3">
                                 <label class="form-label">Text Model (LLM)</label>
                                 <select class="form-select"
                                    v-model="chatbotConfig.chatbot_config.model.cloudflare.text">
                                    <option value="" disabled>Select text model...</option>
                                    <option v-for="model in aiModels.cloudflare?.text || []" :key="model.id"
                                       :value="model.id">
                                       {{ model.name }}
                                    </option>
                                 </select>
                              </div>

                              <div class="mb-3">
                                 <label class="form-label">Image Model</label>
                                 <select class="form-select"
                                    v-model="chatbotConfig.chatbot_config.model.cloudflare.image">
                                    <option value="" disabled>Select image model...</option>
                                    <option v-for="model in aiModels.cloudflare?.genimg || []" :key="model.id"
                                       :value="model.id">
                                       {{ model.name }} <span v-if="model.quality">({{ model.quality }})</span>
                                    </option>
                                 </select>
                                 <div v-if="selectedCloudflareLimit"
                                    class="alert alert-info d-flex align-items-center mt-2 mb-2 py-2 px-3 small">
                                    <i class="bi bi-info-circle-fill me-2 fs-6"></i>
                                    <div><strong>Limit :</strong> {{ selectedCloudflareLimit }}</div>
                                 </div>
                              </div>


                           </div>

                           <div class="mb-3">
                              <label class="form-label">System Instruction</label>
                              <textarea class="form-control" v-model="chatbotConfig.chatbot_config.instruction" rows="3"
                                 placeholder="You are a helpful assistant..."></textarea>
                           </div>

                        </fieldset>
                        <div class="text-end mt-4">
                           <button class="btn btn-custom-accent px-4" @click="saveChatbotSettings"
                              :disabled="isSavingChatbot">
                              <span v-if="isSavingChatbot" class="spinner-border spinner-border-sm me-2"></span>
                              {{ isSavingChatbot ? 'Saving...' : 'Save Chatbot' }}
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div v-if="settings && settings.webhook" class="content-card rounded-3 mb-4">
               <div class="card-header-custom">
                  <h5 class="main-title mb-0">Webhook</h5>
               </div>
               <div class="card-body-custom">
                  <div class="row g-0">
                     <div class="col-md-4 pe-md-4">
                        <div class="switch-wrapper mb-3">
                           <label for="webhook-active" class="switch-label">Enable Webhook</label>
                           <div class="form-check form-switch status-switch">
                              <input class="form-check-input" type="checkbox" role="switch" id="webhook-active"
                                 v-model="settings.webhook.active">
                           </div>
                        </div>
                        <div v-if="settings.webhook.active" class="status-box active">
                           <i class="bi bi-check-circle-fill status-icon"></i>
                           <div>
                              <div class="status-title">Webhook is Active</div>
                              <p class="status-text">Real-time event data will be sent to your URL.</p>
                           </div>
                        </div>
                        <div v-else class="status-box inactive">
                           <i class="bi bi-x-circle-fill status-icon"></i>
                           <div>
                              <div class="status-title">Webhook is Inactive</div>
                              <p class="status-text">No event data is being sent. Turn on to activate.</p>
                           </div>
                        </div>
                     </div>
                     <div class="col-md-8 pt-4 pt-md-0 ps-md-4 border-start-md">
                        <fieldset :disabled="!settings.webhook.active">
                           <div class="mb-3">
                              <label for="webhook-url" class="form-label">Webhook URL</label>
                              <div class="input-group">
                                 <span class="input-group-text"><i class="bi bi-link-45deg"></i></span>
                                 <input type="url" id="webhook-url" class="form-control"
                                    :class="{ 'is-invalid': urlError }" v-model="settings.webhook.url"
                                    placeholder="https://neoxr.app.n8n.cloud/webhook/xxxxx">
                              </div>
                              <div v-if="urlError" class="invalid-feedback-custom">{{ urlError }}</div>
                           </div>
                           <div class="mb-3">
                              <label for="webhook-method" class="form-label">Method</label>
                              <div class="input-group">
                                 <span class="input-group-text"><i class="bi bi-box-arrow-in-down-left"></i></span>
                                 <select id="webhook-method" class="form-select" v-model="settings.webhook.method">
                                    <option value="post">POST</option>
                                    <option value="get">GET</option>
                                 </select>
                              </div>
                           </div>
                        </fieldset>
                        <div class="text-end mt-4">
                           <button class="btn btn-custom-accent px-4" @click="saveWebhookSettings"
                              :disabled="isSavingWebhook || !!urlError || (settings.webhook.active && !settings.webhook.url)">
                              <span v-if="isSavingWebhook" class="spinner-border spinner-border-sm me-2"></span>
                              {{ isSavingWebhook ? 'Saving...' : 'Save Webhook' }}
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div class="content-card rounded-3 mb-4">
               <div class="card-header-custom">
                  <h5 class="main-title mb-0">Main Settings</h5>
               </div>
               <div class="card-body-custom">
                  <div class="row g-3">
                     <div v-for="key in booleanSettingKeys" :key="key" class="col-md-4 col-6">
                        <div class="form-check form-switch">
                           <input class="form-check-input" type="checkbox" role="switch" :id="`switch-${key}`"
                              v-model="settings[key]">
                           <label class="form-check-label" :for="`switch-${key}`">{{ formatKeyToLabel(key) }}</label>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div class="content-card rounded-3 mb-4">
               <div class="card-header-custom">
                  <h5 class="main-title mb-0">Advanced Settings</h5>
               </div>
               <div class="card-body-custom">
                  <div class="row g-3">
                     <div class="col-md-6"><label for="adv-link" class="form-label">Group Link</label><input type="text"
                           id="adv-link" class="form-control" v-model="settings.link"></div>
                     <div class="col-md-6"><label for="adv-onlyprefix" class="form-label">Only Prefix</label><input
                           type="text" id="adv-onlyprefix" class="form-control" v-model="settings.onlyprefix"></div>
                     <div class="col-md-6"><label class="form-label">Prefixes</label>
                        <p class="form-text mt-0 mb-2">Enter items separated by commas.</p><input type="text"
                           class="form-control" v-model="localPrefixInput" @input="updatePrefixes">
                     </div>
                     <div class="col-md-6"><label class="form-label">Owners</label>
                        <p class="form-text mt-0 mb-2">Enter numbers separated by commas.</p><input type="text"
                           class="form-control" v-model="localOwnersInput" @input="updateOwners">
                     </div>
                     <div class="col-md-6"><label class="form-label">Moderators</label>
                        <p class="form-text mt-0 mb-2">Enter numbers separated by commas.</p><input type="text"
                           class="form-control" v-model="localModeratorsInput" @input="updateModerators">
                     </div>
                     <div class="col-md-6"><label class="form-label">Toxic Words</label>
                        <p class="form-text mt-0 mb-2">Enter words separated by commas.</p><textarea
                           class="form-control" v-model="localToxicInput" @input="updateToxic" rows="3"></textarea>
                     </div>
                  </div>
               </div>
            </div>

            <div class="content-card rounded-3 mb-4">
               <div class="card-header-custom">
                  <h5 class="main-title mb-0">Other Settings</h5>
               </div>
               <div class="card-body-custom">
                  <div class="row g-3">
                     <div class="col-md-6" v-if="type === '2'"><label for="header" class="form-label">Header</label><input
                           type="text" id="header" class="form-control" v-model="settings.header"></div>
                     <div class="col-md-6" v-if="type === '2'"><label for="footer" class="form-label">Footer</label><input
                           type="text" id="footer" class="form-control" v-model="settings.footer"></div>
                     <div class="col-md-6"><label for="sk_pack" class="form-label">Sticker Pack</label><input
                           type="text" id="sk_pack" class="form-control" v-model="settings.sk_pack"></div>
                     <div class="col-md-6"><label for="sk_author" class="form-label">Sticker Author</label><input
                           type="text" id="sk_author" class="form-control" v-model="settings.sk_author"></div>
                     <div class="col-12"><label for="msg" class="form-label">Default Message</label><textarea id="msg"
                           class="form-control" v-model="settings.msg" rows="6"></textarea></div>
                  </div>
               </div>
            </div>

            <div class="text-end">
               <button class="btn btn-custom-accent px-4" @click="saveGeneralSettings" :disabled="isSavingGeneral">
                  <span v-if="isSavingGeneral" class="spinner-border spinner-border-sm me-2"></span>
                  {{ isSavingGeneral ? 'Saving...' : 'Save General Settings' }}
               </button>
            </div>
         </div>
      </div>

      <ApiKeyGeminiModal />
      <ApiKeyGroqModal />
      <ApiKeyCloudflareModal />
   </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, reactive } from 'vue'
import Swal from 'sweetalert2'
import { useAuth } from '@/composables/useAuth'

const { type } = useAuth()
const { $api, $bootstrap } = useNuxtApp()
const config = useRuntimeConfig()
useHead({ title: 'Settings', titleTemplate: `%s - ${config.public.title}` })

const settings = ref({ webhook: { url: '', method: 'post', active: false } })
const setupData = ref(null)
const isLoading = ref(true)
const isError = ref(false)
const isSavingGeneral = ref(false)
const isSavingSecurity = ref(false)
const isSavingWebhook = ref(false)
const urlError = ref('')

const credentialData = ref({ username: '', email: '', password: '' })
const isSavingCredential = ref(false)
const usernameError = ref('')
const emailError = ref('')
const showPassword = ref(false)
const passwordFieldType = computed(() => showPassword.value ? 'text' : 'password')
const passwordStrength = ref(0)
const passwordIsRequired = ref(false)

const securityErrors = reactive({
   username: '',
   password: '',
   operators: ''
})

const isSavingChatbot = ref(false)
const aiModels = ref({ groq: [], gemini: [], cloudflare: { limit: '', text: [], genimg: [] } })
const selectedProvider = ref('groq')
const chatbotConfig = ref({
   chatbot: false,
   chatbot_config: {
      apikey: { groq: '', gemini: '', cloudflare: { account: '', token: '' } },
      instruction: '',
      model: { groq: '', gemini: '', cloudflare: { text: '', image: '' } }
   }
})

let guideGeminiInstance = null
let guideGroqInstance = null
let guideCloudflareInstance = null

const openGeminiModal = () => {
   if (guideGeminiInstance) guideGeminiInstance.show()
}

const openGroqModal = () => {
   if (guideGroqInstance) guideGroqInstance.show()
}

const openCloudflareModal = () => {
   if (guideCloudflareInstance) guideCloudflareInstance.show()
}

const selectedGroqModelLimit = computed(() => {
   const modelId = chatbotConfig.value.chatbot_config.model.groq
   const model = aiModels.value.groq.find(m => m.id === modelId)
   return model ? model.limits.request : ''
})

const selectedGeminiModelLimit = computed(() => {
   const modelId = chatbotConfig.value.chatbot_config.model.gemini
   const model = aiModels.value.gemini.find(m => m.id === modelId)
   return model ? model.limits.request : ''
})

const selectedCloudflareLimit = computed(() => {
   return aiModels.value.cloudflare?.limit || ''
})

const passwordStrengthText = computed(() => {
   if (passwordStrength.value === 3) return 'Strong'
   if (passwordStrength.value === 2) return 'Medium'
   if (passwordStrength.value === 1) return 'Weak'
   return ''
})

const isCredentialFormValid = computed(() => {
   if (passwordIsRequired.value) {
      return !usernameError.value && !emailError.value && passwordStrength.value === 3
   } else {
      return !usernameError.value && !emailError.value && (!credentialData.value.password || passwordStrength.value === 3)
   }
})

const localPrefixInput = ref('')
const localOwnersInput = ref('')
const localModeratorsInput = ref('')
const localToxicInput = ref('')
const localOperatorsInput = ref('')

watch(() => settings.value.webhook?.url, (newUrl) => {
   if (settings.value.webhook && !newUrl) {
      urlError.value = ''
      return
   }
   const urlPattern = new RegExp('^(https?:\\/\\/)?' +
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
      '((\\d{1,3}\\.){3}\\d{1,3}))' +
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
      '(\\?[;&a-z\\d%_.~+=-]*)?' +
      '(\\#[-a-z\\d_]*)?$', 'i')
   if (!urlPattern.test(newUrl)) {
      urlError.value = 'Please enter a valid URL format.'
   } else {
      urlError.value = ''
   }
})

watch(() => credentialData.value.username, (value) => {
   if (type.value !== '2') return
   if (!value || value.trim() === '') {
      usernameError.value = 'Username is required.'
   } else if (value.length < 6 || value.length > 25) {
      usernameError.value = 'Username must be between 6 and 25 characters.'
   } else if (!/^[a-zA-Z0-9_.]+$/.test(value)) {
      usernameError.value = 'Username can only contain letters, numbers, underscores, and dots.'
   } else {
      usernameError.value = ''
   }
})

watch(() => credentialData.value.email, (value) => {
   if (type.value !== '2') return
   if (!value || value.trim() === '') {
      emailError.value = 'Email is required.'
   } else if (!/^[^\s@]+@gmail\.com$/.test(value)) {
      emailError.value = 'Please enter a valid Gmail address.'
   } else {
      emailError.value = ''
   }
})

watch(() => credentialData.value.password, (value) => {
   if (type.value !== '2') return

   if (passwordIsRequired.value && (!value || value.length === 0)) {
      passwordStrength.value = 0
      return
   }
   if (!passwordIsRequired.value && (!value || value.length === 0)) {
      passwordStrength.value = 3
      return
   }

   let strength = 0
   if (value.length >= 8) strength = 1
   if (value.length >= 8 && /[A-Z]/.test(value)) strength++
   if (value.length >= 8 && /\d/.test(value)) strength++
   if (strength > 3) strength = 3
   passwordStrength.value = strength
})

const booleanSettingKeys = computed(() => {
   if (!settings.value) return []
   return Object.keys(settings.value)
      .filter(key =>
         typeof settings.value[key] === 'boolean' &&
         !(type.value === '2' && key == 'autobackup') &&
         key !== 'chatbot'
      )
      .sort()
})

const initializeLocalInputs = () => {
   localPrefixInput.value = Array.isArray(settings.value.prefix) ? settings.value.prefix.join(', ') : ''
   localOwnersInput.value = Array.isArray(settings.value.owners) ? settings.value.owners.join(', ') : ''
   localModeratorsInput.value = Array.isArray(settings.value.moderators) ? settings.value.moderators.join(', ') : ''
   localToxicInput.value = Array.isArray(settings.value.toxic) ? settings.value.toxic.join(', ') : ''
   if (setupData.value) {
      localOperatorsInput.value = Array.isArray(setupData.value.operators) ? setupData.value.operators.join(', ') : ''
   }

   if (settings.value.chatbot !== undefined) chatbotConfig.value.chatbot = settings.value.chatbot
   if (settings.value.chatbot_config) {
      chatbotConfig.value.chatbot_config = JSON.parse(JSON.stringify(settings.value.chatbot_config))
      if (!chatbotConfig.value.chatbot_config.apikey) chatbotConfig.value.chatbot_config.apikey = { groq: '', gemini: '', cloudflare: { account: '', token: '' } }
      if (!chatbotConfig.value.chatbot_config.model) chatbotConfig.value.chatbot_config.model = { groq: '', gemini: '', cloudflare: { text: '', image: '' } }
   }
}

const updatePrefixes = () => { settings.value.prefix = localPrefixInput.value.split(',').map(p => p.trim()).filter(Boolean) }
const updateOwners = () => { settings.value.owners = localOwnersInput.value.split(',').map(p => p.trim()).filter(Boolean) }
const updateModerators = () => { settings.value.moderators = localModeratorsInput.value.split(',').map(p => p.trim()).filter(Boolean) }
const updateToxic = () => { settings.value.toxic = localToxicInput.value.split(',').map(p => p.trim()).filter(Boolean) }
const updateOperators = () => {
   if (setupData.value) {
      setupData.value.operators = localOperatorsInput.value.split(',').map(p => p.trim()).filter(Boolean)
   }
}
const togglePasswordVisibility = () => { showPassword.value = !showPassword.value }

const fetchSettings = async () => {
   try {
      const response = await $api('/data/setting')
      if (response.status && response.data) {
         settings.value = response.data
         if (typeof settings.value.webhook === 'undefined' || settings.value.webhook === null) {
            settings.value.webhook = { url: '', method: 'post', active: false }
         }

         if (!settings.value.webhook.method) {
            settings.value.webhook.method = 'post'
         }
      } else {
         throw new Error("Failed to fetch settings data")
      }
   } catch (error) {
      console.error(error)
      isError.value = true
   }
}

const fetchSetupData = async () => {
   if (type.value !== '1') return
   try {
      const response = await $api('/data/setup')
      if (response.status && response.data) {
         setupData.value = response.data
      } else {
         throw new Error("Failed to fetch setup data")
      }
   } catch (error) {
      console.error(error)
      isError.value = true
   }
}

const fetchCredential = async () => {
   if (type.value !== '2') return
   try {
      const response = await $api('/data/credential')
      if (response.status && response.data) {
         if (!response.data.password || response.data.password === '') {
            passwordIsRequired.value = true
            passwordStrength.value = 0
         }
         credentialData.value = { ...response.data, password: '' }
      } else {
         throw new Error("Failed to fetch credential data")
      }
   } catch (error) {
      console.error(error)
      isError.value = true
   }
}

const fetchAiModels = async () => {
   try {
      const response = await $api('/data/models')
      if (response.status && response.data) {
         aiModels.value = response.data
      }
   } catch (error) {
      console.error('Failed to fetch AI models:', error)
   }
}

const saveChatbotSettings = async () => {
   isSavingChatbot.value = true
   try {
      const payload = {
         chatbot: chatbotConfig.value.chatbot,
         chatbot_config: chatbotConfig.value.chatbot_config
      }
      const response = await $api('/action/update-setting', {
         method: 'POST',
         body: { data: payload }
      })
      if (response.status) {
         Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Chatbot settings saved!', showConfirmButton: false, timer: 3000, timerProgressBar: true })
      } else {
         throw new Error(response.message || 'Failed to save chatbot settings.')
      }
   } catch (error) {
      console.error('Error saving chatbot:', error)
      Swal.fire({ icon: 'error', title: 'Save Failed', text: error?.data?.message || error.message })
   } finally {
      isSavingChatbot.value = false
   }
}

const saveCredentialSettings = async () => {
   if (passwordIsRequired.value && (!credentialData.value.password || passwordStrength.value < 3)) {
      Swal.fire({ icon: 'error', title: 'Password Required', text: 'You must set a strong password for your account.' })
      return
   }

   if (!isCredentialFormValid.value) {
      Swal.fire({ icon: 'warning', title: 'Invalid Data', text: 'Please fill all fields correctly before saving.' })
      return
   }
   isSavingCredential.value = true
   try {
      const payload = { ...credentialData.value }
      if (!payload.password) {
         delete payload.password
      }

      const response = await $api('/action/update-credential', {
         method: 'POST',
         body: { data: payload }
      })
      if (response.status) {
         Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Credentials saved!', showConfirmButton: false, timer: 3000, timerProgressBar: true })
         credentialData.value.password = ''
         passwordIsRequired.value = false
      } else {
         throw new Error(response.message || 'Failed to save credentials.')
      }
   } catch (error) {
      console.error('Error saving credentials:', error)
      Swal.fire({ icon: 'error', title: 'Save Failed', text: error?.data?.message || error.message })
   } finally {
      isSavingCredential.value = false
   }
}

const saveWebhookSettings = async () => {
   if (urlError.value) {
      Swal.fire({ icon: 'error', title: 'Invalid URL', text: 'Please fix the URL format before saving.' })
      return
   }
   if (settings.value.webhook.active && !settings.value.webhook.url) {
      Swal.fire({ icon: 'warning', title: 'URL Required', text: 'Webhook URL cannot be empty when the feature is active.' })
      return
   }
   isSavingWebhook.value = true
   try {
      const response = await $api('/action/update-webhook', {
         method: 'POST',
         body: { data: settings.value.webhook }
      })
      if (response.status) {
         Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Webhook settings saved!', showConfirmButton: false, timer: 3000, timerProgressBar: true })
      } else {
         throw new Error(response.message || 'Failed to save webhook settings.')
      }
   } catch (error) {
      console.error('Error saving webhook settings:', error)
      Swal.fire({ icon: 'error', title: 'Save Failed', text: error?.data?.message || error.message || 'An unexpected error occurred.' })
   } finally {
      isSavingWebhook.value = false
   }
}

const saveGeneralSettings = async () => {
   isSavingGeneral.value = true
   try {
      const { cover, ...payload } = settings.value
      const response = await $api('/action/update-setting', {
         method: 'POST',
         body: { data: payload }
      })
      if (response.status) {
         Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'General settings saved!', showConfirmButton: false, timer: 3000, timerProgressBar: true })
      } else {
         throw new Error(response.message || 'Failed to save settings.')
      }
   } catch (error) {
      console.error('Error saving settings:', error)
      Swal.fire({ icon: 'error', title: 'Save Failed', text: error?.data?.message || error.message || 'An unexpected error occurred.' })
   } finally {
      isSavingGeneral.value = false
   }
}

const validateSecuritySettings = () => {
   let isValid = true
   securityErrors.username = ''
   securityErrors.password = ''
   securityErrors.operators = ''

   if (!setupData.value.username || setupData.value.username.trim() === '') {
      securityErrors.username = 'Admin username is required.'
      isValid = false
   }
   if (!setupData.value.password || setupData.value.password.trim() === '') {
      securityErrors.password = 'Admin password is required.'
      isValid = false
   }
   if (!localOperatorsInput.value || localOperatorsInput.value.trim() === '') {
      securityErrors.operators = 'At least one operator number is required.'
      isValid = false
   }
   return isValid
}

const saveSecuritySettings = async () => {
   if (!setupData.value) return
   if (!validateSecuritySettings()) {
      Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'Please fill all required fields.' })
      return
   }
   isSavingSecurity.value = true
   try {
      const response = await $api('/action/update-setup', {
         method: 'POST',
         body: { data: setupData.value }
      })
      if (response.status) {
         Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Security settings saved!', showConfirmButton: false, timer: 3000, timerProgressBar: true })
      } else {
         throw new Error(response.message || 'Failed to save security settings.')
      }
   } catch (error) {
      console.error('Error saving security settings:', error)
      Swal.fire({ icon: 'error', title: 'Save Failed', text: error?.data?.message || error.message || 'An unexpected error occurred.' })
   } finally {
      isSavingSecurity.value = false
   }
}

const formatKeyToLabel = (key) => {
   if (!key) return ''
   const result = key.replace(/([A-Z])/g, ' $1')
   return result.charAt(0).toUpperCase() + result.slice(1)
}

onMounted(async () => {
   isLoading.value = true
   await Promise.all([
      fetchSettings(),
      fetchSetupData(),
      fetchCredential(),
      fetchAiModels()
   ])
   initializeLocalInputs()
   if (process.client) {
      const geminiModal = document.getElementById('apiKeyGeminiModal')
      if (geminiModal) {
         guideGeminiInstance = new $bootstrap.Modal(geminiModal)
      }

      const groqModal = document.getElementById('apiKeyGroqModal')
      if (groqModal) {
         guideGroqInstance = new $bootstrap.Modal(groqModal)
      }

      const cloudflareModal = document.getElementById('apiKeyCloudflareModal')
      if (cloudflareModal) {
         guideCloudflareInstance = new $bootstrap.Modal(cloudflareModal)
      }
   }
   isLoading.value = false
})
</script>

<style scoped>
.form-label {
   font-weight: 500;
   margin-bottom: 0.5rem;
}

.form-text {
   font-size: 0.8rem;
   color: var(--dark-secondary-text-color);
}

body.light-mode .form-text {
   color: #6c757d;
}

.status-box {
   display: flex;
   align-items: flex-start;
   padding: 1rem;
   border-radius: 0.5rem;
   border: 1px solid transparent;
   transition: background-color 0.3s ease;
}

.status-box.active {
   background-color: rgba(25, 135, 84, 0.1);
   border-color: rgba(25, 135, 84, 0.2);
}

.status-box.inactive {
   background-color: rgba(108, 117, 125, 0.1);
   border-color: rgba(108, 117, 125, 0.2);
}

.status-icon {
   font-size: 1.5rem;
   margin-right: 0.75rem;
   line-height: 1.2;
}

.status-box.active .status-icon {
   color: #198754;
}

.status-box.inactive .status-icon {
   color: #6c757d;
}

.status-title {
   font-weight: 600;
   margin-bottom: 0.25rem;
   color: var(--dark-main-text-color);
}

body.light-mode .status-title {
   color: #212529;
}

.status-text {
   font-size: 0.85rem;
   margin: 0;
   color: var(--dark-secondary-text-color);
}

.status-switch {
   position: relative;
   bottom: 3px
}

body.light-mode .status-text {
   color: #495057;
}

.switch-wrapper {
   display: flex;
   justify-content: space-between;
   align-items: center;
   background-color: var(--dark-card-hover);
   padding: 0.75rem 1rem;
   border-radius: 0.5rem;
   border: 1px solid var(--dark-border-color);
}

body.light-mode .switch-wrapper {
   background-color: #f8f9fa;
   border-color: #e9ecef;
}

.switch-label {
   font-weight: 500;
   margin-bottom: 0;
   cursor: pointer;
}

.switch-wrapper .form-check.form-switch {
   padding-left: 0;
   margin-bottom: 0;
}

.switch-wrapper .form-check-input {
   width: 2.5em;
   height: 1.25em;
   cursor: pointer;
}

.form-control.is-invalid {
   border-color: #dc3545;
}

.invalid-feedback-custom {
   display: block;
   width: 100%;
   margin-top: 0.25rem;
   font-size: .875em;
   color: #dc3545;
}

.input-group-text {
   background-color: transparent;
   border-right: none;
   border-color: var(--dark-border-color);
   color: var(--dark-secondary-text-color);
}

body.light-mode .input-group-text {
   background-color: transparent;
   border-right: none;
   border-color: #dee2e6;
   color: #495057;
}

fieldset:disabled {
   opacity: 0.6;
}

fieldset:disabled input,
fieldset:disabled select {
   pointer-events: none;
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

@media (min-width: 768px) {
   .border-start-md {
      border-left: 1px solid var(--dark-border-color);
   }

   body.light-mode .border-start-md {
      border-left: 1px solid #dee2e6;
   }
}

select:disabled,
textarea:disabled,
input:disabled {
   background-color: var(--dark-bg);
   opacity: 0.7;
}

.input-group-password input:disabled {
   background-color: transparent;
}

body.light-mode select:disabled,
body.light-mode textarea:disabled,
body.light-mode input:disabled {
   background-color: var(--light-bg);
}

body.light-mode .input-group-password input:disabled {
   background-color: transparent;
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

.btn-group .btn-check:checked+.btn-outline-secondary {
   background-color: var(--dark-primary-accent);
   color: #000;
   border-color: var(--dark-primary-accent);
}

body.light-mode .btn-group .btn-check:checked+.btn-outline-secondary {
   background-color: var(--light-primary);
   color: #fff;
   border-color: var(--light-primary);
}
</style>