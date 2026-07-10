<template>
   <div>
      <div class="container px-3 mb-4 mt-1">
         <div class="content-card rounded-3">
            <div class="card-header-custom d-flex justify-content-between align-items-center">
               <h5 class="main-title mb-0">Active Sessions</h5>
            </div>
            <div class="card-body-custom">
               <div v-if="isLoading" class="text-center py-5">
                  <div class="loader-spinner"></div>
                  <p class="mt-2">Fetching data...</p>
               </div>
               <div v-else-if="!sessions.length" class="alert alert-info">
                  No active sessions found.
               </div>
               <transition name="fade">
                  <div v-if="!isLoading && sessions.length > 0">
                     <div class="row g-3 mb-4">
                        <div class="col-6 col-md-4">
                           <div class="stat-card-simple">
                              <div class="value">{{ sessions.length }}</div>
                              <div class="label">Total Sessions</div>
                           </div>
                        </div>
                        <div class="col-6 col-md-4">
                           <div class="stat-card-simple">
                              <div class="value text-success">{{ onlineCount }}</div>
                              <div class="label">Online</div>
                           </div>
                        </div>
                        <div class="col-12 col-md-4">
                           <div class="stat-card-simple">
                              <div class="value text-danger">{{ offlineCount }}</div>
                              <div class="label">Offline</div>
                           </div>
                        </div>
                     </div>
                     <div class="row g-3 mb-4 align-items-center">
                        <div class="col-lg-6">
                           <input type="text" class="form-control"
                              placeholder="Search by ID, username, email or number..." v-model="searchQuery" />
                        </div>
                        <div class="col-lg-6 d-flex justify-content-lg-end">
                           <div class="btn-group" role="group" aria-label="Session Filters">
                              <button type="button" class="btn btn-outline-secondary"
                                 :class="{ 'active': filterStatus === 'all' }"
                                 @click="filterStatus = 'all'">All</button>
                              <button type="button" class="btn btn-outline-secondary"
                                 :class="{ 'active': filterStatus === 'online' }"
                                 @click="filterStatus = 'online'">Online</button>
                              <button type="button" class="btn btn-outline-secondary"
                                 :class="{ 'active': filterStatus === 'offline' }"
                                 @click="filterStatus = 'offline'">Offline</button>
                           </div>
                        </div>
                     </div>
                     <div class="table-responsive">
                        <table class="table detail-info-table">
                           <thead>
                              <tr>
                                 <th scope="col" class="text-nowrap-custom">ID</th>
                                 <th scope="col" class="text-nowrap-custom">Number</th>
                                 <th scope="col" class="text-nowrap-custom">Method</th>
                                 <th scope="col" class="text-nowrap-custom">Status</th>
                                 <th scope="col" class="text-end text-nowrap-custom">Actions</th>
                              </tr>
                           </thead>
                           <tbody v-if="paginatedSessions.length > 0">
                              <tr v-for="session in paginatedSessions" :key="session._id">
                                 <td class="font-monospace text-nowrap-custom">#{{ session.account }}</td>
                                 <td class="font-monospace text-nowrap-custom">{{ formatPhoneNumber(session.jid) }}</td>
                                 <td class="text-nowrap-custom"><span class="badge text-bg-secondary">{{
                                    session.method.toUpperCase() }}</span></td>
                                 <td class="text-nowrap-custom">
                                    <span :class="session.is_connected ? 'badge bg-success' : 'badge bg-danger'">
                                       {{ session.is_connected ? 'Online' : 'Offline' }}
                                    </span>
                                 </td>
                                 <td class="text-end text-nowrap-custom">
                                    <button @click="handleInfo(session)" class="btn btn-sm btn-secondary me-1"><i
                                          class="bi bi-info-circle"></i></button>
                                    <button @click="handleToken(session)"
                                       class="btn btn-sm btn-warning me-1">Token</button>
                                    <button @click="handleUpgrade(session)" class="btn btn-sm btn-success me-1"><i
                                          class="bi bi-arrow-up"></i></button>
                                    <button @click="confirmTerminate(session)" class="btn btn-sm btn-danger me-1"><i
                                          class="bi bi-power"></i></button>
                                    <button @click="confirmDelete(session)" class="btn btn-sm btn-danger"><i
                                          class="bi bi-trash"></i></button>
                                 </td>
                              </tr>
                           </tbody>
                           <tbody v-else>
                              <tr>
                                 <td colspan="4" class="text-center py-4">No sessions match the current filter or
                                    search.</td>
                              </tr>
                           </tbody>
                        </table>
                     </div>
                     <div v-if="totalPages > 1" class="d-flex justify-content-between align-items-center mt-4">
                        <span class="pagination-info small">Showing {{ (currentPage - 1) * itemsPerPage + 1 }} - {{
                           Math.min(currentPage * itemsPerPage, filteredSessions.length) }} of {{
                              filteredSessions.length }} sessions</span>
                        <nav aria-label="Session pagination">
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

      <div class="modal fade" id="sessionInfoModal" tabindex="-1" aria-labelledby="sessionInfoModalLabel"
         aria-hidden="true">
         <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
               <div class="modal-header">
                  <h5 class="modal-title" id="sessionInfoModalLabel">
                     <span v-if="selectedSession"> Details for {{ formatPhoneNumber(selectedSession.jid) }} </span>
                  </h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
               </div>
               <div class="modal-body" v-if="selectedSession">
                  <table class="table detail-info-table sys-info-table">
                     <tbody>
                        <tr>
                           <td class="label">Account ID</td>
                           <td class="colon">:</td>
                           <td class="value font-monospace">{{ selectedSession.account }}</td>
                        </tr>
                        <tr>
                           <td class="label">Owner</td>
                           <td class="colon">:</td>
                           <td class="value font-monospace">{{
                              formatPhoneNumber(selectedSession.connector.sessionOpts.owner) }}</td>
                        </tr>
                        <tr>
                           <td class="label">Users</td>
                           <td class="colon">:</td>
                           <td class="value">{{ selectedSession.data.users }}</td>
                        </tr>
                        <tr>
                           <td class="label">Groups</td>
                           <td class="colon">:</td>
                           <td class="value">{{ selectedSession.data.groups }}</td>
                        </tr>
                        <tr>
                           <td class="label">Chats</td>
                           <td class="colon">:</td>
                           <td class="value">{{ selectedSession.data.chats }}</td>
                        </tr>
                        <tr>
                           <td class="label">Last Connect</td>
                           <td class="colon">:</td>
                           <td class="value">{{ formatTimestamp(selectedSession.last_connect) }}</td>
                        </tr>
                        <tr v-if="selectedSession.expired">
                           <td class="label">Plan</td>
                           <td class="colon">:</td>
                           <td class="value">{{ priceList.find(v => v.code === selectedSession.plan)?.name }}</td>
                        </tr>
                        <tr v-if="selectedSession.expired">
                           <td class="label">Expired At</td>
                           <td class="colon">:</td>
                           <td class="value">{{ formatTimestamp(selectedSession.expired) }}</td>
                        </tr>
                     </tbody>
                  </table>
               </div>
               <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
               </div>
            </div>
         </div>
      </div>

      <div class="modal fade" id="tokenModal" tabindex="-1" aria-labelledby="tokenModalLabel" aria-hidden="true">
         <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
               <div class="modal-header">
                  <h5 class="modal-title" id="tokenModalLabel">Session Token</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
               </div>
               <div class="modal-body">
                  <p>Here is the token for the selected session:</p>
                  <div class="input-group">
                     <input type="text" class="form-control font-monospace" :value="sessionToken" readonly
                        ref="tokenInputRef" />
                     <button @click="copyToken" class="btn" :class="isCopied ? 'btn-success' : 'btn-outline-secondary'"
                        type="button">
                        <i :class="isCopied ? 'bi bi-check-lg' : 'bi bi-clipboard'"></i>
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div class="modal fade" id="upgradeModal" tabindex="-1" aria-labelledby="upgradeModalLabel" aria-hidden="true">
         <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
               <div class="modal-header">
                  <h5 class="modal-title" id="upgradeModalLabel">Upgrade Session</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
               </div>
               <div class="modal-body" v-if="selectedSession">
                  <p>Upgrade premium plan for <strong>{{ formatPhoneNumber(selectedSession.jid) }}</strong>.</p>
                  <div class="mb-3">
                     <label for="upgradePlan" class="form-label">Select Plan</label>
                     <select id="upgradePlan" class="form-select" v-model="selectedPlan">
                        <option disabled value="">Choose a plan...</option>
                        <option value="none">Reset Premium</option>
                        <option v-for="plan in priceList" :key="plan.code" :value="plan.code">
                           {{ plan.name }} - {{ formatPrice(plan.price) }} ({{ plan.days }} {{ plan.days > 1 ? 'Days' :
                              'Day' }})
                        </option>
                     </select>
                  </div>
               </div>
               <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                  <button type="button" class="btn btn-primary" @click="submitUpgrade" :disabled="isUpgrading">
                     <span v-if="isUpgrading" class="spinner-border spinner-border-sm"></span> Submit
                  </button>
               </div>
            </div>
         </div>
      </div>

   </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import Swal from 'sweetalert2'

const { $api, $bootstrap } = useNuxtApp()
const config = useRuntimeConfig()
const priceList = ref(config.public.price_list || [])
useHead({ title: 'Sessions Management', titleTemplate: `%s - ${config.public.title}` })

const sessions = ref([])
const isLoading = ref(true)
const selectedSession = ref(null)
const sessionToken = ref('')
const tokenInputRef = ref(null)
const isCopied = ref(false)
const selectedPlan = ref('')
const isUpgrading = ref(false)

let infoModalInstance = null
let tokenModalInstance = null
let upgradeModalInstance = null

onMounted(async () => {
   await fetchSessions()
   if (process.client) {
      const infoEl = document.getElementById('sessionInfoModal')
      if (infoEl) infoModalInstance = new $bootstrap.Modal(infoEl)
      const tokenEl = document.getElementById('tokenModal')
      if (tokenEl) tokenModalInstance = new $bootstrap.Modal(tokenEl)
      const upgradeEl = document.getElementById('upgradeModal')
      if (upgradeEl) upgradeModalInstance = new $bootstrap.Modal(upgradeEl)
   }
})

const searchQuery = ref('')
const filterStatus = ref('all')
const currentPage = ref(1)
const itemsPerPage = ref(10)

const onlineCount = computed(() => sessions.value.filter(s => s.is_connected).length)
const offlineCount = computed(() => sessions.value.filter(s => !s.is_connected).length)

const filteredSessions = computed(() => {
   let filtered = [...sessions.value]
   if (filterStatus.value === 'online') {
      filtered = filtered.filter(session => session.is_connected)
   } else if (filterStatus.value === 'offline') {
      filtered = filtered.filter(session => !session.is_connected)
   }
   if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase().trim()
      filtered = filtered.filter(session => {
         const accountId = String(session.account).includes(String(query))
         const uname = session.connector?.override?.username?.toLowerCase().includes(query)
         const email = session.connector?.override?.email?.toLowerCase().includes(query)
         const sessionMatch = session.jid.includes(query)
         const ownerMatch = session.connector.sessionOpts.owner.includes(query)
         return accountId || uname || email || sessionMatch || ownerMatch
      })
   }
   return filtered
})

const totalPages = computed(() => Math.ceil(filteredSessions.value.length / itemsPerPage.value))

const paginatedSessions = computed(() => {
   const start = (currentPage.value - 1) * itemsPerPage.value
   const end = start + itemsPerPage.value
   return filteredSessions.value.slice(start, end)
})

watch([filterStatus, searchQuery], () => { currentPage.value = 1 })

const fetchSessions = async () => {
   isLoading.value = true
   try {
      const response = await $api('/data/sessions')
      sessions.value = response.status && Array.isArray(response.data) ? response.data : []
   } catch (error) {
      console.error('Failed to fetch sessions:', error)
      sessions.value = []
      Swal.fire({ icon: 'error', title: 'Fetch Failed', text: 'Could not retrieve sessions data.' })
   } finally {
      isLoading.value = false
   }
}

const refreshSessionsSilently = async () => {
   try {
      const response = await $api('/data/sessions')
      sessions.value = response.status && Array.isArray(response.data) ? response.data : []
   } catch (error) {
      console.error('Failed to refresh sessions:', error)
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Failed to refresh data!', showConfirmButton: false, timer: 3000 })
   }
}

const prevPage = () => { if (currentPage.value > 1) currentPage.value-- }
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++ }

const formatPhoneNumber = (jid = '') => {
   if (typeof jid !== 'string') return ''
   const numberPart = jid.split('@')[0]
   const phoneNumber = parsePhoneNumberFromString('+' + numberPart)
   return phoneNumber?.isValid() ? phoneNumber.formatInternational() : `+${numberPart}`
}

const formatTimestamp = timestamp => {
   if (!timestamp) return 'N/A'
   return new Date(timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}

const handleInfo = session => {
   selectedSession.value = session
   infoModalInstance?.show()
}

const handleToken = async session => {
   try {
      Swal.fire({ title: 'Fetching Token...', didOpen: () => Swal.showLoading(), allowOutsideClick: false })
      const response = await $api('/action/get-token', { method: 'POST', body: { id: session._id } })
      Swal.close()
      if (response.status && response.data.token) {
         sessionToken.value = response.data.token
         isCopied.value = false
         tokenModalInstance?.show()
      } else throw new Error(response.message || 'Token not found.')
   } catch (error) {
      console.error('Failed to get token:', error)
      Swal.fire({ icon: 'error', title: 'Error', text: 'Could not retrieve the token.' })
   }
}

const copyToken = () => {
   if (tokenInputRef.value) {
      tokenInputRef.value.select()
      document.execCommand('copy')
      isCopied.value = true
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Token copied!', showConfirmButton: false, timer: 2000 })
   }
}

const confirmTerminate = session => {
   Swal.fire({
      title: 'Are you sure?',
      html: `Terminate session for <strong>${formatPhoneNumber(session.jid)}</strong>?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
      reverseButtons: true
   }).then(r => { if (r.isConfirmed) handleTerminate(session) })
}

const handleTerminate = async session => {
   try {
      const response = await $api('/action/terminate', { method: 'POST', body: { id: session._id } })
      if (response.status) {
         await refreshSessionsSilently()
         Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Session terminated!', showConfirmButton: false, timer: 3000 })
      } else throw new Error(response.message)
   } catch (error) {
      console.error('Failed to terminate:', error)
      Swal.fire({ icon: 'error', title: 'Failed', text: 'Could not terminate session.' })
   }
}

const confirmDelete = session => {
   Swal.fire({
      title: 'Are you sure?',
      html: `Delete session for <strong>${formatPhoneNumber(session.jid)}</strong>?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
      reverseButtons: true
   }).then(r => { if (r.isConfirmed) handleDelete(session) })
}

const handleDelete = async session => {
   try {
      const response = await $api('/action/terminate', { method: 'POST', body: { id: session._id, remove: true } })
      if (response.status) {
         await refreshSessionsSilently()
         Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Session deleted!', showConfirmButton: false, timer: 3000 })
      } else throw new Error(response.message)
   } catch (error) {
      console.error('Failed to delete:', error)
      Swal.fire({ icon: 'error', title: 'Delete Failed', text: 'Could not delete session.' })
   }
}

const handleUpgrade = session => {
   selectedSession.value = session
   selectedPlan.value = ''
   upgradeModalInstance?.show()
}

const submitUpgrade = async () => {
   if (!selectedSession.value || !selectedPlan.value) {
      Swal.fire({ icon: 'warning', title: 'Invalid', text: 'Please select a plan.' })
      return
   }
   isUpgrading.value = true
   try {
      const response = await $api('/action/client-manage', {
         method: 'POST',
         body: { jid: selectedSession.value.jid, plan: selectedPlan.value }
      })
      if (response.status) {
         upgradeModalInstance?.hide()
         Swal.fire({ icon: 'success', title: 'Success', text: response.message || 'Upgraded.' })
         await refreshSessionsSilently()
      } else throw new Error(response.message)
   } catch (e) {
      Swal.fire({ icon: 'error', title: 'Upgrade Failed', text: e.message })
   } finally {
      isUpgrading.value = false
   }
}

const formatPrice = price => {
   return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
   }).format(price)
}
</script>