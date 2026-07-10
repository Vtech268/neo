<template>
   <div>
      <div class="container px-3 mb-4 mt-1">
         <div class="content-card rounded-3">
            <div class="card-header-custom d-flex justify-content-between align-items-center">
               <h5 class="main-title mb-0">Chats Management</h5>
            </div>
            <div class="card-body-custom">
               <div v-if="isLoading" class="text-center py-5">
                  <div class="loader-spinner"></div>
                  <p class="mt-3">Fetching data...</p>
               </div>
               <div v-else-if="!chats.length" class="alert alert-info">
                  No chats found in the database.
               </div>
               <transition name="fade">
                  <div v-if="!isLoading && chats.length > 0">
                     <div class="row g-3 mb-4">
                        <div class="col-6 col-md-4">
                           <div class="stat-card-simple">
                              <div class="value">{{ stats.total }}</div>
                              <div class="label">Total Chats</div>
                           </div>
                        </div>
                        <div class="col-6 col-md-4">
                           <div class="stat-card-simple">
                              <div class="value text-success">{{ stats.personal }}</div>
                              <div class="label">Personal</div>
                           </div>
                        </div>
                        <div class="col-12 col-md-4">
                           <div class="stat-card-simple">
                              <div class="value text-info">{{ stats.group }}</div>
                              <div class="label">Group</div>
                           </div>
                        </div>
                     </div>
                     <div class="row g-3 mb-4 align-items-center">
                        <div class="col-lg-6">
                           <input type="text" class="form-control" placeholder="Search by ID (JID)..."
                              v-model="searchQuery" />
                        </div>
                        <div class="col-lg-6 d-flex justify-content-lg-end">
                           <div class="btn-group" role="group" aria-label="Chat Filters">
                              <button type="button" class="btn btn-outline-secondary"
                                 :class="{ 'active': filterStatus === 'all' }"
                                 @click="filterStatus = 'all'">All</button>
                              <button type="button" class="btn btn-outline-secondary"
                                 :class="{ 'active': filterStatus === 'personal' }"
                                 @click="filterStatus = 'personal'">Personal</button>
                              <button type="button" class="btn btn-outline-secondary"
                                 :class="{ 'active': filterStatus === 'group' }"
                                 @click="filterStatus = 'group'">Group</button>
                           </div>
                        </div>
                     </div>
                     <div class="table-responsive">
                        <table class="table detail-info-table">
                           <thead>
                              <tr>
                                 <th scope="col" class="text-nowrap-custom">ID (JID)</th>
                                 <th scope="col" class="text-nowrap-custom">Messages</th>
                                 <th scope="col" class="text-nowrap-custom">Last Chat</th>
                                 <th scope="col" class="text-end text-nowrap-custom">Actions</th>
                              </tr>
                           </thead>
                           <tbody v-if="paginatedChats.length > 0">
                              <tr v-for="chat in paginatedChats" :key="chat.jid">
                                 <td class="font-monospace text-nowrap-custom small">{{ chat.jid }}</td>
                                 <td class="text-nowrap-custom">{{ chat.chat.toLocaleString() }}</td>
                                 <td class="text-nowrap-custom">{{ formatTimestamp(chat.lastreply) }}</td>
                                 <td class="text-end text-nowrap-custom">
                                    <button @click="confirmDelete(chat)" class="btn btn-sm btn-danger"><i
                                          class="bi bi-trash"></i></button>
                                 </td>
                              </tr>
                           </tbody>
                           <tbody v-else>
                              <tr>
                                 <td colspan="4" class="text-center py-4">No chats match the current filter or search.
                                 </td>
                              </tr>
                           </tbody>
                        </table>
                     </div>
                     <div v-if="totalPages > 1" class="d-flex justify-content-between align-items-center mt-4">
                        <span class="pagination-info small">Showing {{ (currentPage - 1) * itemsPerPage + 1 }} - {{
                           Math.min(currentPage * itemsPerPage, filteredChats.length) }} of {{ filteredChats.length }}
                           chats</span>
                        <nav aria-label="Chat pagination">
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
   </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import Swal from 'sweetalert2'

const { $api } = useNuxtApp()
const config = useRuntimeConfig()
useHead({ title: 'Chats Management', titleTemplate: `%s - ${config.public.title}` })

const chats = ref([])
const stats = ref({ personal: 0, group: 0, total: 0 })
const isLoading = ref(true)

const searchQuery = ref('')
const filterStatus = ref('all')
const currentPage = ref(1)
const itemsPerPage = ref(10)

const filteredChats = computed(() => {
   let filtered = [...chats.value]
   if (filterStatus.value === 'personal') {
      filtered = filtered.filter(chat => !chat.jid.includes('@g.us'))
   } else if (filterStatus.value === 'group') {
      filtered = filtered.filter(chat => chat.jid.includes('@g.us'))
   }
   if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase().trim()
      if (query) {
         filtered = filtered.filter(chat => chat.jid.toLowerCase().includes(query))
      }
   }
   return filtered
})

const totalPages = computed(() => {
   return Math.ceil(filteredChats.value.length / itemsPerPage.value)
})

const paginatedChats = computed(() => {
   const start = (currentPage.value - 1) * itemsPerPage.value
   const end = start + itemsPerPage.value
   return filteredChats.value.slice(start, end)
})

watch([filterStatus, searchQuery], () => {
   currentPage.value = 1
})

const fetchChats = async () => {
   isLoading.value = true
   try {
      const response = await $api('/data/chats')
      if (response.status && response.data) {
         chats.value = response.data.chats
         stats.value = response.data.stats
      }
   } catch (error) {
      console.error('Failed to fetch chats data:', error)
      Swal.fire({
         icon: 'error',
         title: 'Failed to Fetch Data',
         text: 'Could not retrieve chats data from the server.'
      })
   } finally {
      isLoading.value = false
   }
}

const refreshChatsSilently = async () => {
   try {
      const response = await $api('/data/chats')
      if (response.status && response.data) {
         chats.value = response.data.chats
         stats.value = response.data.stats
      }
   } catch (error) {
      console.error('Failed to silently refresh chats data:', error)
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Failed to refresh data!', showConfirmButton: false, timer: 3000 })
   }
}

const prevPage = () => {
   if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
   if (currentPage.value < totalPages.value) currentPage.value++
}

const formatTimestamp = timestamp => {
   if (!timestamp || timestamp === 0) return 'N/A'
   return new Date(timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}

const handleDelete = async chat => {
   try {
      const response = await $api('/action/delete', {
         method: 'POST',
         body: {
            jid: chat.jid,
            type: '_c'
         }
      })
      if (response.status) {
         await refreshChatsSilently()
         Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: `Chat ${chat.jid} deleted!`,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
         })
      } else {
         throw new Error(response.message || 'Server returned a failure status.')
      }
   } catch (error) {
      console.error('Failed to delete chat:', error)
      Swal.fire({
         icon: 'error',
         title: 'Deletion Failed',
         text: 'Could not delete the chat. Please try again.'
      })
   }
}

const confirmDelete = chat => {
   Swal.fire({
      title: 'Are you sure?',
      html: `You are about to delete chat for JID: <br><strong>${chat.jid}</strong>. This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true
   }).then(result => {
      if (result.isConfirmed) {
         handleDelete(chat)
      }
   })
}

onMounted(() => {
   fetchChats()
})
</script>