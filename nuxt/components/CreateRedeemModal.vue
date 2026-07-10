<template>
   <div class="modal fade" id="createRedeemModal" tabindex="-1" aria-labelledby="createRedeemModalLabel"
      aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
         <div class="modal-content">
            <div class="modal-header">
               <h5 class="modal-title" id="createRedeemModalLabel">{{ isEditMode ? 'Edit' : 'Create' }} Redeem Code
               </h5>
               <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
                  :disabled="isSubmitting"></button>
            </div>
            <form @submit.prevent="handleSubmit" action="#" autocomplete="off">
               <div class="modal-body">
                  <Alert :message="alert.message" :type="alert.type" @close="$emit('clearAlert')" class="mb-3" />
                  <div class="row g-4">
                     <div class="col-md-5">
                        <div class="mb-3">
                           <label for="redeem-code" class="form-label">Redeem Code</label>
                           <div class="input-group input-group-password">
                              <input type="text" id="redeem-code" class="form-control"
                                 :class="{ 'is-invalid': errors.code }" v-model="formData.code"
                                 placeholder="Leave blank to generate" :disabled="isEditMode || isSubmitting">
                              <button class="btn btn-outline-secondary input-icon-button" type="button"
                                 @click="generateRandomCode" :disabled="isEditMode || isSubmitting"
                                 title="Generate Random Code">
                                 <i class="bi bi-shuffle"></i>
                              </button>
                           </div>
                           <div v-if="errors.code" class="invalid-feedback-custom">{{ errors.code }}</div>
                        </div>
                        <div class="mb-3">
                           <label for="redeem-message" class="form-label">Success Message (Optional)</label>
                           <textarea id="redeem-message" class="form-control" :class="{ 'is-invalid': errors.message }"
                              v-model="formData.message" rows="4"
                              placeholder="e.g., Congratulations! You've received a Pro plan."></textarea>
                           <div v-if="errors.message" class="invalid-feedback-custom">{{ errors.message }}</div>
                        </div>
                        <div class="row g-2">
                           <div class="col-6">
                              <label class="form-label">Max Redeem</label>
                              <input type="number" class="form-control" :class="{ 'is-invalid': errors.limitTotal }"
                                 v-model.number="formData.limit.total" placeholder="e.g., 100">
                              <div v-if="errors.limitTotal" class="invalid-feedback-custom">{{ errors.limitTotal }}
                              </div>
                           </div>
                           <div class="col-6">
                              <label class="form-label">Limit Per User</label>
                              <input type="number" class="form-control" :class="{ 'is-invalid': errors.limitPerUser }"
                                 v-model.number="formData.limit.per_user" placeholder="e.g., 1">
                              <div v-if="errors.limitPerUser" class="invalid-feedback-custom">{{ errors.limitPerUser }}
                              </div>
                           </div>
                        </div>
                     </div>
                     <div class="col-md-7">
                        <div class="mb-3">
                           <label for="redeem-type" class="form-label">Code Type</label>
                           <select id="redeem-type" class="form-select" v-model="formData.type"
                              :disabled="isSubmitting">
                              <option value="plan">Plan</option>
                              <option value="discount">Discount</option>
                              <option value="universal">Universal</option>
                           </select>
                        </div>
                        <div class="reward-wrapper">
                           <Transition name="fade" mode="out-in">
                              <div :key="formData.type">
                                 <div v-if="formData.type === 'plan'" class="row g-2">
                                    <div class="col-sm-6">
                                       <label class="form-label">Plan Type</label>
                                       <select class="form-select" v-model="formData.reward.plan"
                                          :class="{ 'is-invalid': errors.plan }">
                                          <option disabled value="">Select a plan...</option>
                                          <option v-for="plan in priceList" :key="plan.code" :value="plan.code">
                                             {{ plan.name }}
                                          </option>
                                       </select>
                                       <div v-if="errors.plan" class="invalid-feedback-custom">{{ errors.plan }}</div>
                                    </div>
                                    <div class="col-sm-6">
                                       <label class="form-label">Days</label>
                                       <input type="number" class="form-control" :class="{ 'is-invalid': errors.days }"
                                          v-model.number="formData.reward.days" placeholder="e.g., 30">
                                       <div v-if="errors.days" class="invalid-feedback-custom">{{ errors.days }}</div>
                                    </div>
                                 </div>
                                 <div v-if="formData.type === 'discount'" class="row g-2">
                                    <div class="col-sm-4">
                                       <label class="form-label">Type</label>
                                       <select class="form-select" v-model="formData.reward.discount.type">
                                          <option value="percent">%</option>
                                          <option value="fixed">Fix</option>
                                       </select>
                                    </div>
                                    <div class="col-sm-8">
                                       <label class="form-label">Value</label>
                                       <input type="number" class="form-control"
                                          :class="{ 'is-invalid': errors.discountValue }"
                                          v-model.number="formData.reward.discount.value"
                                          placeholder="e.g., 20 or 10000">
                                       <div v-if="errors.discountValue" class="invalid-feedback-custom">{{
                                          errors.discountValue }}</div>
                                    </div>
                                 </div>
                                 <div v-if="formData.type === 'universal'" class="row g-2">
                                    <div class="col-sm-4"><label class="form-label">Days</label><input type="number"
                                          class="form-control" v-model.number="formData.reward.add_days"></div>
                                    <div class="col-sm-4"><label class="form-label">Response</label><input type="number"
                                          class="form-control" v-model.number="formData.reward.add_response"></div>
                                    <div class="col-sm-4"><label class="form-label">Owner</label><input type="number"
                                          class="form-control" v-model.number="formData.reward.add_owner"></div>
                                 </div>
                              </div>
                           </Transition>
                        </div>
                        <div class="mb-3">
                           <label class="form-label">Expires At (Optional)</label>
                           <input type="datetime-local" class="form-control" v-model="expiresDateTime">
                           <div class="form-text">The date and time when this code will no longer be redeemable.</div>
                        </div>
                     </div>
                  </div>
               </div>
               <div class="modal-footer d-flex justify-content-between">
                  <div class="form-check form-switch">
                     <input class="form-check-input" type="checkbox" role="switch" id="isActiveSwitch"
                        v-model="formData.is_active" :disabled="isSubmitting">
                     <label class="form-check-label" for="isActiveSwitch">Active</label>
                  </div>
                  <div>
                     <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal"
                        :disabled="isSubmitting">Cancel</button>
                     <button type="submit" class="btn btn-primary d-inline-flex align-items-center"
                        :disabled="isSubmitting">
                        <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
                        {{ isEditMode ? 'Save Changes' : 'Create Code' }}
                     </button>
                  </div>
               </div>
            </form>
         </div>
      </div>
   </div>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import Alert from '~/components/Alert.vue'

const props = defineProps({
   isSubmitting: Boolean,
   alert: Object,
   editData: {
      type: Object,
      default: null
   }
})

const emit = defineEmits(['submit', 'clearAlert'])
const config = useRuntimeConfig()
const priceList = config.public.price_list

const isEditMode = computed(() => !!props.editData)

const getInitialFormData = () => ({
   code: '', type: 'plan', message: '',
   reward: { plan: '', days: 0, add_days: 0, add_response: 0, add_owner: 0, discount: { type: 'percent', value: 0, max: 0, } },
   limit: { per_user: 1, total: 10, },
   redeemed: [], expires_at: 0, is_active: true, created_at: 0
})

const formData = reactive(getInitialFormData())
const errors = reactive({
   code: '', message: '', plan: '', days: '', discountValue: '',
   limitTotal: '', limitPerUser: ''
})
const expiresDateTime = ref('')

const reset = () => {
   Object.assign(formData, getInitialFormData())
   Object.keys(errors).forEach(key => errors[key] = '')
   expiresDateTime.value = ''
}

watch(() => props.editData, (newData) => {
   if (newData) {
      Object.assign(formData, JSON.parse(JSON.stringify(newData)))
      if (newData.expires_at) {
         const d = new Date(newData.expires_at)
         expiresDateTime.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
      } else {
         expiresDateTime.value = ''
      }
   } else {
      reset()
   }
}, { immediate: true })

watch(expiresDateTime, (newDateTime) => {
   formData.expires_at = newDateTime ? new Date(newDateTime).getTime() : 0
})

const generateRandomCode = () => {
   const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
   let result = ''
   for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
      if ((i + 1) % 4 === 0 && i < 11) result += '-'
   }
   formData.code = result
}

const validateForm = () => {
   let isValid = true
   Object.keys(errors).forEach(key => errors[key] = '')

   if (!formData.code.trim()) {
      errors.code = 'Code is required.'
      isValid = false
   }
   if (!formData.limit.total || formData.limit.total <= 0) {
      errors.limitTotal = 'Max redeem must be greater than 0.'
      isValid = false
   }
   if (!formData.limit.per_user || formData.limit.per_user <= 0) {
      errors.limitPerUser = 'Limit per user must be greater than 0.'
      isValid = false
   }
   if (formData.type === 'plan') {
      if (!formData.reward.plan) {
         errors.plan = 'Plan type is required.'
         isValid = false
      }
      if (!formData.reward.days || formData.reward.days <= 0) {
         errors.days = 'Days must be greater than 0.'
         isValid = false
      }
   }
   if (formData.type === 'discount') {
      if (!formData.reward.discount.value || formData.reward.discount.value <= 0) {
         errors.discountValue = 'Discount value must be greater than 0.'
         isValid = false
      } else if (formData.reward.discount.type === 'percent' && formData.reward.discount.value > 100) {
         errors.discountValue = 'Percent discount cannot exceed 100%.'
         isValid = false
      }
   }
   return isValid
}

const handleSubmit = () => {
   if (validateForm()) {
      const payload = { ...formData }
      if (isEditMode.value) {
         delete payload.created_at
         delete payload.redeemed
      } else {
         payload.created_at = Date.now()
      }
      emit('submit', JSON.parse(JSON.stringify(payload)), isEditMode.value)
   }
}

defineExpose({ reset })
</script>

<style scoped>
.form-text {
   font-size: 0.8rem;
   color: var(--dark-secondary-text-color);
}

body.light-mode .form-text {
   color: #6c757d;
}

.reward-wrapper {
   border: 1px solid var(--dark-border-color);
   border-radius: .375rem;
   padding: 1rem;
   margin-bottom: 1rem;
   min-height: 130px;
}

body.light-mode .reward-wrapper {
   border-color: var(--light-border-color);
}

.invalid-feedback-custom {
   display: block;
   width: 100%;
   margin-top: 0.25rem;
   font-size: .875em;
   color: #dc3545;
}

.form-control.is-invalid {
   border-color: #dc3545;
}

.fade-enter-active,
.fade-leave-active {
   transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
   opacity: 0;
}

input[type="datetime-local"]::-webkit-calendar-picker-indicator {
   cursor: pointer;
   border-radius: 4px;
   margin-right: 2px;
   filter: invert(1) grayscale(100%) brightness(200%);
   transition: filter .2s;
}

input[type="datetime-local"]::-webkit-calendar-picker-indicator:hover {
   filter: invert(1) grayscale(0%) brightness(100%);
}

body.light-mode input[type="datetime-local"]::-webkit-calendar-picker-indicator {
   filter: none;
}

select:disabled,
textarea:disabled,
input:disabled {
   background-color: var(--dark-bg);
   opacity: 0.7;
}

.input-group-password input:disabled {
   background-color: transparent;
}

body.light-mode select:disabled,
body.light-mode textarea:disabled,
body.light-mode input:disabled {
   background-color: var(--light-bg);
}

body.light-mode .input-group-password input:disabled {
   background-color: transparent;
}
</style>