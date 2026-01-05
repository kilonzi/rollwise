<template>
  <div class="h-full">
    <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm h-full flex flex-col">
      <!-- Standard Header -->
      <div 
         class="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between"
      >
         <div class="flex items-center gap-3">
             <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
               <span class="material-symbols-rounded">account_balance_wallet</span>
             </div>
             <div>
               <h3 class="font-bold text-slate-900 dark:text-white">Payments & Earnings</h3>
               <p class="text-xs text-slate-500 font-medium">Manage your balance and payouts</p>
             </div>
         </div>
         
         <div class="flex items-center gap-3">
            <button 
                @click.stop="openCashout"
                class="bg-indigo-600 text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
              >
                <span class="material-symbols-rounded text-lg">payments</span>
                Cash Out
              </button>
         </div>
      </div>

      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <!-- Balance Summary Card -->
          <div class="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div class="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
              <span class="material-symbols-rounded text-8xl">account_balance</span>
            </div>
            
            <p class="text-indigo-200 font-bold tracking-wider text-xs uppercase mb-1">Available Balance</p>
            <h1 class="text-4xl font-black mb-4">{{ formattedBalance }}</h1>
            
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-sm text-indigo-100/90 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                <span class="material-symbols-rounded text-base">credit_card</span>
                <span>{{ bankInfo.name }} ••••{{ bankInfo.last4 }}</span>
              </div>
            </div>
          </div>

          <!-- Stats Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center gap-4">
              <div class="p-3 bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 rounded-lg shadow-sm">
                <span class="material-symbols-rounded text-xl">build</span>
              </div>
              <div>
                <p class="text-xs text-slate-500 font-bold uppercase">Labor Earnings</p>
                <p class="text-lg font-black text-slate-900 dark:text-white">{{ formatCurrency(breakdown.labor) }}</p>
              </div>
            </div>
            <div class="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center gap-4">
              <div class="p-3 bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 rounded-lg shadow-sm">
                <span class="material-symbols-rounded text-xl">photo_camera</span>
              </div>
              <div>
                <p class="text-xs text-slate-500 font-bold uppercase">Remote Triage</p>
                <p class="text-lg font-black text-slate-900 dark:text-white">{{ formatCurrency(breakdown.triage) }}</p>
              </div>
            </div>
          </div>

          <!-- Transactions List -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold text-slate-900 dark:text-white">Transaction History</h3>
              <div class="flex bg-slate-100 dark:bg-slate-900/50 rounded-lg p-1">
                <button 
                  v-for="range in ranges" 
                  :key="range.value"
                  @click="selectRange(range.value)"
                  class="px-3 py-1 text-xs font-bold rounded-md transition-all"
                  :class="earningsStore.selectedRange === range.value ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
                >
                  {{ range.label }}
                </button>
              </div>
            </div>

            <div class="bg-slate-50 dark:bg-slate-900/20 rounded-xl border border-slate-100 dark:border-slate-700/50 overflow-hidden">
               <div v-if="transactions.length === 0" class="text-center py-12 text-slate-400">
                  <span class="material-symbols-rounded text-4xl mb-2 opacity-50">receipt_long</span>
                  <p class="text-sm">No transactions found</p>
               </div>

               <div 
                  v-for="tx in transactions" 
                  :key="tx.id"
                  class="group flex items-center justify-between p-4 hover:bg-white dark:hover:bg-slate-800 transition-colors border-b border-slate-200/50 dark:border-slate-700/50 last:border-0"
               >
                  <!-- Left: Icon & Details -->
                  <div class="flex items-center gap-3">
                     <div 
                        class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        :class="getIconStyles(tx)"
                     >
                        <span class="material-symbols-rounded text-lg">{{ getIcon(tx) }}</span>
                     </div>
                     
                     <div>
                        <div class="flex items-center gap-2 mb-0.5">
                           <span class="font-bold text-slate-900 dark:text-white text-sm">
                              {{ tx.type === 'payout' ? 'Payout to Bank' : tx.jobAddress }}
                           </span>
                           <span v-if="tx.type !== 'payout'" class="text-[10px] bg-white dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-mono">
                             #{{ tx.jobId || 'GENERIC' }}
                           </span>
                        </div>
                        <div class="text-xs text-slate-500">
                           {{ formatDate(tx.date) }} <span class="mx-1">•</span> <span class="capitalize">{{ tx.type }}</span>
                        </div>
                     </div>
                  </div>

                  <!-- Right: Amount -->
                  <div class="text-right">
                     <span 
                        class="font-bold block"
                        :class="tx.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'"
                     >
                        {{ tx.amount > 0 ? '+' : '' }}{{ formatCurrency(tx.amount) }}
                     </span>
                  </div>
               </div>
            </div>
          </div>
      </div>
    </div>
  
    <!-- Cashout Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="closeCashout">
       <div class="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
          <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
             <h3 class="font-bold text-lg dark:text-white">Cash Out Balance</h3>
             <button @click="closeCashout" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">✕</button>
          </div>
          
          <div class="p-6 space-y-4">
             <label class="flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all" :class="transferOption === 'instant' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700'">
                <input type="radio" value="instant" v-model="transferOption" class="w-5 h-5 text-indigo-600" />
                <div>
                   <p class="font-bold text-slate-900 dark:text-white">Instant Transfer</p>
                   <p class="text-xs text-slate-500">Arrives in minutes • Fee $1.50</p>
                </div>
             </label>

             <label class="flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all" :class="transferOption === 'standard' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700'">
                <input type="radio" value="standard" v-model="transferOption" class="w-5 h-5 text-indigo-600" />
                <div>
                   <p class="font-bold text-slate-900 dark:text-white">Standard Deposit</p>
                   <p class="text-xs text-slate-500">Arrives Tuesday • Free</p>
                </div>
             </label>
          </div>

          <div class="p-6 bg-slate-50 dark:bg-slate-900/50">
             <button @click="confirmCashout" class="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                Confirm Transfer
             </button>
          </div>
       </div>
    </div>
  </div>
</template>

<script>
import { useEarningsStore } from '@/stores/earningsStore'

export default {
  name: 'TechWalletView',
  data() {
    return {
      showModal: false,
      isExpanded: true,
      transferOption: 'instant',
      ranges: [
        { value: 'today', label: 'Today' },
        { value: 'week', label: 'This Week' },
        { value: 'month', label: 'Month' },
        { value: 'all', label: 'All' }
      ]
    }
  },
  setup() {
    const earningsStore = useEarningsStore()
    
    // Initialize real-time listener on mount
    import('vue').then(({ onMounted, onUnmounted }) => {
        onMounted(() => {
            earningsStore.init()
        })
        onUnmounted(() => {
            earningsStore.cleanup()
        })
    })

    return { earningsStore }
  },
  computed: {
    // The earningsStore is now provided by setup(), so this computed property is no longer needed.
    // earningsStore() {
    //   return useEarningsStore()
    // },
    transactions() {
      // Sort logic could go here if not in store
      return this.earningsStore.filteredTransactions
    },
    breakdown() {
      return this.earningsStore.incomeBreakdown
    },
    formattedBalance() {
      return this.formatCurrency(this.earningsStore.currentBalance)
    },
    bankInfo() {
      return this.earningsStore.bankInfo
    }
  },
  methods: {
    formatCurrency(value) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value)
    },
    formatDate(dateString) {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      }).format(new Date(dateString))
    },
    getIcon(tx) {
       if (tx.type === 'payout') return 'arrow_outward'
       if (tx.type === 'triage') return 'photo_camera'
       if (tx.type === 'bonus') return 'star'
       return 'build'
    },
    getIconStyles(tx) {
       if (tx.type === 'payout') return 'bg-slate-100 dark:bg-slate-700 text-slate-500'
       if (tx.type === 'triage') return 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
       if (tx.type === 'bonus') return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
       return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
    },
    openCashout() {
      this.showModal = true
    },
    closeCashout() {
      this.showModal = false
    },
    confirmCashout() {
      // Demo Action
      alert(`Cash out of ${this.formattedBalance} explicitly initiated via ${this.transferOption}!`)
      this.closeCashout()
    },
    selectRange(range) {
      this.earningsStore.setRange(range)
    }
  }
}
</script>
