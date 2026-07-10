import { ofetch } from 'ofetch'

export default defineNuxtPlugin(() => {
   const config = useRuntimeConfig()

   const getAuthHeader = () => {
      if (process.server || process.client) {
         const cookie = useCookie<{ token: string; type: string } | null>('session_token')
         const token = cookie.value?.token ?? ''
         if (token) return `Bearer ${token}`
      }
      return null
   }

   const api = ofetch.create({
      baseURL: config.public.baseURL as string,
      headers: {
         Accept: 'application/json'
      },
      onRequest({ options }) {
         const authHeader = getAuthHeader()
         if (authHeader) {
            const headers = new Headers(options.headers as HeadersInit)
            headers.set('Authorization', authHeader)
            options.headers = headers
         }
      }
   })

   return {
      provide: { api }
   }
})