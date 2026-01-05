<template>
  <div class="client-dashboard">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <!-- Actions Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Create Job Card -->
          <div class="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl shadow-blue-900/10 flex flex-col justify-between relative overflow-hidden group">
              <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span class="material-symbols-rounded text-9xl">add_circle</span>
              </div>
              <div>
                  <h2 class="text-xl font-bold mb-2">New Service Request</h2>
                  <p class="text-blue-100 text-sm mb-6">Dispatch a Pro for repair or maintenance.</p>
              </div>
              <button @click="bookNew" class="bg-white text-blue-700 py-3 px-4 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 shadow-sm">
                  <span class="material-symbols-rounded">bolt</span>
                  Dispatch Now
              </button>
          </div>

          <!-- Payment Methods Card -->
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
              <div>
                  <div class="flex items-center justify-between mb-4">
                      <div class="flex items-center gap-3">
                         <div class="bg-emerald-100 text-emerald-700 p-2 rounded-lg">
                           <span class="material-symbols-rounded">credit_card</span>
                         </div>
                         <h3 class="font-bold text-slate-900">Payment Methods</h3>
                      </div>
                      <span class="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">Secure</span>
                  </div>
                  
                  <div class="space-y-3">
                      <div v-if="savedCards.length === 0" class="text-sm text-slate-500 italic">
                          No cards saved. Add one for faster checkout.
                      </div>
                      <div v-else class="space-y-2">
                          <div v-for="card in savedCards" :key="card.id" class="flex items-center justify-between text-sm p-2 bg-slate-50 rounded-lg border border-slate-100">
                              <div class="flex items-center gap-2">
                                  <span class="font-mono text-slate-700">•••• {{ card.last4 }}</span>
                                  <span class="text-xs text-slate-400">{{ card.exp }}</span>
                              </div>
                              <span class="material-symbols-rounded text-slate-400 text-sm">lock</span>
                          </div>
                      </div>
                  </div>
              </div>
              <button class="mt-6 w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2" @click="addPaymentMethod">
                  <span class="material-symbols-rounded text-lg">add</span>
                  Add Card
              </button>
          </div>

          <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
               <div>
                  <div class="flex items-center gap-3 mb-4">
                      <div class="bg-amber-100 text-amber-700 p-2 rounded-lg">
                        <span class="material-symbols-rounded">support_agent</span>
                      </div>
                      <h3 class="font-bold text-slate-900">Support</h3>
                  </div>
                  <p class="text-sm text-slate-600">Need help? Text or call our dispatch team directly.</p>
               </div>
               <a href="tel:+17742925110" class="mt-6 w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                   <span class="material-symbols-rounded text-lg">call</span>
                   (774) 292-5110
               </a>
          </div>
      </div>

      <!-- Job List -->
      <section>
          <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-bold text-slate-900">Recent Activity</h2>
              <button @click="loadJobs" :disabled="isLoading" class="text-sm text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1">
                  <span class="material-symbols-rounded text-base" :class="{'animate-spin': isLoading}">refresh</span>
                  Refresh
              </button>
          </div>

          <JobList
            :jobs="clientJobs"
            role="client"
            :loading="isLoading"
            @action="handleAction"
          />
      </section>

      <!-- Intake Modal -->
      <transition name="fade">
        <div v-if="showIntakeModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="showIntakeModal = false"></div>
          <div class="relative bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl scrollbar-hide">
            <button 
              @click="showIntakeModal = false" 
              class="absolute top-4 right-4 z-20 p-2 bg-white/80 rounded-full hover:bg-slate-100 text-slate-500 transition-colors shadow-sm border border-slate-100"
            >
              <span class="material-symbols-rounded">close</span>
            </button>
            <div class="p-1">
               <QuickIntakeView 
                 :initial-phone="clientPhone" 
                 :embedded="true"
                 @completed="handleIntakeComplete"
               />
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import JobList from '@/components/jobs/JobList.vue'
import BaseEmptyState from '@/components/ui/BaseEmptyState.vue'
import QuickIntakeView from '@/views/QuickIntakeView.vue'
import { useAuthStore } from '@/stores/authStore'
import { useJobStore } from '@/stores/jobStore'

export default {
  name: 'ClientPortal',
  components: {
    JobList,
    BaseEmptyState,
    QuickIntakeView
  },
  data() {
    return {
      savedCards: [],
      showIntakeModal: false
    }
  },
  computed: {
    authStore() {
      return useAuthStore()
    },
    jobStore() {
      return useJobStore()
    },
    clientPhone() {
      return this.authStore.userPhone
    },
    clientJobs() {
      return this.jobStore.clientJobs
    },
    isLoading() {
      return this.jobStore.isLoading
    }
  },
  created() {
    if (!this.clientPhone) {
      this.authStore.logout()
      this.$router.push('/client/login')
      return
    }
    this.loadJobs()
  },
  methods: {
    async loadJobs() {
      if (!this.clientPhone) return
      await this.jobStore.loadClientJobs(this.clientPhone)
    },
    logout() {
      this.authStore.logout()
      this.$router.push('/')
    },
    bookNew() {
      this.showIntakeModal = true
    },
    handleIntakeComplete() {
      // Refresh jobs and verify logic?
      this.loadJobs()
      // Optional: close modal after delay or keep open on success step?
      // User can close manually.
    },
    addPaymentMethod() {
       alert("Secure card addition flow coming shortly.")
    },
    handleAction({ job, action }) {
      if (action === 'call_support') {
        window.location.href = 'tel:+17742925110'
      }
      // Other actions handled by JobList or routing
    }
  }
}
</script>

<style scoped>
/* Tailwind handles styling */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
