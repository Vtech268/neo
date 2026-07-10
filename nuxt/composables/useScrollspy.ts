import { ref, onBeforeUnmount } from 'vue'

export function useScrollspy(sectionIds: string[]) {
   const activeSection = ref<string | null>(null)
   const observers = new Map<string, IntersectionObserver>()

   const setup = () => {
      cleanup()

      sectionIds.forEach(id => {
         const element = document.getElementById(id)
         if (!element) return

         const observer = new IntersectionObserver(
            ([entry]) => {
               if (entry.isIntersecting) {
                  activeSection.value = id
               }
            },
            {
               rootMargin: '-50% 0px -50% 0px',
               threshold: 0
            }
         )

         observer.observe(element)
         observers.set(id, observer)
      })
   }

   const cleanup = () => {
      observers.forEach(observer => observer.disconnect())
      observers.clear()
   }

   onBeforeUnmount(cleanup)

   return {
      activeSection,
      setup,
      cleanup
   }
}