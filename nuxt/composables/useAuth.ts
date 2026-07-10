import { computed } from 'vue'
import { useCookie } from '#app'

export const useAuth = () => {
   const config = useRuntimeConfig()
   const cookie = useCookie<{ token: string; type: string, jid: string } | null>('session_token', {
      default: () => null,
      maxAge: config.public.session_expires as number
   })

   const token = computed(() => cookie.value?.token ?? '')
   const type = computed(() => cookie.value?.type ?? '')
   const jid = computed(() => cookie.value?.jid ?? '')
   const isLogin = computed(() => !!cookie.value?.token)

   const setAuth = (data: { token: string; type: string; jid: string }) => {
      cookie.value = data
   }

   const clearAuth = () => {
      cookie.value = null
   }

   return { token, type, isLogin, jid, setAuth, clearAuth }
}