<template>
   <div v-if="store.currentSong" class="expanded-content">
      <img v-if="store.currentSong.thumbnail" :src="store.currentSong.thumbnail" class="expanded-thumbnail"
         alt="Album Art">

      <div class="expanded-info-wrapper">
         <div class="top-section">
            <div class="expanded-details">
               <div class="title-wrapper" ref="titleWrapperRef" :class="{ 'is-overflowing': isTitleOverflowing }">
                  <h2 class="expanded-title" ref="titleRef" :data-title="store.currentSong.title">
                     {{ store.currentSong.title }}
                  </h2>
               </div>
               <h3 class="expanded-artist">{{ store.currentSong.artist }}</h3>
            </div>
            <div class="expanded-actions">
               <button @click.stop="store.togglePlayerExpansion(false)" class="action-btn"
                  aria-label="Collapse player"><i class="bi bi-chevron-down"></i></button>
               <button @click.stop="store.closePlayer()" class="action-btn" aria-label="Close player"><i
                     class="bi bi-x-lg"></i></button>
            </div>
         </div>

         <div class="bottom-section">
            <div class="progress-container">
               <input type="range" class="progress-bar" :value="store.progress" min="0" max="100" @input="onSeek"
                  :style="progressStyle">
               <div class="time-display">
                  <span>{{ formatTime(store.currentTime) }}</span>
                  <span>{{ formatTime(store.duration) }}</span>
               </div>
            </div>
            <div class="expanded-controls">
               <button @click.stop="store.prevSong()" class="control-btn"><i class="bi bi-skip-start-fill"></i></button>
               <button @click.stop="store.togglePlayPause()" class="control-btn play-pause">
                  <div v-if="store.isBuffering" class="button-loader"></div>
                  <i v-else-if="store.isPlaying" class="bi bi-pause-fill"></i>
                  <i v-else class="bi bi-play-fill"></i>
               </button>
               <button @click.stop="store.nextSong()" class="control-btn"><i class="bi bi-skip-end-fill"></i></button>
            </div>
         </div>
      </div>

      <div class="volume-container-vertical">
         <i class="bi bi-volume-up-fill"></i>
         <input type="range" class="volume-slider-vertical" :value="store.volume" min="0" max="100"
            @input="onVolumeChange">
         <i class="bi bi-volume-down-fill"></i>
      </div>
   </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import { useMusicStore } from '@/stores/music'

const props = defineProps<{
   store: ReturnType<typeof useMusicStore>
   formatTime: (seconds: number) => string
   onSeek: (event: Event) => void
   onVolumeChange: (event: Event) => void
   downloadSong: () => void
}>()

const titleWrapperRef = ref<HTMLElement | null>(null)
const titleRef = ref<HTMLElement | null>(null)
const isTitleOverflowing = ref(false)

const progressStyle = computed(() => ({
   '--progress-percent': `${props.store.progress}%`
}))

const checkTitleOverflow = () => {
   if (props.store.currentSong && titleRef.value && titleWrapperRef.value) {
      isTitleOverflowing.value = titleRef.value.scrollWidth > titleWrapperRef.value.clientWidth
   }
}

watch(() => props.store.currentSong, async () => {
   isTitleOverflowing.value = false
   await nextTick()
   checkTitleOverflow()
}, { immediate: true, deep: true })
</script>

<style scoped>
.expanded-content {
   width: 100%;
   height: 100%;
   display: flex;
   align-items: center;
   padding: 1rem;
   gap: 1.25rem;
}

.expanded-thumbnail {
   width: 120px;
   height: 120px;
   flex-shrink: 0;
   border-radius: 8px;
   object-fit: cover;
}

.expanded-info-wrapper {
   display: flex;
   flex-direction: column;
   width: 100%;
   height: 100%;
   min-width: 0;
   justify-content: space-between;
}

.top-section {
   display: flex;
   justify-content: space-between;
   width: 100%;
}

.bottom-section {
   width: 100%;
}

.expanded-details {
   text-align: left;
   overflow: hidden;
}

.title-wrapper {
   width: 100%;
   overflow: hidden;
}

.expanded-title {
   font-size: 1.1rem;
   font-weight: 600;
   color: var(--dark-text-color);
   display: inline-block;
   white-space: nowrap;
}

.title-wrapper.is-overflowing .expanded-title {
   padding-left: 100%;
   animation: marquee-anim 12s linear infinite;
}

.title-wrapper.is-overflowing .expanded-title::after {
   content: attr(data-title);
   display: inline-block;
   padding-left: 2rem;
}

@keyframes marquee-anim {
   0% {
      transform: translateX(0);
   }

   100% {
      transform: translateX(-100%);
   }
}

.expanded-artist {
   font-size: 0.85rem;
   color: var(--dark-secondary-text-color);
   white-space: nowrap;
   text-overflow: ellipsis;
   overflow: hidden;
}

body.light-mode .expanded-title {
   color: var(--light-text-color);
}

body.light-mode .expanded-artist {
   color: #6c757d;
}

.expanded-actions {
   display: flex;
   gap: 0.5rem;
   flex-shrink: 0;
}

.action-btn {
   background-color: transparent;
   border: none;
   color: var(--dark-secondary-text-color);
   width: 30px;
   height: 30px;
   border-radius: 50%;
   display: grid;
   place-items: center;
   font-size: 0.9rem;
   cursor: pointer;
   transition: background-color 0.2s ease, color 0.2s;
}

.action-btn:hover {
   background-color: var(--dark-border-color);
   color: var(--dark-text-color);
}

body.light-mode .action-btn {
   color: #6c757d;
}

body.light-mode .action-btn:hover {
   background-color: var(--light-border-color);
   color: var(--light-text-color);
}

.expanded-controls {
   display: flex;
   align-items: center;
   justify-content: center;
   gap: 1.5rem;
   margin-bottom: 0.5rem;
}

.expanded-controls .control-btn {
   background: none;
   border: none;
   padding: 0;
   color: var(--dark-secondary-text-color);
   font-size: 1.75rem;
   cursor: pointer;
   transition: color 0.2s ease;
}

.expanded-controls .control-btn:hover {
   color: var(--dark-text-color);
}

body.light-mode .expanded-controls .control-btn {
   color: #6c757d;
}

body.light-mode .expanded-controls .control-btn:hover {
   color: var(--light-text-color);
}

.expanded-controls .play-pause {
   width: 44px;
   height: 44px;
   background-color: var(--dark-text-color);
   color: var(--dark-card-bg);
   border-radius: 50%;
   font-size: 1.5rem;
   display: flex;
   align-items: center;
   justify-content: center;
   transition: all 0.2s ease;
}

.expanded-controls .play-pause:hover {
   background-color: var(--dark-primary-accent);
   color: #000;
   transform: scale(1.05);
}

body.light-mode .expanded-controls .play-pause {
   background-color: var(--light-primary);
   color: #fff;
}

body.light-mode .expanded-controls .play-pause:hover {
   background-color: var(--light-primary);
   opacity: 0.8;
}

.button-loader {
   width: 20px;
   height: 20px;
   border: 2px solid;
   border-color: currentColor transparent;
   border-radius: 50%;
   display: inline-block;
   animation: rotation 1s linear infinite;
}

@keyframes rotation {
   0% {
      transform: rotate(0deg);
   }

   100% {
      transform: rotate(360deg);
   }
}

.time-display {
   display: flex;
   justify-content: space-between;
   font-size: 0.7rem;
   color: var(--dark-secondary-text-color);
   margin-top: 0.25rem;
   padding: 0 2px;
}

body.light-mode .time-display {
   color: #6c757d;
}

.progress-bar {
   width: 100%;
   -webkit-appearance: none;
   appearance: none;
   background: transparent;
   height: 4px;
   border-radius: 2px;
   cursor: pointer;
   outline: none;
}

.progress-bar::-webkit-slider-thumb {
   -webkit-appearance: none;
   appearance: none;
}

.progress-bar::-moz-range-thumb {
   -moz-appearance: none;
   appearance: none;
   width: 0;
   height: 0;
   border: 0;
}

.progress-bar::-webkit-slider-runnable-track {
   width: 100%;
   height: 4px;
   background: linear-gradient(to right,
         var(--dark-text-color) var(--progress-percent),
         var(--dark-border-color) var(--progress-percent));
   border-radius: 2px;
}

body.light-mode .progress-bar::-webkit-slider-runnable-track {
   background: linear-gradient(to right,
         var(--light-text-color) var(--progress-percent),
         var(--light-border-color) var(--progress-percent));
}

.progress-bar::-moz-range-track {
   width: 100%;
   height: 4px;
   background: linear-gradient(to right,
         var(--dark-text-color) var(--progress-percent),
         var(--dark-border-color) var(--progress-percent));
   border-radius: 2px;
}

body.light-mode .progress-bar::-moz-range-track {
   background: linear-gradient(to right,
         var(--light-text-color) var(--progress-percent),
         var(--light-border-color) var(--progress-percent));
}

.volume-container-vertical {
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   gap: 0.5rem;
   color: var(--dark-secondary-text-color);
   height: 100%;
   flex-shrink: 0;
   padding: 0 0.5rem;
}

body.light-mode .volume-container-vertical {
   color: #6c757d;
}

.volume-slider-vertical {
   writing-mode: vertical-lr;
   direction: rtl;
   -webkit-appearance: slider-vertical;
   appearance: none;
   width: 8px;
   height: 100%;
   padding: 0;
   margin: 0;
   background: transparent;
   cursor: pointer;
}

.volume-slider-vertical::-webkit-slider-runnable-track {
   width: 4px;
   height: 100%;
   background: var(--dark-border-color);
   border-radius: 2px;
}

body.light-mode .volume-slider-vertical::-webkit-slider-runnable-track {
   background: var(--light-border-color);
}

.volume-slider-vertical::-webkit-slider-thumb {
   -webkit-appearance: none;
   appearance: none;
   width: 14px;
   height: 14px;
   background: var(--dark-text-color);
   border-radius: 50%;
   border: none;
   margin-left: -5px;
}

body.light-mode .volume-slider-vertical::-webkit-slider-thumb {
   background: var(--light-text-color);
}

.volume-slider-vertical::-moz-range-track {
   width: 4px;
   height: 100%;
   background: var(--dark-border-color);
   border-radius: 2px;
}

body.light-mode .volume-slider-vertical::-moz-range-track {
   background: var(--light-border-color);
}

.volume-slider-vertical::-moz-range-thumb {
   width: 14px;
   height: 14px;
   background: var(--dark-text-color);
   border-radius: 50%;
   border: none;
}

body.light-mode .volume-slider-vertical::-moz-range-thumb {
   background: var(--light-text-color);
}

@media (max-width: 575.98px) {
   .expanded-content {
      gap: 1rem;
      padding-right: 1rem;
   }

   .expanded-thumbnail {
      width: 80px;
      height: 80px;
   }

   .volume-container-vertical {
      display: none;
   }
}
</style>