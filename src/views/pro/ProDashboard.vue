<template>
  <div class="pro-dashboard-modern">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <!-- Top Action Bar (Pro Specifics) -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
            <span class="material-symbols-rounded text-2xl">engineering</span>
          </div>
          <div>
            <h1 class="text-xl font-bold text-slate-900 dark:text-white">{{ proName }}</h1>
            <div class="flex items-center gap-2 mt-0.5">
              <span class="w-2 h-2 rounded-full" :class="isOnline ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'"></span>
              <span class="text-sm font-medium" :class="isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'">
                {{ isOnline ? 'Online & Accepting Jobs' : 'Offline' }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <button @click="showIdModal = true" class="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold transition-colors">
            <span class="material-symbols-rounded text-lg">badge</span>
            Digital ID
          </button>
          <button 
            @click="toggleAvailability" 
            class="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all border-2"
            :class="isOnline ? 'border-emerald-500/20 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/20 text-slate-500'"
          >
            <span class="material-symbols-rounded text-lg">{{ isOnline ? 'cloud_done' : 'cloud_off' }}</span>
            {{ isOnline ? 'Go Offline' : 'Go Online' }}
          </button>
        </div>
      </div>

      <!-- Onboarding / Pending Banners -->
      <div v-if="authStore.activeStatus === 'onboarding'" class="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl shadow-blue-900/10 flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden relative">
        <div class="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <span class="material-symbols-rounded text-9xl">verified_user</span>
        </div>
        <div class="relative z-10">
          <h3 class="text-xl font-bold mb-2">Complete Your Profile</h3>
          <p class="text-blue-100 text-sm opacity-90">Finish your setup to start receiving service requests and earning.</p>
        </div>
        <router-link to="/pro/onboarding" class="relative z-10 white-btn flex items-center gap-2 bg-white text-blue-700 py-3 px-6 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors shadow-sm">
          Resume Setup
          <span class="material-symbols-rounded">arrow_forward</span>
        </router-link>
      </div>

      <div v-if="authStore.isPendingPro" class="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-6 flex items-start gap-4">
        <div class="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg text-amber-700 dark:text-amber-400">
          <span class="material-symbols-rounded">hourglass_top</span>
        </div>
        <div>
           <h3 class="font-bold text-amber-900 dark:text-amber-400 mb-1">Approval Pending</h3>
           <p class="text-sm text-amber-800/80 dark:text-amber-400/60 leading-relaxed">Your application is being reviewed. You can explore the dashboard, but you'll be able to accept jobs once verified.</p>
        </div>
      </div>

      <button 
        @click="isStatsExpanded = !isStatsExpanded"
        class="w-full flex items-center justify-between p-4 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors mb-2 group"
      >
        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-blue-600 transition-colors">Overview</span>
        <span class="material-symbols-rounded text-slate-400 transform transition-transform duration-300" :class="{ 'rotate-180': isStatsExpanded }">keyboard_arrow_down</span>
      </button>

      <!-- Quick Stats & Actions Grid -->
      <!-- Top Stats Grid: Hidden on mobile, visible on medium screens and up -->
      <div v-show="isStatsExpanded" class="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 animate-in slide-in-from-top-2 duration-300">
        <!-- Earnings Card -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-3 mb-4">
              <div class="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 p-2 rounded-lg">
                <span class="material-symbols-rounded">payments</span>
              </div>
              <h3 class="font-bold text-slate-700 dark:text-slate-300 text-sm">Earnings (30d)</h3>
            </div>
            <h2 class="text-3xl font-black text-slate-900 dark:text-white">$0.00</h2>
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Next Payout: Thursday</p>
          </div>
          <button class="mt-6 w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
            View History
          </button>
        </div>

        <!-- Payout Card -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
           <div>
            <div class="flex items-center gap-3 mb-4">
               <div class="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-lg">
                 <span class="material-symbols-rounded">account_balance</span>
               </div>
               <h3 class="font-bold text-slate-700 dark:text-slate-300 text-sm">Payout Account</h3>
            </div>
            <div v-if="authStore.bankDetails">
               <h3 class="font-bold text-slate-900 dark:text-white truncate">{{ maskedBankInfo }}</h3>
               <p class="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Account connected & active</p>
            </div>
            <div v-else>
               <p class="text-sm text-slate-600 dark:text-slate-400">Connect your bank account to receive automatic payouts.</p>
            </div>
          </div>
          <button @click="openBankModal" class="mt-6 w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center justify-center gap-2">
              <span class="material-symbols-rounded text-lg">edit_square</span>
              {{ authStore.bankDetails ? 'Update Payouts' : 'Setup Payouts' }}
          </button>
       </div>

        <!-- Preferences Card -->
        <div class="bg-slate-900 dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-800 dark:border-slate-700 flex flex-col justify-between text-white">
           <div>
              <div class="flex items-center gap-3 mb-4">
                  <div class="bg-blue-500/20 text-blue-400 p-2 rounded-lg">
                    <span class="material-symbols-rounded">settings</span>
                  </div>
                  <h3 class="font-bold">Preferences</h3>
              </div>
              
              <!-- Dark Mode Toggle Removed (Redundant with Header) -->
              
              <!-- Edit Profile Link -->
              <router-link :to="{ path: '/pro/onboarding', query: { mode: 'edit' } }" class="flex items-center justify-between py-2 text-slate-300 hover:text-white transition-colors group">
                 <span class="text-sm">Edit Profile & Rates</span>
                 <span class="material-symbols-rounded text-slate-500 group-hover:text-white text-lg">arrow_forward</span>
              </router-link>
           </div>
           
           <button @click="activeTab = 'messages'" class="mt-4 w-full py-2.5 rounded-xl bg-slate-800 dark:bg-slate-700 text-white font-semibold text-sm hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
               <span class="material-symbols-rounded text-lg">forum</span>
               Message Dispatch
           </button>
        </div>
      </div>

      <!-- Content Tabs -->
      <div class="flex items-center gap-2 mb-6 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl w-fit overflow-x-auto no-scrollbar max-w-full">
        <button 
          @click="activeTab = 'jobs'" 
          class="whitespace-nowrap flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all"
          :class="activeTab === 'jobs' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'"
        >
          <span class="material-symbols-rounded text-lg">list_alt</span>
          Board
        </button>
        <button 
          @click="activeTab = 'wallet'" 
          class="whitespace-nowrap flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all"
          :class="activeTab === 'wallet' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'"
        >
          <span class="material-symbols-rounded text-lg">account_balance_wallet</span>
          Payments
        </button>
        <button 
          @click="activeTab = 'messages'" 
          class="whitespace-nowrap flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all"
          :class="activeTab === 'messages' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'"
        >
          <span class="material-symbols-rounded text-lg">forum</span>
          Messages
        </button>
      </div>

      <!-- Main Content Area -->
      <div class="fade-in">
        <!-- Job Board -->
        <section v-if="activeTab === 'jobs'" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm flex flex-col min-h-[600px]">
          <!-- Header -->
          <div 
             class="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <span class="material-symbols-rounded">list_alt</span>
              </div>
              <div>
                <h3 class="font-bold text-slate-900 dark:text-white">Active Job Board</h3>
                <p class="text-xs text-slate-500 font-medium">Available and upcoming requests</p>
              </div>
            </div>

            <div class="flex items-center gap-4">
                <div v-if="isOnline" class="flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                   <span class="relative flex h-2 w-2">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span class="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest hidden sm:inline-block">Live</span>
                </div>
                <div v-else class="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-600">
                  <span class="material-symbols-rounded text-base text-slate-400">visibility_off</span>
                  <span class="text-xs font-bold text-slate-500 uppercase tracking-widest hidden sm:inline-block">Offline</span>
                </div>
            </div>
          </div>

          <!-- Content -->
          <div class="p-6 flex-1 flex flex-col">
            <div v-if="!isOnline" class="flex-1 flex flex-col items-center justify-center text-center py-12">
              <div class="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6">
                <span class="material-symbols-rounded text-4xl text-slate-300 dark:text-slate-600">visibility_off</span>
              </div>
              <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">You're Currently Offline</h3>
              <p class="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8">Go online to see your assigned service requests and start receiving new live job notifications.</p>
              <button @click.stop="toggleAvailability" class="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                Go Online Now
              </button>
            </div>

            <div v-else-if="unifiedJobs.length === 0" class="flex-1 flex items-center justify-center">
               <BaseEmptyState 
                title="No Active Jobs" 
                description="You're all caught up! New requests will appear here automatically."
                icon="event_note"
              />
            </div>

            <div v-else class="space-y-4">
              <JobList
                :jobs="unifiedJobs"
                role="pro"
                :loading="jobStore.isLoading"
                @action="handleJobAction"
              />
            </div>
          </div>
        </section>

        <!-- Wallet View -->
        <section v-else-if="activeTab === 'wallet'">
          <ProWalletView />
        </section>

        <!-- Dispatch Chat Section -->
        <section v-if="activeTab === 'messages'" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm flex flex-col h-[600px]">
          <div 
             class="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <span class="material-symbols-rounded">support_agent</span>
              </div>
              <div>
                <h3 class="font-bold text-slate-900 dark:text-white">Dispatch Support</h3>
                <p class="text-xs text-emerald-500 font-medium flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Usually replies in minutes
                </p>
              </div>
            </div>
          </div>

          <!-- Chat History -->
          <div class="flex-1 overflow-y-auto p-4 space-y-4" ref="chatHistory">
            <div v-if="chatStore.messages.length === 0" class="flex flex-col items-center justify-center h-full text-center p-8">
              <div class="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
                <span class="material-symbols-rounded text-3xl text-slate-300">chat_bubble</span>
              </div>
              <p class="text-slate-500 text-sm max-w-xs">No messages yet. Send a message to start a conversation with Dispatch.</p>
            </div>
            
            <div v-for="msg in chatStore.messages" :key="msg.id" 
              class="flex flex-col" 
              :class="msg.sender === 'pro' ? 'items-end' : 'items-start'"
            >
              <div class="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm"
                :class="msg.sender === 'pro' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-tl-none'"
              >
                {{ msg.text }}
              </div>
              <span class="text-[10px] text-slate-400 mt-1 px-1">{{ formatChatTime(msg.createdAt) }}</span>
            </div>
          </div>

          <!-- Chat Input -->
          <div class="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <form @submit.prevent="sendChatMessage" class="flex items-center gap-2">
              <input 
                type="text" 
                v-model="newChatMessage" 
                placeholder="Type your message..." 
                class="flex-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 dark:text-white transition-all outline-none"
              />
              <button 
                type="submit" 
                :disabled="!newChatMessage.trim()"
                class="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="material-symbols-rounded">send</span>
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>

    <!-- Verify Triage Modal -->
    <div v-if="showTriageModal" class="modal-overlay" @click="closeTriageModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Verify Remote Diagnosis</h2>
          <button @click="closeTriageModal" class="close-btn">✕</button>
        </div>

        <div class="modal-body">
          <div class="diagnosis-info">
            <p class="tech-diagnosis">
              <strong>Tech {{ triageModalData.tech_name || triageModalData.triage_by_tech_id }}</strong> diagnosed this as:
            </p>
            <div class="diagnosis-box">
              <h3>{{ triageModalData.triage_diagnosis }}</h3>
              <p class="notes">{{ triageModalData.triage_notes }}</p>
              <p class="estimated-price">Estimated: ${{ triageModalData.triage_estimated_price }}</p>
            </div>
          </div>

          <p class="verification-question">Is this diagnosis accurate?</p>

          <div class="verification-actions">
            <button @click="confirmTriageDiagnosis" class="verify-btn confirm">
              <span class="material-symbols-rounded icon" aria-hidden="true">check_circle</span>
              Yes, Diagnosis Correct
              <span class="sub-text">Tech earns ${{ triageModalData.triage_bounty }}</span>
            </button>

            <button @click="showRediagnoseForm = true" class="verify-btn reject">
              <span class="material-symbols-rounded icon" aria-hidden="true">close</span>
              No, Re-Diagnose
              <span class="sub-text">Tech gets $0</span>
            </button>
          </div>

          <!-- Re-diagnose Form -->
          <div v-if="showRediagnoseForm" class="rediagnose-form">
            <h3>Correct Diagnosis</h3>
            
            <div class="form-group">
              <label>Actual Issue</label>
              <select v-model="correctDiagnosis.diagnosis" class="diagnosis-select">
                <option value="">Select diagnosis...</option>
                <option value="Broken Spring">Broken Spring</option>
                <option value="Cable Issue">Cable Issue</option>
                <option value="Opener Malfunction">Opener Malfunction</option>
                <option value="Off-Track">Off-Track</option>
                <option value="Panel Damage">Panel Damage</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div class="form-group">
              <label>Correct Notes</label>
              <textarea 
                v-model="correctDiagnosis.notes"
                placeholder="Explain what the actual issue was..."
                class="diagnosis-textarea"
                rows="3"
              ></textarea>
            </div>

            <button 
              @click="rejectTriageDiagnosis" 
              class="submit-correction-btn"
              :disabled="!correctDiagnosis.diagnosis || !correctDiagnosis.notes"
            >
              Submit Correction
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Photo Zoom Modal -->
    <div v-if="zoomedPhoto" class="modal-overlay" @click="zoomedPhoto = null">
      <div class="zoom-modal">
        <img :src="zoomedPhoto" alt="Zoomed photo" />
        <button @click="zoomedPhoto = null" class="close-zoom">✕</button>
      </div>
    </div>

    <!-- Safety Checklist Modal -->
    <SafetyChecklistModal
      v-if="showSafetyModal"
      :job-id="pendingJobStart?.id"
      @cancel="showSafetyModal = false"
      @confirm="handleSafetyConfirm"
    />

    <!-- Digital ID Modal -->
    <DigitalIdModal
      v-if="showIdModal"
      :name="proName"
      :tech-id="proId"
      :license-number="authStore.licenseNumber"
      :photo-url="proPhotoUrl"
      @close="showIdModal = false"
    />

    <!-- Bank Details Modal -->
    <div v-if="showBankModal" class="modal-overlay" @click="showBankModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ authStore.bankDetails ? 'Update Payout Account' : 'Setup Payout Account' }}</h2>
          <button @click="showBankModal = false" class="close-btn">✕</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveBankDetails" class="space-y-4">
            <div class="form-group">
              <label for="bankName" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Bank Name</label>
              <input type="text" id="bankName" v-model="bankForm.bankName" required class="w-full rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-3 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none">
            </div>
            <div class="form-group">
              <label for="accountNumber" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Account Number</label>
              <input type="text" id="accountNumber" v-model="bankForm.accountNumber" required class="w-full rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-3 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none" placeholder="Enter account number">
            </div>
            <div class="form-group">
              <label for="confirmAccountNumber" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Confirm Account Number</label>
              <input type="text" id="confirmAccountNumber" v-model="bankForm.confirmAccountNumber" required class="w-full rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-3 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none" placeholder="Re-enter account number">
            </div>
            <div class="form-group">
              <label for="routingNumber" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Routing Number</label>
              <input type="text" id="routingNumber" v-model="bankForm.routingNumber" required class="w-full rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-3 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none" placeholder="9-digit routing number">
            </div>
            <div class="form-group">
              <label for="nameOnAccount" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Name on Account</label>
              <input type="text" id="nameOnAccount" v-model="bankForm.nameOnAccount" required class="w-full rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-3 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none" placeholder="As it appears on your statement">
            </div>
            <button type="submit" 
              :disabled="isSavingBank"
              class="w-full py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span v-if="isSavingBank" class="material-symbols-rounded animate-spin">refresh</span>
              {{ isSavingBank ? 'Saving...' : 'Save Bank Details' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useJobStore } from '@/stores/jobStore'
import { useChatStore } from '@/stores/chatStore' // Import chatStore
import JobList from '@/components/jobs/JobList.vue'
import NotificationCenter from '@/components/notifications/NotificationCenter.vue'
import BaseEmptyState from '@/components/ui/BaseEmptyState.vue'
import SafetyChecklistModal from '@/components/pro/SafetyChecklistModal.vue'
import DigitalIdModal from '@/components/pro/DigitalIdModal.vue'
import ProWalletView from './Wallet.vue'

export default defineComponent({
  name: 'ProDashboard',
  components: { JobList, NotificationCenter, BaseEmptyState, SafetyChecklistModal, DigitalIdModal, ProWalletView },
  data() {
    return {
      activeTab: 'jobs', // 'jobs' or 'triage'
      showIdModal: false,
      isStatsExpanded: true,
      availabilityLoading: false, // Default to offline for safety
      showBankModal: false,
      isSavingBank: false,
      newChatMessage: '',
      bankForm: {
        bankName: '',
        accountNumber: '',
        confirmAccountNumber: '',
        routingNumber: '',
        nameOnAccount: ''
      },
      activeJob: null,
      // Realtime job feed
      availableJobs: [],
      notifications: [],
      // Triage-specific data
      currentPhotoIndex: {},
      diagnosisData: {},
      showTriageModal: false,
      triageModalData: {},
      showRediagnoseForm: false,
      correctDiagnosis: {
        diagnosis: '',
        notes: ''
      },
      zoomedPhoto: null,
      unsubscribeJobs: null,
      unsubscribeNotifications: null,
      showSafetyModal: false,
      pendingJobStart: null,
      showIdModal: false
    }
  },
  computed: {
    authStore() {
      return useAuthStore()
    },
    jobStore() {
      return useJobStore()
    },
    chatStore() { // Add chatStore to computed properties
      return useChatStore()
    },
    assignedJobs() {
      // Filter the main job feed for jobs assigned to this pro
      const allJobs = this.jobStore.jobFeed('pro')
      const myProId = this.authStore.proId 
      const myPhone = this.authStore.userPhone
      return allJobs.filter(job => 
        job.technicianId === myProId || 
        job.technicianId === myPhone || 
        job.assignedTechnicians?.includes(myProId) ||
        job.assignedTechnicians?.includes(myPhone)
      )
    },
    openTriageJobs() {
      // Filter remote triage jobs assigned to this pro
      const myProId = this.authStore.proId
      const myPhone = this.authStore.userPhone
      return (this.jobStore.openTriageJobs || []).filter(job => 
        job.technicianId === myProId || job.technicianId === myPhone
      )
    },
    maskedBankInfo() {
      const details = this.authStore.bankDetails
      if (!details) return null
      return `${details.bankName} (****${details.accountNumber.slice(-4)})`
    },
    proName() {
      return this.authStore.proName
    },
    proId() {
      return this.authStore.proId
    },
    proPhotoUrl() {
      // Use phone number as seed for consistent avatar
      const seed = this.authStore.userPhone ? this.authStore.userPhone.replace(/\D/g, '') : 'default'
      return `https://i.pravatar.cc/150?u=${seed}`
    },
    unifiedJobs() {
      // Merge on-site and triage jobs for a single view
      const fixJobs = this.assignedJobs.map(j => ({ ...j, type: 'fix' }))
      const triageJobs = this.openTriageJobs.map(j => ({ ...j, type: 'triage' }))
      return [...fixJobs, ...triageJobs].sort((a, b) => {
        // Sort by urgency or date if needed
        return (b.createdAt || 0) - (a.createdAt || 0)
      })
    }
  },
  watch: {
    jobStore: {
      handler(store) {
        if (!store) return
        this.notifications = store.notifications
      },
      deep: true,
      immediate: true
    },
    openTriageJobs: {
      handler(jobs) {
        if (!jobs || !Array.isArray(jobs)) return
        // Initialize diagnosis data for each job
        jobs.forEach(job => {
          if (!this.diagnosisData[job.id]) {
            this.diagnosisData[job.id] = {
              diagnosis: '',
              notes: '',
              estimatedPrice: null
            }
          }
          if (this.currentPhotoIndex[job.id] === undefined) {
            this.currentPhotoIndex[job.id] = 0
          }
        })
      },
      immediate: true
    },
    'chatStore.messages': {
      handler() {
        this.scrollToBottom()
      },
      deep: true
    }
  },
  mounted() {
    this.jobStore.init()
    this.chatStore.initChat()
    this.availableJobs = this.jobStore.jobFeed('pro')
    this.notifications = this.jobStore.notifications
  },
  unmounted() {
    this.jobStore.dispose()
    this.chatStore.disposeChat()
  },
  methods: {
    toggleAvailability() {
      // STRICT CHECK: Cannot go online if not approved
      if (this.authStore.activeStatus !== 'approved') {
        alert('Your profile must be approved before you can accept jobs.')
        this.isOnline = false
        return
      }
      
      this.isOnline = !this.isOnline
      if (this.isOnline) {
        alert('You are now Online. You will receive notifications for new jobs.')
      } else {
        alert('You are now Offline. You will not receive new job assignments.')
      }
      console.log('Availability changed:', this.isOnline ? 'Online' : 'Offline')
    },

    handleJobAction({ job, action }) {
      if (action === 'navigate') this.navigate(job)
      if (action === 'start') this.startJob(job)
      if (action === 'details') this.viewPhotos(job)
    },

    navigate(job) {
      const address = encodeURIComponent(job.address)
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${address}`
      window.open(mapsUrl, '_blank')
    },

    callCustomer(job) {
      window.location.href = `tel:${job.customerPhone}`
    },

    viewPhotos(job) {
      if (!job.photos || job.photos.length === 0) {
        alert('No photos available for this job.')
        return
      }
      alert(`Viewing ${job.photos.length} photo(s) for job #${job.id}`)
    },

    startJob(job) {
      this.pendingJobStart = job
      this.showSafetyModal = true
    },

    async saveBankDetails() {
      if (this.bankForm.accountNumber !== this.bankForm.confirmAccountNumber) {
        alert('Account numbers do not match')
        return
      }
      
      this.isSavingBank = true
      const success = await this.authStore.saveBankDetails({
        bankName: this.bankForm.bankName,
        accountNumber: this.bankForm.accountNumber,
        routingNumber: this.bankForm.routingNumber,
        nameOnAccount: this.bankForm.nameOnAccount
      })
      this.isSavingBank = false

      if (success) {
        alert('Bank details saved successfully!')
        this.showBankModal = false
      } else {
        alert('Failed to save bank details. Please try again.')
      }
    },

    openBankModal() {
      const details = this.authStore.bankDetails
      if (details) {
        this.bankForm = {
          bankName: details.bankName || '',
          accountNumber: details.accountNumber || '',
          confirmAccountNumber: details.accountNumber || '',
          routingNumber: details.routingNumber || '',
          nameOnAccount: details.nameOnAccount || ''
        }
      }
      this.showBankModal = true
    },

    async sendChatMessage() {
      if (!this.newChatMessage.trim()) return
      try {
        await this.chatStore.sendMessage(this.newChatMessage)
        this.newChatMessage = ''
        this.scrollToBottom()
      } catch (e) {
        alert('Failed to send message')
      }
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const history = this.$refs.chatHistory
        if (history) {
          history.scrollTop = history.scrollHeight
        }
      })
    },

    formatChatTime(ts) {
      if (!ts) return ''
      return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },

    handleSafetyConfirm() {
      this.showSafetyModal = false
      const job = this.pendingJobStart
      if (!job) return

      // Check if this job has a remote diagnosis
      if (job.triage_status === 'diagnosed' && job.triage_by_tech_id) {
        // Show verification modal
        this.triageModalData = job
        this.showTriageModal = true
      } else {
        this.jobStore.start(job.id)
        alert('Safety checks cleared. Job started!')
      }
      this.pendingJobStart = null
    },

    markComplete(job) {
      const confirmed = confirm(`Mark job #${job.id} as complete? This will trigger payment.`)
      if (confirmed) {
        console.log('Job completed:', job.id)
        alert(`Job #${job.id} marked complete! Payment of $${job.payout} will be processed.`)
        this.activeJob = null
      }
    },

    // Triage Methods
    prevPhoto(jobId) {
      const job = this.openTriageJobs.find(j => j.id === jobId)
      if (!job) return

      const currentIndex = this.currentPhotoIndex[jobId] || 0
      this.currentPhotoIndex[jobId] = currentIndex === 0 ? job.photos.length - 1 : currentIndex - 1
    },

    nextPhoto(jobId) {
      const job = this.openTriageJobs.find(j => j.id === jobId)
      if (!job) return

      const currentIndex = this.currentPhotoIndex[jobId] || 0
      this.currentPhotoIndex[jobId] = (currentIndex + 1) % job.photos.length
    },

    zoomPhoto(photoUrl) {
      this.zoomedPhoto = photoUrl
    },

    isFormValid(jobId) {
      const data = this.diagnosisData[jobId]
      return data && data.diagnosis && data.notes && data.estimatedPrice > 0
    },

    submitDiagnosis(job) {
      const data = this.diagnosisData[job.id]

      const success = this.jobStore.submitDiagnosis(job.id, this.proId, {
        diagnosis: data.diagnosis,
        notes: data.notes,
        estimatedPrice: data.estimatedPrice
      })

      if (success) {
        alert(`Diagnosis submitted! You'll earn $${job.triage_bounty} if the field tech confirms it's correct.`)

        // Reset form
        this.diagnosisData[job.id] = {
          diagnosis: '',
          notes: '',
          estimatedPrice: null
        }
      }
    },

    closeTriageModal() {
      this.showTriageModal = false
      this.showRediagnoseForm = false
      this.correctDiagnosis = { diagnosis: '', notes: '' }
    },

    confirmTriageDiagnosis() {
      const job = this.triageModalData
      this.jobStore.confirmDiagnosis(job.id, this.proId)

      alert(`Diagnosis confirmed! Tech ${job.triage_by_tech_id} will receive $${job.triage_bounty}`)
      this.closeTriageModal()
    },

    rejectTriageDiagnosis() {
      const job = this.triageModalData

      this.jobStore.rejectDiagnosis(
        job.id,
        this.proId,
        this.correctDiagnosis.diagnosis,
        this.correctDiagnosis.notes
      )

      alert(`Diagnosis corrected. Original tech gets $0. Your correction has been recorded.`)
      this.closeTriageModal()
    },
  }
})
</script>

<style scoped>
.pro-dashboard-modern {
  min-height: calc(100vh - 64px);
  background-color: var(--bg-primary);
  transition: background-color 0.3s ease;
}

/* Modals */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-content {
  background: var(--bg-surface);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid var(--border-primary);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid var(--border-primary);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-primary);
}

.close-btn {
  background: var(--bg-muted);
  border: none;
  color: var(--text-secondary);
  font-size: 1.25rem;
  cursor: pointer;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--border-primary);
  color: var(--text-primary);
}

.modal-body {
  padding: 24px;
}

/* Triage Form Elements */
.diagnosis-select,
.diagnosis-textarea,
.price-input {
  width: 100%;
  padding: 12px 16px;
  background: var(--bg-muted);
  border: 1px solid var(--border-primary);
  border-color: #e2e8f0; /* slate-200 fallback */
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.2s;
}

[data-theme='dark'] .diagnosis-select,
[data-theme='dark'] .diagnosis-textarea,
[data-theme='dark'] .price-input {
  border-color: #475569; /* slate-600 */
}

.diagnosis-select:focus,
.diagnosis-textarea:focus,
.price-input:focus {
  outline: none;
  border-color: var(--blue-600);
  background: var(--bg-surface);
}

.verify-btn {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px;
  border-radius: 16px;
  font-weight: 800;
  transition: all 0.2s;
}

.verify-btn.confirm {
  background: #10b981;
  color: white;
}

.verify-btn.reject {
  background: #ef4444;
  color: white;
}

.verify-btn:active {
  transform: scale(0.98);
}

.sub-text {
  font-size: 0.75rem;
  font-weight: 500;
  opacity: 0.9;
}

/* Animations */
.fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.zoom-modal {
  position: relative;
  max-width: 95vw;
  max-height: 95vh;
}

.zoom-modal img {
  max-width: 100%;
  max-height: 90vh;
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
}

.close-zoom {
  position: absolute;
  top: -20px;
  right: -20px;
  background: white;
  color: black;
  border: none;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

@media (max-width: 640px) {
  .modal-overlay {
    padding: 12px;
  }
}
</style>
