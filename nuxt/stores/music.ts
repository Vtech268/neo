import { defineStore } from 'pinia'

export interface Song {
   id: string
   title: string
   artist: string
   thumbnail?: string
}

export const useMusicStore = defineStore('music', {
   state: () => ({
      playlist: [] as Song[],
      playbackQueue: [] as Song[],
      currentSongIndex: null as number | null,
      isPlaying: false,
      isBuffering: false,
      isLooping: false,
      isPlayerExpanded: false,
      currentTime: 0,
      duration: 0,
      volume: 100,
      searchHistory: [] as Song[],
      lastSearchQuery: ''
   }),

   getters: {
      currentSong(state): Song | null {
         if (state.currentSongIndex === null || !state.playbackQueue[state.currentSongIndex]) {
            return null
         }
         return state.playbackQueue[state.currentSongIndex]
      },
      progress(state): number {
         if (state.duration === 0) return 0
         return (state.currentTime / state.duration) * 100
      }
   },

   actions: {
      playFromList(contextList: Song[], startingSongId: string) {
         this.playbackQueue = [...contextList]
         const index = this.playbackQueue.findIndex(s => s.id === startingSongId)

         if (index !== -1) {
            this.currentSongIndex = index
            this.isPlaying = true
            this.isBuffering = true
         }
      },
      addToPlaylist(song: Song) {
         if (!this.playlist.some(s => s.id === song.id)) {
            this.playlist.push(song)
         }
      },
      nextSong() {
         if (this.currentSongIndex !== null && this.playbackQueue.length > 0) {
            const nextIndex = (this.currentSongIndex + 1) % this.playbackQueue.length
            this.currentSongIndex = nextIndex
            this.isPlaying = true
            this.isBuffering = true
         }
      },
      prevSong() {
         if (this.currentSongIndex !== null && this.playbackQueue.length > 0) {
            const prevIndex = (this.currentSongIndex - 1 + this.playbackQueue.length) % this.playbackQueue.length
            this.currentSongIndex = prevIndex
            this.isPlaying = true
            this.isBuffering = true
         }
      },
      closePlayer() {
         this.currentSongIndex = null
         this.playbackQueue = []
         this.isPlayerExpanded = false
         this.isPlaying = false
      },
      setSearchHistory(results: Song[], query: string) {
         this.searchHistory = results
         this.lastSearchQuery = query
      },
      clearSearchHistory() {
         this.searchHistory = []
         this.lastSearchQuery = ''
      },
      togglePlayerExpansion(forceState?: boolean) {
         this.isPlayerExpanded = typeof forceState === 'boolean' ? forceState : !this.isPlayerExpanded
      },
      updateTime(payload: { current: number, duration: number }) {
         this.currentTime = payload.current
         this.duration = payload.duration
      },
      setVolume(newVolume: number) {
         this.volume = Math.max(0, Math.min(100, newVolume))
      },
      setPlayerState(payload: { isPlaying?: boolean, isBuffering?: boolean }) {
         if (typeof payload.isPlaying !== 'undefined') this.isPlaying = payload.isPlaying
         if (typeof payload.isBuffering !== 'undefined') this.isBuffering = payload.isBuffering
      },
      togglePlayPause() {
         if (this.currentSongIndex !== null) {
            this.isPlaying = !this.isPlaying
         }
      }
   }
})