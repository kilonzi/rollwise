<template>
  <div class="chart-card">
    <header>
      <h3>This Week's Earnings</h3>
      <p class="total">{{ formattedTotal }}</p>
    </header>
    
    <div class="chart-container">
      <div 
        v-for="(day, index) in chartData" 
        :key="index" 
        class="bar-group"
      >
        <div class="bar-wrapper">
          <div 
            class="bar" 
            :style="{ height: `${day.percent}%` }"
            :class="{ max: day.isMax }"
          >
            <div class="tooltip">${{ day.amount }}</div>
          </div>
        </div>
        <span class="label">{{ day.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Array, // [{ label: 'Mon', amount: 150 }, ...]
    default: () => [
      { label: 'Mon', amount: 320 },
      { label: 'Tue', amount: 450 },
      { label: 'Wed', amount: 200 },
      { label: 'Thu', amount: 580 },
      { label: 'Fri', amount: 120 },
      { label: 'Sat', amount: 0 },
      { label: 'Sun', amount: 0 }
    ]
  }
})

const maxAmount = computed(() => Math.max(...props.data.map(d => d.amount)) || 1)

const chartData = computed(() => {
  return props.data.map(d => ({
    ...d,
    percent: (d.amount / maxAmount.value) * 100,
    isMax: d.amount === maxAmount.value && d.amount > 0
  }))
})

const formattedTotal = computed(() => {
  const total = props.data.reduce((sum, d) => sum + d.amount, 0)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(total)
})
</script>

<style scoped>
.chart-card {
  background: white;
  border-radius: 1.25rem;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
}

h3 {
  margin: 0;
  font-size: 0.9rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.total {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
}

.chart-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 180px;
  gap: 8px;
}

.bar-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  height: 100%;
}

.bar-wrapper {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  position: relative;
}

.bar {
  width: 12px;
  background: #e2e8f0;
  border-radius: 99px;
  transition: height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  min-height: 4px;
}

.bar.max {
  background: #3b82f6;
  width: 16px;
}

.label {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 600;
}

/* Tooltip interaction */
.bar:hover .tooltip {
  opacity: 1;
  transform: translateX(-50%) translateY(-8px);
}

.tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(0);
  background: #1e293b;
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: all 0.2s ease;
  z-index: 10;
}

.tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: #1e293b;
}

@media (min-width: 640px) {
  .bar {
    width: 24px;
  }
  .bar.max {
    width: 24px;
  }
}
</style>
