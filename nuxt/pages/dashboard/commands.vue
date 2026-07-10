<template>
   <div>
      <div class="container px-3 mb-4 mt-1">
         <div class="content-card rounded-3">
            <div class="card-header-custom d-flex justify-content-between align-items-center">
               <h5 class="main-title mb-0">Commands Management</h5>
            </div>

            <div class="card-body-custom">
               <div v-if="isLoading" class="text-center py-5">
                  <div class="loader-spinner"></div>
                  <p class="mt-3">Fetching data...</p>
               </div>

               <div v-else-if="!commands.length" class="alert alert-info">
                  No commands found.
               </div>

               <transition name="fade">
                  <div v-if="!isLoading && commands.length > 0">
                     <div class="row g-3 mb-4">
                        <div class="col-6 col-md-4">
                           <div class="stat-card-simple">
                              <div class="value">{{ stats.total }}</div>
                              <div class="label">Total Commands</div>
                           </div>
                        </div>
                        <div class="col-6 col-md-4">
                           <div class="stat-card-simple">
                              <div class="value text-success">{{ stats.enable }}</div>
                              <div class="label">Enabled</div>
                           </div>
                        </div>
                        <div class="col-12 col-md-4">
                           <div class="stat-card-simple">
                              <div class="value text-danger">{{ stats.disable }}</div>
                              <div class="label">Disabled</div>
                           </div>
                        </div>
                     </div>

                     <div class="row g-3 mb-4 align-items-center">
                        <div class="col-lg-6">
                           <input type="text" class="form-control" placeholder="Search by command name..."
                              v-model="searchQuery" />
                        </div>
                        <div class="col-lg-6 d-flex justify-content-lg-end">
                           <div class="btn-group" role="group" aria-label="Command Filters">
                              <button type="button" class="btn btn-outline-secondary"
                                 :class="{ 'active': filterStatus === 'all' }"
                                 @click="filterStatus = 'all'">All</button>
                              <button type="button" class="btn btn-outline-secondary"
                                 :class="{ 'active': filterStatus === 'enabled' }"
                                 @click="filterStatus = 'enabled'">Enabled</button>
                              <button type="button" class="btn btn-outline-secondary"
                                 :class="{ 'active': filterStatus === 'disabled' }"
                                 @click="filterStatus = 'disabled'">Disabled</button>
                           </div>
                        </div>
                     </div>

                     <div class="table-responsive">
                        <table class="table detail-info-table">
                           <thead>
                              <tr>
                                 <th scope="col" class="text-nowrap-custom">Command Name</th>
                                 <th scope="col" class="text-nowrap-custom text-center">Total Hits</th>
                                 <th scope="col" class="text-nowrap-custom text-center">Today</th>
                                 <th scope="col" class="text-nowrap-custom">Last Hit</th>
                                 <th scope="col" class="text-end text-nowrap-custom">Status</th>
                              </tr>
                           </thead>
                           <tbody v-if="paginatedCommands.length > 0">
                              <tr v-for="command in paginatedCommands" :key="command.name">
                                 <td class="font-monospace text-nowrap-custom">{{ command.name }}</td>
                                 <td class="text-nowrap-custom text-center">{{ command.stats?.hitstat || 0 }}</td>
                                 <td class="text-nowrap-custom text-center">{{ command.stats?.today || 0 }}</td>
                                 <td class="text-nowrap-custom">{{ formatTimestamp(command.stats?.lasthit) }}</td>
                                 <td class="text-end text-nowrap-custom">
                                    <div class="form-check form-switch d-inline-block">
                                       <input class="form-check-input" type="checkbox" role="switch"
                                          :id="`switch-${command.name}`" :checked="!command.disabled"
                                          @change="toggleCommandStatus(command, $event)">
                                    </div>
                                 </td>
                              </tr>
                           </tbody>
                           <tbody v-else>
                              <tr>
                                 <td colspan="5" class="text-center py-4">No commands match the current filter or
                                    search.</td>
                              </tr>
                           </tbody>
                        </table>
                     </div>

                     <div v-if="totalPages > 1" class="d-flex justify-content-between align-items-center mt-4">
                        <span class="pagination-info small">Showing {{ (currentPage - 1) * itemsPerPage + 1 }} - {{
                           Math.min(currentPage * itemsPerPage, filteredCommands.length) }} of {{
                           filteredCommands.length }} commands</span>
                        <nav aria-label="Command pagination">
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
useHead({ title: 'Commands Management', titleTemplate: `%s - ${config.public.title}` })

const commands = ref([])
const stats = ref({ enable: 0, disable: 0, total: 0 })
const isLoading = ref(true)

const searchQuery = ref('')
const filterStatus = ref('all')
const currentPage = ref(1)
const itemsPerPage = ref(10)

const filteredCommands = computed(() => {
   let filtered = [...commands.value]
   if (filterStatus.value === 'enabled') {
      filtered = filtered.filter(p => !p.disabled)
   } else if (filterStatus.value === 'disabled') {
      filtered = filtered.filter(p => p.disabled)
   }
   if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase().trim()
      if (query) {
         filtered = filtered.filter(p => p.name.toLowerCase().includes(query))
      }
   }
   filtered.sort((a, b) => (b.stats?.hitstat || 0) - (a.stats?.hitstat || 0))
   return filtered
})

const totalPages = computed(() => Math.ceil(filteredCommands.value.length / itemsPerPage.value))

const paginatedCommands = computed(() => {
   const start = (currentPage.value - 1) * itemsPerPage.value
   const end = start + itemsPerPage.value
   return filteredCommands.value.slice(start, end)
})

watch([filterStatus, searchQuery], () => {
   currentPage.value = 1
})

const fetchCommands = async () => {
   isLoading.value = true
   try {
      const response = await $api('/data/commands')
      if (response.status && response.data) {
         commands.value = response.data.commands
         stats.value = response.data.stats
      } else {
         commands.value = []
         stats.value = { enable: 0, disable: 0, total: 0 }
      }
   } catch (error) {
      console.error("Failed to fetch commands data:", error)
      commands.value = []
      Swal.fire({ icon: 'error', title: 'Fetch Failed', text: 'Could not retrieve commands data.' })
   } finally {
      isLoading.value = false
   }
}

const toggleCommandStatus = async (command, event) => {
   const newStatus = event.target.checked
   const oldDisabledState = command.disabled
   command.disabled = !newStatus
   if (newStatus) { stats.value.enable++; stats.value.disable--; }
   else { stats.value.enable--; stats.value.disable++; }

   try {
      const response = await $api('/action/update-command', {
         method: 'POST',
         body: {
            name: command.name,
            status: newStatus
         }
      })
      if (!response.status) {
         throw new Error(response.message || 'Server returned a failure status.')
      }
      Swal.fire({
         toast: true, position: 'top-end', icon: 'success',
         title: `Command '${command.name}' has been ${newStatus ? 'enabled' : 'disabled'}.`,
         showConfirmButton: false, timer: 2000, timerProgressBar: true,
      })
   } catch (error) {
      console.error('Failed to toggle command status:', error)
      command.disabled = oldDisabledState
      if (newStatus) { stats.value.enable--; stats.value.disable++; }
      else { stats.value.enable++; stats.value.disable--; }
      Swal.fire({ icon: 'error', title: 'Update Failed', text: 'Could not change command status.' })
   }
}

const formatTimestamp = (timestamp) => {
   if (!timestamp || timestamp === 0) return 'N/A'
   return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
   })
}

const prevPage = () => { if (currentPage.value > 1) currentPage.value-- }
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++ }

onMounted(() => {
   fetchCommands()
})
</script>