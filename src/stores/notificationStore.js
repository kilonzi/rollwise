import { defineStore } from 'pinia'
import { db } from '@/firebase/database.js'

const NOTIFICATIONS_PATH = 'notifications'

const normalizeRole = (role) => role?.toLowerCase() || 'client'

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    items: [],
    isReady: false,
    error: null,
    unsubscribe: null
  }),

  actions: {
    async init(role) {
      if (this.unsubscribe) return
      const safeRole = normalizeRole(role)
      this.unsubscribe = db.subscribe(`${NOTIFICATIONS_PATH}/${safeRole}`, (snapshot) => {
        this.items = snapshot
          ? Object.entries(snapshot)
              .map(([id, value]) => ({ id, ...value }))
              .sort((a, b) => b.createdAt - a.createdAt)
          : []
        this.isReady = true
      })
    },
    dispose() {
      if (this.unsubscribe) {
        this.unsubscribe()
        this.unsubscribe = null
      }
    }
  }
})

