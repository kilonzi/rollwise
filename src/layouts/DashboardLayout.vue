<template>
  <div class="dashboard-layout min-h-screen bg-slate-50">
    <AppHeader />
    <main class="dashboard-content">
      <slot />
    </main>
    <!-- Minimal Footer or None for App -->
    <footer class="py-6 text-center text-xs text-slate-400">
      &copy; {{ new Date().getFullYear() }} Rollwise. All rights reserved.
    </footer>
  </div>
</template>

<script setup>
import AppHeader from '@/components/AppHeader.vue'
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  flex-direction: column;
}
.dashboard-content {
  flex: 1;
}
</style>
