<template>
   <div>
      <div class="container px-3 mb-4 mt-1">
         <div class="content-card rounded-3">
            <div class="card-header-custom d-flex justify-content-between align-items-center">
               <h5 class="main-title mb-0">Redeem Code</h5>
               <button class="btn btn-custom-accent" @click="openCreateModal">
                  <i class="bi bi-plus-circle me-2"></i>Create
               </button>
            </div>

            <div class="card-body-custom">
               <div v-if="isLoading" class="text-center py-5">
                  <div class="loader-spinner"></div>
                  <p class="mt-3">Fetching data...</p>
               </div>

               <div v-else-if="!codes.length" class="alert alert-info">
                  No redeem codes found. Click "Create" to get started.
               </div>

               <transition name="fade">
                  <div v-if="!isLoading && codes.length > 0">
                     <div class="row g-3 mb-4">
                        <div class="col-6 col-md-4">
                           <div class="stat-card-simple">
                              <div class="value">{{ stats.total }}</div>
                              <div class="label">Total Codes</div>
                           </div>
                        </div>
                        <div class="col-6 col-md-4">
                           <div class="stat-card-simple">
                              <div class="value text-success">{{ stats.active }}</div>
                              <div class="label">Active</div>
                           </div>
                        </div>
                        <div class="col-12 col-md-4">
                           <div class="stat-card-simple">
                              <div class="value text-danger">{{ stats.expired }}</div>
                              <div class="label">Expired/Used</div>
                           </div>
                        </div>
                     </div>

                     <div class="row g-3 mb-4 align-items-center">
                        <div class="col-lg-6">
                           <input type="text" class="form-control" placeholder="Search by code..."
                              v-model="searchQuery" />
                        </div>
                        <div class="col-lg-6 d-flex justify-content-lg-end">
                           <div class="btn-group" role="group">
                              <button type="button" class="btn btn-outline-secondary"
                                 :class="{ 'active': filterStatus === 'all' }"
                                 @click="filterStatus = 'all'">All</button>
                              <button type="button" class="btn btn-outline-secondary"
                                 :class="{ 'active': filterStatus === 'active' }"
                                 @click="filterStatus = 'active'">Active</button>
                              <button type="button" class="btn btn-outline-secondary"
                                 :class="{ 'active': filterStatus === 'inactive' }"
                                 @click="filterStatus = 'inactive'">Inactive</button>
                           </div>
                        </div>
                     </div>

                     <div class="table-responsive">
                        <table class="table detail-info-table">
                           <thead>
                              <tr>
                                 <th scope="col">Code</th>
                                 <th scope="col">Type</th>
                                 <th scope="col" class="text-center">Usage</th>
                                 <th scope="col">Status</th>
                                 <th scope="col" class="text-end">Actions</th>
                              </tr>
                           </thead>
                           <tbody v-if="paginatedCodes.length > 0">
                              <tr v-for="code in paginatedCodes" :key="code.code">
                                 <td class="font-monospace text-nowrap-custom">{{ code.code }}</td>
                                 <td class="text-nowrap-custom"><span class="badge text-bg-secondary">{{ code.type
                                       }}</span></td>
                                 <td class="text-center text-nowrap-custom">{{ code.redeemed.length }} / {{
                                    code.limit.total }}</td>
                                 <td class="text-nowrap-custom">
                                    <span :class="code.is_active ? 'badge bg-success' : 'badge bg-danger'">
                                       {{ code.is_active ? 'Active' : 'Inactive' }}
                                    </span>
                                 </td>
                                 <td class="text-end text-nowrap-custom">
                                    <button @click="openInfoModal(code)" class="btn btn-sm btn-secondary me-1"
                                       title="Details"><i class="bi bi-info-circle"></i></button>
                                    <button @click="openEditModal(code)" class="btn btn-sm btn-warning me-1"
                                       title="Edit"><i class="bi bi-pencil-square"></i></button>
                                    <button @click="confirmDelete(code)" class="btn btn-sm btn-danger" title="Delete"><i
                                          class="bi bi-trash"></i></button>
                                 </td>
                              </tr>
                           </tbody>
                           <tbody v-else>
                              <tr>
                                 <td colspan="5" class="text-center py-4">No codes match the current filter or search.
                                 </td>
                              </tr>
                           </tbody>
                        </table>
                     </div>

                     <div v-if="totalPages > 1" class="d-flex justify-content-between align-items-center mt-4">
                        <span class="pagination-info small">Showing {{ (currentPage - 1) * itemsPerPage + 1 }} - {{
                           Math.min(currentPage * itemsPerPage, filteredCodes.length) }} of {{ filteredCodes.length }}
                           codes</span>
                        <nav>
                           <ul class="pagination mb-0">
                              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                                 <a class="page-link" href="#" @click.prevent="currentPage--">Previous</a>
                              </li>
                              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                                 <a class="page-link" href="#" @click.prevent="currentPage++">Next</a>
                              </li>
                           </ul>
                        </nav>
                     </div>
                  </div>
               </transition>
            </div>
         </div>
      </div>

      <CreateRedeemModal ref="createModalRef" :is-submitting="isSubmitting" :alert="notification"
         :edit-data="selectedCodeForEdit" @submit="handleSubmit" @clear-alert="closeNotification" />
      <RedeemInfoModal :code="selectedCode" />
   </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import Swal from 'sweetalert2'

const { $api, $bootstrap } = useNuxtApp()
const config = useRuntimeConfig()
useHead({ title: 'Redeem Codes', titleTemplate: `%s - ${config.public.title}` })

const codes = ref([])
const isLoading = ref(true)
const createModalRef = ref(null)
let createModalInstance = null
let infoModalInstance = null
const isSubmitting = ref(false)
const selectedCode = ref(null)
const selectedCodeForEdit = ref(null)

const searchQuery = ref('')
const filterStatus = ref('all')
const currentPage = ref(1)
const itemsPerPage = ref(10)

const notification = reactive({ message: '', type: 'success' })

const stats = computed(() => {
   const now = Date.now()
   return {
      total: codes.value.length,
      active: codes.value.filter(c => c.is_active && (c.expires_at === 0 || c.expires_at > now) && c.redeemed.length < c.limit.total).length,
      expired: codes.value.filter(c => !c.is_active || ((c.expires_at !== 0 && c.expires_at <= now) || c.redeemed.length >= c.limit.total)).length,
   }
})

const filteredCodes = computed(() => {
   let filtered = [...codes.value]
   const now = Date.now()
   if (filterStatus.value === 'active') {
      filtered = filtered.filter(c => c.is_active && (c.expires_at === 0 || c.expires_at > now) && c.redeemed.length < c.limit.total)
   } else if (filterStatus.value === 'inactive') {
      filtered = filtered.filter(c => !c.is_active || ((c.expires_at !== 0 && c.expires_at <= now) || c.redeemed.length >= c.limit.total))
   }
   if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase().trim()
      filtered = filtered.filter(c => c.code.toLowerCase().includes(query))
   }
   return filtered.sort((a, b) => (b.created_at || 0) - (a.created_at || 0))
})

const totalPages = computed(() => Math.ceil(filteredCodes.value.length / itemsPerPage.value))
const paginatedCodes = computed(() => {
   const start = (currentPage.value - 1) * itemsPerPage.value
   const end = start + itemsPerPage.value
   return filteredCodes.value.slice(start, end)
})

watch([filterStatus, searchQuery], () => { currentPage.value = 1 })

const fetchCodes = async () => {
   isLoading.value = true
   try {
      const response = await $api('/data/redeem-codes')
      if (response.status) {
         codes.value = response.data
      }
   } catch (error) {
      console.error('Failed to fetch redeem codes:', error)
   } finally {
      isLoading.value = false
   }
}

const refreshCodesSilently = async () => {
   try {
      const response = await $api('/data/redeem-codes')
      if (response.status) {
         codes.value = response.data
      }
   } catch (error) {
      console.error('Failed to silently refresh redeem codes:', error)
   }
}

onMounted(() => {
   fetchCodes()
   if (process.client) {
      const createEl = document.getElementById('createRedeemModal')
      if (createEl) {
         createModalInstance = new $bootstrap.Modal(createEl)
      }
      const infoEl = document.getElementById('redeemInfoModal')
      if (infoEl) {
         infoModalInstance = new $bootstrap.Modal(infoEl)
      }
   }
})

const openCreateModal = () => {
   closeNotification()
   selectedCodeForEdit.value = null
   createModalRef.value?.reset()
   createModalInstance?.show()
}

const openEditModal = (code) => {
   closeNotification()
   selectedCodeForEdit.value = code
   createModalInstance?.show()
}

const closeNotification = () => {
   notification.message = ''
}

const handleSubmit = async (payload, isEdit) => {
   isSubmitting.value = true
   closeNotification()

   const endpoint = isEdit ? '/action/update-redeem' : '/action/create-redeem'
   const successMessage = isEdit ? 'Code updated successfully!' : `Code "${payload.code}" created successfully.`
   const errorMessage = isEdit ? 'Failed to update code.' : 'Failed to create code.'

   try {
      const response = await $api(endpoint, {
         method: 'POST',
         body: payload
      })
      if (response.status) {
         notification.message = successMessage
         notification.type = 'success'
         await refreshCodesSilently()
         if (!isEdit) {
            createModalRef.value?.reset()
         }
         setTimeout(() => {
            createModalInstance?.hide()
            closeNotification()
         }, 2000)
      } else {
         throw new Error(response.message || 'An error occurred.')
      }
   } catch (error) {
      notification.message = error.data?.message || error.message || errorMessage
      notification.type = 'danger'
   } finally {
      isSubmitting.value = false
   }
}

const confirmDelete = (code) => {
   Swal.fire({
      title: 'Are you sure?',
      html: `You are about to delete the code <strong class="font-monospace">${code.code}</strong>. This cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
   }).then((result) => {
      if (result.isConfirmed) {
         handleDelete(code)
      }
   })
}

const handleDelete = async (code) => {
   try {
      const response = await $api('/action/delete-redeem', {
         method: 'POST',
         body: { code: code.code }
      })
      if (response.status) {
         Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Code deleted!', showConfirmButton: false, timer: 2000 })
         await refreshCodesSilently()
      } else {
         throw new Error(response.message || 'Failed to delete code')
      }
   } catch (error) {
      Swal.fire({ icon: 'error', title: 'Deletion Failed', text: error.data?.message || error.message })
   }
}

const openInfoModal = (code) => {
   selectedCode.value = code
   infoModalInstance?.show()
}
</script>