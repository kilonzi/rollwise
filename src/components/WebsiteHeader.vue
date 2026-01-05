<template>
  <header class="the-header">
    <div class="header-content container">
      <!-- Logo -->
      <button class="logo-btn" @click="navigateHome">
        ROLLWISE
      </button>

      <!-- Desktop Nav / Actions -->
      <div class="header-actions">
        <!-- Prominent Phone CTA -->
        <a href="tel:+17742925110" class="phone-cta">
          <div class="icon-circle">
            <span class="material-symbols-rounded">call</span>
          </div>
          <div class="phone-text">
            <span class="label">24/7 Dispatch</span>
            <span class="number">(774) 292-5110</span>
          </div>
        </a>

        <!-- Nav Links -->
        <nav class="hidden md:flex items-center gap-6">
          <router-link to="/pro/apply" class="text-sm font-bold text-blue-600 hover:text-blue-700">
             Join as Pro
          </router-link>
        </nav>

        <!-- Auth Action -->
        <div v-if="!authStore.isAuthenticated" class="auth-action">
          <router-link 
            to="/client/login"
            class="client-auth-btn"
          >
            Client Sign-In
          </router-link>
        </div>

        <!-- User Menu (Logged In) -->
        <div class="user-menu" v-else>
          <button class="dashboard-btn" @click="goToDashboard">
             Go to Dashboard
          </button>
          <button class="logout-link" @click="handleLogout" title="Sign Out">
            <span class="material-symbols-rounded">logout</span>
          </button>
        </div>
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

const userLabel = computed(() => {
  if (authStore.activeRole === 'pro') return 'Pro'
  if (authStore.activeRole === 'client') return 'Client'
  if (authStore.activeRole === 'admin') return 'Admin'
  return 'Account'
})

const navigateHome = () => router.push('/')

const goToDashboard = () => {
    const route = authStore.homeRoute
    router.push(route || '/client/home')
}

const handleLogout = () => {
  authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.the-header {
  background-color: transparent; /* Blends with page background */
  /* border-bottom: 1px solid #f3f4f6; Removed border */
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: none; /* Removed shadow for 'less raised' look */
  backdrop-filter: blur(8px); /* Optional: nice effect over content */
  background: rgba(255,255,255,0.95);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.logo-btn {
  font-family: 'Inter', sans-serif;
  font-weight: 900;
  font-size: 1.5rem;
  color: #111827;
  letter-spacing: -0.05em;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 2rem;
}

/* Phone CTA */
.phone-cta {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: #111827;
  transition: opacity 0.2s;
}

.phone-cta:hover {
  opacity: 0.8;
}

.icon-circle {
  width: 40px;
  height: 40px;
  background-color: #ef4444; /* Emergency Red */
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
}

.phone-text {
  display: flex;
  flex-direction: column;
}

.phone-text .label {
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 700;
  color: #ef4444;
  letter-spacing: 0.05em;
}

.phone-text .number {
  font-weight: 800;
  font-size: 1.1rem;
  line-height: 1;
}

/* Auth Group */
.auth-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-link {
  font-size: 0.95rem;
  font-weight: 600;
  color: #4b5563;
  text-decoration: none;
  transition: color 0.2s;
}

.nav-link:hover {
  color: #111827;
}

.divider {
  color: #e5e7eb;
}

/* User Menu */
.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.dashboard-btn {
  background: #1e40af; /* brand-900 like hero button or blue-600 */
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  transition: all 0.2s;
}
.dashboard-btn:hover {
  background: #1e3a8a;
  transform: translateY(-1px);
}

.logout-link {
  font-size: 1.25rem;
  color: #94a3b8;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.logout-link:hover {
  color: #ef4444;
}

@media (max-width: 640px) {
  .phone-text {
    display: none;
  }
  
  .auth-group {
    display: none;
  }
  
  .header-actions {
    gap: 1rem;
  }
}

.client-auth-btn {
  background: white;
  color: #0f172a;
  border: 1px solid #e2e8f0;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
.client-auth-btn:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}
</style>
