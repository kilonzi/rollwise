<template>
  <div class="modal-overlay" @click.self="$emit('cancel')">
    <div class="modal-card">
      <header>
        <div class="header-icon">
          <span class="material-symbols-rounded">security</span>
        </div>
        <h2>Safety First</h2>
        <p>Complete the pre-job safety check to proceed.</p>
      </header>

      <div class="checklist">
        <label 
          v-for="(item, index) in items" 
          :key="index"
          class="checklist-item"
        >
          <input 
            type="checkbox" 
            v-model="checkedItems" 
            :value="item.id"
          />
          <span class="text">{{ item.label }}</span>
        </label>
      </div>

      <footer>
        <button class="cancel-btn" @click="$emit('cancel')">Cancel</button>
        <button 
          class="confirm-btn" 
          :disabled="!allChecked"
          @click="$emit('confirm')"
        >
          Confirm & Start Job
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  jobId: {
    type: String,
    required: true
  }
})

defineEmits(['cancel', 'confirm'])

const items = [
  { id: 'loto', label: 'Lock Out / Tag Out confirmed' },
  { id: 'ppe', label: 'PPE (Safety Glasses, Gloves) equipped' },
  { id: 'hazards', label: 'Work area cleared of hazards' },
  { id: 'ladder', label: 'Ladder inspection completed' }
]

const checkedItems = ref([])

const allChecked = computed(() => {
  return items.every(item => checkedItems.value.includes(item.id))
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1000;
}

.modal-card {
  background: white;
  width: 100%;
  max-width: 480px;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: slideUp 0.3s ease-out;
}

header {
  text-align: center;
  margin-bottom: 24px;
}

.header-icon {
  width: 56px;
  height: 56px;
  background: #ecfdf5;
  color: #059669;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.header-icon span {
  font-size: 32px;
}

h2 {
  margin: 0;
  color: #111827;
  font-size: 1.5rem;
  font-weight: 700;
}

p {
  margin: 8px 0 0;
  color: #6b7280;
}

.checklist {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 30px;
}

.checklist-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.checklist-item:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.checklist-item:has(input:checked) {
  background: #f0fdf4;
  border-color: #86efac;
}

.checklist-item input {
  width: 20px;
  height: 20px;
  accent-color: #059669;
}

.text {
  font-weight: 500;
  color: #374151;
}

footer {
  display: flex;
  gap: 12px;
}

button {
  flex: 1;
  padding: 14px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

.cancel-btn {
  background: transparent;
  border: 1px solid #e5e7eb;
  color: #4b5563;
}

.cancel-btn:hover {
  background: #f3f4f6;
}

.confirm-btn {
  background: #111827;
  border: none;
  color: white;
}

.confirm-btn:hover:not(:disabled) {
  background: #000;
  transform: translateY(-1px);
}

.confirm-btn:disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
