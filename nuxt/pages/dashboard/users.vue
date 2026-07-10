<template>
   <div>
      <div class="container px-3 mb-4 mt-1">
         <div class="content-card rounded-3">
            <div class="card-header-custom d-flex justify-content-between align-items-center">
               <h5 class="main-title mb-0">Users Management</h5>
            </div>
            <div class="card-body-custom">
               <div v-if="isLoading" class="text-center py-5">
                  <div class="loader-spinner"></div>
                  <p class="mt-3">Fetching data...</p>
               </div>
               <div v-else-if="!users.length" class="alert alert-info">
                  No users found in the database.
               </div>
               <transition name="fade">
                  <div v-if="!isLoading && users.length > 0">
                     <div class="row g-3 mb-4">
                        <div class="col-6 col-md-4">
                           <div class="stat-card-simple">
                              <div class="value">{{ stats.total?.toLocaleString() }}</div>
                              <div class="label">Total Users</div>
                           </div>
                        </div>
                        <div class="col-6 col-md-4">
                           <div class="stat-card-simple">
                              <div class="value text-success">{{ stats.premium?.toLocaleString() }}</div>
                              <div class="label">Premium Users</div>
                           </div>
                        </div>
                        <div class="col-12 col-md-4">
                           <div class="stat-card-simple">
                              <div class="value text-danger">{{ stats.banned?.toLocaleString() }}</div>
                              <div class="label">Banned Users</div>
                           </div>
                        </div>
                     </div>
                     <div class="row g-3 mb-4 align-items-center">
                        <div class="col-lg-6">
                           <input type="text" class="form-control" placeholder="Search by name or number..."
                              v-model="searchQuery" />
                        </div>
                        <div class="col-lg-6 d-flex justify-content-lg-end">
                           <div class="btn-group" role="group" aria-label="User Filters">
                              <button type="button" class="btn btn-outline-secondary"
                                 :class="{ 'active': filterStatus === 'all' }"
                                 @click="filterStatus = 'all'">All</button>
                              <button type="button" class="btn btn-outline-secondary"
                                 :class="{ 'active': filterStatus === 'premium' }"
                                 @click="filterStatus = 'premium'">Premium</button>
                              <button type="button" class="btn btn-outline-secondary"
                                 :class="{ 'active': filterStatus === 'banned' }"
                                 @click="filterStatus = 'banned'">Banned</button>
                           </div>
                        </div>
                     </div>
                     <div class="table-responsive">
                        <table class="table detail-info-table">
                           <thead>
                              <tr>
                                 <th scope="col" class="text-nowrap-custom">Number</th>
                                 <th scope="col" class="text-nowrap-custom">Premium</th>
                                 <th scope="col" class="text-nowrap-custom">Banned</th>
                                 <th scope="col" class="text-end text-nowrap-custom">Actions</th>
                              </tr>
                           </thead>
                           <tbody v-if="paginatedUsers.length > 0">
                              <tr v-for="user in paginatedUsers" :key="user.jid">
                                 <td class="font-monospace text-nowrap-custom">{{ formatPhoneNumber(user.jid) }}</td>
                                 <td class="text-nowrap-custom">
                                    <span :class="user.premium ? 'badge bg-success' : 'badge text-bg-secondary'">
                                       {{ user.premium ? 'Yes' : 'No' }}
                                    </span>
                                 </td>
                                 <td class="text-nowrap-custom">
                                    <span :class="user.banned ? 'badge bg-danger' : 'badge text-bg-secondary'">
                                       {{ user.banned ? 'Yes' : 'No' }}
                                    </span>
                                 </td>
                                 <td class="text-end text-nowrap-custom">
                                    <button @click="handleInfo(user)"
                                       class="btn btn-sm btn-secondary me-1">Detail</button>
                                    <button @click="handleEdit(user)" class="btn btn-sm btn-warning me-1"><i
                                          class="bi bi-gear"></i></button>
                                    <button @click="confirmDelete(user)" class="btn btn-sm btn-danger"><i
                                          class="bi bi-trash"></i></button>
                                 </td>
                              </tr>
                           </tbody>
                           <tbody v-else>
                              <tr>
                                 <td colspan="4" class="text-center py-4">No users match the current filter or search.
                                 </td>
                              </tr>
                           </tbody>
                        </table>
                     </div>
                     <div v-if="totalPages > 1" class="d-flex justify-content-between align-items-center mt-4">
                        <span class="pagination-info small">Showing {{ (currentPage - 1) * itemsPerPage + 1 }} - {{
                           Math.min(currentPage * itemsPerPage, filteredUsers.length) }} of {{ filteredUsers.length }}
                           users</span>
                        <nav aria-label="User pagination">
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

      <div class="modal fade" id="userInfoModal" tabindex="-1" aria-labelledby="userInfoModalLabel" aria-hidden="true">
         <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
               <div class="modal-header">
                  <h5 class="modal-title" id="userInfoModalLabel">
                     <span v-if="selectedUser"> Details for {{ selectedUser.name || formatPhoneNumber(selectedUser.jid)
                        }} </span>
                  </h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
               </div>
               <div class="modal-body" v-if="selectedUser">
                  <table class="table detail-info-table sys-info-table">
                     <tbody>
                        <tr>
                           <td class="label">Number</td>
                           <td class="colon">:</td>
                           <td class="value font-monospace">{{ formatPhoneNumber(selectedUser.jid) }}</td>
                        </tr>
                        <tr>
                           <td class="label">Name</td>
                           <td class="colon">:</td>
                           <td class="value">{{ selectedUser.name || 'N/A' }}</td>
                        </tr>
                        <tr>
                           <td class="label">Limit</td>
                           <td class="colon">:</td>
                           <td class="value">{{ selectedUser.limit }}</td>
                        </tr>
                        <tr>
                           <td class="label">Limit Game</td>
                           <td class="colon">:</td>
                           <td class="value">{{ selectedUser.limit_game }}</td>
                        </tr>
                        <tr>
                           <td class="label">Point</td>
                           <td class="colon">:</td>
                           <td class="value">{{ selectedUser.point }}</td>
                        </tr>
                        <tr v-if="selectedUser.premium">
                           <td class="label">Expired</td>
                           <td class="colon">:</td>
                           <td class="value">{{ formatTimestamp(selectedUser.expired) }}</td>
                        </tr>
                        <tr>
                           <td class="label">Last Seen</td>
                           <td class="colon">:</td>
                           <td class="value">{{ formatTimestamp(selectedUser.lastseen) }}</td>
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

      <EditUserModal ref="editModalRef" :user="selectedUser" @save="handleSave" />
   </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import Swal from 'sweetalert2'
import EditUserModal from '@/components/EditUserModal.vue'

const { $api, $bootstrap } = useNuxtApp()
const config = useRuntimeConfig()
useHead({ title: 'Users Management', titleTemplate: `%s - ${config.public.title}` })

const users = ref([])
const stats = ref({ banned: 0, premium: 0, total: 0 })
const isLoading = ref(true)
const selectedUser = ref(null)
const editModalRef = ref(null)
let editModalInstance = null
let infoModalInstance = null

onMounted(async () => {
   await fetchUsers()
})

const searchQuery = ref('')
const filterStatus = ref('all')
const currentPage = ref(1)
const itemsPerPage = ref(10)

const filteredUsers = computed(() => {
   let filtered = [...users.value]
   if (filterStatus.value === 'premium') {
      filtered = filtered.filter(user => user.premium)
   } else if (filterStatus.value === 'banned') {
      filtered = filtered.filter(user => user.banned)
   }
   if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase().trim()
      if (query) {
         filtered = filtered.filter(user => {
            const nameMatch = user.name && user.name.toLowerCase().includes(query)
            const numberMatch = user.jid.includes(query)
            return nameMatch || numberMatch
         })
      }
   }
   return filtered
})

const totalPages = computed(() => Math.ceil(filteredUsers.value.length / itemsPerPage.value))
const paginatedUsers = computed(() => {
   const start = (currentPage.value - 1) * itemsPerPage.value
   const end = start + itemsPerPage.value
   return filteredUsers.value.slice(start, end)
})

watch([filterStatus, searchQuery], () => { currentPage.value = 1 })

const fetchUsers = async () => {
   isLoading.value = true
   try {
      const response = await $api('/data/users')
      if (response.status && response.data) {
         users.value = response.data.users
         stats.value = response.data.stats
      }
   } catch (error) {
      console.error("Failed to fetch users data:", error)
      Swal.fire({ icon: 'error', title: 'Failed to Fetch Data', text: 'Could not retrieve user data from the server.' })
   } finally {
      isLoading.value = false
   }
}

const refreshUsersSilently = async () => {
   try {
      const response = await $api('/data/users')
      if (response.status && response.data) {
         users.value = response.data.users
         stats.value = response.data.stats
      }
   } catch (error) {
      console.error("Failed to silently refresh users data:", error)
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Failed to refresh data!', showConfirmButton: false, timer: 3000 });
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

const formatTimestamp = (timestamp) => {
   if (!timestamp || timestamp === 0) return 'N/A'
   return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
   })
}

const handleInfo = (user) => {
   selectedUser.value = user
   if (!infoModalInstance) {
      const modalEl = document.getElementById('userInfoModal')
      if (modalEl) infoModalInstance = new $bootstrap.Modal(modalEl)
   }
   infoModalInstance?.show()
}

const handleEdit = (user) => {
   selectedUser.value = user
   if (!editModalInstance) {
      const modalEl = document.getElementById('editUserModal')
      if (modalEl) editModalInstance = new $bootstrap.Modal(modalEl)
   }
   editModalInstance?.show()
}

const handleSave = async (updatedUser) => {
   const payload = {
      id: updatedUser.jid,
      name: updatedUser.name,
      limit: updatedUser.limit,
      limit_game: updatedUser.limit_game,
      premium: updatedUser.premium,
      banned: updatedUser.banned,
      premium_days: updatedUser.premium_days || 0
   }
   try {
      const response = await $api('/action/update-user', { method: 'POST', body: payload })
      if (response.status) {
         await refreshUsersSilently()

         editModalInstance?.hide()
         Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'User updated successfully!', showConfirmButton: false, timer: 3000, timerProgressBar: true })
      } else {
         throw new Error(response.message || 'Server returned a failure status.')
      }
   } catch (error) {
      console.error('Failed to update user:', error)
      Swal.fire({ icon: 'error', title: 'Update Failed', text: 'Could not update the user. Please try again.' })
   } finally {
      if (editModalRef.value) editModalRef.value.resetSubmittingState()
   }
}

const handleDelete = async (user) => {
   try {
      const response = await $api('/action/delete', { method: 'POST', body: { jid: user.jid, type: '_u' } })
      if (response.status) {
         await refreshUsersSilently()

         Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `User deleted!`, showConfirmButton: false, timer: 3000, timerProgressBar: true })
      } else {
         throw new Error(response.message || 'Server returned a failure status.')
      }
   } catch (error) {
      console.error('Failed to delete user:', error)
      Swal.fire({ icon: 'error', title: 'Deletion Failed', text: 'Could not delete the user. Please try again.' })
   }
}

const confirmDelete = (user) => {
   const formattedNumber = formatPhoneNumber(user.jid)
   const displayName = user.name || formattedNumber
   const itemInfo = user.name ? `<br><strong class="font-monospace">${formattedNumber}</strong>` : ''
   Swal.fire({
      title: 'Are you sure?', html: `You are about to delete user <strong>${displayName}</strong>${itemInfo}. This action cannot be undone.`,
      icon: 'warning', showCancelButton: true, confirmButtonText: 'Yes, delete it!', cancelButtonText: 'Cancel', reverseButtons: true
   }).then((result) => {
      if (result.isConfirmed) handleDelete(user)
   })
}
</script>