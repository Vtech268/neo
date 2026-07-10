<template>
   <div>
      <div class="container px-3 mb-4 mt-1">

         <div v-if="isLoading" class="text-center py-5">
            <div class="loader-spinner"></div>
            <p class="mt-3">Fetching data...</p>
         </div>

         <div v-else-if="isError" class="alert alert-danger">
            {{ errorText }}
         </div>

         <div v-else>
            <div class="content-card rounded-3 mb-4">
               <div class="card-header-custom">
                  <h5 class="main-title mb-0">Advanced Settings</h5>
               </div>
               <div class="card-body-custom">
                  <p class="text-secondary mb-3">
                     Configure advanced options for group: <strong class="text-primary-custom">{{ groupData.name
                        }}</strong>
                  </p>
                  <div class="row">
                     <div class="col-md-6">
                        <label for="upgrade-days" class="form-label">Add Rental Days</label>
                        <div class="input-group">
                           <input type="number" id="upgrade-days" class="form-control" v-model.number="upgradeDays"
                              placeholder="e.g., 30">
                           <button class="btn btn-custom-accent" @click="handleUpgrade" :disabled="isUpgrading">
                              <span v-if="isUpgrading" class="spinner-border spinner-border-sm"></span>
                              <span v-else>Upgrade</span>
                           </button>
                        </div>
                        <div class="form-text">Enter the number of days to add to the group's rental period.</div>
                     </div>
                  </div>
               </div>
            </div>

            <div class="content-card rounded-3 mb-4">
               <div class="card-header-custom">
                  <h5 class="main-title mb-0">Welcome & Left Messages</h5>
               </div>
               <div class="card-body-custom">
                  <div class="row g-3">
                     <div class="col-md-6">
                        <label for="text_welcome" class="form-label">Welcome Message</label>
                        <textarea id="text_welcome" class="form-control" v-model="groupData.text_welcome"
                           rows="5"></textarea>
                        <div class="form-text">
                           Use <code>+tag</code> for user mention and <code>+grup</code> for group name.
                        </div>
                     </div>
                     <div class="col-md-6">
                        <label for="text_left" class="form-label">Left Message</label>
                        <textarea id="text_left" class="form-control" v-model="groupData.text_left" rows="5"></textarea>
                        <div class="form-text">
                           Use <code>+tag</code> for user mention and <code>+grup</code> for group name.
                        </div>
                     </div>
                  </div>
                  <div class="text-end mt-4">
                     <button class="btn btn-custom-accent px-4" @click="saveWelcomeLeft" :disabled="isSaving">
                        <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span>
                        {{ isSaving ? 'Saving...' : 'Save Changes' }}
                     </button>
                  </div>
               </div>
            </div>

            <div class="content-card rounded-3 mb-4">
               <div class="card-header-custom">
                  <h5 class="main-title mb-0">Members Management</h5>
               </div>
               <div class="card-body-custom">
                  <div class="row g-3 mb-4 align-items-center">
                     <div class="col-lg-6">
                        <input type="text" class="form-control" placeholder="Search by member number..."
                           v-model="memberSearchQuery" />
                     </div>
                  </div>
                  <div class="table-responsive">
                     <table class="table detail-info-table">
                        <thead>
                           <tr>
                              <th scope="col" class="text-nowrap-custom">Number</th>
                              <th scope="col" class="text-nowrap-custom text-center">Chat</th>
                              <th scope="col" class="text-nowrap-custom text-center">Warning</th>
                              <th scope="col" class="text-nowrap-custom">AFK</th>
                              <th scope="col" class="text-nowrap-custom">Joined At</th>
                              <th scope="col" class="text-nowrap-custom text-end">Actions</th>
                           </tr>
                        </thead>
                        <tbody v-if="paginatedMembers.length > 0">
                           <tr v-for="member in paginatedMembers" :key="member.jid">
                              <td class="font-monospace small text-nowrap-custom">{{ formatPhoneNumber(member.jid) }}
                              </td>
                              <td class="text-center">{{ member.chat }}</td>
                              <td class="text-center">{{ member.warning }}</td>
                              <td class="text-nowrap-custom">{{ formatAfkTime(member.afK) }}</td>
                              <td class="text-nowrap-custom">{{ formatTimestamp(member.joined_at) }}</td>
                              <td class="text-end text-nowrap-custom">
                                 <button class="btn btn-sm btn-danger" @click="confirmDeleteMember(member)"><i
                                       class="bi bi-trash"></i></button>
                              </td>
                           </tr>
                        </tbody>
                        <tbody v-else>
                           <tr>
                              <td colspan="6" class="text-center py-4">No members match the search query.</td>
                           </tr>
                        </tbody>
                     </table>
                  </div>
                  <div v-if="memberTotalPages > 1" class="d-flex justify-content-between align-items-center mt-4">
                     <span class="pagination-info small">Showing {{ (memberCurrentPage - 1) * membersPerPage + 1 }} - {{
                        Math.min(memberCurrentPage * membersPerPage, filteredMembers.length) }} of {{
                           filteredMembers.length }} members</span>
                     <nav aria-label="Member pagination">
                        <ul class="pagination mb-0">
                           <li class="page-item" :class="{ disabled: memberCurrentPage === 1 }"><a class="page-link"
                                 href="#" @click.prevent="memberPrevPage">Previous</a></li>
                           <li class="page-item" :class="{ disabled: memberCurrentPage === memberTotalPages }"><a
                                 class="page-link" href="#" @click.prevent="memberNextPage">Next</a></li>
                        </ul>
                     </nav>
                  </div>
               </div>
            </div>
         </div>
      </div>
   </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import Swal from 'sweetalert2'
import { useRoute } from 'vue-router'
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import { formatDistanceToNow } from 'date-fns'

const { $api } = useNuxtApp()
const route = useRoute()
const config = useRuntimeConfig()

const groupData = ref(null)
const isLoading = ref(true)
const isError = ref(false)
const errorText = ref('Failed to load group data. Please try again later.')
const isSaving = ref(false)
const isUpgrading = ref(false)
const upgradeDays = ref(null)

const memberSearchQuery = ref('')
const memberCurrentPage = ref(1)
const membersPerPage = ref(10)

const decodedJid = computed(() => {
   try { return atob(route.params.id) } catch (e) { return null }
})

const memberList = computed(() => {
   if (!groupData.value || !groupData.value.member) return []
   return Object.entries(groupData.value.member).map(([jid, data]) => ({ jid, ...data }))
})

const filteredMembers = computed(() => {
   let filtered = [...memberList.value]
   if (memberSearchQuery.value) {
      const query = memberSearchQuery.value.toLowerCase().trim()
      filtered = filtered.filter(member => member.jid.includes(query))
   }
   return filtered
})

const memberTotalPages = computed(() => Math.ceil(filteredMembers.value.length / membersPerPage.value))

const paginatedMembers = computed(() => {
   const start = (memberCurrentPage.value - 1) * membersPerPage.value
   const end = start + membersPerPage.value
   return filteredMembers.value.slice(start, end)
})

watch(memberSearchQuery, () => { memberCurrentPage.value = 1 })

const fetchGroupData = async () => {
   if (!decodedJid.value) {
      isError.value = true
      errorText.value = 'Invalid group ID provided in the URL.'
      isLoading.value = false
      return
   }
   isLoading.value = true
   isError.value = false
   try {
      const response = await $api('/data/group', { method: 'POST', body: { jid: decodedJid.value } })
      if (response.status && response.data) {
         groupData.value = response.data
         useHead({ title: `Group: ${groupData.value?.name || 'Settings'}`, titleTemplate: `%s - ${config.public.title}` })
      } else {
         throw new Error(response.message || 'Failed to fetch group data')
      }
   } catch (error) {
      console.error(error)
      errorText.value = error.message || 'An unexpected error occurred.'
      isError.value = true
   } finally {
      isLoading.value = false
   }
}

const refreshGroupDataSilently = async () => {
   if (!decodedJid.value) return
   try {
      const response = await $api('/data/group', { method: 'POST', body: { jid: decodedJid.value } })
      if (response.status && response.data) groupData.value = response.data
   } catch (error) {
      console.error('Failed to silently refresh group data:', error)
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Failed to refresh data!', showConfirmButton: false, timer: 3000 })
   }
}

const saveWelcomeLeft = async () => {
   if (!groupData.value) return
   isSaving.value = true
   try {
      const payload = { jid: groupData.value.jid, text_welcome: groupData.value.text_welcome, text_left: groupData.value.text_left }
      const response = await $api('/action/update-group', { method: 'POST', body: payload })
      if (response.status) {
         Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Messages updated successfully!', showConfirmButton: false, timer: 3000, timerProgressBar: true })
         await refreshGroupDataSilently()
      } else {
         throw new Error(response.message || 'Failed to save settings.')
      }
   } catch (error) {
      console.error('Error saving settings:', error)
      Swal.fire({ icon: 'error', title: 'Save Failed', text: error.message || 'An unexpected error occurred.' })
   } finally {
      isSaving.value = false
   }
}

const handleUpgrade = async () => {
   if (!groupData.value || !upgradeDays.value || upgradeDays.value <= 0) {
      Swal.fire({ icon: 'warning', title: 'Invalid Input', text: 'Please enter a valid number of days.' })
      return
   }
   isUpgrading.value = true
   try {
      const response = await $api('/action/group-manage', {
         method: 'POST',
         body: {
            jid: groupData.value.jid,
            days: upgradeDays.value,
            action: 'upgrade_group'
         }
      })
      if (response.status) {
         Swal.fire({ icon: 'success', title: 'Success!', text: `Group rental has been extended by ${upgradeDays.value} days.` })
         await refreshGroupDataSilently()
      } else {
         throw new Error(response.message || 'Failed to upgrade group.')
      }
   } catch (error) {
      console.error('Error upgrading group:', error)
      Swal.fire({ icon: 'error', title: 'Upgrade Failed', text: error.data?.message || error.message })
   } finally {
      isUpgrading.value = false
      upgradeDays.value = null
   }
}

const confirmDeleteMember = member => {
   Swal.fire({
      title: 'Are you sure?',
      html: `You are about to remove member <br><strong>${formatPhoneNumber(member.jid)}</strong> from the group.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, remove them!',
      cancelButtonText: 'Cancel',
      reverseButtons: true
   }).then(result => {
      if (result.isConfirmed) handleDeleteMember(member)
   })
}

const handleDeleteMember = async member => {
   if (!groupData.value) return
   try {
      const response = await $api('/action/group-manage', {
         method: 'POST',
         body: {
            jid: groupData.value.jid,
            target: member.jid,
            action: 'delete_member'
         }
      })
      if (response.status) {
         Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Member removed!', showConfirmButton: false, timer: 3000, timerProgressBar: true })
         await refreshGroupDataSilently()
      } else {
         throw new Error(response.message || 'Server returned a failure status.')
      }
   } catch (error) {
      console.error('Failed to delete member:', error)
      Swal.fire({ icon: 'error', title: 'Removal Failed', text: error.data?.message || error.message || 'Could not remove the member.' })
   }
}

const formatTimestamp = timestamp => {
   if (!timestamp || timestamp === 0) return 'N/A'
   return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
   })
}

const formatAfkTime = timestamp => {
   if (!timestamp || timestamp < 0) return '-'
   return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
}

const formatPhoneNumber = (jid = '') => {
   if (typeof jid !== 'string') return ''
   const numberPart = jid.split('@')[0]
   const phoneNumber = parsePhoneNumberFromString('+' + numberPart)
   return phoneNumber?.isValid() ? phoneNumber.formatInternational() : `+${numberPart}`
}

const memberPrevPage = () => { if (memberCurrentPage.value > 1) memberCurrentPage.value-- }

const memberNextPage = () => { if (memberCurrentPage.value < memberTotalPages.value) memberCurrentPage.value++ }

onMounted(() => {
   fetchGroupData()
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

.text-secondary {
   color: var(--dark-secondary-text-color) !important;
}

body.light-mode .text-secondary {
   color: #6c757d !important;
}
</style>