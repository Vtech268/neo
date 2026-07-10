import { useCookie } from '#app'
import { defineNuxtRouteMiddleware, navigateTo } from '#imports'

export default defineNuxtRouteMiddleware((to) => {
   if (process.server) return

   const session = useCookie<{ token: string, type: string } | null>('session_token')
   const token = session.value?.token
   const type = session.value?.type

   if (to.path.startsWith('/dashboard') && !token) {
      return navigateTo('/auth/login')
   }

   if (to.path.startsWith('/auth/login') && token) {
      return navigateTo('/dashboard')
   }

   if (type !== '1' && token) {
      if (
         to.path.startsWith('/dashboard/sessions') ||
         to.path.startsWith('/dashboard/redeem-code')
      ) {
         return navigateTo('/dashboard')
      }
   }

   if (type !== '2' && token) {
      if (to.path.startsWith('/dashboard/terminal')) {
         return navigateTo('/dashboard')
      }
   }
})