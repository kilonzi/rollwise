<template>
  <div class="location-input-wrapper">
    <div class="input-with-icon">
      <span class="material-symbols-rounded icon">location_on</span>
      <input 
        ref="inputRef"
        v-model="query"
        @input="onInput"
        type="text" 
        class="modern-input" 
        :placeholder="placeholder"
        @focus="isFocused = true"
        @blur="handleBlur"
      />
      <div v-if="isLoading" class="loading-spinner"></div>
    </div>

    <!-- Custom Dropdown -->
    <div v-if="showDropdown && suggestions.length > 0" class="suggestions-dropdown">
      <div 
        v-for="(item, index) in suggestions" 
        :key="index" 
        class="suggestion-item"
        @mousedown.prevent="selectPrediction(item)"
      >
        <span class="material-symbols-rounded item-icon">location_on</span>
        <div class="item-text">
          <div class="main-text">{{ item.structuredFormat.mainText.text }}</div>
          <div class="secondary-text">{{ item.structuredFormat.secondaryText.text }}</div>
        </div>
      </div>
    </div>

    <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
    <!-- Debugger -->
    <!-- <p class="text-xs text-gray-400 mt-1">Key: {{ apiKey ? apiKey.substring(0,6) + '...' : 'MISSING' }}</p> -->
  </div>
</template>

<script>
// Lodash removed, using custom debounce implementation

export default {
  name: 'LocationInput',
  props: {
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: 'Enter service address' },
    apiKey: { type: String, required: true }
  },
  emits: ['update:modelValue', 'place-selected', 'focus', 'blur'],
  data() {
    return {
      query: this.modelValue,
      suggestions: [],
      isFocused: false,
      isLoading: false,
      errorMessage: '',
      sessionToken: null
    }
  },
  watch: {
    modelValue(newVal) {
      if (newVal !== this.query) {
        this.query = newVal
      }
    }
  },
  created() {
    // Basic debounce implementation if lodash not available
    this.debouncedFetch = this.debounce(this.fetchSuggestions, 400)
    this.sessionToken = this.generateSessionToken()
  },
  computed: {
    showDropdown() {
      return this.isFocused && this.suggestions.length > 0
    }
  },
  methods: {
    debounce(func, wait) {
      let timeout;
      return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
      }
    },
    generateSessionToken() {
       return crypto.randomUUID()
    },
    onInput() {
      this.$emit('update:modelValue', this.query)
      if (this.query.length > 2) {
        this.debouncedFetch()
      } else {
        this.suggestions = []
      }
    },
    handleBlur() {
      // Delay hide to allow click
      setTimeout(() => {
        this.isFocused = false
      }, 200)
      this.$emit('blur')
    },
    async fetchSuggestions() {
      if (!this.apiKey) {
        this.errorMessage = 'API Key missing'
        return
      }
      
      this.isLoading = true
      this.errorMessage = ''

      try {
        const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': this.apiKey
          },
          body: JSON.stringify({
            input: this.query,
            sessionToken: this.sessionToken,
            includedRegionCodes: ['US']
          })
        })

        if (!response.ok) {
           const err = await response.json()
           throw new Error(err.error?.message || response.statusText)
        }

        const data = await response.json()
        // Extract PlacePredictions
        this.suggestions = (data.suggestions || []).map(s => s.placePrediction)

      } catch (error) {
        console.error('Places API Error:', error)
        this.errorMessage = 'Failed to load suggestions.'
      } finally {
        this.isLoading = false
      }
    },
    selectPrediction(item) {
      const address = item.text.text
      this.query = address
      this.$emit('update:modelValue', address)
      this.suggestions = []
      this.isFocused = false
      
      // We might need lat/lng. The Autocomplete API (New) returns a 'place' resource name.
      // We would ideally fetch details, but for now we emit the address.
      // User requested "we just need the address only".
      
      this.$emit('place-selected', {
        address: address,
        raw: item
      })
      
      // Refresh token for next session
      this.sessionToken = this.generateSessionToken()
    }
  }
}
</script>

<style scoped>
.location-input-wrapper {
  position: relative;
  width: 100%;
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-icon .icon {
  position: absolute;
  left: 12px;
  color: var(--slate-500);
  font-size: 1.25rem;
  pointer-events: none;
}

.modern-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.75rem; 
  border: 1px solid var(--slate-300);
  border-radius: var(--radius-lg);
  font-size: 1rem;
  transition: all 0.2s;
  background: white;
}

.modern-input:focus {
  outline: none;
  border-color: var(--blue-600);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.loading-spinner {
  position: absolute;
  right: 12px;
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid var(--blue-600);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid var(--slate-200);
  border-radius: 0 0 8px 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  z-index: 50;
  margin-top: 4px;
  max-height: 250px;
  overflow-y: auto;
}

.suggestion-item {
  padding: 8px 12px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  border-bottom: 1px solid #f1f5f9;
}
.suggestion-item:last-child { border-bottom: none; }
.suggestion-item:hover { background: #f8fafc; }

.item-icon {
  font-size: 1.1rem;
  color: var(--slate-400);
  margin-top: 2px;
}

.item-text {
  flex: 1;
}

.main-text {
  font-weight: 500;
  color: var(--slate-900);
  font-size: 0.95rem;
}

.secondary-text {
  font-size: 0.8rem;
  color: var(--slate-500);
}

.error-text {
  color: #dc2626;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}
</style>
