/**
 * Example usage of the Firebase Database abstraction layer
 *
 * This file demonstrates common patterns for using the database.js module
 */

import { db } from './database.js'

// ============================================================================
// USER OPERATIONS
// ============================================================================

export const userOperations = {
  /**
   * Create a new user
   */
  async createUser(userId, userData) {
    return await db.setRecord(`users/${userId}`, {
      ...userData,
      createdAt: Date.now()
    })
  },

  /**
   * Get user by ID
   */
  async getUser(userId) {
    return await db.getRecord(`users/${userId}`)
  },

  /**
   * Update user profile
   */
  async updateUser(userId, updates) {
    return await db.updateRecord(`users/${userId}`, updates)
  },

  /**
   * Delete user
   */
  async deleteUser(userId) {
    return await db.deleteRecord(`users/${userId}`)
  },

  /**
   * Subscribe to user updates
   */
  subscribeToUser(userId, callback) {
    return db.subscribe(`users/${userId}`, callback)
  }
}

// ============================================================================
// JOB OPERATIONS
// ============================================================================

export const jobOperations = {
  /**
   * Create a new job
   */
  async createJob(jobData) {
    const jobId = await db.pushRecord('jobs', {
      ...jobData,
      status: 'pending',
      createdAt: Date.now()
    })
    return jobId
  },

  /**
   * Get job by ID
   */
  async getJob(jobId) {
    return await db.getRecord(`jobs/${jobId}`)
  },

  /**
   * Update job status
   */
  async updateJobStatus(jobId, status) {
    return await db.updateRecord(`jobs/${jobId}`, {
      status,
      [`${status}At`]: Date.now()
    })
  },

  /**
   * Assign technician to job
   */
  async assignTechnician(jobId, technicianId) {
    return await db.updateRecord(`jobs/${jobId}`, {
      technicianId,
      status: 'assigned',
      assignedAt: Date.now()
    })
  },

  /**
   * Get all jobs for a client
   */
  async getClientJobs(clientId) {
    return await db.filterRecords('jobs', 'clientId', clientId)
  },

  /**
   * Get all jobs for a technician
   */
  async getTechnicianJobs(technicianId) {
    return await db.filterRecords('jobs', 'technicianId', technicianId)
  },

  /**
   * Get pending jobs
   */
  async getPendingJobs(limit = 50) {
    return await db.filterRecords('jobs', 'status', 'pending', limit)
  },

  /**
   * Subscribe to job updates
   */
  subscribeToJob(jobId, callback) {
    return db.subscribe(`jobs/${jobId}`, callback)
  },

  /**
   * Subscribe to all jobs
   */
  subscribeToAllJobs(callback) {
    return db.subscribe('jobs', callback)
  }
}

// ============================================================================
// TECHNICIAN OPERATIONS
// ============================================================================

export const technicianOperations = {
  /**
   * Create technician profile
   */
  async createTechnician(techId, techData) {
    return await db.setRecord(`technicians/${techId}`, {
      ...techData,
      available: true,
      rating: 5.0,
      totalJobs: 0,
      createdAt: Date.now()
    })
  },

  /**
   * Update technician availability
   */
  async updateAvailability(techId, available) {
    return await db.updateRecord(`technicians/${techId}`, {
      available,
      lastAvailabilityUpdate: Date.now()
    })
  },

  /**
   * Update technician location
   */
  async updateLocation(techId, location) {
    return await db.updateRecord(`technicians/${techId}`, {
      location,
      lastLocationUpdate: Date.now()
    })
  },

  /**
   * Get available technicians
   */
  async getAvailableTechnicians() {
    return await db.filterRecords('technicians', 'available', true)
  },

  /**
   * Increment job count
   */
  async incrementJobCount(techId) {
    return await db.transaction(`technicians/${techId}`, (techData) => {
      if (!techData) return undefined
      return {
        ...techData,
        totalJobs: (techData.totalJobs || 0) + 1
      }
    })
  }
}

// ============================================================================
// EARNINGS OPERATIONS
// ============================================================================

export const earningsOperations = {
  /**
   * Record new earning
   */
  async recordEarning(technicianId, jobId, amount) {
    return await db.pushRecord('earnings', {
      userId: technicianId,
      jobId,
      amount,
      status: 'pending',
      createdAt: Date.now()
    })
  },

  /**
   * Get technician earnings
   */
  async getTechnicianEarnings(technicianId) {
    return await db.getRecordsByUser('earnings', technicianId)
  },

  /**
   * Update earning status
   */
  async updateEarningStatus(earningId, status) {
    return await db.updateRecord(`earnings/${earningId}`, {
      status,
      [`${status}At`]: Date.now()
    })
  },

  /**
   * Get pending earnings
   */
  async getPendingEarnings() {
    return await db.filterRecords('earnings', 'status', 'pending')
  }
}

// ============================================================================
// DISPATCH OPERATIONS
// ============================================================================

export const dispatchOperations = {
  /**
   * Create dispatch record
   */
  async createDispatch(dispatchData) {
    return await db.pushRecord('dispatches', {
      ...dispatchData,
      status: 'active',
      createdAt: Date.now()
    })
  },

  /**
   * Update dispatch status
   */
  async updateDispatchStatus(dispatchId, status) {
    return await db.updateRecord(`dispatches/${dispatchId}`, {
      status,
      updatedAt: Date.now()
    })
  },

  /**
   * Get active dispatches
   */
  async getActiveDispatches() {
    return await db.filterRecords('dispatches', 'status', 'active')
  },

  /**
   * Subscribe to dispatch updates
   */
  subscribeToDispatch(dispatchId, callback) {
    return db.subscribe(`dispatches/${dispatchId}`, callback)
  }
}

// ============================================================================
// BATCH OPERATIONS EXAMPLE
// ============================================================================

export const batchOperations = {
  /**
   * Complete job and update related records
   */
  async completeJob(jobId, technicianId, amount) {
    const updates = {
      [`jobs/${jobId}/status`]: 'completed',
      [`jobs/${jobId}/completedAt`]: Date.now(),
      [`technicians/${technicianId}/lastJobCompletedAt`]: Date.now()
    }

    await db.batchUpdate(updates)

    // Record earning separately
    await earningsOperations.recordEarning(technicianId, jobId, amount)
  },

  /**
   * Assign job and update technician
   */
  async assignJobToTechnician(jobId, technicianId) {
    const updates = {
      [`jobs/${jobId}/technicianId`]: technicianId,
      [`jobs/${jobId}/status`]: 'assigned',
      [`jobs/${jobId}/assignedAt`]: Date.now(),
      [`technicians/${technicianId}/currentJobId`]: jobId,
      [`technicians/${technicianId}/available`]: false
    }

    return await db.batchUpdate(updates)
  }
}

// ============================================================================
// USAGE EXAMPLE IN VUE COMPONENT
// ============================================================================

/*
// In a Vue component:

import { ref, onMounted, onUnmounted } from 'vue'
import { jobOperations } from '@/firebase/examples.js'

export default {
  setup() {
    const jobs = ref([])
    let unsubscribe = null

    onMounted(async () => {
      // Get initial data
      const jobsData = await jobOperations.getPendingJobs()
      jobs.value = Object.entries(jobsData).map(([id, data]) => ({
        id,
        ...data
      }))

      // Subscribe to real-time updates
      unsubscribe = jobOperations.subscribeToAllJobs((data) => {
        jobs.value = Object.entries(data || {}).map(([id, data]) => ({
          id,
          ...data
        }))
      })
    })

    onUnmounted(() => {
      // Clean up subscription
      if (unsubscribe) unsubscribe()
    })

    const assignJob = async (jobId, techId) => {
      await jobOperations.assignTechnician(jobId, techId)
    }

    return {
      jobs,
      assignJob
    }
  }
}
*/

// ============================================================================
// USAGE EXAMPLE IN PINIA STORE
// ============================================================================

/*
// In a Pinia store:

import { defineStore } from 'pinia'
import { jobOperations } from '@/firebase/examples.js'

export const useJobStore = defineStore('job', {
  state: () => ({
    jobs: {},
    loading: false,
    error: null,
    unsubscribe: null
  }),

  actions: {
    async fetchJobs() {
      this.loading = true
      try {
        this.jobs = await jobOperations.getPendingJobs()
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    subscribeToJobs() {
      this.unsubscribe = jobOperations.subscribeToAllJobs((data) => {
        this.jobs = data || {}
      })
    },

    unsubscribeFromJobs() {
      if (this.unsubscribe) {
        this.unsubscribe()
        this.unsubscribe = null
      }
    },

    async createJob(jobData) {
      try {
        const jobId = await jobOperations.createJob(jobData)
        return jobId
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async assignJob(jobId, technicianId) {
      try {
        await jobOperations.assignTechnician(jobId, technicianId)
      } catch (error) {
        this.error = error.message
        throw error
      }
    }
  },

  getters: {
    pendingJobs: (state) => {
      return Object.entries(state.jobs)
        .filter(([_, job]) => job.status === 'pending')
        .map(([id, job]) => ({ id, ...job }))
    },

    activeJobs: (state) => {
      return Object.entries(state.jobs)
        .filter(([_, job]) => ['assigned', 'in_progress'].includes(job.status))
        .map(([id, job]) => ({ id, ...job }))
    }
  }
})
*/

export default {
  userOperations,
  jobOperations,
  technicianOperations,
  earningsOperations,
  dispatchOperations,
  batchOperations
}

