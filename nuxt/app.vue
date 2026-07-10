<template>
   <div>
      <NuxtLayout>
         <NuxtPage />
      </NuxtLayout>

      <GlobalPlayer />
   </div>
</template>


<script setup>
useHead({
   script: [{
      src: 'https://www.youtube.com/iframe_api',
      async: true,
      key: 'yt-api'
   }]
})
</script>