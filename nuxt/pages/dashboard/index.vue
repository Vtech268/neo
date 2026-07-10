<template>
   <div class="container px-3 mb-4 mt-1">
      <div class="row g-4 mb-4">
         <div class="col-12 col-md-4">
            <NuxtLink to="/dashboard/users" class="stat-card-faded">
               <i class="bi bi-person-badge stat-icon-bg"></i>
               <div class="stat-content">
                  <div class="value">{{ allData.users.total?.toLocaleString() }}</div>
                  <div class="label">Total Users</div>
                  <div class="details-link">
                     <span>{{ allData.users.premium }} Premium</span>
                     <i class="bi bi-arrow-right-short"></i>
                  </div>
               </div>
            </NuxtLink>
         </div>
         <div class="col-12 col-md-4">
            <NuxtLink to="/dashboard/groups" class="stat-card-faded">
               <i class="bi bi-people stat-icon-bg"></i>
               <div class="stat-content">
                  <div class="value">{{ allData.groups.total?.toLocaleString() }}</div>
                  <div class="label">Total Groups</div>
                  <div class="details-link">
                     <span>{{ allData.groups.rental }} Rental</span>
                     <i class="bi bi-arrow-right-short"></i>
                  </div>
               </div>
            </NuxtLink>
         </div>
         <div class="col-12 col-md-4">
            <NuxtLink to="/dashboard/chats" class="stat-card-faded">
               <i class="bi bi-chat-dots stat-icon-bg"></i>
               <div class="stat-content">
                  <div class="value">{{ allData.chats.total?.toLocaleString() }}</div>
                  <div class="label">Total Chats</div>
                  <div class="details-link">
                     <span>View All</span>
                     <i class="bi bi-arrow-right-short"></i>
                  </div>
               </div>
            </NuxtLink>
         </div>
      </div>

      <ControlBox />

      <AdminRedeemManagerCard v-if="type === '1'" />

      <RedeemCard @open-redeem-modal="openRedeemModal" v-if="type === '2'" />

      <RedeemCodeModal ref="redeemModalRef" :is-submitting="isRedeeming" @submit="handleRedeem" />

      <Mix />

      <div class="row g-4">
         <div class="col-12 col-lg-6">
            <div class="ranking-header">
               <i class="bi bi-nut me-2 fs-5"></i>
               <h5 class="mb-0 fw-bold">Top Users</h5>
            </div>
            <div v-if="isTopDataLoading" class="text-center p-5">
               <div class="loader-spinner"></div>
            </div>
            <transition name="fade">
               <div v-if="!isTopDataLoading">
                  <div v-if="filteredTopHit.length > 0" class="ranking-list">
                     <div class="ranking-item" v-for="(user, index) in filteredTopHit" :key="user.jid">
                        <div class="rank-number">{{ String(index + 1).padStart(2, '0') }}</div>
                        <div class="rank-info font-monospace">{{ formatPhoneNumber(user.jid) }}</div>
                        <div class="rank-score">{{ user.hit.toLocaleString() }}</div>
                     </div>
                  </div>
                  <div v-else class="ranking-list-empty">
                     No top users data available.
                  </div>
               </div>
            </transition>
         </div>
         <div class="col-12 col-lg-6">
            <div class="ranking-header">
               <i class="bi bi-trophy me-2 fs-5"></i>
               <h5 class="mb-0 fw-bold">Top Ranks</h5>
            </div>
            <div v-if="isTopDataLoading" class="text-center p-5">
               <div class="loader-spinner"></div>
            </div>
            <transition name="fade">
               <div v-if="!isTopDataLoading">
                  <div v-if="filteredTopPoint.length > 0" class="ranking-list">
                     <div class="ranking-item" v-for="(user, index) in filteredTopPoint" :key="user.jid">
                        <div class="rank-number">{{ String(index + 1).padStart(2, '0') }}</div>
                        <div class="rank-info font-monospace">{{ formatPhoneNumber(user.jid) }}</div>
                        <div class="rank-score">{{ user.point.toLocaleString() }}</div>
                     </div>
                  </div>
                  <div v-else class="ranking-list-empty">
                     No top ranks data available.
                  </div>
               </div>
            </transition>
         </div>
      </div>
   </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import parsePhoneNumber from 'libphonenumber-js'
import Swal from 'sweetalert2'
import type { Modal } from 'bootstrap'

const config = useRuntimeConfig()
useHead({ title: 'Dashboard', titleTemplate: `%s - ${config.public.title}` })
const { type } = useAuth()
const { $api, $bootstrap } = useNuxtApp()

interface AllData { users: { premium: number, banned: number, total: number }, groups: { rental: number, total: number }, chats: { total: number } }
interface TopUser { jid: string, name: string | null, hit: number, point: number, balance: number }
interface TopData { top_hit: TopUser[], top_point: TopUser[] }
interface ModalExposedMethods {
   reset: () => void
}

const allData = ref<AllData>({ users: { premium: 0, banned: 0, total: 0 }, groups: { rental: 0, total: 0 }, chats: { total: 0 } })
const topData = ref<TopData>({ top_hit: [], top_point: [] })
const isTopDataLoading = ref(true)

const redeemModalRef = ref<ModalExposedMethods | null>(null)
let redeemModalInstance: Modal | null = null
const isRedeeming = ref(false)

const openRedeemModal = () => {
   redeemModalInstance?.show()
}

const handleRedeem = async (payload: { code: string }) => {
   if (!payload.code) return

   isRedeeming.value = true
   try {
      const response = await $api('/action/redeem', {
         method: 'POST',
         body: {
            code: payload.code
         }
      })

      if (response.status) {
         redeemModalInstance?.hide()
         Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: response.message || 'Your code has been successfully redeemed.',
         })
      } else {
         throw { data: response }
      }
   } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || 'An unknown error occurred.'
      Swal.fire({
         icon: 'error',
         title: 'Redeem Failed',
         text: errorMessage,
      })
   } finally {
      isRedeeming.value = false;
      redeemModalRef.value?.reset();
   }
}

const filteredTopHit = computed(() => topData.value.top_hit.filter(user => user.hit > 0))
const filteredTopPoint = computed(() => topData.value.top_point.filter(user => user.point > 0))

const fetchAllData = async () => { try { const response = await $api('/data/all'); if (response.status && response.data) allData.value = response.data as AllData } catch (error) { console.error('Failed to fetch /data/all:', error) } }
const fetchTopData = async () => { isTopDataLoading.value = true; try { const response = await $api('/data/top'); if (response.status && response.data) topData.value = response.data as TopData } catch (error) { console.error('Failed to fetch /data/top:', error) } finally { isTopDataLoading.value = false } }
const formatPhoneNumber = (jid: string) => { if (!jid) return 'Invalid Number'; const numberOnly = jid.split('@')[0]; try { const phoneNumber = parsePhoneNumber(`+${numberOnly}`); return phoneNumber ? phoneNumber.formatInternational() : `+${numberOnly}` } catch (error) { return `+${numberOnly}` } }

onMounted(async () => {
   await fetchAllData()
   await fetchTopData()

   if (process.client) {
      const modalEl = document.getElementById('redeemCodeModal')
      if (modalEl) {
         redeemModalInstance = new $bootstrap.Modal(modalEl)
      }
   }
})
</script>