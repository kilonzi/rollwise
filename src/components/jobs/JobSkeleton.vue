<template>
  <div class="job-skeleton">
    <div class="header-split">
      <div class="info-block">
        <BaseSkeleton width="40px" height="14px" class="mb-2" /> <!-- ID -->
        <BaseSkeleton width="60%" height="20px" class="mb-2" /> <!-- Title -->
        <BaseSkeleton width="40%" height="16px" /> <!-- Subtitle -->
      </div>
      <div class="status-block">
         <BaseSkeleton width="80px" height="28px" border-radius="999px" />
         <BaseSkeleton width="36px" height="36px" border-radius="999px" />
      </div>
    </div>
  </div>
</template>

<script setup>
import BaseSkeleton from '@/components/ui/BaseSkeleton.vue'
</script>

<style scoped>
.job-skeleton {
  border-radius: 16px;
  padding: 20px;
  background: white;
  border: 1px solid #f1f5f9;
}

.header-split {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.info-block {
  flex: 1;
}

.status-block {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mb-2 {
  margin-bottom: 8px;
}
</style>
