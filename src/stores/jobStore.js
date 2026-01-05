import { defineStore } from 'pinia'
import { jobRepository, JOB_STATUS } from '@/firebase/jobRepository.js'

const getCreatedAt = (job) => {
    if (!job) return 0
    if (job.createdAt) return job.createdAt
    if (job.date) {
        const parsed = new Date(job.date)
        return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime()
    }
    return 0
}

export const useJobStore = defineStore('job', {
    state: () => ({
        jobs: [],
        clientJobs: [],
        notifications: [],
        unsubscribe: null,
        isLoading: false,
        error: null
    }),

    getters: {
        jobFeed: (state) => (role) => {
            if (!role) return state.jobs
            return state.jobs.filter(job => !job.visibility || job.visibility.includes(role))
        },
        getByStatus: (state) => (status) => state.jobs.filter(job => job.status === status),
        sortedJobs: (state) => (direction = 'asc') => {
            const multiplier = direction === 'desc' ? -1 : 1
            return [...state.jobs].sort((a, b) => (getCreatedAt(a) - getCreatedAt(b)) * multiplier)
        },
        openTriageJobs: (state) => state.jobs.filter(job => job.triageReady && job.status === 'new'),
        groupedJobs: (state, getters) => (direction = 'asc') => {
            const groups = {
                today: [],
                last7: [],
                older: []
            }
            const now = Date.now()
            const dayMs = 24 * 60 * 60 * 1000
            getters.sortedJobs(direction).forEach(job => {
                const age = now - getCreatedAt(job)
                if (age <= dayMs) {
                    groups.today.push(job)
                } else if (age <= dayMs * 7) {
                    groups.last7.push(job)
                } else {
                    groups.older.push(job)
                }
            })
            return groups
        }
    },

    actions: {
        async init() {
            if (this.unsubscribe) return
            this.isLoading = true
            try {
                this.unsubscribe = jobRepository.subscribe((jobs) => {
                    this.jobs = jobs
                })
                this.isLoading = false
            } catch (error) {
                this.error = error.message
                this.isLoading = false
            }
        },
        dispose() {
            if (this.unsubscribe) {
                this.unsubscribe()
                this.unsubscribe = null
            }
        },
        pushNotification(notification) {
            this.notifications.unshift({
                id: crypto.randomUUID(),
                createdAt: Date.now(),
                ...notification
            })
        },
        async transition(jobId, status, payload = {}) {
            await jobRepository.update(jobId, {
                status,
                ...payload,
                lastUpdatedAt: Date.now()
            })
        },
        async assign(jobId, technicianId) {
            await this.transition(jobId, JOB_STATUS.ASSIGNED, { technicianId })
        },
        async start(jobId) {
            await this.transition(jobId, JOB_STATUS.IN_PROGRESS)
        },
        async complete(jobId) {
            await this.transition(jobId, JOB_STATUS.COMPLETED)
        },
        async cancel(jobId, reason) {
            await this.transition(jobId, JOB_STATUS.CANCELLED, { cancelReason: reason })
        },
        async markPaid(jobId) {
            await this.transition(jobId, JOB_STATUS.PAID)
        },
        async loadClientJobs(phone) {
            this.isLoading = true
            try {
                this.clientJobs = await jobRepository.listByClient(phone)
            } catch (error) {
                this.error = error.message
            } finally {
                this.isLoading = false
            }
        },
        async createJob(job) {
            const record = await jobRepository.create(job)
            this.clientJobs = [record, ...this.clientJobs]
            this.pushNotification({
                title: 'Job Created',
                body: `New job #${record.id} created`,
                severity: 'info'
            })
            return record
        },
        async assignTechnicians(jobId, technicianIds = []) {
            await jobRepository.update(jobId, {
                assignedTechnicians: technicianIds,
                status: technicianIds.length ? JOB_STATUS.ASSIGNED : JOB_STATUS.NEW,
                assignmentUpdatedAt: Date.now()
            })
        },
        async updateJobNotes(jobId, notes) {
            await jobRepository.update(jobId, {
                notes,
                notesUpdatedAt: Date.now()
            })
        },
        async toggleTriage(jobId, enabled) {
            await jobRepository.update(jobId, {
                triageReady: enabled,
                triageUpdatedAt: Date.now()
            })
        }
    }
})
