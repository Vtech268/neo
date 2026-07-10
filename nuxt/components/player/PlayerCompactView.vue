<template>
   <div v-if="store.currentSong" class="music-controls compact-view">
      <div class="song-details">
         <div class="album-art" :class="{ 'is-playing': store.isPlaying && !store.isBuffering }">
            <div class="equalizer-container"><span></span><span></span><span></span><span></span></div>
         </div>
         <div>
            <div class="title-wrapper" ref="titleWrapperRef" :class="{ 'is-overflowing': isTitleOverflowing }">
               <div class="title" ref="titleRef" :data-title="store.currentSong.title">{{ store.currentSong.title }}
               </div>
            </div>
            <div class="artist">{{ store.currentSong.artist }}</div>
         </div>
      </div>
      <div class="controls">
         <button @click.stop="store.prevSong()" class="control-btn" aria-label="Previous song"><i
               class="bi bi-skip-start-fill"></i></button>
         <button @click.stop="store.togglePlayPause()" class="control-btn play-pause" aria-label="Play or Pause">
            <div v-if="store.isBuffering" class="button-loader"></div>
            <i v-else-if="store.isPlaying" class="bi bi-pause-fill"></i>
            <i v-else class="bi bi-play-fill"></i>
         </button>
         <button @click.stop="store.nextSong()" class="control-btn" aria-label="Next song"><i
               class="bi bi-skip-end-fill"></i></button>
      </div>
   </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useMusicStore } from '@/stores/music'

const props = defineProps<{ store: ReturnType<typeof useMusicStore> }>()

const titleWrapperRef = ref<HTMLElement | null>(null)
const titleRef = ref<HTMLElement | null>(null)
const isTitleOverflowing = ref(false)

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
.music-controls.compact-view {
   width: 100%;
   height: 50px;
   padding: 0 0.75rem;
   display: flex;
   align-items: center;
   justify-content: space-between;
   gap: 1rem;
}

.song-details {
   display: flex;
   align-items: center;
   gap: 0.75rem;
   overflow: hidden;
   flex-grow: 1;
   min-width: 0;
}

.album-art {
   flex-shrink: 0;
   width: 36px;
   height: 36px;
   display: flex;
   align-items: center;
   justify-content: center;
}

.equalizer-container {
   width: 20px;
   height: 20px;
   display: flex;
   justify-content: space-between;
   align-items: flex-end;
}

.equalizer-container span {
   width: 3px;
   height: 100%;
   background-color: var(--dark-primary-accent);
   border-radius: 2px;
   transform-origin: bottom;
   transform: scaleY(0.2);
}

body.light-mode .equalizer-container span {
   background-color: var(--light-primary);
}

.album-art.is-playing .equalizer-container span {
   animation: equalizer-anim 0.5s ease-in-out infinite alternate;
}

@keyframes equalizer-anim {
   from {
      transform: scaleY(0.2);
   }

   to {
      transform: scaleY(1);
   }
}

.album-art.is-playing span:nth-child(1) {
   animation-duration: 0.4s;
}

.album-art.is-playing span:nth-child(2) {
   animation-duration: 0.6s;
}

.album-art.is-playing span:nth-child(3) {
   animation-duration: 0.5s;
}

.album-art.is-playing span:nth-child(4) {
   animation-duration: 0.8s;
}

.title-wrapper {
   width: 100%;
   overflow: hidden;
}

.title {
   display: inline-block;
   white-space: nowrap;
   font-weight: 600;
   font-size: 0.85rem;
   color: var(--dark-text-color);
   line-height: 1.2;
}

body.light-mode .title {
   color: var(--light-text-color);
}

.title-wrapper.is-overflowing .title {
   padding-left: 100%;
   animation: marquee-anim 10s linear infinite;
}

.title-wrapper.is-overflowing .title::after {
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

.artist {
   font-size: 0.75rem;
   color: var(--dark-secondary-text-color);
   line-height: 1.2;
}

body.light-mode .artist {
   color: #6c757d;
}

.controls {
   display: flex;
   align-items: center;
   gap: 0.25rem;
   flex-shrink: 0;
}

.control-btn {
   background: none;
   border: none;
   color: var(--dark-secondary-text-color);
   font-size: 1.25rem;
   cursor: pointer;
   padding: 0.5rem;
   transition: color 0.2s ease;
   display: grid;
   place-items: center;
}

.control-btn:hover {
   color: var(--dark-text-color);
}

body.light-mode .control-btn {
   color: #6c757d;
}

body.light-mode .control-btn:hover {
   color: var(--light-text-color);
}

.control-btn.play-pause {
   background-color: var(--dark-text-color);
   color: var(--dark-card-bg);
   border-radius: 50%;
   width: 34px;
   height: 34px;
   font-size: 1.1rem;
   display: flex;
   align-items: center;
   justify-content: center;
}

.control-btn.play-pause:hover {
   background-color: var(--dark-primary-accent);
   color: #000;
   transform: scale(1.1);
}

body.light-mode .control-btn.play-pause {
   background-color: var(--light-primary);
   color: #fff;
}

body.light-mode .control-btn.play-pause:hover {
   background-color: var(--light-primary);
   opacity: 0.8;
}

.button-loader {
   width: 16px;
   height: 16px;
   border: 2px solid;
   border-color: currentColor transparent;
   border-radius: 50%;
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
</style>