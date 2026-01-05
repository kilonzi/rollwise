<template>
  <aside class="notification-center">
    <header>
      <div>
        <h3>Notifications</h3>
        <p v-if="unreadCount" class="sub">{{ unreadCount }} new</p>
      </div>
      <button class="clear-btn" @click="$emit('clear')">Clear</button>
    </header>
    <div v-if="!items.length" class="empty">
      <p>No notifications yet.</p>
    </div>
    <ul v-else>
      <li v-for="notification in items" :key="notification.id">
        <div class="row">
          <p class="title">{{ notification.title }}</p>
          <span class="badge" :class="notification.severity">{{ notification.severity || 'info' }}</span>
        </div>
        <p class="body">{{ notification.body }}</p>
        <span class="time">{{ formatTime(notification.createdAt) }}</span>
      </li>
    </ul>
  </aside>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  }
})

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleString()
}

const unreadCount = computed(() => props.items.filter(item => !item.read).length)
</script>

<style scoped>
.notification-center {
  width: 320px;
  background: #fff;
  border-left: 1px solid #e2e8f0;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sub {
  margin: 2px 0 0;
  font-size: 0.8rem;
  color: #94a3b8;
}

.clear-btn {
  background: none;
  border: none;
  color: #2563eb;
  font-weight: 600;
  cursor: pointer;
}

.empty {
  text-align: center;
  color: #94a3b8;
  font-size: 0.9rem;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

li {
  padding: 12px;
  border-radius: 8px;
  background: #f8fafc;
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  margin: 0;
  font-weight: 600;
}

.body {
  margin: 4px 0;
  color: #475569;
  font-size: 0.9rem;
}

.time {
  font-size: 0.8rem;
  color: #94a3b8;
}

.badge {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.7rem;
  text-transform: uppercase;
  color: #1e293b;
  background: #e2e8f0;
}

.badge.success { background: #d1fae5; color: #065f46; }
.badge.warning { background: #fef3c7; color: #92400e; }
.badge.error { background: #fee2e2; color: #991b1b; }
</style>
