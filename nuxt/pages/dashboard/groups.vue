<template>
   <div>
      <div class="container px-3 mb-4 mt-1">
         <div class="content-card rounded-3">
            <div class="card-header-custom d-flex justify-content-between align-items-center">
               <h5 class="main-title mb-0">Groups Management</h5>
            </div>

            <div class="card-body-custom">
               <div v-if="isLoading" class="text-center py-5">
                  <div class="loader-spinner"></div>
                  <p class="mt-3">Fetching data...</p>
               </div>

               <div v-else-if="!groups.length" class="alert alert-info">
                  No groups found in the database.
               </div>

               <transition name="fade">
                  <div v-if="!isLoading && groups.length > 0">
                     <div class="row g-3 mb-4">
                        <div class="col-6 col-md-4">
                           <div class="stat-card-simple">
                              <div class="value">{{ stats.total }}</div>
                              <div class="label">Total Groups</div>
                           </div>
                        </div>
                        <div class="col-6 col-md-4">
                           <div class="stat-card-simple">
                              <div class="value text-success">{{ stats.rental }}</div>
                              <div class="label">Rental Groups</div>
                           </div>
                        </div>
                        <div class="col-12 col-md-4">
                           <div class="stat-card-simple">
                              <div class="value">{{ stats.total - stats.rental }}</div>
                              <div class="label">Regular Groups</div>
                           </div>
                        </div>
                     </div>

                     <div class="row g-3 mb-4 align-items-center">
                        <div class="col-lg-6">
                           <input type="text" class="form-control" placeholder="Search by group name..."
                              v-model="searchQuery" />
                        </div>
                        <div class="col-lg-6 d-flex justify-content-lg-end">
                           <div class="btn-group" role="group" aria-label="Group Filters">
                              <button type="button" class="btn btn-outline-secondary"
                                 :class="{ 'active': filterStatus === 'all' }"
                                 @click="filterStatus = 'all'">All</button>
                              <button type="button" class="btn btn-outline-secondary"
                                 :class="{ 'active': filterStatus === 'rental' }"
                                 @click="filterStatus = 'rental'">Rental</button>
                           </div>
                        </div>
                     </div>

                     <div class="table-responsive">
                        <table class="table detail-info-table">
                           <thead>
                              <tr>
                                 <th scope="col" class="text-nowrap-custom">Name</th>
                                 <th scope="col" class="text-nowrap-custom">Members</th>
                                 <th scope="col" class="text-nowrap-custom">Rental</th>
                                 <th scope="col" class="text-end text-nowrap-custom">Actions</th>
                              </tr>
                           </thead>
                           <tbody v-if="paginatedGroups.length > 0">
                              <tr v-for="group in paginatedGroups" :key="group.jid">
                                 <td class="text-nowrap-custom">{{ group.name }}</td>
                                 <td class="text-nowrap-custom">{{ Object.keys(group.member || {}).length }}</td>
                                 <td class="text-nowrap-custom">
                                    <span :class="group.expired !== 0 ? 'badge bg-success' : 'badge text-bg-secondary'">
                                       {{ group.expired !== 0 ? 'Yes' : 'No' }}
                                    </span>
                                 </td>
                                 <td class="text-end text-nowrap-custom">
                                    <button @click="setSelectedGroup(group, 'info')"
                                       class="btn btn-sm btn-secondary me-1">Detail</button>
                                    <button @click="setSelectedGroup(group, 'send')"
                                       class="btn btn-sm btn-primary me-1"><i class="bi bi-send"></i></button>
                                    <button @click="setSelectedGroup(group, 'setup')"
                                       class="btn btn-sm btn-warning me-1"><i class="bi bi-gear"></i></button>
                                    <button @click="confirmDelete(group)" class="btn btn-sm btn-danger"><i
                                          class="bi bi-trash"></i></button>
                                 </td>
                              </tr>
                           </tbody>
                           <tbody v-else>
                              <tr>
                                 <td colspan="4" class="text-center py-4">No groups match the current filter or search.
                                 </td>
                              </tr>
                           </tbody>
                        </table>
                     </div>

                     <div v-if="totalPages > 1" class="d-flex justify-content-between align-items-center mt-4">
                        <span class="pagination-info small">Showing {{ (currentPage - 1) * itemsPerPage + 1 }} - {{
                           Math.min(currentPage * itemsPerPage, filteredGroups.length) }} of {{ filteredGroups.length }}
                           groups</span>
                        <nav aria-label="Group pagination">
                           <ul class="pagination mb-0">
                              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                                 <a class="page-link" href="#" @click.prevent="prevPage">Previous</a>
                              </li>
                              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                                 <a class="page-link" href="#" @click.prevent="nextPage">Next</a>
                              </li>
                           </ul>
                        </nav>
                     </div>
                  </div>
               </transition>
            </div>
         </div>
      </div>

      <div class="modal fade" id="groupInfoModal" tabindex="-1" aria-labelledby="groupInfoModalLabel"
         aria-hidden="true">
         <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
               <div class="modal-header">
                  <h5 class="modal-title" id="groupInfoModalLabel"><span v-if="selectedGroup"> Details for {{
                     selectedGroup.name }} </span></h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
               </div>
               <div class="modal-body" v-if="selectedGroup">
                  <table class="table detail-info-table sys-info-table">
                     <tbody>
                        <tr>
                           <td class="label">ID</td>
                           <td class="colon">:</td>
                           <td class="value font-monospace small">{{ selectedGroup.jid }}</td>
                        </tr>
                        <tr>
                           <td class="label">Name</td>
                           <td class="colon">:</td>
                           <td class="value">{{ selectedGroup.name }}</td>
                        </tr>
                        <tr>
                           <td class="label">Mute</td>
                           <td class="colon">:</td>
                           <td class="value">{{ selectedGroup.mute ? 'Yes' : 'No' }}</td>
                        </tr>
                        <tr>
                           <td class="label">Expired</td>
                           <td class="colon">:</td>
                           <td class="value">{{ selectedGroup.expired !== 0 ? formatTimestamp(selectedGroup.expired) :
                              'No Expiration' }}</td>
                        </tr>
                        <tr>
                           <td class="label">Last Activity</td>
                           <td class="colon">:</td>
                           <td class="value">{{ formatTimestamp(selectedGroup.activity) }}</td>
                        </tr>
                     </tbody>
                  </table>
               </div>
               <div class="modal-footer"><button type="button" class="btn btn-secondary"
                     data-bs-dismiss="modal">Close</button></div>
            </div>
         </div>
      </div>

      <div class="modal fade" id="sendGroupMessageModal" tabindex="-1" aria-labelledby="sendGroupMessageModalLabel"
         aria-hidden="true">
         <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
               <div class="modal-header">
                  <h5 class="modal-title" id="sendGroupMessageModalLabel">Send Group Message</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
               </div>
               <div class="modal-body" v-if="selectedGroup">
                  <div class="mb-3"><label for="groupName" class="form-label">Group Name</label><input type="text"
                        id="groupName" class="form-control" :value="selectedGroup.name" readonly disabled /></div>
                  <div class="btn-group d-flex mb-3" role="group" aria-label="Message Type">
                     <input type="radio" class="btn-check" name="messageTypeRadio" id="radioText" value="text"
                        v-model="messageType" autocomplete="off" checked><label class="btn btn-outline-secondary"
                        for="radioText">Text</label>
                     <input type="radio" class="btn-check" name="messageTypeRadio" id="radioMedia" value="media"
                        v-model="messageType" autocomplete="off"><label class="btn btn-outline-secondary"
                        for="radioMedia">Media</label>
                     <input type="radio" class="btn-check" name="messageTypeRadio" id="radioFile" value="file"
                        v-model="messageType" autocomplete="off"><label class="btn btn-outline-secondary"
                        for="radioFile">File</label>
                     <input type="radio" class="btn-check" name="messageTypeRadio" id="radioVoice" value="voice"
                        v-model="messageType" autocomplete="off"><label class="btn btn-outline-secondary"
                        for="radioVoice">Voice</label>
                  </div>
                  <div>
                     <div v-if="messageType === 'text'" class="mb-3"><label for="messageText"
                           class="form-label">Message</label><textarea class="form-control" id="messageText" rows="4"
                           v-model="messageContent"></textarea></div>
                     <div v-if="messageType === 'media'">
                        <div class="mb-3"><label for="mediaFile" class="form-label">Media File</label>
                           <div class="custom-file-input-wrapper"><input class="d-none" type="file" id="mediaFile"
                                 @change="handleFileChange"><label for="mediaFile"
                                 class="btn-custom-file-trigger">Choose File</label><span
                                 class="file-name-display ms-3">{{ chosenFileName }}</span></div>
                        </div>
                        <div class="mb-3"><label for="mediaCaption" class="form-label">Caption</label><textarea
                              class="form-control" id="mediaCaption" rows="2" v-model="messageContent"></textarea></div>
                     </div>
                     <div v-if="messageType === 'file'">
                        <div class="mb-3"><label for="docFile" class="form-label">Document File</label>
                           <div class="custom-file-input-wrapper"><input class="d-none" type="file" id="docFile"
                                 @change="handleFileChange"><label for="docFile" class="btn-custom-file-trigger">Choose
                                 File</label><span class="file-name-display ms-3">{{ chosenFileName }}</span></div>
                        </div>
                        <div class="mb-3"><label for="fileCaption" class="form-label">Caption</label><textarea
                              class="form-control" id="fileCaption" rows="2" v-model="messageContent"></textarea></div>
                     </div>
                     <div v-if="messageType === 'voice'" class="mb-3"><label for="voiceFile"
                           class="form-label">Voicenote</label>
                        <div class="custom-file-input-wrapper"><input class="d-none" type="file" id="voiceFile"
                              @change="handleFileChange"><label for="voiceFile" class="btn-custom-file-trigger">Choose
                              File</label><span class="file-name-display ms-3">{{ chosenFileName }}</span></div>
                     </div>
                  </div>
               </div>
               <div class="modal-footer d-flex justify-content-between">
                  <div class="d-flex gap-3">
                     <div class="form-check form-switch"><input class="form-check-input" type="checkbox" role="switch"
                           id="hidetagSwitch" v-model="hidetag"><label class="form-check-label"
                           for="hidetagSwitch">Hidetag</label></div>
                     <div class="form-check form-switch"><input class="form-check-input" type="checkbox" role="switch"
                           id="withStatusSwitch" v-model="withStatus"><label class="form-check-label"
                           for="withStatusSwitch">Status</label></div>
                  </div>
                  <div><button type="button" class="btn btn-secondary me-2"
                        data-bs-dismiss="modal">Close</button><button type="button" class="btn btn-primary"
                        @click="handleSubmit" :disabled="isSending"><span v-if="isSending"
                           class="spinner-border spinner-border-sm"></span><span v-else>Submit</span></button></div>
               </div>
            </div>
         </div>
      </div>

      <div class="modal fade" id="groupSetupModal" tabindex="-1" aria-labelledby="groupSetupModalLabel"
         aria-hidden="true">
         <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
               <div class="modal-header">
                  <h5 class="modal-title" id="groupSetupModalLabel">Group Settings</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
               </div>
               <div class="modal-body" v-if="selectedGroup && groupSettings">
                  <div class="row g-3">
                     <div v-for="key in booleanSettingsKeys" :key="key" class="col-6 col-md-6">
                        <div class="form-check form-switch">
                           <input class="form-check-input" type="checkbox" role="switch" :id="`switch-${key}`"
                              v-model="groupSettings[key]">
                           <label class="form-check-label" :for="`switch-${key}`">{{ formatKeyToLabel(key) }}</label>
                        </div>
                     </div>
                  </div>
                  <div class="alert alert-info p-2 small mt-4">
                     For more advanced settings such as Welcome/Left Message, visit the
                     <NuxtLink :to="`/dashboard/group/${encodedJid}`" @click="closeSetupModal"><strong>Advanced Settings
                           page</strong></NuxtLink>.
                  </div>
               </div>
               <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                  <button type="button" class="btn btn-primary" @click="handleSaveChanges" :disabled="isSaving"><span
                        v-if="isSaving" class="spinner-border spinner-border-sm"></span><span v-else>Save
                        Changes</span></button>
               </div>
            </div>
         </div>
      </div>
   </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import Swal from 'sweetalert2'

const { $api, $bootstrap } = useNuxtApp()
const config = useRuntimeConfig()
useHead({ title: 'Groups Management', titleTemplate: `%s - ${config.public.title}` })

const groups = ref([])
const stats = ref({ rental: 0, total: 0 })
const isLoading = ref(true)
const selectedGroup = ref(null)

let infoModalInstance = null
let sendModalInstance = null
let setupModalInstance = null

onMounted(async () => {
   await fetchGroups()
   if (process.client) {
      const infoEl = document.getElementById('groupInfoModal')
      if (infoEl) infoModalInstance = new $bootstrap.Modal(infoEl)
      const sendEl = document.getElementById('sendGroupMessageModal')
      if (sendEl) sendModalInstance = new $bootstrap.Modal(sendEl)
      const setupEl = document.getElementById('groupSetupModal')
      if (setupEl) setupModalInstance = new $bootstrap.Modal(setupEl)
   }
})

const groupSettings = ref({})
const isSaving = ref(false)
const messageType = ref('text')
const messageContent = ref('')
const messageFile = ref(null)
const hidetag = ref(false)
const withStatus = ref(false)
const isSending = ref(false)
const searchQuery = ref('')
const filterStatus = ref('all')
const currentPage = ref(1)
const itemsPerPage = ref(10)

const booleanSettingsKeys = computed(() => {
   if (!selectedGroup.value) return []
   return Object.keys(selectedGroup.value)
      .filter(key => typeof selectedGroup.value[key] === 'boolean' && !['mute', 'expired', 'stay'].includes(key))
      .sort()
})

const encodedJid = computed(() => {
   if (!selectedGroup.value?.jid) return ''
   return btoa(selectedGroup.value.jid)
})

const filteredGroups = computed(() => {
   let filtered = [...groups.value]
   if (filterStatus.value === 'rental') {
      filtered = filtered.filter(group => group.expired !== 0)
   }
   if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase().trim()
      if (query) {
         filtered = filtered.filter(group => group.name && group.name.toLowerCase().includes(query))
      }
   }
   return filtered
})

const totalPages = computed(() => Math.ceil(filteredGroups.value.length / itemsPerPage.value))

const paginatedGroups = computed(() => {
   const start = (currentPage.value - 1) * itemsPerPage.value
   const end = start + itemsPerPage.value
   return filteredGroups.value.slice(start, end)
})

const chosenFileName = computed(() => messageFile.value ? messageFile.value.name : 'No file chosen')

watch([filterStatus, searchQuery], () => { currentPage.value = 1 })
watch(messageType, () => { messageFile.value = null; messageContent.value = '' })
watch(hidetag, newValue => { if (newValue) withStatus.value = false })
watch(withStatus, newValue => { if (newValue) hidetag.value = false })

const removeBootstrapBackdrop = () => {
   if (process.client) {
      const backdrops = document.querySelectorAll('.modal-backdrop')
      backdrops.forEach(el => el.remove())
      document.body.classList.remove('modal-open')
      document.body.style.removeProperty('padding-right')
      setTimeout(() => {
         if (document.body.style.overflow === 'hidden') {
            document.body.style.overflow = ''
         }
      }, 200)
   }
}

const fetchGroups = async () => {
   isLoading.value = true
   try {
      const response = await $api('/data/groups')
      if (response.status && response.data) {
         groups.value = response.data.groups
         stats.value = response.data.stats
      }
   } catch (error) {
      console.error("Failed to fetch groups data:", error)
      Swal.fire({ icon: 'error', title: 'Fetch Failed', text: 'Could not retrieve groups data.' })
   } finally {
      isLoading.value = false
   }
}

const refreshGroupsSilently = async () => {
   try {
      const response = await $api('/data/groups')
      if (response.status && response.data) {
         groups.value = response.data.groups
         stats.value = response.data.stats
      }
   } catch (error) {
      console.error("Failed to silently refresh groups data:", error)
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Failed to refresh data!', showConfirmButton: false, timer: 3000 })
   }
}

const setSelectedGroup = (group, action) => {
   selectedGroup.value = group
   if (action === 'info') {
      infoModalInstance?.show()
   } else if (action === 'send') {
      messageType.value = 'text'
      messageContent.value = ''
      messageFile.value = null
      hidetag.value = false
      withStatus.value = false
      isSending.value = false
      sendModalInstance?.show()
   } else if (action === 'setup') {
      groupSettings.value = {}
      booleanSettingsKeys.value.forEach(key => { groupSettings.value[key] = group[key] })
      isSaving.value = false
      setupModalInstance?.show()
   }
}

const closeSetupModal = () => {
   setupModalInstance?.hide()
   setTimeout(removeBootstrapBackdrop, 400)
}

const prevPage = () => { if (currentPage.value > 1) currentPage.value-- }
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++ }

const formatTimestamp = timestamp => {
   if (!timestamp) return 'N/A'
   return new Date(timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}

const handleFileChange = event => {
   const file = event.target.files?.[0]
   if (file) messageFile.value = file
}

const handleSubmit = async () => {
   if (!selectedGroup.value) return
   isSending.value = true
   const formData = new FormData()
   formData.append('jid', selectedGroup.value.jid)
   formData.append('type', messageType.value)
   formData.append('hidetag', String(hidetag.value))
   formData.append('status', String(withStatus.value))
   if (messageType.value === 'text') {
      formData.append('message', messageContent.value)
   } else {
      if (messageFile.value) {
         formData.append('file', messageFile.value)
         if (messageContent.value) {
            formData.append('caption', messageContent.value)
         }
      } else {
         Swal.fire({ icon: 'error', title: 'Oops...', text: `Please choose a ${messageType.value} file.` })
         isSending.value = false
         return
      }
   }
   try {
      const response = await $api('/action/group-message', { method: 'POST', body: formData })
      if (response.status) {
         sendModalInstance?.hide()
         setTimeout(removeBootstrapBackdrop, 400)
         Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Message sent successfully!', showConfirmButton: false, timer: 3000, timerProgressBar: true })
      } else {
         throw new Error(response.message || 'Server returned an error.')
      }
   } catch (error) {
      console.error('Error sending message:', error)
      Swal.fire({ icon: 'error', title: 'Error!', text: 'Failed to send message.' })
   } finally {
      isSending.value = false
   }
}

const handleSaveChanges = async () => {
   if (!selectedGroup.value) return
   isSaving.value = true
   const payload = { jid: selectedGroup.value.jid, ...groupSettings.value }
   try {
      const response = await $api('/action/update-group', { method: 'POST', body: payload })
      if (response.status) {
         setupModalInstance?.hide()
         setTimeout(removeBootstrapBackdrop, 400)
         await refreshGroupsSilently()
         Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Settings saved!', showConfirmButton: false, timer: 3000, timerProgressBar: true })
      } else {
         throw new Error(response.message || 'Server returned an error.')
      }
   } catch (error) {
      console.error("Failed to save settings:", error)
      Swal.fire({ icon: 'error', title: 'Error!', text: 'Failed to save settings.' })
   } finally {
      isSaving.value = false
   }
}

const confirmDelete = group => {
   Swal.fire({
      title: 'Are you sure?',
      html: `You are about to delete group <br><strong>${group.name}</strong>. This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true
   }).then(result => {
      if (result.isConfirmed) {
         handleDelete(group)
      }
   })
}

const handleDelete = async group => {
   try {
      const response = await $api('/action/delete', { method: 'POST', body: { jid: group.jid, type: '_g' } })
      if (response.status) {
         await refreshGroupsSilently()
         Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `Group ${group.name} deleted!`, showConfirmButton: false, timer: 3000, timerProgressBar: true })
      } else {
         throw new Error(response.message || 'Server returned an error.')
      }
   } catch (error) {
      console.error('Failed to delete group:', error)
      Swal.fire({ icon: 'error', title: 'Deletion Failed', text: 'Could not delete the group.' })
   }
}

const formatKeyToLabel = key => {
   if (!key) return ''
   const spaced = key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')
   return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}
</script>
