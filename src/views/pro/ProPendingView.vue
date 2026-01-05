<template>
  <div class="pending-container">
    <div class="pending-card">
      <span class="material-symbols-rounded icon" aria-hidden="true">hourglass_top</span>
      <h1>Pro Application Under Review</h1>
      <p class="lead">Our admin team is validating your documents.</p>
      <ul class="status-list">
        <li>
          <span class="material-symbols-rounded" aria-hidden="true">task</span>
          Professional identity verification
        </li>
        <li>
          <span class="material-symbols-rounded" aria-hidden="true">inventory_2</span>
          Insurance and compliance audit
        </li>
        <li>
          <span class="material-symbols-rounded" aria-hidden="true">credit_score</span>
          Marketplace partner onboarding
        </li>
      </ul>
      <p class="eta">You'll receive an SMS at {{ authStore.userPhone }} when approved (usually within 24 hours).</p>
      <button class="uber-button secondary" @click="logout">Log Out</button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore.js'

const router = useRouter()
const authStore = useAuthStore()

const logout = () => {
  authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.pending-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f6f6f6;
  padding: 24px;
}

.pending-card {
  max-width: 520px;
  width: 100%;
  background: white;
  padding: 40px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.1);
}

.icon {
  font-size: 48px;
  color: #f59e0b;
}

h1 {
  margin: 16px 0 8px;
  font-size: 1.75rem;
}

.lead {
  color: #4b5563;
}

.status-list {
  list-style: none;
  padding: 0;
  margin: 24px 0;
  text-align: left;
  display: grid;
  gap: 12px;
}

.status-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #111827;
}

.status-list span {
  color: #10b981;
}

.eta {
  color: #4b5563;
  margin-bottom: 24px;
}

.uber-button.secondary {
  background: #111827;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 999px;
  cursor: pointer;
}
</style>
