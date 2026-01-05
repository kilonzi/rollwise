<template>
  <article class="job-card" :class="{ expanded: isExpanded }">
    <header class="job-card__header" @click="toggle">
      <div class="header-main">
        <div class="job-type-ribbon" :class="jobTypeClass">
          {{ jobTypeLabel }}
        </div>
        <div class="mt-4">
          <p class="job-card__id">#{{ job.id }}</p>
          <h3 class="job-card__title">{{ job.title || 'Job Request' }}</h3>
          <p v-if="job.doorType" class="job-card__subtitle">{{ job.doorType }}</p>
        </div>
      </div>
      <div class="status-cluster">
        <span class="badge" :class="statusClass">
          {{ statusLabel }}
        </span>
        <button class="toggle-btn" type="button" aria-label="Toggle details">
          <span class="material-symbols-rounded">
            {{ isExpanded ? 'expand_less' : 'expand_more' }}
          </span>
        </button>
      </div>
    </header>

    <transition name="fade-expand">
      <section v-if="isExpanded" class="job-card__body">
        <!-- Progress Bar -->
        <div class="progress-container">
           <div class="progress-bar">
             <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
           </div>
           <div class="progress-labels">
             <span :class="{ active: progressStep >= 1 }">Request</span>
             <span :class="{ active: progressStep >= 2 }">Assigned</span>
             <span :class="{ active: progressStep >= 3 }">En Route</span>
             <span :class="{ active: progressStep >= 4 }">Working</span>
             <span :class="{ active: progressStep >= 5 }">Done</span>
           </div>
        </div>

        <div class="job-details">
          <DetailRow icon="location_on" label="Service Location" :value="formattedAddress" />
          
          <!-- Technician / ETA -->
          <DetailRow 
             v-if="job.technicianName" 
             icon="engineering" 
             label="Pro Partner" 
             :value="job.technicianName" 
          >
             <template #extra>
                <div v-if="job.status === 'en_route'" class="eta-tag">
                   <span class="material-symbols-rounded text-sm">timelapse</span>
                   {{ job.technicianEta || 'Arriving Soon' }}
                </div>
             </template>
          </DetailRow>

          <!-- Price / Payment -->
          <DetailRow 
             icon="payments" 
             label="Estimated Total" 
             :value="formattedPrice" 
          >
             <template #extra>
               <span class="payment-status" :class="paymentStatusClass">
                 {{ paymentStatusLabel }}
               </span>
             </template>
          </DetailRow>
          
          <DetailRow icon="calendar_month" label="Created" :value="formattedDate" />
          <DetailRow icon="description" label="Issue" :value="job.description" multiline />
        </div>

        <div v-if="job.media?.length" class="media-preview">
          <h4>Attachments</h4>
          <ul>
            <li v-for="file in job.media" :key="file.name">
              <span class="material-symbols-rounded" aria-hidden="true">
                {{ file.type?.startsWith('video') ? 'videocam' : 'image' }}
              </span>
              {{ file.name }}
            </li>
          </ul>
        </div>

        <div class="action-panel">
          <p class="panel-label">Actions</p>
          <div class="action-grid">
            <button
              v-for="action in availableActions"
              :key="action.key"
              type="button"
              class="action-chip"
              :class="action.intent"
              @click.stop="$emit('action', { job, action: action.key })"
            >
              <span class="material-symbols-rounded">{{ action.icon }}</span>
              <div>
                <strong>{{ action.label }}</strong>
              </div>
            </button>
          </div>
        </div>
      </section>
    </transition>
  </article>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  job: {
    type: Object,
    required: true
  },
  role: {
    type: String,
    default: 'client'
  }
})

const emits = defineEmits(['action'])

const isExpanded = ref(false)
const toggle = () => {
  isExpanded.value = !isExpanded.value
}

const statusLabel = computed(() => props.job.status || 'New')
const statusClass = computed(() => statusLabel.value.toLowerCase().replace(/\s+/g, '-'))

const isTriage = computed(() => props.job.triageReady || props.job.type === 'triage')
const jobTypeLabel = computed(() => isTriage.value ? 'Triage' : 'Fix')
const jobTypeClass = computed(() => isTriage.value ? 'triage' : 'fix')

const formattedDate = computed(() => {
  if (!props.job.createdAt && !props.job.date) return 'Just now'
  const timestamp = props.job.createdAt || props.job.date
  const date = typeof timestamp === 'number' ? new Date(timestamp) : new Date(timestamp)
  return date.toLocaleString()
})

const formattedAddress = computed(() => {
  if (props.job.addressText) return props.job.addressText
  if (typeof props.job.address === 'string') return props.job.address
  if (props.job.address && typeof props.job.address === 'object') {
    const { street, city, state, zip } = props.job.address
    const region = [state, zip].filter(Boolean).join(' ')
    return [street, city, region].filter(Boolean).join(', ')
  }
  return '—'
})

const formattedPrice = computed(() => {
  const price = props.job.estimatedPrice || props.job.finalPrice
  return price ? `$${price.toFixed(2)}` : 'Pending Quote'
})

const paymentStatusLabel = computed(() => {
   if (props.job.status === 'paid') return 'Paid'
   if (props.job.status === 'completed') return 'Payment Due'
   return 'Unpaid'
})

const paymentStatusClass = computed(() => {
   if (props.job.status === 'paid') return 'status-paid'
   if (props.job.status === 'completed') return 'status-due'
   return 'status-pending'
})

const progressStep = computed(() => {
  const s = (props.job.status || '').toLowerCase()
  if (['new', 'triage'].includes(s)) return 1
  if (['assigned'].includes(s)) return 2
  if (['en_route'].includes(s)) return 3
  if (['in_progress'].includes(s)) return 4
  if (['completed', 'paid'].includes(s)) return 5
  return 1
})

const progressPercent = computed(() => {
  return (progressStep.value / 5) * 100
})

const availableActions = computed(() => {
  const actions = []
  const status = (props.job.status || 'new').toLowerCase()
  const push = (key, label, icon, intent = 'neutral') => {
    actions.push({ key, label, icon, intent })
  }

  if (props.role === 'client') {
    if (status === 'new' || status === 'triage') {
      push('edit', 'Edit Request', 'edit_note')
      push('cancel', 'Cancel Job', 'close', 'warning')
    }
    if (['assigned', 'en_route', 'in_progress'].includes(status)) {
      push('call_support', 'Call Support', 'support_agent')
    }
    if (status === 'completed') {
      push('pay', 'Pay Invoice', 'credit_card', 'primary')
      push('review', 'Rate Pro', 'reviews')
    }
    if (status === 'paid') {
      push('receipt', 'View Receipt', 'receipt_long')
      push('reopen', 'Start Follow-up', 'refresh')
    }
  }

  // Additional roles can have their own actions later
  return actions
})
</script>

<script>
export default {
  components: {
    DetailRow: {
      props: {
        icon: String,
        label: String,
        value: [String, Number],
        multiline: Boolean
      },
      template: `
        <div class="detail-row" v-if="value">
          <span class="material-symbols-rounded icon-box" aria-hidden="true">{{ icon }}</span>
          <div class="detail-content">
            <p class="label">{{ label }}</p>
            <div class="value-line">
              <p :class="['value', { multiline }]">{{ value }}</p>
              <slot name="extra"></slot>
            </div>
          </div>
        </div>
      `
    }
  }
}
</script>

<style scoped>
/* Progress Bar */
.progress-container {
  margin-bottom: 24px;
}
.progress-bar {
  height: 8px;
  background: var(--bg-muted);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}
.progress-fill {
  background: var(--blue-600);
  height: 100%;
  transition: width 0.5s ease;
}
.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
}
.progress-labels span.active {
  color: var(--blue-600);
}

/* Detail Row Extras */
.icon-box {
  color: var(--text-muted);
  font-size: 1.25rem;
}
.detail-content {
  flex: 1;
}
.value-line {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.eta-tag {
  background: #fef3c7;
  color: #b45309;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.payment-status {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: uppercase;
}
.status-paid { background: #dcfce7; color: #166534; }
.status-due { background: #fee2e2; color: #991b1b; }
.status-pending { background: var(--bg-muted); color: var(--text-muted); }

.job-card {
  border-radius: 16px;
  padding: 24px;
  background: var(--bg-surface);
  box-shadow: var(--card-shadow);
  border: 1px solid var(--border-primary);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  position: relative;
  overflow: hidden;
}

.job-type-ribbon {
  position: absolute;
  top: 0;
  left: 0;
  padding: 4px 12px;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom-right-radius: 12px;
}

.job-type-ribbon.fix {
  background: var(--blue-600);
  color: white;
}

.job-type-ribbon.triage {
  background: #EAB308; /* Gold */
  color: #000;
}

.job-card.expanded {
  transform: translateY(-2px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
}

.job-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  cursor: pointer;
}

.job-card__id {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.85rem;
  font-weight: 600;
}

.job-card__title {
  margin: 4px 0 0;
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-primary);
}

.job-card__subtitle {
  margin: 4px 0 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.status-cluster {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggle-btn {
  border: none;
  background: var(--bg-muted);
  border-radius: 999px;
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-primary);
}

.badge {
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 600;
  background: #e2e8f0;
  color: #0f172a;
}

.badge.completed {
  background: #d1fae5;
  color: #065f46;
}

.badge.in-progress {
  background: #dbeafe;
  color: #1d4ed8;
}

.job-card__body {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.job-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.detail-row {
  display: flex;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  background: var(--bg-muted);
}

.detail-row .label {
  margin: 0;
  font-size: 0.8rem;
  text-transform: uppercase;
  color: var(--text-muted);
  letter-spacing: 0.08em;
}

.detail-row .value {
  margin: 4px 0 0;
  color: var(--text-primary);
  font-weight: 600;
}

.detail-row .value.multiline {
  white-space: pre-line;
}

.media-preview ul {
  list-style: none;
  padding: 0;
  margin: 12px 0 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.media-preview li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--bg-muted);
  border-radius: 8px;
  color: var(--text-primary);
}

.action-panel {
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  padding: 16px;
  background: var(--bg-muted);
}

.panel-label {
  margin: 0 0 12px 0;
  font-size: 0.8rem;
  text-transform: uppercase;
  color: #f97316;
  letter-spacing: 0.08em;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.action-chip {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border-radius: 12px;
  border: none;
  text-align: left;
  cursor: pointer;
  background: var(--bg-secondary);
  box-shadow: inset 0 0 0 1px var(--border-primary);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  color: var(--text-primary);
}

.action-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08);
}

.action-chip.primary {
  background: #111827;
  color: white;
}

.action-chip.warning {
  background: #fff7ed;
  color: #c2410c;
}

.fade-expand-enter-active,
.fade-expand-leave-active {
  transition: all 0.2s ease;
}

.fade-expand-enter-from,
.fade-expand-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
