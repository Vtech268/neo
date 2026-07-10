interface GoogleCredentialResponse {
   credential: any
}

interface GoogleAccounts {
   accounts: any
   id: {
      initialize: (config: { client_id: string; callback: (response: GoogleCredentialResponse) => void; }) => void
      renderButton: (parent: HTMLElement | null, options: { theme?: string; size?: string; width?: string; }) => void
      prompt: () => void
   }
}

declare global {
   interface Window {
      google: GoogleAccounts
      onYouTubeIframeAPIReady: () => void
      YT: any
   }
}

export { }