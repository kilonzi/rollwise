import { defineStore } from 'pinia'
import { db } from '@/firebase/database'
import { useAuthStore } from '@/stores/authStore'

const getStartDate = (range) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  switch (range) {
    case 'today':
      return today
    case 'week': {
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - 7)
      return startOfWeek
    }
    case 'month': {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      return startOfMonth
    }
    case 'all':
    default:
      return null
  }
}

export const useEarningsStore = defineStore('earnings', {
  state: () => ({
    transactions: [],
    selectedRange: 'today',
    isLoading: false,
    unsubscribe: null
  }),

  getters: {
    bankInfo() {
      const authStore = useAuthStore()
      // Return saved bank info or a default implementation placeholder
      // If the user hasn't set it up, Wallet.vue can handle the "Setup" CTA separately
      // OR we return a placeholder if we want to show the card in a "empty" state
      return authStore.bankDetails || { name: 'Not Connected', last4: '----' }
    },

    currentBalance(state) {
      // Calculate from transactions (sum of all except payouts? or just allow manual balance?)
      // For now, let's sum up all non-payout transactions minus payouts?
      // Or assumes the backend updates a 'balance' field. 
      // Since we don't have a backend calculator, let's sum locally.
      return state.transactions.reduce((acc, tx) => {
        return acc + (tx.amount || 0)
      }, 0)
    },

    filteredTransactions(state) {
      const startDate = getStartDate(state.selectedRange)
      if (!startDate) return state.transactions

      return state.transactions.filter((tx) => {
        const txDate = new Date(tx.date)
        return txDate >= startDate
      })
    },

    incomeBreakdown(state) {
      const totals = {
        labor: 0,
        triage: 0
      }

      this.filteredTransactions.forEach((tx) => {
        if (tx.type === 'labor') {
          totals.labor += tx.amount
        }
        if (tx.type === 'triage') {
          totals.triage += tx.amount
        }
      })

      return totals
    }
  },

  actions: {
    setRange(range) {
      this.selectedRange = range
    },

    async init() {
      const authStore = useAuthStore()
      if (!authStore.userPhone) return

      this.isLoading = true

      // Unsubscribe previous listener if any
      if (this.unsubscribe) {
        this.unsubscribe()
        this.unsubscribe = null
      }

      const normalized = authStore.userPhone.replace(/\D/g, '')
      const path = `users/${normalized}/earnings/transactions`

      // Subscribe to transactions
      // Note: db.subscribe returns an unsubscribe function
      try {
        this.unsubscribe = db.subscribe(path, (data) => {
          if (data) {
            // RTDB returns object with keys, convert to array
            const txList = Object.entries(data).map(([key, value]) => ({
              id: key,
              ...value
            }))
            // Sort by date desc
            this.transactions = txList.sort((a, b) => new Date(b.date) - new Date(a.date))
          } else {
            this.transactions = []
          }
          this.isLoading = false
        })
      } catch (e) {
        console.error('Earnings sync failed', e)
        this.isLoading = false
      }
    },

    cleanup() {
      if (this.unsubscribe) {
        this.unsubscribe()
        this.unsubscribe = null
      }
      this.transactions = []
    }
  }
})
