<template>
  <div class="logo-container">
    <svg width="80" height="80" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="54" fill="#000000"/>
      <g transform="translate(30, 36)">
        <rect x="0" y="0" width="60" height="7" rx="1.5" fill="#ffffff" opacity="0.95"/>
        <rect x="0" y="10" width="60" height="7" rx="1.5" fill="#ffffff" opacity="0.85"/>
        <rect x="0" y="20" width="60" height="7" rx="1.5" fill="#ffffff" opacity="0.75"/>
        <rect x="0" y="30" width="60" height="7" rx="1.5" fill="#ffffff" opacity="0.65"/>
        <rect x="0" y="40" width="60" height="7" rx="1.5" fill="#ffffff" opacity="0.55"/>
      </g>
      <circle cx="60" cy="60" r="42" stroke="#ffffff" stroke-width="1.5" fill="none" opacity="0.2"/>
      <path d="M 60 18 A 42 42 0 0 1 87 33" stroke="#ffffff" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.6"/>
    </svg>
  </div>
</template>

<script>
export default {
  name: 'Logo'
}
</script>

<style scoped>
.logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
}
</style>

