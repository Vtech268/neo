<template>
   <div>
      <div class="container px-3 mb-4 mt-1">
         <div class="content-card rounded-3">
            <div class="card-header-custom d-flex justify-content-between align-items-center">
               <h5 class="main-title mb-0">Plugins Management</h5>
            </div>

            <div class="card-body-custom">
               <div v-if="isLoading" class="text-center py-5">
                  <div class="loader-spinner"></div>
                  <p class="mt-3">Fetching data...</p>
               </div>

               <div v-else-if="!plugins.length" class="alert alert-info">
                  No plugins found.
               </div>

               <transition name="fade">
                  <div v-if="!isLoading && plugins.length > 0">
                     <div class="row g-3 mb-4">
                        <div class="col-6 col-md-4">
                           <div class="stat-card-simple">
                              <div class="value">{{ stats.total }}</div>
                              <div class="label">Total Plugins</div>
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
                           <input type="text" class="form-control" placeholder="Search by plugin name or category..."
                              v-model="searchQuery" />
                        </div>
                        <div class="col-lg-6 d-flex justify-content-lg-end">
                           <div class="btn-group" role="group" aria-label="Plugin Filters">
                              <button type="button" class="btn btn-outline-secondary"
                                 :class="{ 'active': filterStatus === 'all' }"
                                 @click="filterStatus = 'all'">All</button>
                              <button type="button" class="btn btn-outline-secondary"
                                 :class="{ 'active': filterStatus === 'enabled' }"
                                 @click="filterStatus = 'enabled'">Enabled</button>
                              <button type="button" class="btn btn-outline-secondary"
                                 :class="{ 'active': filterStatus === 'disabled' }"
                                 @click="filterStatus = 'disabled'">Disabled</button>
                              <button type="button" class="btn btn-outline-secondary"
                                 :class="{ 'active': filterStatus === 'command' }"
                                 @click="filterStatus = 'command'">CMD</button>
                              <button type="button" class="btn btn-outline-secondary"
                                 :class="{ 'active': filterStatus === 'event' }"
                                 @click="filterStatus = 'event'">EVN</button>
                           </div>
                        </div>
                     </div>

                     <div class="table-responsive">
                        <table class="table detail-info-table">
                           <thead>
                              <tr>
                                 <th scope="col" class="text-nowrap-custom">Plugin Name</th>
                                 <th scope="col" class="text-nowrap-custom">Category</th>
                                 <th scope="col" class="text-nowrap-custom">Type</th>
                                 <th scope="col" class="text-nowrap-custom text-center">Status</th>
                                 <th scope="col" class="text-end text-nowrap-custom">Actions</th>
                              </tr>
                           </thead>
                           <tbody v-if="paginatedPlugins.length > 0">
                              <tr v-for="plugin in paginatedPlugins" :key="plugin.name">
                                 <td class="font-monospace text-nowrap-custom">{{ plugin.name }}</td>
                                 <td class="text-nowrap-custom">
                                    <span class="badge text-bg-secondary">{{ plugin.category || 'N/A' }}</span>
                                 </td>
                                 <td class="text-nowrap-custom">
                                    <span :class="getPluginType(plugin).class">{{ getPluginType(plugin).text }}</span>
                                 </td>
                                 <td class="text-center">
                                    <div class="form-check form-switch d-inline-block">
                                       <input class="form-check-input" type="checkbox" role="switch"
                                          :id="`switch-${plugin.name}`" :checked="!plugin.disabled"
                                          @change="togglePluginStatus(plugin, $event)">
                                    </div>
                                 </td>
                                 <td class="text-end">
                                    <button @click="showPluginInfo(plugin)"
                                       class="btn btn-sm btn-secondary">Info</button>
                                 </td>
                              </tr>
                           </tbody>
                           <tbody v-else>
                              <tr>
                                 <td colspan="5" class="text-center py-4">No plugins match the current filter
                                    or search.</td>
                              </tr>
                           </tbody>
                        </table>
                     </div>

                     <div v-if="totalPages > 1" class="d-flex justify-content-between align-items-center mt-4">
                        <span class="pagination-info small">Showing {{ (currentPage - 1) * itemsPerPage + 1 }} - {{
                           Math.min(paginatedPlugins.length, filteredPlugins.length) }} of {{ filteredPlugins.length }}
                           plugins</span>
                        <nav aria-label="Plugin pagination">
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

      <div class="modal fade" id="pluginInfoModal" tabindex="-1" aria-labelledby="pluginInfoModalLabel"
         aria-hidden="true">
         <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
               <div class="modal-header">
                  <h5 class="modal-title" id="pluginInfoModalLabel">
                     <span v-if="selectedPlugin">Plugin Details: <code
                           class="text-primary-custom">{{ selectedPlugin.name }}</code></span>
                  </h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
               </div>
               <div class="modal-body" v-if="selectedPlugin">
                  <table class="table detail-info-table sys-info-table">
                     <tbody>
                        <tr>
                           <td class="label">Usage</td>
                           <td class="colon">:</td>
                           <td>
                              <div v-if="selectedPlugin.usage && selectedPlugin.usage.length"
                                 class="d-flex flex-wrap gap-1">
                                 <span v-for="u in selectedPlugin.usage" :key="u"
                                    class="badge text-bg-secondary font-monospace">{{ u }}</span>
                              </div>
                              <span v-else>-</span>
                           </td>
                        </tr>
                        <tr>
                           <td class="label">Hidden Commands</td>
                           <td class="colon">:</td>
                           <td>
                              <div v-if="selectedPlugin.hidden && selectedPlugin.hidden.length"
                                 class="d-flex flex-wrap gap-1">
                                 <span v-for="h in selectedPlugin.hidden" :key="h"
                                    class="badge text-bg-secondary font-monospace">{{ h }}</span>
                              </div>
                              <span v-else>-</span>
                           </td>
                        </tr>
                        <tr>
                           <td class="label">Example Use</td>
                           <td class="colon">:</td>
                           <td>
                              <code v-if="selectedPlugin.use">{{ selectedPlugin.use }}</code>
                              <span v-else>-</span>
                           </td>
                        </tr>
                        <tr>
                           <td class="label">Properties</td>
                           <td class="colon">:</td>
                           <td>
                              <div v-if="booleanProperties.length" class="d-flex flex-wrap gap-1">
                                 <span v-for="prop in booleanProperties" :key="prop" class="badge bg-info">{{ prop
                                 }}</span>
                              </div>
                              <span v-else>-</span>
                           </td>
                        </tr>
                     </tbody>
                  </table>
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
useHead({ title: 'Plugins Management', titleTemplate: `%s - ${config.public.title}` })

const plugins = ref([])
const stats = ref({ enable: 0, disable: 0, total: 0 })
const isLoading = ref(true)
const selectedPlugin = ref(null)
let infoModalInstance = null

onMounted(async () => {
   await fetchPlugins()
   if (process.client) {
      const modalEl = document.getElementById('pluginInfoModal')
      if (modalEl) infoModalInstance = new $bootstrap.Modal(modalEl)
   }
})

const searchQuery = ref('')
const filterStatus = ref('all')
const currentPage = ref(1)
const itemsPerPage = ref(10)

const isPluginCommand = (plugin) => {
   return (plugin.usage && plugin.usage.length > 0) || (plugin.hidden && plugin.hidden.length > 0)
}

const filteredPlugins = computed(() => {
   let filtered = [...plugins.value]
   if (filterStatus.value === 'enabled') {
      filtered = filtered.filter(p => !p.disabled)
   } else if (filterStatus.value === 'disabled') {
      filtered = filtered.filter(p => p.disabled)
   } else if (filterStatus.value === 'command') {
      filtered = filtered.filter(p => isPluginCommand(p))
   } else if (filterStatus.value === 'event') {
      filtered = filtered.filter(p => !isPluginCommand(p))
   }

   if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase().trim()
      if (query) {
         filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(query) ||
            (p.category && p.category.toLowerCase().includes(query))
         )
      }
   }
   return filtered
})

const totalPages = computed(() => Math.ceil(filteredPlugins.value.length / itemsPerPage.value))
const paginatedPlugins = computed(() => {
   const start = (currentPage.value - 1) * itemsPerPage.value
   const end = start + itemsPerPage.value
   return filteredPlugins.value.slice(start, end)
})

const booleanProperties = computed(() => {
   if (!selectedPlugin.value) return [];
   const excludedKeys = ['name', 'category', 'disabled', 'usage', 'hidden', 'use'];
   return Object.keys(selectedPlugin.value)
      .filter(key => typeof selectedPlugin.value[key] === 'boolean' && selectedPlugin.value[key] && !excludedKeys.includes(key));
});

watch([filterStatus, searchQuery], () => { currentPage.value = 1 })

const getPluginType = (plugin) => {
   const isCommand = isPluginCommand(plugin)
   return {
      text: isCommand ? 'Command' : 'Event',
      class: isCommand ? 'badge bg-primary' : 'badge bg-info'
   }
}

const fetchPlugins = async () => {
   isLoading.value = true
   try {
      const response = await $api('/data/plugins')
      if (response.status && response.data) {
         plugins.value = response.data.plugins
         stats.value = response.data.stats
      } else {
         plugins.value = []
         stats.value = { enable: 0, disable: 0, total: 0 }
      }
   } catch (error) {
      console.error("Failed to fetch plugins data:", error.data)
      plugins.value = []
      Swal.fire({ icon: 'error', title: 'Fetch Failed', text: error.data?.message || 'Could not retrieve plugins data.' })
   } finally {
      isLoading.value = false
   }
}

const togglePluginStatus = async (plugin, event) => {
   const newStatus = event.target.checked
   const oldDisabledState = plugin.disabled
   plugin.disabled = !newStatus
   if (newStatus) { stats.value.enable++; stats.value.disable--; }
   else { stats.value.enable--; stats.value.disable++; }

   try {
      const response = await $api('/action/update-plugin', { method: 'POST', body: { name: plugin.name, status: newStatus } })
      if (!response.status) { throw new Error(response.message || 'Server returned a failure status.') }
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `Plugin '${plugin.name}' ${newStatus ? 'enabled' : 'disabled'}.`, showConfirmButton: false, timer: 2000, timerProgressBar: true })
   } catch (error) {
      console.error('Failed to toggle plugin status:', error)
      plugin.disabled = oldDisabledState
      if (newStatus) { stats.value.enable--; stats.value.disable++; }
      else { stats.value.enable++; stats.value.disable--; }
      Swal.fire({ icon: 'error', title: 'Update Failed', text: error.data?.message || 'Could not change plugin status.' })
   }
}

const showPluginInfo = (plugin) => {
   selectedPlugin.value = plugin;
   infoModalInstance?.show();
}

const prevPage = () => { if (currentPage.value > 1) currentPage.value-- }
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++ }
</script>