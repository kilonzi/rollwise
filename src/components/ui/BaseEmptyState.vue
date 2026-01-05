<template>
  <div class="empty-state-container" :class="{ dark }">
    <div class="illustration" :class="{ dark }">
      <span class="material-symbols-rounded icon" aria-hidden="true">{{ icon }}</span>
    </div>
    <h3>{{ title }}</h3>
    <p>{{ description }}</p>
    <button 
      v-if="actionLabel" 
      class="action-btn"
      :class="{ dark }"
      @click="$emit('action')"
    >
      {{ actionLabel }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: 'Nothing here yet'
  },
  description: {
    type: String,
    default: 'When records are added, they will appear here.'
  },
  icon: {
    type: String,
    default: 'inbox'
  },
  actionLabel: {
    type: String,
    default: ''
  },
  dark: {
    type: Boolean,
    default: false
  }
})

defineEmits(['action'])
</script>

<style scoped>
.empty-state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 40px 20px;
  background: white;
  border-radius: 16px;
  border: 1px dashed #cbd5e1;
  color: #64748b;
}

.empty-state-container.dark {
  background: #1e1e1e;
  border-color: #333;
  color: #9ca3af;
}

.illustration {
  width: 64px;
  height: 64px;
  background: #f1f5f9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.illustration.dark {
  background: #2d2d2d;
}

.icon {
  font-size: 32px;
  color: #94a3b8;
}

h3 {
  margin: 0 0 8px;
  color: #0f172a;
  font-size: 1.1rem;
  font-weight: 600;
}

.empty-state-container.dark h3 {
  color: #e2e8f0;
}


p {
  margin: 0 0 24px;
  max-width: 300px;
  line-height: 1.5;
}

.action-btn {
  background: #0f172a;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.1);
}

.action-btn.dark {
  background: #3b82f6;
  color: white;
}
</style>
