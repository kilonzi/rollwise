<template>
  <div class="service-radius-selector">
    <div class="controls">
      <div class="radius-info">
        <label>Service Radius: <span class="miles">{{ localRadius }} miles</span></label>
        <p class="helper-text">How far from your base address will you accept jobs?</p>
        <div class="slider-container">
          <input 
            type="range" 
            v-model.number="localRadius" 
            min="5" 
            max="100" 
            step="5" 
            class="radius-slider"
            @input="onRadiusChange"
          />
          <div class="slider-ticks">
            <span>5m</span>
            <span>25m</span>
            <span>50m</span>
            <span>75m</span>
            <span>100m</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ServiceRadiusSelector',
  props: {
    modelValue: { type: Number, default: 25 },
    address: { type: String, default: '' }, // Kept for prop compatibility but unused
    apiKey: { type: String, default: '' }   // Kept for prop compatibility but unused
  },
  emits: ['update:modelValue'],
  data() {
    return {
      localRadius: this.modelValue
    }
  },
  watch: {
    modelValue(newVal) {
      this.localRadius = newVal
    }
  },
  methods: {
    onRadiusChange() {
      this.$emit('update:modelValue', this.localRadius)
    }
  }
}
</script>

<style scoped>
.service-radius-selector {
  width: 100%;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 24px;
}

.radius-info label {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.helper-text {
  font-size: 0.9rem;
  color: #64748b;
  margin-bottom: 24px;
}

.miles {
  color: var(--blue-600);
  font-weight: 800;
  font-size: 1.1rem;
}

.slider-container {
  position: relative;
  padding: 10px 0;
}

.radius-slider {
  width: 100%;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  appearance: none;
  outline: none;
  cursor: pointer;
}

.radius-slider::-webkit-slider-thumb {
  appearance: none;
  width: 24px;
  height: 24px;
  background: white;
  border: 2px solid var(--blue-600);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  transition: transform 0.1s;
  margin-top: -9px; /* center on track */
}

.radius-slider::-webkit-slider-runnable-track {
  width: 100%;
  height: 6px;
  background: #cbd5e1;
  border-radius: 3px;
}

.radius-slider:focus::-webkit-slider-thumb {
  transform: scale(1.1);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2);
}

.slider-ticks {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  font-size: 0.8rem;
  color: #94a3b8;
  font-weight: 500;
}
</style>
