export default defineNuxtPlugin(() => {
   const config = useRuntimeConfig()
   if (process.client) {
      config.public.baseURL = window.location.origin
   }
})