<template>
   <div class="modal fade" id="redeemInfoModal" tabindex="-1" aria-labelledby="redeemInfoModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
         <div class="modal-content">
            <div class="modal-header">
               <h5 class="modal-title" id="redeemInfoModalLabel">
                  <span v-if="code">Code Details: <code class="text-primary-custom">{{ code.code }}</code></span>
               </h5>
               <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body" v-if="code">
               <table class="table detail-info-table sys-info-table">
                  <tbody>
                     <tr>
                        <td class="label">Type</td>
                        <td class="colon">:</td>
                        <td class="value">{{ code.type }}</td>
                     </tr>
                     <tr>
                        <td class="label">Message</td>
                        <td class="colon">:</td>
                        <td class="value">{{ code.message }}</td>
                     </tr>
                     <tr>
                        <td class="label">Status</td>
                        <td class="colon">:</td>
                        <td>
                           <span :class="code.is_active ? 'badge bg-success' : 'badge bg-danger'">
                              {{ code.is_active ? 'Active' : 'Inactive' }}
                           </span>
                        </td>
                     </tr>
                     <tr>
                        <td class="label">Usage</td>
                        <td class="colon">:</td>
                        <td class="value">{{ code.redeemed.length }} / {{ code.limit.total }} (Total)</td>
                     </tr>
                     <tr>
                        <td class="label">Limit/User</td>
                        <td class="colon">:</td>
                        <td class="value">{{ code.limit.per_user }}</td>
                     </tr>
                     <tr>
                        <td class="label">Created At</td>
                        <td class="colon">:</td>
                        <td class="value">{{ formatTimestamp(code.created_at) }}</td>
                     </tr>
                     <tr>
                        <td class="label">Expires At</td>
                        <td class="colon">:</td>
                        <td class="value">{{ formatTimestamp(code.expires_at) }}</td>
                     </tr>
                  </tbody>
               </table>

               <h6 class="mt-4">Reward Details</h6>
               <div class="reward-details-box">
                  <div v-if="code.type === 'plan'">
                     <div><strong>Plan:</strong> {{ code.reward.plan }}</div>
                     <div><strong>Days:</strong> {{ code.reward.days }}</div>
                  </div>
                  <div v-if="code.type === 'discount'">
                     <div><strong>Type:</strong> {{ code.reward.discount.type }}</div>
                     <div><strong>Value:</strong> {{ code.reward.discount.value }}{{ code.reward.discount.type ===
                        'percent' ? '%' : '' }}</div>
                     <div v-if="code.reward.discount.max > 0"><strong>Max:</strong> {{ code.reward.discount.max }}</div>
                  </div>
                  <div v-if="code.type === 'universal'">
                     <div v-if="code.reward.add_days > 0"><strong>Add Days:</strong> {{ code.reward.add_days }}</div>
                     <div v-if="code.reward.add_response > 0"><strong>Add Response:</strong> {{ code.reward.add_response
                        }}</div>
                     <div v-if="code.reward.add_owner > 0"><strong>Add Owner:</strong> {{ code.reward.add_owner }}</div>
                  </div>
               </div>

               <h6 class="mt-4" v-if="code.redeemed.length > 0">Redeemed By</h6>
               <div v-if="code.redeemed.length > 0" class="redeemed-list">
                  <div v-for="user in code.redeemed" :key="user.jid" class="font-monospace small">[{{
                     user.jid?.replace(/@.+/, '') }}] at {{
                        formatTimestamp(user.at) }}</div>
               </div>

            </div>
         </div>
      </div>
   </div>
</template>

<script setup>
const props = defineProps({
   code: Object
})

const formatTimestamp = (timestamp) => {
   if (!timestamp || timestamp === 0) return 'Never'
   return new Date(timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}
</script>