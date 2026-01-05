<template>
  <div class="notification-center">
    <div class="nc-header">
      <h3>Notifications</h3>
      <button v-if="unreadCount > 0" class="mark-read-btn" @click="markAllRead">
        Mark all read
      </button>
    </div>
    
    <div v-if="notifications.length === 0" class="empty-state">
      <span class="material-symbols-rounded">notifications_off</span>
      <p>No new notifications</p>
    </div>

    <div v-else class="notification-list">
      <div 
        v-for="note in notifications" 
        :key="note.id" 
        class="notification-item"
        :class="{ unread: !note.read }"
        @click="handleNotificationClick(note)"
      >
        <div class="icon-wrapper" :class="note.severity || 'info'">
          <span class="material-symbols-rounded">{{ getIcon(note.type) }}</span>
        </div>
        <div class="content">
          <div class="title-row">
            <h4>{{ note.title }}</h4>
            <span class="time">{{ formatTime(note.createdAt) }}</span>
          </div>
          <p>{{ note.body }}</p>
        </div>
        <div v-if="!note.read" class="dot"></div>
      </div>
    </div>
  </div>
</template>

<script>
// Use the RTDB wrapper rather than Firestore SDK
import { db } from '@/firebase/database'

export default {
  name: 'NotificationCenter',
  data() {
    return {
      notifications: [],
      unsubscribe: null
    }
  },
  computed: {
    unreadCount() {
      // Logic remains the same
      return this.notifications.filter(n => !n.read).length
    }
  },
  async mounted() {
    // We can use db.subscribe directly
    // The wrapper handles the 'notifications' path under proper env
    
    // However, the wrapper returns an unsubscribe function if using 'subscribe'
    // Let's use db.subscribe('notifications', callback) which handles onValue
    this.unsubscribe = db.subscribe('notifications', (data) => {
      if (!data) {
        this.notifications = []
        return
      }
      // RTDB returns object { key: val, ... }, convert to array & sort
      const list = Object.entries(data).map(([id, val]) => ({
        id,
        ...val
      }))
      
      // Sort by createdAt desc
      this.notifications = list.sort((a, b) => b.createdAt - a.createdAt)
      
      this.$emit('count-update', this.unreadCount)
    })
  },
  beforeUnmount() {
    if (this.unsubscribe) this.unsubscribe()
  },
  methods: {
    getIcon(type) {
      const map = {
        'new_lead': 'person_add',
        'job_secured': 'verified',
        'urgent': 'warning'
      }
      return map[type] || 'info'
    },
    formatTime(timestamp) {
      if (!timestamp) return ''
      // RTDB timestamp is usually number (mms)
      const date = new Date(timestamp)
      const diff = (Date.now() - date.getTime()) / 1000
      if (diff < 60) return 'Just now'
      if (diff < 3600) return `${Math.floor(diff/60)}m ago`
      if (diff < 86400) return `${Math.floor(diff/3600)}h ago`
      return date.toLocaleDateString()
    },
    async handleNotificationClick(note) {
      if (!note.read) {
        // Mark read in RTDB
        await db.updateRecord(`notifications/${note.id}`, { read: true })
      }
      if (note.jobId) {
        this.$emit('view-job', note.jobId)
      }
    },
    async markAllRead() {
      // Batch update logic for RTDB
      // We can use db.batchUpdate() from our wrapper if supported, or loop
      // Wrapper supports batchUpdate expecting { path: data, ... }
      
      const updates = {}
      this.notifications.filter(n => !n.read).forEach(n => {
        // Use relative path from root? No, batchUpdate helper prefixes env?
        // Let's check db.batchUpdate: it prefixes paths.
        // So we just need `notifications/${id}/read`: true
        updates[`notifications/${n.id}/read`] = true
      })
      
      if (Object.keys(updates).length > 0) {
        await db.batchUpdate(updates)
      }
    }
  }
}
</script>

<style scoped>
.notification-center {
  background: white;
  border-left: 1px solid #e2e8f0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.nc-header {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nc-header h3 {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.mark-read-btn {
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 0.8rem;
  cursor: pointer;
  font-weight: 600;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: #94a3b8;
}
.empty-state span { font-size: 2rem; margin-bottom: 0.5rem; display: block; }

.notification-list {
  overflow-y: auto;
  flex: 1;
}

.notification-item {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  gap: 0.75rem;
  cursor: pointer;
  transition: background 0.15s;
  position: relative;
}

.notification-item:hover {
  background: #f8fafc;
}

.notification-item.unread {
  background: #f0f9ff;
}

.icon-wrapper {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-wrapper span { font-size: 1.1rem; }

.icon-wrapper.info { background: #e0f2fe; color: #0284c7; }
.icon-wrapper.success { background: #dcfce7; color: #16a34a; }
.icon-wrapper.warning { background: #fef9c3; color: #ca8a04; }

.content {
  flex: 1;
}

.title-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.title-row h4 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #334155;
}

.time {
  font-size: 0.75rem;
  color: #94a3b8;
}

.content p {
  margin: 0;
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.4;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3b82f6;
  position: absolute;
  top: 1.25rem;
  right: 0.5rem;
}
</style>
