import { db } from './database.js'

const JOBS_COLLECTION = 'jobs'

const normalizeId = (id) => id?.trim() || ''
const normalizePhone = (phone) => {
  const p = phone?.replace(/\D/g, '') || ''
  // Standardize US numbers to 11 digits (1 + 10 digits)
  if (p.length === 10) return '1' + p
  if (p.length === 11 && p.startsWith('1')) return p
  return p
}

const jobPath = (id) => `${JOBS_COLLECTION}/${normalizeId(id)}`

/**
 * Generates a 6-character alphanumeric Job ID (Uppercase)
 * Matches Cloud Functions logic. Collisions ~ 1 in 1B.
 */
const generateShortId = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const JOB_STATUS = {
  NEW: 'new',
  TRIAGE: 'triage',
  ASSIGNED: 'assigned',
  EN_ROUTE: 'en_route',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  PAID: 'paid'
}

export const jobRepository = {
  async list() {
    const records = await db.getRecords(JOBS_COLLECTION)
    if (!records) return []
    return Object.entries(records).map(([id, value]) => ({ id, ...value }))
  },

  async listByClient(phone) {
    const normalized = normalizePhone(phone)
    if (!normalized) return []
    try {
      const records = await db.filterRecords(JOBS_COLLECTION, 'clientPhoneNormalized', normalized)
      if (!records) return []
      return Object.entries(records).map(([id, value]) => ({ id, ...value }))
    } catch (error) {
      console.warn('Falling back to client-side job filtering', error)
      const jobs = await this.list()
      return jobs.filter(job => job.clientPhoneNormalized === normalized)
    }
  },

  subscribe(callback) {
    return db.subscribe(JOBS_COLLECTION, (snapshot) => {
      if (!snapshot) {
        callback([])
        return
      }
      const jobs = Object.entries(snapshot).map(([id, value]) => ({ id, ...value }))
      callback(jobs)
    })
  },

  async get(id) {
    if (!id) return null
    return db.getRecord(jobPath(id))
  },

  async create(job) {
    const id = job?.id || generateShortId()
    const record = {
      ...job,
      id,
      clientPhoneNormalized: normalizePhone(job?.clientPhone),
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    await db.setRecord(jobPath(id), record)
    return record
  },

  async save(job) {
    if (!job?.id) {
      throw new Error('Job must include id')
    }
    const record = {
      ...job,
      clientPhoneNormalized: normalizePhone(job.clientPhone)
    }
    await db.setRecord(jobPath(job.id), record)
    return record
  },

  async update(id, updates) {
    if (!id) throw new Error('Job id required for update')
    const payload = { ...updates }
    if (updates?.clientPhone) {
      payload.clientPhoneNormalized = normalizePhone(updates.clientPhone)
    }
    await db.updateRecord(jobPath(id), payload)
    return this.get(id)
  }
}
