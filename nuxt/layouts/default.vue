<template>
   <div>
      <Preloader />
      <nav class="navbar fixed-top py-3" id="mainNavbar" :class="{ 'scrolled': isScrolled }">
         <div class="container px-3">
            <h1 class="main-title mb-0">
               <NuxtLink to="/" @click="handleHomeClick" class="text-decoration-none" style="color: inherit;">
                  {{ title }}
               </NuxtLink>
            </h1>

            <div class="d-flex align-items-center">
               <div class="d-none d-md-flex align-items-center me-3">
                  <ul class="navbar-nav flex-row">
                     <template v-for="link in navLinks" :key="link.text">
                        <li class="nav-item" v-if="shouldShowLink(link)">
                           <a v-if="link.isLogout" class="nav-link px-2 text-danger" href="#" @click.prevent="logout">{{
                              link.text }}</a>
                           <a v-else-if="link.isAnchor" class="nav-link px-2" :href="link.href"
                              @click.prevent="scrollToAnchor(link.href)"
                              :class="{ 'router-link-exact-active': isAnchorActive(link) }">
                              {{ link.text }}
                           </a>
                           <NuxtLink v-else class="nav-link px-2" :to="link.href">{{ link.text }}</NuxtLink>
                        </li>
                     </template>
                  </ul>
               </div>

               <Theme />

               <button class="navbar-toggler fullscreen-toggle-btn d-md-none ms-3" type="button"
                  @click="toggleFullScreen" aria-label="Toggle Fullscreen">
                  <i v-if="!isFullscreen" class="bi bi-fullscreen"></i>
                  <i v-else class="bi bi-fullscreen-exit"></i>
               </button>

               <button class="navbar-toggler d-md-none ms-2" type="button" @click="toggleSidebar"
                  aria-label="Toggle navigation">
                  <span class="navbar-toggler-icon"></span>
               </button>
            </div>
         </div>
      </nav>

      <Transition name="fade">
         <div v-if="isSidebarOpen" class="sidebar-overlay" @click="closeSidebar"></div>
      </Transition>

      <div ref="mobileSidebarRef" class="offcanvas offcanvas-start" tabindex="-1" id="mobileSidebar">
         <div class="offcanvas-header">
            <h5 class="offcanvas-title">{{ title }}</h5>
            <button type="button" class="btn-close" @click="closeSidebar" aria-label="Close"></button>
         </div>


         <div class="offcanvas-body">
            <ul class="sidebar-nav">
               <template v-for="link in navLinks" :key="link.text">
                  <li v-if="shouldShowLink(link)" @click="closeSidebar">
                     <a v-if="link.isLogout" class="sidebar-link text-danger" href="#" @click.prevent="logout">
                        <i :class="link.icon"></i>
                        <span>{{ link.text }}</span>
                     </a>
                     <a v-else-if="link.isAnchor" class="sidebar-link" :href="link.href"
                        @click.prevent="scrollToAnchor(link.href)"
                        :class="{ 'router-link-exact-active': isAnchorActive(link) }">
                        <i :class="link.icon"></i>
                        <span>{{ link.text }}</span>
                     </a>
                     <NuxtLink v-else class="sidebar-link" :to="link.href">
                        <i :class="link.icon"></i>
                        <span>{{ link.text }}</span>
                     </NuxtLink>
                  </li>
               </template>
            </ul>

            <a href="https://shop.neoxr.eu/product/TCnb" class="sidebar-footer mt-auto" target="_blank">
               <span>Buy Script</span>
               <i class="bi bi-box-arrow-up-right"></i>
            </a>
         </div>
      </div>

      <div :class="{ 'content-frozen': isSidebarOpen }">
         <NuxtPage />
      </div>

      <OneTimePopup />
   </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRuntimeConfig, useRoute, useRouter } from '#app'
import { useAuth } from '@/composables/useAuth'
import { usePageEffects } from '@/composables/usePageEffects'
import { useScrollspy } from '@/composables/useScrollspy'

const config = useRuntimeConfig()
const title = config.public.title
const route = useRoute()
const router = useRouter()
const { $api } = useNuxtApp()
const { isScrolled } = usePageEffects()
const { type, isLogin, token, clearAuth } = useAuth()

const mobileSidebarRef = ref<HTMLElement | null>(null)
let mobileSidebarInstance: any | null = null
const isSidebarOpen = ref(false)
const isFullscreen = ref(false)

const handleFullscreenChange = () => { isFullscreen.value = !!document.fullscreenElement }
const toggleFullScreen = () => { if (!document.fullscreenElement) { document.documentElement.requestFullscreen() } else { if (document.exitFullscreen) { document.exitFullscreen() } } }

const checkTokenValidity = async () => {
   if (!isLogin.value) return
   try {
      const response = await $api('/action/check-auth', { method: 'POST', body: { token: token.value } })
      if (!response.status) { forceLogout('Your session has expired. Please log in again.') }
   } catch (error: any) {
      if (error.response?.status === 401) { forceLogout('Invalid session detected. Please log in again.') }
   }
}

const forceLogout = (message: string) => {
   clearAuth()
   if (process.client) {
      alert(message)
      window.location.href = '/auth/login'
   }
}

onMounted(async () => {
   checkTokenValidity()
   const { Offcanvas } = await import('bootstrap')
   if (mobileSidebarRef.value) { mobileSidebarInstance = new Offcanvas(mobileSidebarRef.value, { backdrop: false, keyboard: true }) }
   document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onBeforeUnmount(() => {
   document.removeEventListener('fullscreenchange', handleFullscreenChange)
})

const closeSidebar = () => { isSidebarOpen.value = false }
const toggleSidebar = () => { isSidebarOpen.value = !isSidebarOpen.value }

watch(isSidebarOpen, (isOpen) => {
   if (mobileSidebarInstance) {
      if (isOpen) { mobileSidebarInstance.show() } else { mobileSidebarInstance.hide() }
   }
})

const navLinks = ref([
   { text: 'Dashboard', href: '/dashboard', icon: 'bi bi-grid-1x2-fill', requiresAuth: true },
   { text: 'Pricing', href: '/#pricing', icon: 'bi bi-tags-fill', isAnchor: true },
   { text: 'Statistic', href: '/#statistic', icon: 'bi bi-bar-chart-line-fill', isAnchor: true },
   { text: 'Features', href: '/#features', icon: 'bi bi-gem', isAnchor: true },
   { text: 'Documentation', href: '/docs', icon: 'bi bi-book-half', hideWhenLoggedIn: true },
   { text: 'Terminal', href: '/dashboard/terminal', icon: 'bi bi-terminal-fill', requiresAuth: true, userOnly: true },
   { text: 'Sessions', href: '/dashboard/sessions', icon: 'bi bi-hdd-stack-fill', requiresAuth: true, adminOnly: true },
   { text: 'Connect', href: '/auth/login', icon: 'bi bi-box-arrow-in-right', hideWhenLoggedIn: true },
   { text: 'Logout', href: '#', icon: 'bi bi-box-arrow-left', requiresAuth: true, isLogout: true },
])

const anchorIds = navLinks.value.filter(l => l.isAnchor).map(l => l.href.substring(2))
const { activeSection, setup, cleanup } = useScrollspy(anchorIds)

watch(() => route.path, async (newPath) => {
   if (process.client) {
      if (newPath === '/') {
         await nextTick()
         setup()

         if (route.hash) {
            const element = document.getElementById(route.hash.substring(1))
            if (element) {
               element.scrollIntoView({ behavior: 'smooth' })
            }
         }
      } else {
         cleanup()
      }
   }
}, { immediate: true })

const isAnchorActive = (link: any) => {
   if (link.isAnchor && route.path === '/') {
      const id = link.href.substring(2)
      return activeSection.value === id
   }
   return false
}

const handleHomeClick = () => {
   if (route.path === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      activeSection.value = null
   }
}

const scrollToAnchor = async (href: string) => {
   const id = href.substring(2)
   if (route.path !== '/') {
      await router.push({ path: '/', hash: `#${id}` })
   } else {
      const element = document.getElementById(id)
      if (element) {
         element.scrollIntoView({ behavior: 'smooth' })
      }
   }
}

const shouldShowLink = (link: any) => {
   if (link.hideWhenLoggedIn && isLogin.value) return false
   if (link.requiresAuth && !isLogin.value) return false
   if (link.adminOnly && (type.value !== '1' || !isLogin.value)) return false
   if (link.userOnly && (type.value !== '2' || !isLogin.value)) return false
   return true
}

const logout = async () => {
   try {
      await $api('/action/logout', { method: 'POST' })
      clearAuth()
      router.push('/')
   } catch (err) {
      console.error('Logout gagal:', err)
      clearAuth()
      router.push('/')
   }
}
</script>

<style lang="css" scoped>
.content-frozen {
   pointer-events: none;
   user-select: none;
}
</style>