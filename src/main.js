import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

import { useAuthStore } from '@/stores/authStore'
const auth = useAuthStore()
// Apply theme immediately
auth.applyTheme()

// Attempt restore before mount
auth.restoreSession().finally(() => {
  app.mount('#app')
})

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      console.warn('Service worker registration failed')
    })
  })
}
