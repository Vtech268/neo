<template>
   <Teleport to="body">
      <Transition name="fade-backdrop">
         <div v-if="isModalOpen" class="music-modal-backdrop" @click="closeModal">
            <Transition name="scale-up-modal">
               <div v-if="isModalOpen" class="music-modal" @click.stop>
                  <div class="modal-header-custom">
                     <h5 class="main-title mb-0">Search Music</h5>
                     <button @click="closeModal" class="btn-close" aria-label="Close"></button>
                  </div>
                  <div class="card-body-custom pt-3 pb-3">
                     <form @submit.prevent="performSearch" class="search-form">
                        <div class="input-group">
                           <i class="bi bi-search search-icon"></i>
                           <input type="text" v-model="searchQuery" class="form-control search-input"
                              placeholder="Search for a song (min. 3 chars)..." :disabled="isSearchLoading">
                           <button type="submit" class="btn btn-search"
                              :disabled="!!(isSearchLoading || (challengeStore.salt !== null && !challengeStore.isVerified))">
                              <i class="bi bi-arrow-right"></i>
                           </button>
                        </div>
                        <div v-if="challengeStore.salt" class="mt-3">
                           <Challenge :challenge="challengeStore.challengeString"
                              :difficulty="challengeStore.difficulty" :bind-context="challengeContext"
                              @verified="onChallengeVerified" />
                        </div>
                     </form>
                  </div>
                  <div class="results-container">
                     <div v-if="isSearchLoading" class="text-center py-5">
                        <div class="line-loader-wrapper">
                           <div class="line-loader"></div>
                        </div>
                        <p class="mt-3 text-secondary">Searching...</p>
                     </div>
                     <div v-else-if="isSearchView">
                        <div v-if="searchError" class="alert alert-danger mb-3">{{ searchError }}</div>

                        <div v-else-if="challengeStore.salt" class="text-center py-5 challenge-active-state">
                           <i class="bi bi-shield-lock display-1 text-secondary"></i>
                           <p class="mt-3 text-secondary">Please complete the security challenge above.</p>
                        </div>
                        <div v-else-if="paginatedSearchResults.length" class="d-flex flex-column gap-2">
                           <div v-for="song in paginatedSearchResults" :key="song.id" class="song-card"
                              @click="selectSong(song)">
                              <div class="thumbnail-wrapper">
                                 <img :src="song.thumbnail" :alt="song.title" class="song-thumbnail">
                                 <button @click.stop="playSong(song)" class="btn-play" aria-label="Play song">
                                    <i class="bi bi-play-fill"></i>
                                 </button>
                              </div>
                              <div class="song-info">
                                 <p class="song-title">{{ song.title }}</p>
                                 <div class="song-meta">
                                    <span><i class="bi bi-person"></i> {{ song.artist }}</span>
                                 </div>
                              </div>
                           </div>
                        </div>
                        <div v-else class="text-center py-5 initial-state">
                           <i class="bi bi-search display-1 text-secondary"></i>
                           <p class="mt-3 text-secondary">No results found for "{{ musicStore.lastSearchQuery }}".</p>
                        </div>
                     </div>
                     <div v-else class="text-center py-5 initial-state">
                        <i class="bi bi-music-note-beamed display-1 text-secondary"></i>
                        <p class="mt-3 text-secondary">Start a search to find music.</p>
                     </div>
                  </div>
                  <div
                     v-if="!isSearchLoading && isSearchView && searchTotalPages > 1 && !challengeStore.salt && !searchError"
                     class="modal-footer-custom">
                     <button @click="prevSearchPage" :disabled="searchCurrentPage <= 1"
                        class="btn btn-sm btn-outline-secondary">
                        <i class="bi bi-arrow-left"></i> Prev
                     </button>
                     <span class="page-info">Page {{ searchCurrentPage }} of {{ searchTotalPages }}</span>
                     <button @click="nextSearchPage" :disabled="searchCurrentPage >= searchTotalPages"
                        class="btn btn-sm btn-outline-secondary">
                        Next <i class="bi bi-arrow-right"></i>
                     </button>
                  </div>
               </div>
            </Transition>
         </div>
      </Transition>
   </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useMusicStore, type Song } from '~/stores/music'
import { useChallengeStore } from '~/stores/challenge'
import CryptoJS from 'crypto-js'
import type { Pinia } from 'pinia'

const config = useRuntimeConfig()
const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits(['update:modelValue'])
const { $api, $pinia } = useNuxtApp()
const musicStore = useMusicStore($pinia as Pinia)
const challengeStore = useChallengeStore($pinia as Pinia)

const isModalOpen = computed({ get: () => props.modelValue, set: (value) => emit('update:modelValue', value) })
const searchQuery = ref('')
const searchError = ref('')
const isSearchLoading = ref(false)
const isSearchView = ref(false)
const searchCurrentPage = ref(1)
const itemsPerPage = 5
const searchTotalPages = computed(() => Math.ceil(musicStore.searchHistory.length / itemsPerPage))
const paginatedSearchResults = computed(() => {
   const start = (searchCurrentPage.value - 1) * itemsPerPage
   const end = start + itemsPerPage
   return musicStore.searchHistory.slice(start, end)
})

const challengeContext = computed(() => JSON.stringify({ query: searchQuery.value }))

const initializeState = () => {
   searchQuery.value = musicStore.lastSearchQuery
   isSearchView.value = musicStore.searchHistory.length > 0
   searchError.value = ''
   challengeStore.clearChallenge()
}
onMounted(initializeState)
watch(() => props.modelValue, (isOpen) => { if (isOpen) { initializeState() } })

const closeModal = () => { isModalOpen.value = false }
const nextSearchPage = () => { if (searchCurrentPage.value < searchTotalPages.value) searchCurrentPage.value++ }
const prevSearchPage = () => { if (searchCurrentPage.value > 1) searchCurrentPage.value-- }
const onChallengeVerified = (nonce: number) => {
   challengeStore.setVerified(nonce)
   performSearch()
}

const normalizeApiSong = (songData: any): Song => ({
   id: songData.videoId,
   title: songData.title,
   artist: songData.author.name,
   thumbnail: songData.thumbnail
})

const performSearch = async () => {
   searchError.value = ''
   isSearchView.value = true

   if (searchQuery.value.trim().length < 3) {
      searchError.value = 'Enter at least 3 characters.'
      return
   }

   if (challengeStore.salt && !challengeStore.isVerified) return

   isSearchLoading.value = true
   searchCurrentPage.value = 1

   try {
      const headers: Record<string, string> = {}

      if (challengeStore.isVerified) {
         const rawJson = JSON.stringify(challengeStore.getChallengePayload)
         const encryptedPayload = CryptoJS.AES.encrypt(rawJson, config.public.cp).toString()
         headers['x-request-challenge'] = encryptedPayload
      }

      const response = await $api('/music/search', {
         method: 'POST',
         body: { query: searchQuery.value },
         headers: headers
      })

      if (response.status) {
         const normalizedResults: Song[] = response.data.map(normalizeApiSong)
         musicStore.setSearchHistory(normalizedResults, searchQuery.value)
         challengeStore.clearChallenge()
      } else {
         throw { data: response }
      }
   } catch (error: any) {
      if (error.response && error.response.status === 428) {
         const challengeHeader = error.response.headers.get('x-response-challenge')

         if (challengeHeader) {
            try {
               const bytes = CryptoJS.AES.decrypt(challengeHeader, config.public.cp)
               const decryptedString = bytes.toString(CryptoJS.enc.Utf8)
               const d = JSON.parse(decryptedString)

               challengeStore.setChallenge({
                  salt: d.salt,
                  ts: d.ts,
                  difficulty: d.difficulty,
                  context: challengeContext.value,
                  token: d.token
               })
            } catch (e) {
               searchError.value = 'Failed to process security challenge.'
            }
         } else {
            searchError.value = 'Security challenge required but no data received.'
         }
      } else {
         searchError.value = error.data?.message || 'An unexpected error occurred.'
      }
   } finally {
      isSearchLoading.value = false
   }
}

const playSong = (song: Song) => {
   musicStore.playFromList(musicStore.searchHistory, song.id)
   closeModal()
}

const selectSong = (song: Song) => {
   musicStore.addToPlaylist(song)
}

watch(searchQuery, (newQuery) => {
   if (newQuery.trim().length === 0) {
      musicStore.clearSearchHistory()
      isSearchView.value = false
      searchError.value = ''
   }
})
</script>

<style scoped>
@import "assets/css/music.css"
</style>