<template>
  <div class="public-layout">
    <WebsiteHeader />
    <main class="public-content">
      <slot />
    </main>
    <WebsiteFooter />
  </div>
</template>

<script setup>
import WebsiteHeader from '@/components/WebsiteHeader.vue'
import WebsiteFooter from '@/components/WebsiteFooter.vue'
</script>

<style scoped>
.public-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.public-content {
  flex: 1;
}
</style>
