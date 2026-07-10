<template>
   <div class="container px-3 my-4">
      <div class="text-center mb-4">
         <h1 class="main-title mb-2">API Playground</h1>
         <p class="text-secondary">Execute endpoints and debug payloads in real-time</p>
      </div>

      <div class="row g-4">
         <div class="col-lg-6">
            <div class="content-card rounded-3 mb-4">
               <div class="card-header-custom">
                  <h5 class="mb-0 fw-bold">Configuration</h5>
               </div>
               <div class="card-body-custom">
                  <div class="mb-4">
                     <label class="form-label small text-uppercase fw-bold opacity-75">Access Token</label>
                     <div class="input-group">
                        <span class="input-group-text"><i class="bi bi-key"></i></span>
                        <input type="text" class="form-control font-monospace" v-model="apiToken"
                           placeholder="x-neoxr-token">
                     </div>
                  </div>

                  <div class="row g-3">
                     <div class="col-8">
                        <label class="form-label small text-uppercase fw-bold opacity-75">Message Type</label>
                        <select class="form-select" v-model="selectedType" @change="loadTemplate">
                           <optgroup label="Standard">
                              <option value="text">Text Message</option>
                           </optgroup>
                           <optgroup label="Media">
                              <option value="media">Image / Video</option>
                              <option value="file">Document</option>
                              <option value="voice">Voice Note</option>
                              <option value="album">Album</option>
                           </optgroup>
                           <optgroup label="Advanced">
                              <option value="modify">Link Preview</option>
                              <option value="button">Interactive Button</option>
                              <option value="contact">Contact Card</option>
                           </optgroup>
                        </select>
                     </div>
                     <div class="col-4">
                        <label class="form-label small text-uppercase fw-bold opacity-75">Version</label>
                        <div class="version-selector">
                           <label class="version-item">
                              <input type="radio" name="api_version" value="v1" v-model="selectedVersion"
                                 class="version-input">
                              <span class="version-label">V1</span>
                           </label>
                           <label class="version-item">
                              <input type="radio" name="api_version" value="v2" v-model="selectedVersion"
                                 class="version-input">
                              <span class="version-label">V2</span>
                           </label>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div class="content-card rounded-3">
               <div class="card-header-custom d-flex justify-content-between align-items-center">
                  <h5 class="mb-0 fw-bold">Request Body</h5>
                  <span class="badge bg-primary font-monospace">{{ `/${selectedVersion}/${selectedType}` }}</span>
               </div>
               <div class="card-body-custom">
                  <form @submit.prevent="sendRequest">
                     <div class="mb-3">
                        <label class="form-label small fw-bold">{{ selectedVersion === 'v1' ? 'Recipient Number' :
                           'Recipient JID' }}</label>
                        <input type="text" class="form-control" v-model="formData.target"
                           :placeholder="selectedVersion === 'v1' ? 'e.g. 628123456789' : 'e.g. 628123456789@s.whatsapp.net'"
                           required>
                     </div>

                     <div class="mb-3" v-if="['text', 'button', 'modify'].includes(selectedType)">
                        <label class="form-label small fw-bold">Message Content</label>
                        <textarea class="form-control" v-model="formData.text" rows="3"
                           placeholder="Type your message here..." required></textarea>
                     </div>

                     <div class="mb-3" v-if="['media', 'file', 'voice', 'modify'].includes(selectedType)">
                        <label class="form-label small fw-bold">Media/Source URL</label>
                        <input type="url" class="form-control" v-model="formData.url"
                           placeholder="https://example.com/file.jpg" required>
                     </div>

                     <div class="row g-2 mb-3" v-if="selectedType === 'modify'">
                        <div class="col-6">
                           <label class="form-label small fw-bold">Title</label>
                           <input type="text" class="form-control" v-model="formData.title" placeholder="Preview Title">
                        </div>
                        <div class="col-6">
                           <label class="form-label small fw-bold">Thumbnail URL</label>
                           <input type="url" class="form-control" v-model="formData.thumbnail"
                              placeholder="https://example.com/thumb.jpg">
                        </div>
                     </div>

                     <div class="mb-3" v-if="['media', 'file', 'album'].includes(selectedType)">
                        <label class="form-label small fw-bold">Caption</label>
                        <input type="text" class="form-control" v-model="formData.caption"
                           placeholder="Add a caption...">
                     </div>

                     <div class="mb-3" v-if="selectedType === 'file'">
                        <label class="form-label small fw-bold">Filename</label>
                        <input type="text" class="form-control" v-model="formData.filename" placeholder="document.pdf">
                     </div>

                     <div class="mb-3" v-if="['button', 'contact', 'album'].includes(selectedType)">
                        <label class="form-label small fw-bold mb-2">JSON Payload</label>
                        <textarea class="form-control font-monospace small" v-model="formData.jsonPayload" rows="8"
                           spellcheck="false" placeholder="JSON Array..."></textarea>
                     </div>

                     <div class="d-grid mt-4">
                        <button type="submit"
                           class="btn btn-custom-accent py-2 shadow-sm d-flex align-items-center justify-content-center"
                           :disabled="isLoading || !apiToken">
                           <span v-if="isLoading" class="loader-spinner me-2"
                              style="width: 18px; height: 18px; border-width: 2px;"></span>
                           {{ isLoading ? 'Processing...' : 'Send Request' }}
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         </div>

         <div class="col-lg-6">
            <div class="content-card rounded-3 response-card-wrapper">
               <div class="card-header-custom d-flex justify-content-between align-items-center">
                  <div class="d-flex align-items-center gap-2">
                     <div class="terminal-dots">
                        <span class="dot bg-danger"></span>
                        <span class="dot bg-warning"></span>
                        <span class="dot bg-success"></span>
                     </div>
                     <span class="ms-2 fw-bold text-secondary small">Console</span>
                  </div>
                  <button v-if="apiResponse" class="btn btn-sm btn-link text-decoration-none text-secondary p-0"
                     @click="clearResponse">
                     <i class="bi bi-eraser me-1"></i>Clear
                  </button>
               </div>

               <div class="card-body-custom p-0 position-relative terminal-body">
                  <div v-if="!apiResponse" class="terminal-empty">
                     <span class="prompt">>_</span>
                     {{ isLoading ? 'Executing request...' : 'Waiting for API request...' }}
                  </div>

                  <div v-if="apiResponse" class="terminal-content">
                     <div
                        class="response-meta d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-25 pb-2 mb-2">
                        <span class="badge" :class="responseStatusBadge">HTTP {{ responseStatusCode }}</span>
                        <span class="text-secondary small font-monospace">{{ new Date().toLocaleTimeString() }}</span>
                     </div>
                     <pre
                        class="m-0"><code class="language-json">{{ JSON.stringify(apiResponse, null, 3) }}</code></pre>
                  </div>
               </div>
            </div>
         </div>
      </div>
   </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import Swal from 'sweetalert2'
import { useAuth } from '@/composables/useAuth'

const config = useRuntimeConfig()
useHead({ title: 'API Playground', titleTemplate: `%s - ${config.public.title}` })
const { $api } = useNuxtApp()
const { isLogin } = useAuth()

const apiToken = ref('YOUR_TOKEN')
const isLoading = ref(false)
const selectedType = ref('text')
const selectedVersion = ref('v1')
const apiResponse = ref(null)
const responseStatusCode = ref(null)

const formData = reactive({
   target: '',
   text: '',
   url: '',
   title: '',
   thumbnail: '',
   caption: '',
   filename: '',
   jsonPayload: ''
})

const button = JSON.stringify([{
   name: "quick_reply",
   buttonParamsJson: JSON.stringify({
      display_text: "OWNER",
      id: '.owner'
   }),
}, {
   name: "cta_url",
   buttonParamsJson: JSON.stringify({
      display_text: "Rest API",
      url: "https://api.neoxr.my.id",
      merchant_url: "https://api.neoxr.my.id"
   })
}, {
   name: "cta_copy",
   buttonParamsJson: JSON.stringify({
      display_text: "Copy",
      copy_code: "123456"
   })
}, {
   name: "cta_call",
   buttonParamsJson: JSON.stringify({
      display_text: "Call",
      phone_number: "6285887776722"
   })
}, {
   name: "single_select",
   buttonParamsJson: JSON.stringify({
      title: "Tap!",
      sections: [{
         rows: [{
            title: "Owner",
            description: `X`,
            id: `.owner`
         }, {
            title: "Runtime",
            description: `Y`,
            id: `.run`
         }]
      }]
   })
}], null, 2)

const contact = JSON.stringify([{
   "name": "Jokowi",
   "number": "6281234567890",
   "about": "Developer"
}], null, 2)

const album = JSON.stringify([{
   "url": "https://i.pinimg.com/736x/6f/a3/6a/6fa36aa2c367da06b2a4c8ae1cf9ee02.jpg",
   "caption": "Image 1",
   "type": "image"
}, {
   "url": "https://i.pinimg.com/736x/0b/97/6f/0b976f0a7aa1aa43870e1812eee5a55d.jpg",
   "caption": "Image 2",
   "type": "image"
}], null, 2)

const templates = { button, contact, album }

const loadTemplate = () => {
   apiResponse.value = null
   formData.jsonPayload = templates[selectedType.value] || ''
}

const fetchToken = async () => {
   if (isLogin.value) {
      try {
         const response = await $api('/data/token-auth')
         if (response?.status && response.data?.token) apiToken.value = response.data.token
      } catch (error) {
         apiToken.value = 'YOUR_TOKEN'
      }
   }
}

onMounted(() => fetchToken())

const clearResponse = () => {
   apiResponse.value = null
   responseStatusCode.value = null
}

const responseStatusBadge = computed(() => {
   if (!responseStatusCode.value) return ''
   return responseStatusCode.value < 400 ? 'bg-success' : 'bg-danger'
})

const sendRequest = async () => {
   isLoading.value = true
   apiResponse.value = null
   responseStatusCode.value = null

   const payload = {}
   if (selectedVersion.value === 'v1') payload.number = formData.target
   else payload.jid = formData.target

   switch (selectedType.value) {
      case 'text': payload.text = formData.text; break
      case 'media':
         payload.url = formData.url
         if (formData.caption) payload.caption = formData.caption
         break
      case 'voice': payload.url = formData.url; break
      case 'file':
         payload.url = formData.url
         payload.filename = formData.filename || 'document.bin'
         if (formData.caption) payload.caption = formData.caption
         break
      case 'modify':
         payload.text = formData.text
         if (formData.title) payload.title = formData.title
         if (formData.thumbnail) payload.thumbnail = formData.thumbnail
         if (formData.url) payload.url = formData.url
         break
      case 'button':
         payload.text = formData.text
         payload.button = formData.jsonPayload
         break
      case 'contact':
         try { payload.contacts = JSON.parse(formData.jsonPayload) }
         catch (e) { Swal.fire('Error', 'Invalid JSON Array', 'error'); isLoading.value = false; return }
         break
      case 'album':
         try { payload.media = JSON.parse(formData.jsonPayload) }
         catch (e) { Swal.fire('Error', 'Invalid JSON Array', 'error'); isLoading.value = false; return }
         break
   }

   try {
      const res = await fetch(`${config.public.baseURL}/${selectedVersion.value}/${selectedType.value}`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
            'x-neoxr-token': apiToken.value
         },
         body: JSON.stringify(payload)
      })

      responseStatusCode.value = res.status
      apiResponse.value = await res.json()
   } catch (error) {
      responseStatusCode.value = 500
      apiResponse.value = { error: 'Failed to connect to API server' }
   } finally {
      isLoading.value = false
   }
}
</script>

<style scoped>
.input-group-text {
   border-color: var(--dark-border-color);
   background-color: var(--dark-bg);
   color: var(--dark-secondary-text-color);
}

.input-group .form-control {
   border-color: var(--dark-border-color);
}

body.light-mode .input-group-text {
   border-color: var(--light-border-color);
   background-color: var(--light-bg);
   color: var(--light-text-color);
}

body.light-mode .input-group .form-control {
   border-color: var(--light-border-color);
}

.version-selector {
   display: flex;
   background-color: var(--dark-bg);
   border: 1px solid var(--dark-border-color);
   border-radius: 0.375rem;
   padding: 3px;
   height: 38px;
}

body.light-mode .version-selector {
   background-color: var(--light-bg);
   border-color: var(--light-border-color);
}

.version-item {
   flex: 1;
   position: relative;
   display: flex;
   justify-content: center;
   align-items: center;
   cursor: pointer;
   margin-bottom: 0;
}

.version-input {
   position: absolute;
   opacity: 0;
   cursor: pointer;
}

.version-label {
   width: 100%;
   height: 100%;
   display: flex;
   align-items: center;
   justify-content: center;
   border-radius: 0.25rem;
   font-weight: 600;
   font-size: 0.85rem;
   color: var(--dark-secondary-text-color);
   transition: all 0.2s ease-in-out;
}

.version-input:checked+.version-label {
   background-color: var(--dark-card-bg);
   color: var(--dark-primary-accent);
   box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
   border: 1px solid var(--dark-border-color);
}

body.light-mode .version-input:checked+.version-label {
   background-color: #fff;
   color: var(--light-primary);
   border-color: var(--light-border-color);
}

.terminal-body {
   background-color: #1e1e1e;
   min-height: 400px;
   border-radius: 0 0 0.375rem 0.375rem;
   font-family: 'Courier New', Courier, monospace;
   display: flex;
   flex-direction: column;
}

.terminal-dots .dot {
   display: inline-block;
   width: 10px;
   height: 10px;
   border-radius: 50%;
   margin-right: 4px;
}

.terminal-empty {
   flex-grow: 1;
   display: flex;
   align-items: center;
   justify-content: center;
   color: #6c757d;
   font-size: 0.9rem;
}

.prompt {
   color: var(--dark-primary-accent);
   margin-right: 8px;
   font-weight: bold;
   animation: blink 1s infinite;
}

@keyframes blink {

   0%,
   100% {
      opacity: 1;
   }

   50% {
      opacity: 0;
   }
}

.terminal-content {
   padding: 1rem;
   color: #d4d4d4;
   font-size: 0.85rem;
   overflow-x: auto;
}

.terminal-content pre::-webkit-scrollbar {
   height: 8px;
   width: 8px;
}

.terminal-content pre::-webkit-scrollbar-track {
   background: #1e1e1e;
}

.terminal-content pre::-webkit-scrollbar-thumb {
   background: #424242;
   border-radius: 4px;
}

body.light-mode .btn-custom-accent .loader-spinner {
   border-color: #ffffff transparent !important;
}
</style>