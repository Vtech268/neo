import type { Modal } from 'bootstrap'

declare module '#app' {
   interface NuxtApp {
      $bootstrap: {
         Modal: new (element: string | Element, options?: Partial<Modal.Options>) => Modal
      }
   }
}

export { }