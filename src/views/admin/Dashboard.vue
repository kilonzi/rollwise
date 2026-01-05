<template>
  <div class="admin-shell">
    <header class="command-header">
      <div>
        <p class="eyebrow">Mission Control</p>
        <h1>Operations Dashboard</h1>
        <p class="subtitle">Coordinate jobs, Pros, and payouts in real time.</p>
      </div>
      <div class="header-actions">
        <button type="button" class="pill" @click="refreshAll">
          <span class="material-symbols-rounded">refresh</span>
          Sync Data
        </button>
        <button type="button" class="pill ghost" @click="showNotifications = !showNotifications">
          <span class="material-symbols-rounded">notifications</span>
          <span v-if="unreadCount > 0" class="badge-dot"></span>
        </button>
        <button type="button" class="pill danger" @click="logout">
          Sign Out
        </button>
      </div>
    </header>

    <nav class="tab-nav" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        role="tab"
        :class="['tab', { active: activeTab === tab.key }]"
        @click="activeTab = tab.key"
      >
        <span class="material-symbols-rounded">{{ tab.icon }}</span>
        {{ tab.label }}
        <small>{{ tab.meta }}</small>
      </button>
    </nav>

    <section v-if="activeTab === 'jobs'" class="panel">
      <div class="panel-header">
        <div>
          <h2>Jobs</h2>
          <p>Order book grouped by age with status and triage filters.</p>
        </div>
        <div class="filter-row">
          <select v-model="jobStatus" class="filter-select">
            <option value="all">All Statuses</option>
            <option v-for="status in jobStatuses" :key="status" :value="status">{{ status }}</option>
          </select>
          <label class="switch">
            <input type="checkbox" v-model="showTriageOnly" />
            <span>Triage Ready</span>
          </label>
        </div>
      </div>

      <JobList
        :jobs="jobGroups"
        role="admin"
        grouped
        :loading="jobStore.isLoading"
        :direction="jobDirection"
        @update:direction="jobDirection = $event"
        @action="handleJobAction"
      >
        <template #subtitle>
          <p class="sub">{{ filteredCount }} results · {{ jobDirection === 'asc' ? 'Oldest first' : 'Newest first' }}</p>
        </template>
        <template #empty>
          <div class="empty-state">
            <p>No jobs match this filter.</p>
          </div>
        </template>
      </JobList>
    </section>

    <section v-if="activeTab === 'pros'" class="panel">
      <div class="panel-header">
        <div>
          <h2>Pros</h2>
          <p>Review onboarding, compliance, and field readiness.</p>
        </div>
        <div class="filter-row">
          <select v-model="techFilter" class="filter-select">
            <option value="all">All</option>
            <option value="pending">Pending Review</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      <div class="card-grid">
        <article v-for="tech in filteredTechs" :key="tech.id" class="tech-card">
          <header>
            <h3>{{ tech.name }}</h3>
            <span class="badge" :class="tech.status">{{ tech.statusLabel }}</span>
          </header>
          <p>{{ tech.region }}</p>
          <ul>
            <li><strong>Jobs completed:</strong> {{ tech.metrics.jobs }}</li>
            <li><strong>Acceptance:</strong> {{ tech.metrics.acceptance }}%</li>
            <li><strong>Onboarding:</strong> {{ tech.checklist }}/5 docs</li>
          </ul>
          <div class="tech-actions">
            <button class="pill" @click="approveTech(tech)" v-if="tech.status === 'pending'">Approve</button>
            <button class="pill" @click="remindTech(tech)" v-else>Send Nudge</button>
            <button class="pill ghost" @click="openDocs(tech)">Docs</button>
          </div>
        </article>
      </div>
    </section>

    <section v-else class="panel">
      <div class="panel-header">
        <div>
          <h2>Payments</h2>
          <p>Review invoices, payouts, and outstanding balances.</p>
        </div>
        <div class="filter-row">
          <select v-model="paymentFilter" class="filter-select">
            <option value="all">All</option>
            <option value="awaiting">Awaiting Approval</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div class="card-grid payments">
        <article v-for="payment in filteredPayments" :key="payment.id" class="payment-card">
          <header>
            <div>
              <p>#{{ payment.jobId }}</p>
              <h3>${{ payment.amount }}</h3>
            </div>
            <span class="badge" :class="payment.status">{{ payment.statusLabel }}</span>
          </header>
          <p class="meta">{{ payment.recipient }}</p>
          <p class="meta">{{ payment.due }}</p>
          <div class="note" v-if="payment.note">{{ payment.note }}</div>
          <div class="payment-actions">
            <button class="pill" @click="approvePayment(payment)" v-if="payment.status === 'awaiting'">Approve</button>
            <button class="pill" @click="markPaid(payment)" v-else-if="payment.status === 'scheduled'">Mark as Paid</button>
            <button class="pill ghost" @click="openPayment(payment)">Details</button>
          </div>
        </article>
      </div>
    </section>
    <aside v-if="showNotifications" class="notification-panel">
      <div class="panel-backdrop" @click="showNotifications = false"></div>
      <div class="panel-content">
        <NotificationCenter @view-job="handleViewJob" @count-update="unreadCount = $event" />
      </div>
    </aside>
  </div>
</template>

<script>
import { computed, defineComponent, ref } from 'vue'
import JobList from '@/components/jobs/JobList.vue'
import NotificationCenter from '@/components/admin/NotificationCenter.vue'
import { useAuthStore } from '@/stores/authStore'
import { useJobStore } from '@/stores/jobStore'

const STATUS_MAP = ['new', 'triage', 'assigned', 'en_route', 'in_progress', 'completed', 'cancelled', 'paid']

export default defineComponent({
  name: 'AdminDashboard',
  components: { JobList, NotificationCenter },
  setup() {
    const authStore = useAuthStore()
    const jobStore = useJobStore()
    jobStore.init()

    const tabs = [
      { key: 'jobs', label: 'Jobs', icon: 'assignment', meta: 'Realtime queue' },
      { key: 'pros', label: 'Pros', icon: 'engineering', meta: 'Onboarding & field' },
      { key: 'payments', label: 'Payments', icon: 'request_quote', meta: 'Payouts & invoices' }
    ]

    const activeTab = ref('jobs')
    const jobDirection = ref('asc')
    const jobStatus = ref('all')
    const showTriageOnly = ref(false)
    const showNotifications = ref(false)
    const unreadCount = ref(0) // Updated by child

    const jobStatuses = STATUS_MAP.map(status => status.replace(/_/g, ' '))

    const jobGroups = computed(() => {
      const grouped = jobStore.groupedJobs(jobDirection.value)
      const annotate = (jobs, groupKey) => jobs
        .filter((job) => {
          if (jobStatus.value !== 'all' && (job.status || 'new') !== jobStatus.value) return false
          if (showTriageOnly.value && !job.triageReady) return false
          return true
        })
        .map(job => ({ ...job, __group: groupKey }))
      return [
        { key: 'today', label: 'Today', jobs: annotate(grouped.today, 'today') },
        { key: 'last7', label: 'Last 7 Days', jobs: annotate(grouped.last7, 'last7') },
        { key: 'older', label: 'Earlier', jobs: annotate(grouped.older, 'older') }
      ]
    })

    const filteredCount = computed(() => jobGroups.value.reduce((sum, group) => sum + group.jobs.length, 0))

    const technicians = ref([
      { id: 't1', name: 'Alex Rivera', status: 'pending', statusLabel: 'Pending Review', region: 'Boston, MA', metrics: { jobs: 0, acceptance: 0 }, checklist: 3 },
      { id: 't2', name: 'Priya Patel', status: 'active', statusLabel: 'Active', region: 'Austin, TX', metrics: { jobs: 24, acceptance: 92 }, checklist: 5 },
      { id: 't3', name: 'Chris Lee', status: 'suspended', statusLabel: 'Suspended', region: 'Atlanta, GA', metrics: { jobs: 14, acceptance: 70 }, checklist: 5 }
    ])
    const techFilter = ref('all')
    const filteredTechs = computed(() => {
      if (techFilter.value === 'all') return technicians.value
      return technicians.value.filter(tech => tech.status === techFilter.value)
    })

    const payments = ref([
      { id: 'p1', jobId: 'RW-1223', amount: 850, status: 'awaiting', statusLabel: 'Awaiting Admin', recipient: 'Mike Johnson', due: 'Due today', note: 'Client card on file', role: 'client' },
      { id: 'p2', jobId: 'RW-1201', amount: 640, status: 'scheduled', statusLabel: 'Scheduled', recipient: 'Alex Rivera', due: 'Fri, 2:00 PM', note: 'ACH transfer', role: 'tech' },
      { id: 'p3', jobId: 'RW-1189', amount: 420, status: 'completed', statusLabel: 'Paid', recipient: 'Priya Patel', due: 'Paid yesterday', note: null, role: 'tech' }
    ])
    const paymentFilter = ref('all')
    const filteredPayments = computed(() => {
      if (paymentFilter.value === 'all') return payments.value
      return payments.value.filter(payment => payment.status === paymentFilter.value)
    })

    const handleJobAction = ({ job, action }) => {
      if (action === 'assign') assignJob(job)
      if (action === 'triage') jobStore.toggleTriage(job.id, !job.triageReady)
      if (action === 'notes') editNotes(job)
    }

    const assignJob = (job) => {
      const proId = prompt('Assign Pro ID to job ' + job.id)
      if (proId) jobStore.assignTechnicians(job.id, [proId])
    }

    const editNotes = (job) => {
      const notes = prompt('Update notes for ' + job.id, job.notes || '')
      if (notes !== null) jobStore.updateJobNotes(job.id, notes)
    }

    const approveTech = (tech) => alert(`Approved ${tech.name}`)
    const remindTech = (tech) => alert(`Reminder sent to ${tech.name}`)
    const openDocs = (tech) => alert(`Opening docs for ${tech.name}`)

    const approvePayment = (payment) => alert(`Approved payment ${payment.id}`)
    const markPaid = (payment) => alert(`Marked ${payment.id} as paid`)
    const openPayment = (payment) => alert(`Viewing payment ${payment.id}`)

    const refreshAll = () => jobStore.init()
    const logout = () => {
      authStore.logout()
      window.location.href = '/'
    }

    const handleViewJob = (jobId) => {
      activeTab.value = 'jobs'
      // You might want to filter or scroll to the job here
      console.log('Viewing job from notification:', jobId)
      // Ideally, set a filter for this job ID or highlight it
    }

    return {
      authStore,
      jobStore,
      tabs,
      activeTab,
      jobStatuses,
      jobStatus,
      jobDirection,
      showTriageOnly,
      showNotifications,
      unreadCount,
      jobGroups,
      filteredCount,
      handleJobAction,
      techFilter,
      filteredTechs,
      payments,
      filteredPayments,
      paymentFilter,
      approveTech,
      remindTech,
      openDocs,
      approvePayment,
      markPaid,
      openPayment,
      refreshAll,
      logout,
      handleViewJob
    }
  }
})
</script>

<style scoped>
.admin-shell {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 20px 80px;
  font-family: 'Inter', sans-serif;
  position: relative; /* Context for absolute panel */
}

/* ... existing styles ... */

.notification-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}

.panel-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(2px);
}

.panel-content {
  width: 400px;
  max-width: 90vw;
  background: white;
  height: 100%;
  position: relative;
  z-index: 2;
  box-shadow: -10px 0 30px rgba(0,0,0,0.1);
}

.command-header {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  align-items: center;
  margin-bottom: 24px;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.25em;
  font-size: 0.75rem;
  color: #94a3b8;
  margin: 0;
}

.command-header h1 {
  margin: 6px 0;
  font-size: 2rem;
}

.subtitle {
  margin: 0;
  color: #475569;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.pill {
  border: none;
  border-radius: 999px;
  padding: 0.65rem 1.2rem;
  font-weight: 600;
  background: #0f172a;
  color: white;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
}

.pill.danger {
  background: #b91c1c;
}

.pill.ghost {
  background: #fff;
  color: #0f172a;
  border: 1px solid #e2e8f0;
}

.tab-nav {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
  margin-bottom: 24px;
}

.tab {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1rem;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.tab.active {
  border-color: #2563eb;
  box-shadow: 0 10px 30px rgba(37, 99, 235, 0.15);
}

.tab small {
  color: #94a3b8;
}

.panel {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 24px;
}

.filter-row {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.filter-select {
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  padding: 0.35rem 0.85rem;
  background: #f8fafc;
}

.switch {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-weight: 600;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
}

.tech-card,
.payment-card {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.25rem;
  background: #fff;
}

.tech-card header,
.payment-card header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.badge {
  border-radius: 999px;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  text-transform: uppercase;
}

.badge.pending {
  background: #fff7ed;
  color: #c2410c;
}

.badge.active {
  background: #dcfce7;
  color: #15803d;
}

.badge.suspended {
  background: #fee2e2;
  color: #b91c1c;
}

.tech-card ul {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0;
  color: #475569;
}

.tech-card li {
  margin-bottom: 0.3rem;
}

.tech-actions,
.payment-actions {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.meta {
  margin: 0;
  color: #475569;
}

.note {
  margin: 0.5rem 0;
  background: #f1f5f9;
  padding: 0.75rem;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .command-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .panel-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

.badge-dot {
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
  position: absolute;
  top: 10px;
  right: 12px;
  border: 1px solid white;
}
</style>
