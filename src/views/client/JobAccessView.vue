<template>
  <div class="job-access-view">
    <div class="access-card">
      <div class="logo-area">
        <span class="material-symbols-rounded logo-icon">garage_home</span>
        <span class="logo-text">Rollwise</span>
      </div>

      <h2>View Service Request</h2>
      <p class="subtitle">Enter your phone number to access your job details securely.</p>

      <BaseAuthView 
        mode="client" 
        :redirect-to="redirectTarget"
        :initial-phone="initialPhone"
        layout="minimal"
      />
      
      <div class="footer-links">
        <p>Already have an account? <router-link :to="{name: 'client-login'}">Sign In</router-link></p>
      </div>
    </div>
  </div>
</template>

<script>
import BaseAuthView from '@/components/auth/BaseAuthView.vue'

export default {
  name: 'JobAccessView',
  components: { BaseAuthView },
  props: {
      jobId: { type: String, default: '' },
      phone: { type: String, default: '' }
  },
  computed: {
    redirectTarget() {
        return this.jobId ? `/q/${this.jobId}` : '/client/home'
    },
    initialPhone() {
        return this.phone
    }
  }
}
</script>

<style scoped>
.job-access-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--slate-50);
  padding: 1rem;
}

.access-card {
  background: white;
  width: 100%;
  max-width: 500px;
  padding: 2.5rem;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  text-align: center;
}

.logo-area {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 2rem;
  color: var(--blue-600);
}
.logo-icon { font-size: 2rem; }
.logo-text { font-size: 1.5rem; font-weight: 800; color: var(--slate-900); letter-spacing: -0.02em; }

h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--slate-900);
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--slate-500);
  margin-bottom: 2rem;
  font-size: 0.95rem;
  line-height: 1.5;
}

.footer-links {
  margin-top: 2rem;
  font-size: 0.9rem;
  color: var(--slate-500);
}
.footer-links a { color: var(--blue-600); font-weight: 600; text-decoration: none; }
</style>
