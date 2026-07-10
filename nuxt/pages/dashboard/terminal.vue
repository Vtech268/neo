<template>
   <div>
      <div class="container px-3 mb-4 mt-1">
         <BotManagerCard :accountData="accountData" :isLoading="isLoadingBots" :runtime="runtime"
            @open-change-modal="openChangeNumberModal" @open-update-owner-modal="openUpdateOwnerModal"
            @open-update-type-modal="openUpdateTypeModal" @open-update-method-modal="openUpdateMethodModal" />

         <BackupRestoreCard @open-backup-modal="openBackupModal" @open-restore-modal="openRestoreModal" />

         <div class="row g-4">
            <div class="col-lg-7">
               <ConsoleCard :logs="logs" :welcomeMessage="welcomeMessage" :loadingStates="loadingStates"
                  :isActionLoading="isActionLoading" :isConnected="accountData?.is_connected"
                  :socketStatus="socketStatus" v-model:wrapLogs="wrapLogs" @control="handleControlAction"
                  @confirm-logout="confirmLogout" />
            </div>
            <div class="col-lg-5">
               <ConnectionStatusCard :loading="waConnect.loading" :qrCode="waConnect.qrCode"
                  :pairingCode="waConnect.pairingCode" :statusMessage="waConnect.status.message"
                  :statusType="waConnect.status.type" :isActionLoading="isActionLoading"
                  :isConnected="accountData?.is_connected" />
            </div>
         </div>
      </div>

      <ChangeNumberModal ref="changeNumberModalRef" v-if="accountData" :initialMethod="accountData.method"
         @submit="handleChangeNumber" />

      <UpdateOwnerModal ref="updateOwnerModalRef" v-if="accountData"
         :initial-owner-name="accountData.connector?.sessionOpts?.owner_name"
         :initial-owner-number="accountData.connector?.sessionOpts?.owner?.replace(/@.+/, '')"
         :is-submitting="isUpdatingOwner" @submit="handleUpdateOwner" />

      <UpdateTypeModal v-if="accountData" :initialBotType="accountData?.connector?.override?.bot_type" :botTypes="botTypes"
         :isSubmitting="isUpdatingType" @submit="handleUpdateType" />

      <UpdateMethodModal ref="updateMethodModalRef" v-if="accountData" :initial-method="accountData.method"
         :is-submitting="isUpdatingMethod" @submit="handleUpdateMethod" />

      <BackupModal :is-loading="backupState.isLoading" :backup-data="backupState.data" :error="backupState.error" />

      <RestoreModal ref="restoreModalRef" :is-restoring="restoreState.isRestoring" :challenge-store="challengeStore"
         :challenge-context="restoreChallengeContext" :selected-file="restoreState.file"
         @file-selected="onRestoreFileSelected" @challenge-verified="onRestoreChallengeVerified"
         @submit="handleRestore" />
   </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, reactive } from 'vue'
import Swal from 'sweetalert2'
import { useSocket } from '@/composables/useSocket'
import { useAuth } from '@/composables/useAuth'
import { useChallengeStore } from '~/stores/challenge'
import CryptoJS from 'crypto-js'

const { setAuth } = useAuth()
const config = useRuntimeConfig()
const { $api, $bootstrap, $pinia } = useNuxtApp()
useHead({ title: 'Terminal', titleTemplate: `%s - ${config.public.title}` })

const accountData = ref(null)
const isLoadingBots = ref(true)
const runtime = ref('00:00:00')
let runtimeInterval = null
const logs = ref([])
const socket = useSocket()
const isSocketConnected = ref(false)
const welcomeMessage = ref(`Welcome to the ${config.public.title} Console!`)
const wrapLogs = ref(true)
const waConnect = reactive({
   method: 'qr',
   qrCode: '',
   pairingCode: '',
   status: { type: 'info', message: '' },
   loading: false,
})
const loadingStates = ref({ start: false, stop: false, logout: false })
const isActionLoading = computed(() => loadingStates.value.start || loadingStates.value.stop || loadingStates.value.logout || waConnect.loading)

const changeNumberModalRef = ref(null)
let changeNumberModalInstance = null
const updateOwnerModalRef = ref(null)
let updateTypeModalInstance = null
let updateOwnerModalInstance = null
const updateMethodModalRef = ref(null)
let updateMethodModalInstance = null

const isUpdatingOwner = ref(false)
const isUpdatingMethod = ref(false)
const isUpdatingType = ref(false)

const challengeStore = useChallengeStore($pinia)

let backupModalInstance = null
let restoreModalInstance = null
const restoreModalRef = ref(null)

const backupState = reactive({
   isLoading: false,
   data: null,
   error: ''
})

const restoreState = reactive({
   isRestoring: false,
   file: null,
})

const md5 = text => CryptoJS.MD5(String(text)).toString()

const restoreChallengeContext = computed(() => {
   if (!restoreState.file) return ''
   return `${restoreState.file.name}:${restoreState.file.size}`
})

const openBackupModal = () => {
   backupState.isLoading = true
   backupState.data = null
   backupState.error = ''
   backupModalInstance?.show()
   handleBackup()
}

const handleBackup = async () => {
   try {
      const response = await $api('/action/database', {
         method: 'POST',
         body: {
            id: accountData.value._id,
            action: 'backup'
         }
      })

      if (response.status) {
         backupState.data = response.data
      } else {
         throw new Error(response.message || 'Backup failed')
      }
   } catch (error) {
      backupState.error = error?.data?.message || error.message
   } finally {
      backupState.isLoading = false
   }
}

const openRestoreModal = () => {
   restoreState.isRestoring = false
   restoreState.file = null
   challengeStore.clearChallenge()
   restoreModalRef.value?.reset()
   restoreModalInstance?.show()
}

const onRestoreFileSelected = (file) => {
   restoreState.file = file
}

const onRestoreChallengeVerified = (nonce) => {
   challengeStore.setVerified(nonce)
   handleRestore()
}

const handleRestore = async () => {
   if (!restoreState.file) {
      Swal.fire({ icon: 'warning', title: 'No File', text: 'Select a backup file to restore.' })
      return
   }

   if (challengeStore.salt && !challengeStore.isVerified) return

   restoreState.isRestoring = true

   const formData = new FormData()
   formData.append('id', accountData.value._id)
   formData.append('action', 'restore')
   formData.append('file', restoreState.file)
   formData.append('query', restoreChallengeContext.value)

   if (challengeStore.isVerified) {
      formData.append('challenge', JSON.stringify(challengeStore.getChallengePayload))
   }

   try {
      const response = await $api('/action/database', {
         method: 'POST',
         body: formData,
         headers: challengeStore.isVerified
            ? { 'x-severity': md5(restoreChallengeContext.value) }
            : {}
      })

      if (response.status) {
         restoreModalInstance?.hide()
         await refreshAccountDataSilently()
         Swal.fire({ icon: 'success', title: 'Restore Successful', text: 'Your data has been restored.' })
      } else {
         throw new Error(response.message || 'Restore failed')
      }
   } catch (error) {
      if (error.response && error.response.status === 428) {
         const challengeData = error.response._data.data
         challengeStore.setChallenge({
            salt: challengeData.salt,
            ts: challengeData.ts,
            difficulty: challengeData.difficulty,
            context: restoreChallengeContext.value,
            token: challengeData.token
         })
      } else {
         Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'error',
            title: error.data?.message || 'Something went wrong!',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
         })

         challengeStore.clearChallenge()
      }
   } finally {
      restoreState.isRestoring = false
   }
}

const fetchAccountData = async () => {
   isLoadingBots.value = true
   try {
      const response = await $api('/data/account')
      if (response.status && response.data) {
         accountData.value = response.data
      } else {
         throw new Error("Failed to fetch account data")
      }
   } catch (error) {
      console.error(error)
      accountData.value = null
   } finally {
      isLoadingBots.value = false
   }
}

const refreshAccountDataSilently = async () => {
   try {
      const response = await $api('/data/account')
      if (response.status && response.data) {
         accountData.value = response.data
      } else {
         throw new Error("Failed to refresh account data")
      }
   } catch (error) {
      console.error('Silent refresh failed:', error)
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Failed to refresh data!', showConfirmButton: false, timer: 3000 })
   }
}

const socketStatus = computed(() => {
   return {
      text: isSocketConnected.value ? 'Connected' : 'Disconnected',
      class: isSocketConnected.value ? 'bg-success' : 'bg-danger'
   }
})

const startRuntimeTimer = () => {
   if (runtimeInterval) clearInterval(runtimeInterval)
   runtimeInterval = setInterval(() => {
      if (accountData.value?.is_connected && accountData.value.last_connect > 0) {
         const now = Date.now()
         const elapsed = now - accountData.value.last_connect
         const seconds = Math.floor((elapsed / 1000) % 60).toString().padStart(2, '0')
         const minutes = Math.floor((elapsed / (1000 * 60)) % 60).toString().padStart(2, '0')
         const hours = Math.floor(elapsed / (1000 * 60 * 60)).toString().padStart(2, '0')
         runtime.value = `${hours}:${minutes}:${seconds}`
      } else {
         runtime.value = '00:00:00'
      }
   }, 1000)
}

const addLog = (logData) => {
   const newLog = { ...logData, timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }) }
   logs.value.push(newLog)
}

const openChangeNumberModal = () => {
   if (accountData.value?.is_connected) {
      Swal.fire({ icon: 'warning', title: 'Bot is Active', text: 'You must stop or log out the bot before changing the number.' })
   } else {
      changeNumberModalInstance?.show()
   }
}

const openUpdateOwnerModal = () => {
   updateOwnerModalInstance?.show()
}

const handleChangeNumber = async (payload) => {
   if (!payload.number || !accountData.value) return
   const modalComponent = changeNumberModalRef.value
   if (!modalComponent) return

   try {
      const response = await $api('/action/change-number', {
         method: 'POST',
         body: { id: accountData.value._id, number: payload.number, method: payload.method }
      })
      if (response.status) {
         changeNumberModalInstance?.hide()
         Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Number change process initiated!', showConfirmButton: false, timer: 3000, timerProgressBar: true })
         await refreshAccountDataSilently()
      } else {
         throw new Error(response.message || 'Failed to change number.')
      }
   } catch (error) {
      console.error('Error changing number:', error)
      Swal.fire({ icon: 'error', title: 'Change Failed', text: error.data.message || error.message })
   } finally {
      modalComponent.reset()
   }
}

const botTypes = computed(() => {
   return config.public.bot_type
})

const handleUpdateOwner = async (payload) => {
   if (!payload.owner_name || !payload.owner_number || !accountData.value) return
   const modalComponent = updateOwnerModalRef.value
   if (!modalComponent) return
   isUpdatingOwner.value = true

   try {
      const response = await $api('/action/update-bot', {
         method: 'POST',
         body: {
            id: accountData.value._id,
            owner_name: payload.owner_name,
            owner_number: payload.owner_number
         }
      })

      if (response.status) {
         updateOwnerModalInstance?.hide()
         Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Owner updated successfully!',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
         })

         if (response.data) {
            const { token, jid, type } = response.data
            setAuth({ token: token, type: String(type), jid })
         }

         await refreshAccountDataSilently()
      } else {
         throw new Error(response.message || 'Failed to update owner.')
      }
   } catch (error) {
      console.error('Error updating owner:', error)
      Swal.fire({
         icon: 'error',
         title: 'Update Failed',
         text: error.data?.message || error.message
      })
   } finally {
      isUpdatingOwner.value = false
      modalComponent.reset()
   }
}

const openUpdateMethodModal = () => {
   if (accountData.value?.is_connected) {
      Swal.fire({ icon: 'warning', title: 'Bot is Active', text: 'You must stop the bot before changing the method.' })
   } else {
      updateMethodModalInstance?.show()
   }
}

const handleUpdateMethod = async (payload) => {
   if (!payload.method || !accountData.value) return
   const modalComponent = updateMethodModalRef.value
   if (!modalComponent) return
   isUpdatingMethod.value = true

   try {
      const response = await $api('/action/update-bot', {
         method: 'POST',
         body: {
            id: accountData.value._id,
            method: payload.method
         }
      })

      if (response.status) {
         updateMethodModalInstance?.hide()
         Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Connection method updated!',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
         })
         await refreshAccountDataSilently()
      } else {
         throw new Error(response.message || 'Failed to update method.')
      }
   } catch (error) {
      console.error('Error updating method:', error)
      Swal.fire({
         icon: 'error',
         title: 'Update Failed',
         text: error.data?.message || error.message
      })
   } finally {
      isUpdatingMethod.value = false
      modalComponent.reset()
   }
}

const openUpdateTypeModal = () => {
   if (updateTypeModalInstance) updateTypeModalInstance.show()
}

const handleUpdateType = async (data) => {
   if (isUpdatingType.value) return

   isUpdatingType.value = true

   try {
      const response = await $api('/action/update-bot', {
         method: 'POST',
         body: {
            id: accountData.value._id,
            bot_type: data.bot_type
         }
      })

      if (response.status) {
         updateTypeModalInstance.hide()
         Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Bot type updated successfully!',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
         })
         await refreshAccountDataSilently()
      } else {
         throw new Error(response.message || 'Failed to update bot type.')
      }
   } catch (error) {
      console.error('Failed to update bot type:', error)
      Swal.fire({
         icon: 'error',
         title: 'Update Failed',
         text: error.data?.message || error.message
      })
   } finally {
      isUpdatingType.value = false
   }
}

const handleControlAction = (action) => {
   if (action === 'start') {
      waConnect.loading = true; waConnect.qrCode = ''; waConnect.pairingCode = ''; waConnect.status = { type: 'info', message: '' }
   }
   sendControl(action)
}

const sendControl = async (action) => {
   if (!accountData.value) return
   loadingStates.value[action] = true
   try {
      const response = await $api('/action/control', {
         method: 'POST',
         body: { id: accountData.value._id, action: action }
      })
      if (!response.status) {
         throw new Error(response.message || 'Action failed')
      }
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `Action '${action}' sent successfully!`, showConfirmButton: false, timer: 2000, timerProgressBar: true })
   } catch (error) {
      console.error(`Failed to send action '${action}':`, error)
      waConnect.loading = false
      Swal.fire({ icon: 'error', title: 'Action Failed', text: error.data.message || error.message })
   } finally {
      await refreshAccountDataSilently()
      loadingStates.value[action] = false
   }
}

const confirmLogout = () => {
   Swal.fire({
      title: 'Are you sure?',
      text: "This will log out the bot from WhatsApp and you will need to reconnect.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, log out!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
   }).then((result) => {
      if (result.isConfirmed) {
         sendControl('logout')
      }
   })
}

const onConnect = () => { isSocketConnected.value = true; addLog({ isCmd: false, type: 'SYSTEM', body: `WebSocket connected.`, at: '', size: '', from: 'CLIENT', in_name: 'Console' }); }
const onDisconnect = (reason) => { isSocketConnected.value = false; addLog({ isCmd: false, type: 'SYSTEM', body: `WebSocket disconnected: ${reason}.`, at: '', size: '', from: 'CLIENT', in_name: 'Console' }); }
const onWaConnection = (data) => { waConnect.loading = false; if (data.qr) { waConnect.qrCode = data.qr; waConnect.pairingCode = ''; waConnect.status = { type: 'info', message: 'Scan the QR code.' } }; if (data.code) { waConnect.qrCode = ''; waConnect.pairingCode = data.code; waConnect.status = { type: 'info', message: 'Enter the code on your device.' } } }
const onStatus = (data) => { waConnect.loading = false; waConnect.qrCode = ''; waConnect.pairingCode = ''; if (data.status === 'success') { waConnect.status = { type: 'success', message: `Connection successful!` }; refreshAccountDataSilently(); } else { waConnect.status = { type: 'danger', message: data.message } } }
let onLogs = null

onMounted(async () => {
   await fetchAccountData()
   startRuntimeTimer()

   if (process.client) {
      const modalEl = document.getElementById('changeNumberModal')
      if (modalEl) { changeNumberModalInstance = new $bootstrap.Modal(modalEl) }

      const updateOwnerModalEl = document.getElementById('updateOwnerModal')
      if (updateOwnerModalEl) { updateOwnerModalInstance = new $bootstrap.Modal(updateOwnerModalEl) }

      const updateTypeEl = document.getElementById('updateTypeModal')
      if (updateTypeEl) updateTypeModalInstance = new $bootstrap.Modal(updateTypeEl)

      const updateMethodModalEl = document.getElementById('updateMethodModal')
      if (updateMethodModalEl) { updateMethodModalInstance = new $bootstrap.Modal(updateMethodModalEl) }

      const backupEl = document.getElementById('backupModal')
      if (backupEl) backupModalInstance = new $bootstrap.Modal(backupEl)

      const restoreEl = document.getElementById('restoreModal')
      if (restoreEl) restoreModalInstance = new $bootstrap.Modal(restoreEl)
   }

   if (socket) {
      let botJid = accountData.value?.jid
      isSocketConnected.value = socket.connected

      socket.on('connect', onConnect)
      socket.on('disconnect', onDisconnect)
      socket.on(`connect.${botJid.replace(/@.+/, '')}`, onWaConnection)
      socket.on(`status.${botJid.replace(/@.+/, '')}`, onStatus)

      if (botJid) {
         const logChannel = `logs.${botJid.replace(/@.+/, '')}`
         onLogs = (data) => { if (data.data.body || data.data.media?.base64) { addLog(data.data) } }
         socket.on(logChannel, onLogs)
      } else {
         welcomeMessage.value += `<br>Error: Bot JID not found. Log stream cannot start.`
      }
   }
})

onBeforeUnmount(() => {
   if (runtimeInterval) clearInterval(runtimeInterval)
   let botJid = accountData.value?.jid
   if (socket) {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off(`connect.${botJid.replace(/@.+/, '')}`, onWaConnection)
      socket.off(`status.${botJid.replace(/@.+/, '')}`, onStatus)
      if (botJid && onLogs) {
         const logChannel = `logs.${botJid.replace(/@.+/, '')}`
         socket.off(logChannel, onLogs)
      }
   }
})
</script>