<template>
   <div>
      <div class="container px-3 mb-4 mt-1">
         <div v-if="isLogin" class="content-card rounded-3 mb-4">
            <div class="card-header-custom">
               <h5 class="main-title mb-0">Your API Token</h5>
            </div>
            <div class="card-body-custom">
               <p class="mb-3">
                  Use this token in the <code>x-neoxr-token</code> header for every API request. This token is
                  confidential.
               </p>
               <div class="input-group">
                  <input type="text" class="form-control font-monospace" :value="apiToken" readonly
                     placeholder="Loading token...">
                  <button class="btn btn-outline-secondary" type="button" @click="copyApiToken"
                     :disabled="!apiToken || apiToken.includes('Failed')">
                     <i class="bi me-1" :class="tokenCopyStatus === 'Copy' ? 'bi-clipboard' : 'bi-check-lg'"></i>
                     <span>{{ tokenCopyStatus }}</span>
                  </button>
               </div>
            </div>
         </div>

         <div class="row">
            <div class="col-lg-4 d-none d-lg-block">
               <div class="docs-nav-wrapper">
                  <h6 class="docs-nav-title">ENDPOINTS V1 (BY NUMBER)</h6>
                  <ul class="list-unstyled docs-nav">
                     <li v-for="endpoint in endpointsV1" :key="endpoint.id">
                        <a :href="`#${endpoint.id}`" class="nav-link"
                           :class="{ 'active': activeSection === endpoint.id }">
                           {{ endpoint.title }}
                        </a>
                     </li>
                  </ul>
                  <h6 class="docs-nav-title mt-4">ENDPOINTS V2 (BY JID)</h6>
                  <ul class="list-unstyled docs-nav">
                     <li v-for="endpoint in endpointsV2" :key="endpoint.id">
                        <a :href="`#${endpoint.id}`" class="nav-link"
                           :class="{ 'active': activeSection === endpoint.id }">
                           {{ endpoint.title }}
                        </a>
                     </li>
                  </ul>
               </div>
            </div>

            <div class="col-lg-8">
               <div v-for="endpoint in allEndpoints" :key="endpoint.id" :id="endpoint.id" class="endpoint-section">
                  <div class="content-card rounded-3">
                     <div class="card-body-custom">
                        <div class="d-flex align-items-center mb-3">
                           <span :class="`badge me-3 bg-${endpoint.methodColor}`">{{ endpoint.method }}</span>
                           <code class="fs-6 fw-bold">{{ endpoint.path }}</code>
                        </div>
                        <h5 class="main-title mb-1">{{ endpoint.title }}</h5>
                        <p class="endpoint-description">{{ endpoint.description }}</p>

                        <h6 class="mt-4">Headers</h6>
                        <div class="table-responsive mb-4">
                           <table class="table detail-info-table table-bordered">
                              <thead>
                                 <tr>
                                    <th>Key</th>
                                    <th>Description</th>
                                 </tr>
                              </thead>
                              <tbody>
                                 <tr>
                                    <td><code>x-neoxr-token</code></td>
                                    <td>Your bot instance token. <strong>(Required)</strong></td>
                                 </tr>
                              </tbody>
                           </table>
                        </div>

                        <h6 class="mt-4">Body Parameters (application/json)</h6>
                        <div class="table-responsive mb-4">
                           <table class="table detail-info-table table-bordered">
                              <thead>
                                 <tr>
                                    <th>Parameter</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Description</th>
                                 </tr>
                              </thead>
                              <tbody>
                                 <tr v-for="param in endpoint.parameters" :key="param.name">
                                    <td><code>{{ param.name }}</code></td>
                                    <td><code>{{ param.type }}</code></td>
                                    <td>
                                       <span v-if="param.required" class="badge bg-danger">Required</span>
                                       <span v-else class="badge text-bg-secondary">Optional</span>
                                    </td>
                                    <td v-html="param.description"></td>
                                 </tr>
                              </tbody>
                           </table>
                        </div>

                        <div v-if="endpoint.notes && endpoint.notes.length > 0" class="mt-4">
                           <h6>Notes</h6>
                           <ul class="list-unstyled">
                              <li v-for="(note, index) in endpoint.notes" :key="index" class="mb-1 d-flex">
                                 <i class="bi bi-info-circle text-primary-custom me-2 mt-1"></i>
                                 <span class="endpoint-note-text" v-html="note"></span>
                              </li>
                           </ul>
                        </div>

                        <h6 class="mt-4">Example (cURL)</h6>
                        <div class="code-container position-relative">
                           <pre class="language-bash"><code>{{ endpoint.curlExample }}</code></pre>
                           <button class="btn btn-sm btn-secondary btn-copy"
                              @click="copyToClipboard(endpoint.curlExample, endpoint.id)">
                              <i class="bi me-1"
                                 :class="copyStatus[endpoint.id] === 'Copied!' ? 'bi-check-lg' : 'bi-clipboard'"></i>
                              {{ copyStatus[endpoint.id] || 'Copy' }}
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from 'vue'
import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-bash'
import { useAuth } from '@/composables/useAuth'

const { $api } = useNuxtApp()
const { isLogin } = useAuth()
useHead({ title: 'API Documentation' })

const apiToken = ref('')
const tokenCopyStatus = ref('Copy')
const copyStatus = ref({})
const activeSection = ref('')
let observer = null

const copyApiToken = () => {
   if (!apiToken.value || apiToken.value.includes('Failed')) return
   navigator.clipboard.writeText(apiToken.value).then(() => {
      tokenCopyStatus.value = 'Copied!'; setTimeout(() => { tokenCopyStatus.value = 'Copy' }, 2000)
   }).catch(() => {
      tokenCopyStatus.value = 'Failed!'; setTimeout(() => { tokenCopyStatus.value = 'Copy' }, 2000)
   })
}

const copyToClipboard = (text, id) => {
   navigator.clipboard.writeText(text).then(() => {
      copyStatus.value[id] = 'Copied!'; setTimeout(() => { delete copyStatus.value[id] }, 2000)
   })
}

const rawButtons = [
   {
      name: "quick_reply",
      buttonParamsJson: JSON.stringify({
         display_text: "OWNER",
         id: ".owner"
      })
   },
   {
      name: "cta_url",
      buttonParamsJson: JSON.stringify({
         display_text: "Rest API",
         url: "__BASE_URL__",
         merchant_url: "__BASE_URL__"
      })
   },
   {
      name: "cta_copy",
      buttonParamsJson: JSON.stringify({
         display_text: "Copy",
         copy_code: "123456"
      })
   },
   {
      name: "cta_call",
      buttonParamsJson: JSON.stringify({
         display_text: "Call",
         phone_number: "6285887776722"
      })
   },
   {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
         title: "Tap!",
         sections: [{
            rows: [{
               title: "Owner",
               description: "X",
               id: ".owner"
            }, {
               title: "Runtime",
               description: "Y",
               id: ".run"
            }]
         }]
      })
   }
]

const buttonPayload = JSON.stringify(rawButtons).replace(/\\/g, '\\\\').replace(/"/g, '\\"')

const endpointsV1 = ref([
   { id: 'v1-send-text', title: 'Send Text Message', method: 'POST', methodColor: 'primary', path: '/v1/text', description: 'Sends a plain text message.', parameters: [{ name: 'number', type: 'string', required: true, description: 'Recipient number with country code (e.g., 62812xxxx).' }, { name: 'text', type: 'string', required: true, description: 'The message content.' }], notes: [], curlExample: `curl -X POST '__BASE_URL__/v1/text' \\\n  --header 'x-neoxr-token: __YOUR_TOKEN__' \\\n  --header 'Content-Type: application/json' \\\n  --data-raw '{\n    "number": "6281234567890",\n    "text": "Hello, this is a test message."\n  }'` },
   { id: 'v1-send-modify', title: 'Send Message Modify', method: 'POST', methodColor: 'primary', path: '/v1/modify', description: 'Sends a text message with a custom thumbnail and link preview.', parameters: [{ name: 'number', type: 'string', required: true, description: 'Recipient number.' }, { name: 'text', type: 'string', required: true, description: 'The message content.' }, { name: 'title', type: 'string', required: false, description: 'Title for the link preview.' }, { name: 'thumbnail', type: 'string', required: true, description: 'URL of the thumbnail image.' }, { name: 'url', type: 'string', required: false, description: 'Target URL for the link preview.' }], notes: ['Useful for sending messages that look like link previews.'], curlExample: `curl -X POST '__BASE_URL__/v1/modify' \\\n  --header 'x-neoxr-token: __YOUR_TOKEN__' \\\n  --header 'Content-Type: application/json' \\\n  --data-raw '{\n    "number": "6281234567890",\n    "text": "Test!",\n    "title": "© neoxr-bot",\n    "thumbnail": "https://iili.io/HP3ODj2.jpg",\n    "url": "https://chat.whatsapp.com/HYknAquOTrECm9KPJJQO1V"\n  }'` },
   { id: 'v1-send-media', title: 'Send Media', method: 'POST', methodColor: 'success', path: '/v1/media', description: 'Sends a media file from a URL.', parameters: [{ name: 'number', type: 'string', required: true, description: 'Recipient number.' }, { name: 'url', type: 'string', required: true, description: 'Public URL of the image/video.' }, { name: 'caption', type: 'string', required: false, description: 'Caption for the media.' }], notes: ['Supported types: image, video.'], curlExample: `curl -X POST '__BASE_URL__/v1/media' \\\n  --header 'x-neoxr-token: __YOUR_TOKEN__' \\\n  --header 'Content-Type: application/json' \\\n  --data-raw '{\n    "number": "6281234567890",\n    "url": "https://i.pinimg.com/736x/39/cc/b3/39ccb37903402f63a990e8cc004bef5d.jpg",\n    "caption": "This is an image."\n  }'` },
   { id: 'v1-send-voice', title: 'Send Voice Note', method: 'POST', methodColor: 'success', path: '/v1/voice', description: 'Sends an audio file as a voice note.', parameters: [{ name: 'number', type: 'string', required: true, description: 'Recipient number.' }, { name: 'url', type: 'string', required: true, description: 'Public URL of the audio file.' }], notes: ['Audio will be sent as a Push-to-Talk (PTT) message.'], curlExample: `curl -X POST '__BASE_URL__/v1/voice' \\\n  --header 'x-neoxr-token: __YOUR_TOKEN__' \\\n  --header 'Content-Type: application/json' \\\n  --data-raw '{\n    "number": "6281234567890",\n    "url": "https://cdn.neoxr.eu/audio/chicken.mp3"\n  }'` },
   { id: 'v1-send-file', title: 'Send Document', method: 'POST', methodColor: 'success', path: '/v1/file', description: 'Sends a file as a document.', parameters: [{ name: 'number', type: 'string', required: true, description: 'Recipient number.' }, { name: 'url', type: 'string', required: true, description: 'Public URL of the file.' }, { name: 'filename', type: 'string', required: true, description: 'File name with extension.' }, { name: 'caption', type: 'string', required: false, description: 'Optional caption.' }], notes: [], curlExample: `curl -X POST '__BASE_URL__/v1/file' \\\n  --header 'x-neoxr-token: __YOUR_TOKEN__' \\\n  --header 'Content-Type: application/json' \\\n  --data-raw '{\n    "number": "6281234567890",\n    "url": "https://pdfobject.com/pdf/sample.pdf",\n    "filename": "sample.pdf"\n  }'` },
   { id: 'v1-send-album', title: 'Send Album', method: 'POST', methodColor: 'success', path: '/v1/album', description: 'Sends multiple media files as an album.', parameters: [{ name: 'number', type: 'string', required: true, description: 'Recipient number.' }, { name: 'media', type: 'array', required: true, description: 'Array of media objects containing <code>url</code>, <code>caption</code>, and <code>type</code>.' }], notes: ['Only image and video types are supported for albums.'], curlExample: `curl -X POST '__BASE_URL__/v1/album' \\\n  --header 'x-neoxr-token: __YOUR_TOKEN__' \\\n  --header 'Content-Type: application/json' \\\n  --data-raw '{\n    "number": "6281234567890",\n    "media": [\n      {"url": "https://i.pinimg.com/736x/09/d2/b9/09d2b9f1e452f54a8260de445120cc76.jpg", "caption": "Image 1", "type": "image"},\n      {"url": "https://i.pinimg.com/1200x/a0/3a/2b/a03a2b9c7291739ce7cb27d380f26143.jpg", "caption": "Image 2", "type": "image"},\n      {"url": "https://i.pinimg.com/736x/86/57/97/865797107d1552e2dbb3a28177e18056.jpg", "caption": "Image 3", "type": "image"}\n    ]\n  }'` },
   { id: 'v1-send-contact', title: 'Send Contact', method: 'POST', methodColor: 'primary', path: '/v1/contact', description: 'Sends a contact card (vCard).', parameters: [{ name: 'number', type: 'string', required: true, description: 'Recipient number.' }, { name: 'contacts', type: 'array', required: true, description: 'Array of contact objects (name, number, about).' }, { name: 'org', type: 'string', required: false, description: 'Organization name.' }, { name: 'website', type: 'string', required: false, description: 'Website URL.' }, { name: 'email', type: 'string', required: false, description: 'Email address.' }], notes: [], curlExample: `curl -X POST '__BASE_URL__/v1/contact' \\\n  --header 'x-neoxr-token: __YOUR_TOKEN__' \\\n  --header 'Content-Type: application/json' \\\n  --data-raw '{\n    "number": "6281234567890",\n    "contacts": [\n      {"name": "Wildan Izzudin", "number": "6285887776722", "about": "Owner"}\n    ],\n    "org": "Neoxr Network",\n    "website": "__BASE_URL__",\n    "email": "contact@neoxr.my.id"\n  }'` },
   { id: 'v1-send-button', title: 'Send Button Message', method: 'POST', methodColor: 'warning', path: '/v1/button', description: 'Sends a message with interactive buttons.', parameters: [{ name: 'number', type: 'string', required: true, description: 'Recipient number.' }, { name: 'text', type: 'string', required: true, description: 'Main text content.' }, { name: 'button', type: 'string', required: true, description: 'JSON string of button objects.' }, { name: 'media', type: 'string', required: false, description: 'Optional image/video URL for header.' }], notes: ['This feature may not work on WhatsApp Business accounts.', 'Interactive buttons are currently not supported on iOS (iPhone). Use an Android device to access this feature.'], curlExample: `curl -X POST '__BASE_URL__/v1/button' \\\n  --header 'x-neoxr-token: __YOUR_TOKEN__' \\\n  --header 'Content-Type: application/json' \\\n  --data-raw '{\n    "number": "6281234567890",\n    "text": "Select an option",\n    "button": "${buttonPayload}"\n  }'` },
])

const endpointsV2 = ref([
   { id: 'v2-send-text', title: 'Send Text Message (JID)', method: 'POST', methodColor: 'primary', path: '/v2/text', description: 'Sends a plain text message using a JID.', parameters: [{ name: 'jid', type: 'string', required: true, description: 'Recipient JID (e.g., 62812xxxx@s.whatsapp.net or xxxxx-xxxx@g.us).' }, { name: 'text', type: 'string', required: true, description: 'The message content.' }], notes: [], curlExample: `curl -X POST '__BASE_URL__/v2/text' \\\n  --header 'x-neoxr-token: __YOUR_TOKEN__' \\\n  --header 'Content-Type: application/json' \\\n  --data-raw '{\n    "jid": "6281234567890@s.whatsapp.net",\n    "text": "Hello, this is a test message."\n  }'` },
   { id: 'v2-send-modify', title: 'Send Message Modify (JID)', method: 'POST', methodColor: 'primary', path: '/v2/modify', description: 'Sends a text message with a custom thumbnail and link preview using a JID.', parameters: [{ name: 'jid', type: 'string', required: true, description: 'Recipient JID.' }, { name: 'text', type: 'string', required: true, description: 'The message content.' }, { name: 'title', type: 'string', required: false, description: 'Title for the link preview.' }, { name: 'thumbnail', type: 'string', required: true, description: 'URL of the thumbnail image.' }, { name: 'url', type: 'string', required: false, description: 'Target URL for the link preview.' }], notes: ['Useful for sending messages that look like link previews.'], curlExample: `curl -X POST '__BASE_URL__/v2/modify' \\\n  --header 'x-neoxr-token: __YOUR_TOKEN__' \\\n  --header 'Content-Type: application/json' \\\n  --data-raw '{\n    "jid": "6281234567890@s.whatsapp.net",\n    "text": "Test!",\n    "title": "© neoxr-bot",\n    "thumbnail": "https://iili.io/HP3ODj2.jpg",\n    "url": "https://chat.whatsapp.com/HYknAquOTrECm9KPJJQO1V"\n  }'` },
   { id: 'v2-send-media', title: 'Send Media (JID)', method: 'POST', methodColor: 'success', path: '/v2/media', description: 'Sends a media file from a URL using a JID.', parameters: [{ name: 'jid', type: 'string', required: true, description: 'Recipient JID.' }, { name: 'url', type: 'string', required: true, description: 'Public URL of the image/video.' }, { name: 'caption', type: 'string', required: false, description: 'Caption for the media.' }], notes: ['Supported types: image, video.'], curlExample: `curl -X POST '__BASE_URL__/v2/media' \\\n  --header 'x-neoxr-token: __YOUR_TOKEN__' \\\n  --header 'Content-Type: application/json' \\\n  --data-raw '{\n    "jid": "6281234567890@s.whatsapp.net",\n    "url": "https://i.pinimg.com/736x/39/cc/b3/39ccb37903402f63a990e8cc004bef5d.jpg",\n    "caption": "This is an image."\n  }'` },
   { id: 'v2-send-voice', title: 'Send Voice Note (JID)', method: 'POST', methodColor: 'success', path: '/v2/voice', description: 'Sends an audio file as a voice note using a JID.', parameters: [{ name: 'jid', type: 'string', required: true, description: 'Recipient JID.' }, { name: 'url', type: 'string', required: true, description: 'Public URL of the audio file.' }], notes: ['Audio will be sent as a Push-to-Talk (PTT) message.'], curlExample: `curl -X POST '__BASE_URL__/v2/voice' \\\n  --header 'x-neoxr-token: __YOUR_TOKEN__' \\\n  --header 'Content-Type: application/json' \\\n  --data-raw '{\n    "jid": "6281234567890@s.whatsapp.net",\n    "url": "https://cdn.neoxr.eu/audio/chicken.mp3"\n  }'` },
   { id: 'v2-send-file', title: 'Send Document (JID)', method: 'POST', methodColor: 'success', path: '/v2/file', description: 'Sends a file as a document using a JID.', parameters: [{ name: 'jid', type: 'string', required: true, description: 'Recipient JID.' }, { name: 'url', type: 'string', required: true, description: 'Public URL of the file.' }, { name: 'filename', type: 'string', required: true, description: 'File name with extension.' }, { name: 'caption', type: 'string', required: false, description: 'Optional caption.' }], notes: [], curlExample: `curl -X POST '__BASE_URL__/v2/file' \\\n  --header 'x-neoxr-token: __YOUR_TOKEN__' \\\n  --header 'Content-Type: application/json' \\\n  --data-raw '{\n    "jid": "6281234567890@s.whatsapp.net",\n    "url": "https://pdfobject.com/pdf/sample.pdf",\n    "filename": "sample.pdf"\n  }'` },
   { id: 'v2-send-album', title: 'Send Album (JID)', method: 'POST', methodColor: 'success', path: '/v2/album', description: 'Sends multiple media files as an album using a JID.', parameters: [{ name: 'jid', type: 'string', required: true, description: 'Recipient JID.' }, { name: 'media', type: 'array', required: true, description: 'Array of media objects containing <code>url</code>, <code>caption</code>, and <code>type</code>.' }], notes: ['Only image and video types are supported for albums.'], curlExample: `curl -X POST '__BASE_URL__/v2/album' \\\n  --header 'x-neoxr-token: __YOUR_TOKEN__' \\\n  --header 'Content-Type: application/json' \\\n  --data-raw '{\n    "jid": "6281234567890@s.whatsapp.net",\n    "media": [\n      {"url": "https://i.pinimg.com/736x/09/d2/b9/09d2b9f1e452f54a8260de445120cc76.jpg", "caption": "Image 1", "type": "image"},\n      {"url": "https://i.pinimg.com/1200x/a0/3a/2b/a03a2b9c7291739ce7cb27d380f26143.jpg", "caption": "Image 2", "type": "image"},\n      {"url": "https://i.pinimg.com/736x/86/57/97/865797107d1552e2dbb3a28177e18056.jpg", "caption": "Image 3", "type": "image"}\n    ]\n  }'` },
   { id: 'v2-send-contact', title: 'Send Contact (JID)', method: 'POST', methodColor: 'primary', path: '/v2/contact', description: 'Sends a contact card (vCard) using a JID.', parameters: [{ name: 'jid', type: 'string', required: true, description: 'Recipient JID.' }, { name: 'contacts', type: 'array', required: true, description: 'Array of contact objects (name, number, about).' }, { name: 'org', type: 'string', required: false, description: 'Organization name.' }, { name: 'website', type: 'string', required: false, description: 'Website URL.' }, { name: 'email', type: 'string', required: false, description: 'Email address.' }], notes: [], curlExample: `curl -X POST '__BASE_URL__/v2/contact' \\\n  --header 'x-neoxr-token: __YOUR_TOKEN__' \\\n  --header 'Content-Type: application/json' \\\n  --data-raw '{\n    "jid": "6281234567890@s.whatsapp.net",\n    "contacts": [\n      {"name": "Wildan Izzudin", "number": "6285887776722", "about": "Owner"}\n    ],\n    "org": "Neoxr Network",\n    "website": "__BASE_URL__",\n    "email": "contact@neoxr.my.id"\n  }'` },
   { id: 'v2-send-button', title: 'Send Button Message (JID)', method: 'POST', methodColor: 'warning', path: '/v2/button', description: 'Sends a message with interactive buttons using a JID.', parameters: [{ name: 'jid', type: 'string', required: true, description: 'Recipient JID.' }, { name: 'text', type: 'string', required: true, description: 'Main text content.' }, { name: 'button', type: 'string', required: true, description: 'JSON string of button objects.' }, { name: 'media', type: 'string', required: false, description: 'Optional image/video URL for header.' }], notes: ['This feature may not work on WhatsApp Business accounts.', 'Interactive buttons are currently not supported on iOS (iPhone). Use an Android device to access this feature.'], curlExample: `curl -X POST '__BASE_URL__/v2/button' \\\n  --header 'x-neoxr-token: __YOUR_TOKEN__' \\\n  --header 'Content-Type: application/json' \\\n  --data-raw '{\n    "jid": "6281234567890@s.whatsapp.net",\n    "text": "Select an option",\n    "button": "${buttonPayload}"\n  }'` },
])

const allEndpoints = computed(() => [...endpointsV1.value, ...endpointsV2.value])

onMounted(async () => {
   let tokenForCurl = 'YOUR_TOKEN'
   if (isLogin.value) {
      try {
         const response = await $api('/data/token-auth')
         if (response?.status && response.data?.token) {
            apiToken.value = response.data.token
            tokenForCurl = response.data.token
         } else {
            apiToken.value = 'Failed to load token.'
         }
      } catch (error) {
         console.error('Error fetching API token:', error)
         apiToken.value = 'Failed to load token due to an error.'
      }
   }

   const baseUrl = process.client ? window.location.origin : ''

   const processEndpoints = (endpoints) => {
      return endpoints.map(endpoint => ({
         ...endpoint,
         curlExample: endpoint.curlExample.replace(/__BASE_URL__/g, baseUrl).replace(/__YOUR_TOKEN__/g, tokenForCurl)
      }))
   }
   endpointsV1.value = processEndpoints(endpointsV1.value)
   endpointsV2.value = processEndpoints(endpointsV2.value)

   nextTick(() => {
      Prism.highlightAll()
      const options = { rootMargin: "-20% 0px -80% 0px" }
      observer = new IntersectionObserver((entries) => {
         entries.forEach(entry => {
            if (entry.isIntersecting) {
               activeSection.value = entry.target.id
            }
         })
      }, options)
      document.querySelectorAll('.endpoint-section').forEach(section => observer.observe(section))
   })
})

onBeforeUnmount(() => {
   if (observer) {
      observer.disconnect()
   }
})
</script>

<style scoped>
html {
   scroll-behavior: smooth;
}

.docs-nav-wrapper {
   position: sticky;
   top: 110px;
   max-height: calc(100vh - 120px);
   overflow-y: auto;
}

.docs-nav-title {
   font-size: 0.8rem;
   font-weight: 700;
   text-transform: uppercase;
   letter-spacing: 0.05em;
   color: var(--dark-secondary-text-color);
   padding: 0 0.75rem;
   margin-bottom: 0.5rem;
}

body.light-mode .docs-nav-title {
   color: #6c757d;
}

.docs-nav .nav-link {
   padding: 0.5rem 0.75rem;
   border-radius: .375rem;
   color: var(--dark-secondary-text-color);
   font-weight: 500;
   transition: background-color 0.2s, color 0.2s;
}

body.light-mode .docs-nav .nav-link {
   color: #6c757d;
}

.docs-nav .nav-link:hover {
   background-color: var(--dark-card-bg);
   color: var(--dark-text-color);
}

body.light-mode .docs-nav .nav-link:hover {
   background-color: var(--light-bg);
   color: var(--light-text-color);
}

.docs-nav .nav-link.active {
   background-color: var(--dark-primary-accent);
   color: #000;
}

body.light-mode .docs-nav .nav-link.active {
   background-color: var(--light-primary);
   color: #fff;
}

.endpoint-section {
   margin-bottom: 2rem;
   scroll-margin-top: 100px;
}

.endpoint-description,
.endpoint-note-text {
   color: var(--dark-secondary-text-color);
}

body.light-mode .endpoint-description,
body.light-mode .endpoint-note-text {
   color: #6c757d;
}

.table-bordered {
   --bs-table-border-color: var(--dark-border-color);
}

body.light-mode .table-bordered {
   --bs-table-border-color: var(--light-border-color);
}

.code-container {
   background-color: #2d2d2d;
   border-radius: .375rem;
   padding: 1rem;
}

.code-container pre {
   margin: 0;
}

.code-container .btn-copy {
   position: absolute;
   top: 0.5rem;
   right: 0.5rem;
   opacity: 0.5;
   transition: opacity 0.2s ease-in-out;
}

.code-container:hover .btn-copy {
   opacity: 1;
}
</style>