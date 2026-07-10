<template>
   <Transition name="fade">
      <div v-if="message" class="alert alert-dismissible" :class="`alert-${type}`" role="alert">
         <div>{{ message }}</div>
         <!-- <button type="button" class="btn-close" @click="$emit('close')" aria-label="Close"></button> -->
      </div>
   </Transition>
</template>

<script setup>
defineProps({
   message: String,
   type: {
      type: String,
      default: 'info' // info, success, warning, danger
   }
})

defineEmits(['close'])
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
   transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
   opacity: 0;
}
</style>