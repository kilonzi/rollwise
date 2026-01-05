import { defineStore } from 'pinia'
import { userRepository } from '@/firebase/userRepository.js'

const ROLE_HOME_ROUTES = {
  client: '/client-portal',
  pro: '/pro-hub',
  admin: '/admin-dashboard'
}

const DEFAULT_ROLE_STATUS = {
  client: { status: 'approved' },
  pro: { status: 'onboarding' },
  admin: { status: 'pending_review' }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
    userPhone: null,
    userName: null,
    memberships: {},
    activeRole: null,
    desiredRole: 'client',
    isLoading: false,
    tempRegistrationData: null,
    theme: localStorage.getItem('rollwise_theme') || 'light',
  }),

  getters: {
    homeRoute(state) {
      return ROLE_HOME_ROUTES[state.activeRole] || '/'
    },
    activeStatus(state) {
      return state.memberships?.[state.activeRole]?.status || null
    },
    isPendingPro(state) {
      return state.activeRole === 'pro' && state.activeStatus === 'pending_review'
    },
    availableRoles(state) {
      return Object.keys(state.memberships || {})
    },
    proName(state) {
      return state.userName || (state.memberships?.pro?.application?.fullName) || 'Pro Partner'
    },
    proId(state) {
      if (!state.userPhone) return 'PRO-000'
      const last4 = state.userPhone.slice(-4)
      return `PRO-${last4}`
    },
    bankDetails(state) {
      return state.memberships?.pro?.bankDetails || null
    },
    isOnline(state) {
      return state.memberships?.pro?.isOnline || false
    },
    licenseNumber(state) {
      return state.memberships?.pro?.application?.licenseNumber || 'PENDING'
    }
  },

  actions: {
    setDesiredRole(role) {
      if (role && ['client', 'pro', 'admin'].includes(role)) {
        this.desiredRole = role
      }
    },

    setTempRegistrationData(data) {
      this.tempRegistrationData = data
    },

    async submitProLead(data) {
      this.tempRegistrationData = data
      const normalized = data.phone.replace(/\D/g, '')
      if (normalized.length >= 10) {
        try {
          const { db } = await import('@/firebase/database.js')
          await db.setRecord(`pro_leads/${normalized}`, {
            ...data,
            submittedAt: Date.now()
          })
        } catch (e) {
          console.error('Lead save failed', e)
        }
      }
    },

    resolveLoginRoute(role) {
      if (role === 'pro') return 'pro-login'
      if (role === 'admin') return 'admin-login'
      return 'client-login'
    },

    resetSession() {
      this.isAuthenticated = false
      this.userPhone = null
      this.userName = null
      this.memberships = {}
      this.activeRole = null
      try {
        localStorage.removeItem('rollwise_auth')
      } catch (e) { /* ignore */ }
    },

    applyRecord(record, role) {
      this.isAuthenticated = true
      this.userPhone = record.phone
      this.userName = record.profile?.name || null
      this.memberships = record.roles || {}
      this.activeRole = role || this.pickRole(this.desiredRole)

      this.persistSession()
    },

    persistSession() {
      try {
        localStorage.setItem('rollwise_auth', JSON.stringify({
          phone: this.userPhone,
          role: this.activeRole,
          timestamp: Date.now()
        }))
      } catch (e) { console.error('Auth persist failed', e) }
    },

    async restoreSession() {
      try {
        const stored = localStorage.getItem('rollwise_auth')
        if (!stored) return false

        const data = JSON.parse(stored)
        if (data.phone) {
          this.userPhone = data.phone
          this.isAuthenticated = true
          const record = await userRepository.getByPhone(data.phone)
          if (record) {
            this.applyRecord(record, data.role)
            return true
          }
        }
      } catch (e) {
        console.error('Session restore failed', e)
        this.resetSession()
      }
      return false
    },

    pickRole(preferred) {
      if (preferred && this.memberships?.[preferred]) {
        return preferred
      }
      const available = Object.keys(this.memberships || {})
      return available[0] || null
    },

    hasRole(role) {
      return Boolean(role && this.memberships?.[role])
    },

    ensureRoleRecord(phone, role) {
      const defaults = { ...DEFAULT_ROLE_STATUS[role], grantedAt: Date.now() }
      return userRepository.ensureRole(phone, role, defaults)
    },

    async login(phone) {
      this.isLoading = true
      this.userPhone = phone
      const requestedRole = this.desiredRole || 'client'

      let record = await userRepository.getByPhone(phone)

      if (!record) {
        this.isLoading = false
        return { role: 'new', requestedRole }
      }

      const hasRole = Boolean(record.roles?.[requestedRole])
      if (!hasRole) {
        record = await this.ensureRoleRecord(phone, requestedRole)
      }

      this.applyRecord(record, requestedRole)
      this.isLoading = false
      return { role: requestedRole, status: record.roles?.[requestedRole]?.status }
    },

    async completeNewUser(role) {
      if (!this.userPhone) {
        throw new Error('Cannot complete registration without phone number')
      }
      await this.ensureRoleRecord(this.userPhone, role)
      const record = await userRepository.getByPhone(this.userPhone)
      this.applyRecord(record, role)
      return record
    },

    async handleMultiRoleUpgrade(role) {
      if (!this.userPhone) {
        throw new Error('Phone number required before upgrading role')
      }
      const record = await this.ensureRoleRecord(this.userPhone, role)
      this.applyRecord(record, role)
    },

    async registerClient() {
      await this.completeNewUser('client')
      return this.homeRoute
    },

    async startProOnboarding() {
      await this.handleMultiRoleUpgrade('pro')
    },

    async submitProApplication(data) {
      await this.startProOnboarding()
      await userRepository.updateRole(this.userPhone, 'pro', {
        application: {
          fullName: data.fullName,
          businessName: data.businessName,
          businessAddress: data.businessAddress,
          email: data.email,
          skills: data.skills || [],
          serviceRadius: data.serviceRadius || 25,
          // Updated Docs
          licenseNumber: data.licenseNumber || null,
          licenseFrontKey: data.licenseFrontKey || null,
          licenseBackKey: data.licenseBackKey || null,
          insuranceKey: data.insuranceKey || null,
          // Resources
          hasVehicle: data.hasVehicle || false,
          tools: data.tools || [],
          preferredRate: data.preferredRate || null,
          // Terms
          agreedToTerms: data.agreedToTerms || false,
          submittedAt: Date.now()
        },
        status: 'pending_review'
      })
      this.memberships.pro = {
        ...this.memberships.pro,
        status: 'pending_review'
      }
    },

    switchRole(role) {
      if (this.memberships?.[role]) {
        this.activeRole = role
      }
    },

    async fetchProLead(phone) {
      if (!phone) return null
      try {
        const { db } = await import('@/firebase/database.js')
        const { userRepository } = await import('@/firebase/userRepository.js')

        const normalized = phone.replace(/\D/g, '')

        // 1. Check for Lead Data (for pre-fill)
        const lead = await db.getRecord(`pro_leads/${normalized}`)

        // 2. Check for Existing User Record (to suggest login)
        const user = await userRepository.getByPhone(phone)

        if (lead) {
          this.tempRegistrationData = lead
        }

        return {
          lead: lead || null,
          userExists: !!user
        }
      } catch (e) {
        console.error('Fetch lead failed', e)
      }
      return null
    },

    logout() {
      this.resetSession()
      this.desiredRole = 'client'
    },

    async saveBankDetails(details) {
      if (!this.userPhone) return
      this.isLoading = true
      try {
        await userRepository.updateBankDetails(this.userPhone, details)
        const record = await userRepository.getByPhone(this.userPhone)
        if (record) {
          this.applyRecord(record, this.activeRole)
        }
        return true
      } catch (e) {
        console.error('Save bank details failed', e)
        return false
      } finally {
        this.isLoading = false
      }
    },

    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light'
      localStorage.setItem('rollwise_theme', this.theme)
      this.applyTheme()
    },

    applyTheme() {
      document.documentElement.setAttribute('data-theme', this.theme)
    },

    async updateAvailability(isOnline) {
      if (!this.userPhone) return
      this.isLoading = true
      try {
        await userRepository.updateAvailability(this.userPhone, isOnline)
        // Update local state immediately
        if (this.memberships.pro) {
          this.memberships.pro.isOnline = isOnline
        }
        return true
      } catch (e) {
        console.error('Update availability failed', e)
        return false
      } finally {
        this.isLoading = false
      }
    }
  }
})
