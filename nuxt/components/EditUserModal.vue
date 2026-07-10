<template>
   <div class="modal fade" id="editUserModal" tabindex="-1" aria-labelledby="editUserModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
         <div class="modal-content">
            <div class="modal-header">
               <h5 class="modal-title" id="editUserModalLabel">Edit User</h5>
               <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body" v-if="editableUser">
               <div class="mb-3">
                  <label for="editUserNumber" class="form-label">Number</label>
                  <input type="text" id="editUserNumber" class="form-control"
                     :value="formatPhoneNumber(editableUser.jid)" readonly>
               </div>
               <div class="mb-3">
                  <label for="editUserName" class="form-label">Name</label>
                  <input type="text" id="editUserName" class="form-control" v-model="editableUser.name" readonly>
               </div>
               <div class="row">
                  <div class="col-6 mb-3">
                     <label for="editUserLimit" class="form-label">Limit</label>
                     <input type="number" id="editUserLimit" class="form-control" v-model.number="editableUser.limit">
                  </div>
                  <div class="col-6 mb-3">
                     <label for="editUserLimitGame" class="form-label">Limit Game</label>
                     <input type="number" id="editUserLimitGame" class="form-control"
                        v-model.number="editableUser.limit_game">
                  </div>
               </div>
               <div class="row">
                  <div class="col-6 mb-3">
                     <label for="editUserPremium" class="form-label">Premium</label>
                     <select id="editUserPremium" class="form-select" v-model="isPremium">
                        <option :value="true">Yes</option>
                        <option :value="false">No</option>
                     </select>
                  </div>
                  <div class="col-6 mb-3">
                     <label for="editUserBanned" class="form-label">Banned</label>
                     <select id="editUserBanned" class="form-select" v-model="editableUser.banned">
                        <option :value="true">Yes</option>
                        <option :value="false">No</option>
                     </select>
                  </div>
               </div>

               <transition name="fade">
                  <div v-if="isPremium" class="mb-3">
                     <label for="premiumDays" class="form-label">Add Premium Days</label>
                     <input type="number" id="premiumDays" class="form-control" v-model.number="premiumDays"
                        placeholder="e.g., 30">
                     <div class="form-text">
                        Enter number of days to add to the current expiration. Leave blank or 0 to not change.
                     </div>
                  </div>
               </transition>

            </div>
            <div class="modal-footer">
               <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"
                  :disabled="isSubmitting">Close</button>
               <button type="button" class="btn btn-primary" @click="saveChanges" :disabled="isSubmitting">
                  <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-1" role="status"
                     aria-hidden="true"></span>
                  {{ isSubmitting ? 'Saving...' : 'Save' }}
               </button>
            </div>
         </div>
      </div>
   </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { parsePhoneNumberFromString } from 'libphonenumber-js'

const props = defineProps({
   user: {
      type: Object,
      default: null
   }
})
const emit = defineEmits(['save'])

const editableUser = ref(null)
const isSubmitting = ref(false)
const isPremium = ref(false)
const premiumDays = ref(0)

watch(() => props.user, (newUser) => {
   if (newUser) {
      editableUser.value = { ...newUser }
      isPremium.value = newUser.premium
      premiumDays.value = 0
   } else {
      editableUser.value = null
   }
}, { deep: true })

const formatPhoneNumber = (jid = '') => {
   if (typeof jid !== 'string') return ''
   const numberPart = jid.split('@')[0]
   const phoneNumber = parsePhoneNumberFromString('+' + numberPart)
   return phoneNumber?.formatInternational() || `+${numberPart}`
}

const saveChanges = () => {
   isSubmitting.value = true
   const payload = {
      ...editableUser.value,
      premium: isPremium.value,
      premium_days: premiumDays.value || 0
   }
   emit('save', payload)
}

defineExpose({
   resetSubmittingState() {
      isSubmitting.value = false
   }
})
</script>

<style scoped>
.fade-enter-from {
   opacity: 0;
   transform: translateY(-10px);
}

.fade-enter-active {
   transition: opacity 0.3s ease, transform 0.3s ease;
}
</style>