import { useState } from '#app'

type Theme = 'light' | 'dark'

export function usePageEffects() {
   const theme = useState<Theme>('theme', () => 'dark')
   const isScrolled = useState('isScrolled', () => false)

   if (process.client) {
      const saved = localStorage.getItem('theme') as Theme | null
      if (saved) {
         theme.value = saved
      }

      if (typeof window !== 'undefined' && !window.hasOwnProperty('_scrollAttached')) {
         window.addEventListener('scroll', () => {
            isScrolled.value = window.scrollY > 10
         })
         // @ts-ignore
         window._scrollAttached = true
      }
   }

   const toggleTheme = () => {
      const newTheme = theme.value === 'dark' ? 'light' : 'dark'
      theme.value = newTheme
      localStorage.setItem('theme', newTheme)

      if (newTheme === 'light') {
         document.body.classList.add('light-mode')
      } else {
         document.body.classList.remove('light-mode')
      }
   }

   return { theme, isScrolled, toggleTheme }
}