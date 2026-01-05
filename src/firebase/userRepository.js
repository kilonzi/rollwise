import { db } from './database.js'
import { TENANT_ID } from './config.js'

const USERS_COLLECTION = 'users'

const normalizePhone = (phone) => {
  if (!phone) return ''
  return phone.replace(/\D/g, '')
}

const buildPath = (phoneKey) => {
  if (!phoneKey) {
    throw new Error('Invalid phone number key')
  }
  return `${USERS_COLLECTION}/${phoneKey}`
}

const withTimestamps = (data) => ({
  ...data,
  createdAt: data?.createdAt ?? Date.now()
})

export const userRepository = {
  normalizePhone,

  async getByPhone(phone) {
    const phoneKey = normalizePhone(phone)
    if (!phoneKey) return null
    const record = await db.getRecord(buildPath(phoneKey))
    if (record && record.tenantId !== TENANT_ID) {
      return null
    }
    return record
  },

  async create(phone, payload) {
    const phoneKey = normalizePhone(phone)
    if (!phoneKey) {
      throw new Error('Phone number is required to create user record')
    }
    const baseRecord = withTimestamps({ phone, tenantId: TENANT_ID })
    const record = {
      ...baseRecord,
      roles: payload?.roles || {},
      profile: payload?.profile || {}
    }
    await db.setRecord(buildPath(phoneKey), record)
    return record
  },

  async ensureRole(phone, roleKey, rolePayload) {
    const phoneKey = normalizePhone(phone)
    if (!phoneKey) {
      throw new Error('Phone number is required to update role')
    }

    const path = buildPath(phoneKey)
    const existing = await db.getRecord(path)
    if (!existing) {
      const record = withTimestamps({
        phone,
        tenantId: TENANT_ID,
        roles: {
          [roleKey]: rolePayload
        }
      })
      await db.setRecord(path, record)
      return record
    }

    const updatedRoles = {
      ...(existing.roles || {}),
      [roleKey]: {
        ...(existing.roles?.[roleKey] || {}),
        ...rolePayload
      }
    }

    const update = { roles: updatedRoles, updatedAt: Date.now() }
    await db.updateRecord(path, update)
    return { ...existing, ...update }
  },

  async updateRole(phone, roleKey, updates) {
    return this.ensureRole(phone, roleKey, updates)
  },

  async updateProfile(phone, profileUpdates) {
    const phoneKey = normalizePhone(phone)
    if (!phoneKey) {
      throw new Error('Phone number is required to update profile')
    }
    const path = buildPath(phoneKey)
    await db.updateRecord(path, { profile: profileUpdates, updatedAt: Date.now() })
    return db.getRecord(path)
  },
  async updateBankDetails(phone, bankDetails) {
    return this.updateRole(phone, 'pro', { bankDetails, updatedAt: Date.now() })
  },
  async updateAvailability(phone, isOnline) {
    return this.updateRole(phone, 'pro', { isOnline, updatedAt: Date.now() })
  }
}
