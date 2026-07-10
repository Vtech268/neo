<template>
   <div id="pricing" class="pricing-section py-5">
      <div class="container">
         <div class="text-center mb-5">
            <h2 class="main-title mb-3">Choose The Right Plan For You</h2>
            <p class="section-subtitle">Start for free, then upgrade as your business grows.</p>
         </div>
         <div class="pricing-container">
            <swiper v-if="useSlider" :modules="modules" :slides-per-view="slidesPerView" :space-between="spaceBetween"
               :pagination="{ clickable: true }" class="pricing-swiper pb-5">
               <swiper-slide v-for="plan in priceList" :key="plan.code">
                  <div class="pricing-card h-100 d-flex flex-column rounded-3" :class="{ 'popular': plan.popular }">
                     <div class="card-body-custom d-flex flex-column flex-grow-1 p-4">
                        <div class="card-header-section">
                           <p v-if="plan.popular" class="popular-label">Most Popular</p>
                           <h3 class="plan-name">{{ plan.name }}</h3>
                           <p class="plan-description">{{ plan.description }}</p>
                           <div class="price-display mt-3">
                              <span v-if="plan.price > 0" class="price-currency">{{ currencySymbol }}</span>
                              <span class="price-value">{{ formatPrice(plan.price) }}</span>
                           </div>
                        </div>
                        <ul class="features-list list-unstyled my-4">
                           <li class="feature-item"><i class="bi bi-calendar-check feature-icon"></i><span><strong>{{
                              plan.days }}</strong> Days Active</span></li>
                           <li class="feature-item"><i class="bi bi-person-check feature-icon"></i><span><strong>{{
                              plan.owner }}</strong> Owner Number{{ plan.owner > 1 ? 's' : '' }}</span></li>
                           <li class="feature-item"><i class="bi bi-cpu feature-icon"></i><span><strong>{{
                              (plan.response / 1000) }}K</strong> Responses</span></li>
                           <li class="feature-item">
                              <i v-if="plan.customize" class="bi bi-check-lg feature-icon text-success-custom"></i>
                              <i v-else class="bi bi-x-lg feature-icon text-danger"></i>
                              <span>Customization</span>
                           </li>
                           <li class="feature-item">
                              <i v-if="!plan.ads" class="bi bi-shield-check feature-icon text-success-custom"></i>
                              <i v-else class="bi bi-badge-ad feature-icon"></i>
                              <span>{{ plan.ads ? 'Includes Ads' : 'No Ads' }}</span>
                           </li>
                        </ul>
                        <div class="mt-auto">
                           <button class="btn w-100 py-2"
                              :class="plan.popular ? 'btn-custom-accent' : 'btn-outline-accent'"
                              :disabled="isPlanDisabled(plan)" @click="handlePlanSelection(plan)">
                              {{ getButtonText(plan) }}
                           </button>
                        </div>
                     </div>
                  </div>
               </swiper-slide>
            </swiper>
            <div v-else class="row g-4 justify-content-center">
               <div v-for="plan in priceList" :key="plan.code" class="col-lg-4 col-md-6">
                  <div class="pricing-card h-100 d-flex flex-column rounded-3" :class="{ 'popular': plan.popular }">
                     <div class="card-body-custom d-flex flex-column flex-grow-1 p-4">
                        <div class="card-header-section">
                           <p v-if="plan.popular" class="popular-label">Most Popular</p>
                           <h3 class="plan-name">{{ plan.name }}</h3>
                           <p class="plan-description">{{ plan.description }}</p>
                           <div class="price-display mt-3">
                              <span v-if="plan.price > 0" class="price-currency">{{ currencySymbol }}</span>
                              <span class="price-value">{{ formatPrice(plan.price) }}</span>
                           </div>
                        </div>
                        <ul class="features-list list-unstyled my-4">
                           <li class="feature-item"><i class="bi bi-calendar-check feature-icon"></i><span><strong>{{
                              plan.days }}</strong> Days Active</span></li>
                           <li class="feature-item"><i class="bi bi-person-check feature-icon"></i><span><strong>{{
                              plan.owner }}</strong> Owner Number{{ plan.owner > 1 ? 's' : '' }}</span></li>
                           <li class="feature-item"><i class="bi bi-cpu feature-icon"></i><span><strong>{{
                              (plan.response / 1000) }}K</strong> Responses</span></li>
                           <li class="feature-item">
                              <i v-if="plan.customize" class="bi bi-check-lg feature-icon text-success-custom"></i>
                              <i v-else class="bi bi-x-lg feature-icon text-muted"></i>
                              <span>Customization</span>
                           </li>
                           <li class="feature-item">
                              <i v-if="!plan.ads" class="bi bi-shield-check feature-icon text-success-custom"></i>
                              <i v-else class="bi bi-badge-ad feature-icon"></i>
                              <span>{{ plan.ads ? 'Includes Ads' : 'No Ads' }}</span>
                           </li>
                        </ul>
                        <div class="mt-auto">
                           <button class="btn w-100 py-2"
                              :class="plan.popular ? 'btn-custom-accent' : 'btn-outline-accent'"
                              :disabled="isPlanDisabled(plan)" @click="handlePlanSelection(plan)">
                              {{ getButtonText(plan) }}
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
      <div class="modal fade" id="checkoutModal" tabindex="-1" aria-labelledby="checkoutModalLabel" aria-hidden="true">
         <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
               <div class="modal-header">
                  <h5 class="modal-title" id="checkoutModalLabel">Confirm Purchase</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
                     :disabled="isCheckingOut"></button>
               </div>
               <div class="modal-body" v-if="selectedPlan">
                  <p>You are about to purchase the <strong>{{ selectedPlan.name }}</strong> plan.</p>
                  <div class="promo-box mb-4">
                     <label class="form-label small fw-bold">Promo Code</label>
                     <div class="input-group">
                        <input type="text" class="form-control" v-model="promoCode" placeholder="Enter code"
                           :disabled="appliedPromo || isCheckingPromo">
                        <button class="btn btn-outline-accent" type="button"
                           @click="appliedPromo ? resetPromo() : checkPromo()"
                           :disabled="!promoCode || isCheckingPromo">
                           <span v-if="isCheckingPromo" class="spinner-border spinner-border-sm"></span>
                           <span v-else>{{ appliedPromo ? 'Remove' : 'Apply' }}</span>
                        </button>
                     </div>
                     <div v-if="promoError" class="text-danger small mt-1 d-flex align-items-center">
                        <i class="bi bi-exclamation-circle me-1"></i> {{ promoError }}
                     </div>
                  </div>
                  <ul class="list-group list-group-flush mb-3 checkout-summary">
                     <li class="list-group-item d-flex justify-content-between align-items-center bg-transparent">
                        Price
                        <span :class="{ 'price-strike': appliedPromo, 'fw-bold': !appliedPromo }">{{ currencySymbol }}
                           {{ formatPrice(selectedPlan.price) }}</span>
                     </li>
                     <li v-if="appliedPromo"
                        class="list-group-item d-flex justify-content-between align-items-center bg-transparent text-success-custom">
                        Discount ({{ appliedPromo.discount.type === 'percent' ? appliedPromo.discount.value + '%' :
                           'Fixed' }})
                        <span class="fw-bold">- {{ currencySymbol }} {{ formatPrice(discountValue) }}</span>
                     </li>
                     <li v-if="appliedPromo"
                        class="list-group-item d-flex justify-content-between align-items-center bg-transparent">
                        Total Amount
                        <span class="fw-bold text-primary-custom" style="font-size: 1.2rem;">{{ currencySymbol }} {{
                           formatPrice(finalPrice) === 'Free' ? 0 : formatPrice(finalPrice) }}</span>
                     </li>
                     <li class="list-group-item d-flex justify-content-between align-items-center bg-transparent">
                        Duration
                        <span>{{ selectedPlan.days }} Days</span>
                     </li>
                  </ul>
                  <p class="small text-secondary mb-0">By proceeding, you agree to our terms of service.</p>
               </div>
               <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"
                     :disabled="isCheckingOut">Cancel</button>
                  <button type="button" class="btn btn-custom-accent d-inline-flex align-items-center"
                     @click="confirmCheckout" :disabled="isCheckingOut">
                     <span v-if="isCheckingOut" class="spinner-border spinner-border-sm me-2"></span>
                     {{ isCheckingOut ? 'Processing...' : 'Proceed to Payment' }}
                  </button>
               </div>
            </div>
         </div>
      </div>
   </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Swal from 'sweetalert2'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import { useAuth } from '@/composables/useAuth'

const { $api, $bootstrap } = useNuxtApp()
const { type, isLogin } = useAuth()
const router = useRouter()
const config = useRuntimeConfig()
const priceList = ref(config.public.price_list || [])
const windowWidth = ref(0)
const modules = [Pagination]
const selectedPlan = ref(null)
const isCheckingOut = ref(false)
let checkoutModalInstance = null
const promoCode = ref('')
const appliedPromo = ref(null)
const isCheckingPromo = ref(false)
const promoError = ref('')

const useSlider = computed(() => windowWidth.value < 992 || priceList.value.length > 3)
const slidesPerView = computed(() => {
   if (windowWidth.value < 768) return 1
   if (windowWidth.value < 992) return 2.2
   return 3
})

const spaceBetween = computed(() => windowWidth.value < 768 ? 16 : 24)

const discountValue = computed(() => {
   if (!appliedPromo.value || !selectedPlan.value) return 0
   const { discount } = appliedPromo.value
   if (discount.type === 'percent') {
      let val = (selectedPlan.value.price * discount.value) / 100
      return (discount.max > 0 && val > discount.max) ? discount.max : val
   }
   return discount.value
})

const finalPrice = computed(() => {
   if (!selectedPlan.value) return 0
   const res = selectedPlan.value.price - discountValue.value
   return res < 0 ? 0 : res
})

const checkPromo = async () => {
   if (!promoCode.value) return
   isCheckingPromo.value = true
   promoError.value = ''
   try {
      const response = await $api('/action/check-redeem', { method: 'POST', body: { code: promoCode.value } })
      if (response.status && response.data.type === 'discount' && response.data.is_active) {
         appliedPromo.value = response.data
         Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Promo applied!', showConfirmButton: false, timer: 2000 })
      } else {
         promoError.value = 'Invalid or inactive promo code.'
      }
   } catch (e) {
      promoError.value = e.data?.message || 'Failed to verify promo code.'
   } finally {
      isCheckingPromo.value = false
   }
}

const resetPromo = () => {
   promoCode.value = ''
   appliedPromo.value = null
   promoError.value = ''
}

const updateWidth = () => { if (typeof window !== 'undefined') windowWidth.value = window.innerWidth }

onMounted(() => {
   updateWidth()
   window.addEventListener('resize', updateWidth)
   if (process.client) {
      const modalEl = document.getElementById('checkoutModal')
      if (modalEl) {
         checkoutModalInstance = new $bootstrap.Modal(modalEl)
         modalEl.addEventListener('hidden.bs.modal', resetPromo)
      }
   }
})

onUnmounted(() => { window.removeEventListener('resize', updateWidth) })

const currencySymbol = computed(() => {
   try { return new Intl.NumberFormat('en-US', { style: 'currency', currency: config.public.currency || 'IDR' }).formatToParts(1).find(part => part.type === 'currency').value }
   catch { return '$' }
})

const formatPrice = (price) => {
   if (price === 0) return 'Free'
   return new Intl.NumberFormat('en-US').format(price)
}

const isPlanDisabled = (plan) => {
   if (plan.price === 0) return false
   if (!isLogin.value) return false
   return type.value !== '2'
}

const getButtonText = (plan) => {
   if (plan.price === 0) return 'Start for Free'
   if (!isLogin.value) return 'Login to Purchase'
   if (isLogin.value && type.value !== '2') return 'Unavailable'
   return 'Choose Plan'
}

const handlePlanSelection = (plan) => {
   if (plan.price === 0) { router.push('/auth/login'); return }
   if (!isLogin.value) {
      Swal.fire({ icon: 'info', title: 'Login Required', text: 'Please login to purchase.', confirmButtonText: 'Go to Login', showCancelButton: true }).then((r) => { if (r.isConfirmed) router.push('/auth/login') })
      return
   }
   if (type.value === '2') {
      selectedPlan.value = plan
      checkoutModalInstance?.show()
   }
}

const confirmCheckout = async () => {
   if (!selectedPlan.value) return
   isCheckingOut.value = true
   const currentFinalPrice = finalPrice.value
   const currentPromoCode = promoCode.value

   try {
      const response = await $api('/action/checkout', { method: 'POST', body: { plan_code: selectedPlan.value.code, promo_code: appliedPromo.value ? promoCode.value : null } })
      if (response.status) {
         checkoutModalInstance?.hide()
         Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'info',
            title: response.message,
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true
         }).then(() => {
            const priceText = `${currencySymbol.value} ${formatPrice(currentFinalPrice)}`
            let message = `I want to buy *${selectedPlan.value.name}* Plan. Total: ${priceText}`
            if (currentPromoCode) {
               message += ` (Promo Applied: ${currentPromoCode})`
            }
            window.location = `https://wa.me/${config.public.owner}?text=${encodeURIComponent(message)}`
         })
      } else { throw new Error(response.message || 'Checkout failed.') }
   } catch (error) {
      Swal.fire({
         toast: true,
         position: 'top-end',
         icon: 'error',
         title: error.data?.message || error.message,
         showConfirmButton: false,
         timer: 3000,
         timerProgressBar: true
      })
   } finally { isCheckingOut.value = false }
}
</script>

<style scoped>
:deep(.swiper-pagination-bullet) {
   background-color: var(--dark-border-color);
   opacity: 1;
}

:deep(.swiper-pagination-bullet-active) {
   background-color: var(--dark-primary-accent);
}

body.light-mode :deep(.swiper-pagination-bullet) {
   background-color: var(--light-border-color);
}

body.light-mode :deep(.swiper-pagination-bullet-active) {
   background-color: var(--light-primary);
}

.swiper-slide {
   height: auto;
   display: flex;
   padding-top: 15px
}

.pricing-swiper {
   transform: translateZ(0);
   -webkit-transform: translateZ(0);
   will-change: transform;
   backface-visibility: hidden;
   -webkit-backface-visibility: hidden;
   z-index: 1;
}

.pricing-card {
   background-color: var(--dark-card-bg);
   border: 1px solid var(--dark-border-color);
   border-top: 4px solid transparent;
   transition: transform 0.3s ease, border-color 0.3s ease;
   position: relative;
   width: 100%;
}

body.light-mode .pricing-card {
   background-color: var(--light-card-bg);
   border-color: var(--light-border-color);
}

.pricing-card:hover {
   transform: translateY(-5px);
   border-color: var(--dark-border-color);
}

body.light-mode .pricing-card:hover {
   border-color: var(--light-border-color);
}

.pricing-card.popular {
   border-top-color: var(--dark-primary-accent);
}

body.light-mode .pricing-card.popular {
   border-top-color: var(--light-primary);
}

.popular-label {
   color: var(--dark-primary-accent);
   font-size: 0.8rem;
   font-weight: 700;
   text-transform: uppercase;
   letter-spacing: 0.05em;
   margin-bottom: 0.5rem;
}

body.light-mode .popular-label {
   color: var(--light-primary);
}

.section-subtitle {
   font-size: 1.1rem;
   color: var(--dark-secondary-text-color);
}

body.light-mode .section-subtitle {
   color: #6c757d;
}

.plan-name {
   font-size: 1.5rem;
   font-weight: 600;
   color: var(--dark-text-color);
}

body.light-mode .plan-name {
   color: var(--light-text-color);
}

.plan-description {
   font-size: 0.9rem;
   color: var(--dark-secondary-text-color);
   min-height: 40px;
}

body.light-mode .plan-description {
   color: #6c757d;
}

.price-display {
   display: flex;
   align-items: baseline;
   justify-content: flex-start;
   text-align: left;
   color: var(--dark-text-color);
   padding: 0;
   border: none;
}

body.light-mode .price-display {
   color: var(--light-text-color);
}

.price-currency {
   font-size: 1.1rem;
   font-weight: 500;
   margin-right: 0.25rem;
}

.price-value {
   font-size: 2.25rem;
   font-weight: 700;
   line-height: 1;
}

.btn-outline-accent {
   border: 2px solid var(--dark-border-color);
   color: var(--dark-text-color);
   font-weight: 600;
}

.btn-outline-accent:hover:not(:disabled) {
   border-color: var(--dark-primary-accent);
   background-color: var(--dark-primary-accent);
   color: #000;
}

body.light-mode .btn-outline-accent {
   border-color: var(--light-border-color);
   color: var(--light-text-color);
}

body.light-mode .btn-outline-accent:hover:not(:disabled) {
   border-color: var(--light-primary);
   background-color: var(--light-primary);
   color: #fff;
}

.features-list {
   padding: 0;
   padding-top: 1.5rem;
   border-top: 1px solid var(--dark-border-color);
}

body.light-mode .features-list {
   border-color: var(--light-border-color);
}

.feature-item {
   display: flex;
   align-items: center;
   margin-bottom: 0.85rem;
   font-size: 0.9rem;
   color: var(--dark-secondary-text-color);
}

body.light-mode .feature-item {
   color: #495057;
}

.feature-item strong {
   color: var(--dark-text-color);
   margin-right: 0.3rem;
}

body.light-mode .feature-item strong {
   color: var(--light-text-color);
}

.feature-icon {
   font-size: 1.1rem;
   width: 24px;
   text-align: center;
   margin-right: 0.75rem;
   color: var(--dark-secondary-text-color);
}

.text-success-custom {
   color: var(--dark-primary-accent) !important;
}

body.light-mode .text-success-custom {
   color: #198754 !important;
}

.modal-content {
   background-color: var(--dark-card-bg);
   color: var(--dark-text-color);
   border: 1px solid var(--dark-border-color);
}

body.light-mode .modal-content {
   background-color: var(--light-card-bg);
   color: var(--light-text-color);
   border-color: var(--light-border-color);
}

.list-group-item {
   border-color: var(--dark-border-color);
   color: var(--dark-text-color);
   border-width: 0 0 1px;
}

body.light-mode .list-group-item {
   border-color: var(--light-border-color);
   color: var(--light-text-color);
}

.list-group-item:last-child {
   border-bottom: 0;
}

.modal-footer {
   border-top: 1px solid var(--dark-border-color);
}

body.light-mode .modal-footer {
   border-top-color: var(--light-border-color);
}

.btn-close {
   filter: invert(1) grayscale(100%) brightness(200%);
}

body.light-mode .btn-close {
   filter: none;
}

.checkout-summary {
   border: 1px solid var(--dark-border-color);
   border-radius: 0.375rem;
}

body.light-mode .checkout-summary {
   border-color: var(--light-border-color);
}

.price-strike {
   text-decoration: line-through;
   color: var(--dark-secondary-text-color);
   font-weight: normal;
}

body.light-mode .price-strike {
   color: #6c757d;
}
</style>