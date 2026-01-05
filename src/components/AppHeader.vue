<template>
  <header class="app-header">
    <div class="header-inner px-4 sm:px-6 lg:px-8">
      <!-- Logo Area -->
      <div class="flex items-center gap-3">
        <router-link :to="homeRoute" class="flex items-center gap-2 text-slate-900 no-underline hover:text-blue-700 transition-colors">
          <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
             <span class="material-symbols-rounded text-xl">garage_home</span>
          </div>
          <span class="font-bold text-lg tracking-tight hidden sm:block">Rollwise</span>
        </router-link>
      </div>

      <!-- Right Actions -->
      <div class="flex items-center gap-4">
        <!-- Role Switcher -->
        <div v-if="authStore.availableRoles.length > 1" class="hidden md:flex items-center gap-2">

          <button 
            v-if="authStore.activeRole === 'client' && authStore.memberships.pro?.status === 'approved'"
            @click="switchRole('pro')"
            class="switch-role-btn pro"
          >
            <span class="material-symbols-rounded">engineering</span>
            Switch to Pro Hub
          </button>
        </div>

        <div class="user-info text-right hidden sm:block">
          <div class="text-sm font-bold text-slate-900">{{ userName || userPhone }}</div>
          <div class="text-xs text-slate-500 font-medium uppercase tracking-wide">{{ userRoleLabel }}</div>
        </div>

        <div class="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>

        <button @click="authStore.toggleTheme" class="theme-toggle-btn" :title="'Switch to ' + (authStore.theme === 'light' ? 'Dark' : 'Light') + ' Mode'">
          <span class="material-symbols-rounded">
            {{ authStore.theme === 'light' ? 'dark_mode' : 'light_mode' }}
          </span>
        </button>

        <button @click="handleLogout" class="logout-btn-app" title="Sign Out">
          <span class="material-symbols-rounded">logout</span>
          <span class="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const homeRoute = computed(() => authStore.homeRoute)
const userName = computed(() => authStore.userName)
const userPhone = computed(() => authStore.userPhone)
const userRoleLabel = computed(() => {
  const role = authStore.activeRole
  if (role === 'pro') return 'Pro Partner'
  if (role === 'admin') return 'Admin'
  return 'Client'
})

const handleLogout = () => {
  authStore.logout()
  router.push('/')
}

const switchRole = (role) => {
  authStore.switchRole(role)
  router.push(authStore.homeRoute)
}
</script>

<style scoped>
.app-header {
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
  height: 64px;
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 50;
  color: var(--text-primary);
}

.header-inner {
  width: 100%;
  max-width: 1440px; /* Match app container */
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.theme-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: var(--bg-muted);
  border: 1px solid var(--border-primary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.theme-toggle-btn:hover {
  background: var(--border-primary);
  color: var(--text-primary);
}

.switch-role-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 999px;
  background-color: var(--bg-muted);
  color: var(--text-secondary);
  border: 1px solid var(--border-primary);
  font-weight: 700;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  transition: all 0.2s;
  cursor: pointer;
}

.switch-role-btn:hover {
  background-color: var(--border-primary);
  color: var(--text-primary);
}

.switch-role-btn.pro {
  background-color: #eff6ff;
  color: #2563eb;
  border-color: #bfdbfe;
}

.switch-role-btn.pro:hover {
  background-color: #dbeafe;
}

.logout-btn-app {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  background-color: var(--bg-muted);
  color: var(--text-secondary);
  border: 1px solid var(--border-primary);
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s;
}
.logout-btn-app:hover {
  background-color: #fee2e2;
  color: #ef4444;
  border-color: #fecaca;
}
</style>
