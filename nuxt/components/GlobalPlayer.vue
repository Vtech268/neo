<template>
   <div>
      <div id="youtube-player" class="hidden-player"></div>
      <Transition name="slide-up">
         <div v-if="store.currentSong" ref="playerWrapperRef" class="player-wrapper"
            :class="{ 'is-expanded': store.isPlayerExpanded }" @click="handlePlayerClick">
            <PlayerCompactView v-if="!store.isPlayerExpanded" :store="store" />
            <PlayerExpandedView v-else :store="store" :format-time="formatTime" :on-seek="onSeek"
               :on-volume-change="onVolumeChange" :download-song="downloadSong" />
         </div>
      </Transition>
   </div>
</template>

<script setup lang="ts">
import { watch, onMounted, onUnmounted, ref } from 'vue'
import { useMusicStore } from '@/stores/music'
import Swal from 'sweetalert2'

const store = useMusicStore()
let player: any = null
let timeUpdater: number | null = null

const playerWrapperRef = ref<HTMLElement | null>(null)

const handlePlayerClick = (event: MouseEvent) => {
   event.stopPropagation()

   if (!store.isPlayerExpanded) {
      store.togglePlayerExpansion(true)
   }
}

const handleClickOutside = (event: MouseEvent) => {
   if (!store.isPlayerExpanded) return

   if (playerWrapperRef.value && !playerWrapperRef.value.contains(event.target as Node)) {
      store.togglePlayerExpansion(false)
   }
}

const formatTime = (seconds: number): string => {
   if (isNaN(seconds) || seconds < 0) return '00:00'
   const min = Math.floor(seconds / 60)
   const sec = Math.floor(seconds % 60)
   return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
}

const onSeek = (event: Event) => {
   const target = event.target as HTMLInputElement
   const percentage = parseFloat(target.value)
   if (player && store.duration > 0) {
      const newTime = (store.duration * percentage) / 100
      player.seekTo(newTime, true)
   }
}

const onVolumeChange = (event: Event) => {
   const target = event.target as HTMLInputElement
   const newVolume = parseInt(target.value, 10)
   store.setVolume(newVolume)
   if (player) { player.setVolume(newVolume) }
}

const downloadSong = async () => {
   if (!store.currentSong) return
   Swal.fire({
      toast: true, position: 'top-end', icon: 'info',
      title: `Preparing download for ${store.currentSong.title}...`,
      showConfirmButton: false, timer: 3000
   })
}

onMounted(() => {
   document.addEventListener('click', handleClickOutside)

   if ((window as any).YT) { initializePlayer() }
   else {
      const tag = document.createElement('script')
      tag.src = "https://www.youtube.com/iframe_api"
      const firstScriptTag = document.getElementsByTagName('script')[0]
      if (firstScriptTag && firstScriptTag.parentNode) { firstScriptTag.parentNode.insertBefore(tag, firstScriptTag) }
      (window as any).onYouTubeIframeAPIReady = initializePlayer
   }
})

onUnmounted(() => {
   document.removeEventListener('click', handleClickOutside)

   if (player) player.destroy()
   if (timeUpdater) clearInterval(timeUpdater)
})

const initializePlayer = () => {
   if (!document.getElementById('youtube-player')) return
   player = new (window as any).YT.Player('youtube-player', {
      height: '0', width: '0',
      playerVars: { 'autoplay': 0, 'controls': 0, 'playsinline': 1 },
      events: { 'onReady': onPlayerReady, 'onStateChange': onPlayerStateChange }
   })
}
const onPlayerReady = (event: any) => {
   player.setVolume(store.volume)
   if (store.currentSong) { player.cueVideoById(store.currentSong.id) }
}
const onPlayerStateChange = (event: any) => {
   const playerState = event.data
   if (timeUpdater) clearInterval(timeUpdater)
   if (playerState === (window as any).YT.PlayerState.PLAYING) {
      store.setPlayerState({ isPlaying: true, isBuffering: false })
      timeUpdater = window.setInterval(() => { store.updateTime({ current: player.getCurrentTime() || 0, duration: player.getDuration() || 0 }) }, 500)
   } else if (playerState === (window as any).YT.PlayerState.PAUSED) {
      store.setPlayerState({ isPlaying: false, isBuffering: false })
   } else if (playerState === (window as any).YT.PlayerState.BUFFERING) {
      store.setPlayerState({ isBuffering: true })
   } else if (playerState === (window as any).YT.PlayerState.ENDED) {
      store.nextSong()
   }
}
watch(() => store.currentSong, (newSong, oldSong) => { if (player && player.loadVideoById && newSong && newSong.id !== oldSong?.id) { player.loadVideoById(newSong.id) } })
watch(() => store.isPlaying, (isPlaying) => {
   if (!player || !player.getPlayerState) return
   const playerState = player.getPlayerState()
   if (isPlaying && playerState !== (window as any).YT.PlayerState.PLAYING) { player.playVideo() }
   else if (!isPlaying && playerState === (window as any).YT.PlayerState.PLAYING) { player.pauseVideo() }
})
</script>

<style scoped>
.hidden-player {
   display: none !important;
}

.player-wrapper {
   position: fixed;
   bottom: 1rem;
   left: 50%;
   transform: translateX(-50%);
   width: calc(100% - 2rem);
   max-width: 480px;
   height: 50px;
   background-color: rgba(32, 44, 51, 0.75);
   border: 1px solid var(--dark-border-color);
   backdrop-filter: blur(15px);
   -webkit-backdrop-filter: blur(15px);
   border-radius: 50px;
   z-index: 999;
   box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
   cursor: pointer;
   transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}

body.light-mode .player-wrapper {
   background-color: rgba(255, 255, 255, 0.75);
   border-color: var(--light-border-color);
   box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.slide-up-enter-active {
   transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.slide-up-leave-active {
   transition: all 0.3s ease-in-out;
}

.slide-up-enter-from,
.slide-up-leave-to {
   transform: translate(-50%, 120px);
   opacity: 0;
}

.player-wrapper.is-expanded {
   height: 160px;
   border-radius: 16px;
   cursor: default;
}

@media (min-width: 768px) {
   .player-wrapper {
      width: 380px;
      bottom: 1.5rem;
   }

   .player-wrapper.is-expanded {
      width: 500px;
      height: 160px;
   }
}
</style>