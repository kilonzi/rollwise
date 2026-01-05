import { getDatabase, ref, set, get, update, remove, query, orderByChild, equalTo, limitToFirst,
    limitToLast, push, onValue, off } from 'firebase/database'
import { firebaseApp } from './config.js'

/**
 * Database abstraction layer for Firebase Realtime Database
 * Automatically prefixes paths with environment (production/sandbox/development)
 */
class Database {
  constructor() {
    this.db = getDatabase(firebaseApp)
    this.env = this._getEnvironment()
  }

  /**
   * Get current environment from env vars
   * @returns {string} - production, sandbox, or development
   */
  _getEnvironment() {
    const env = import.meta.env.VITE_APP_ENV || 'development'
    const validEnvs = ['production', 'sandbox', 'development']
    return validEnvs.includes(env) ? env : 'development'
  }

  /**
   * Build full path with environment prefix
   * @param {string} path - Path without environment prefix
   * @returns {string} - Full path with environment
   */
  _buildPath(path) {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path
    return `${this.env}/${cleanPath}`
  }

  /**
   * Get reference to a database path
   * @param {string} path - Database path
   * @returns {DatabaseReference}
   */
  getRef(path) {
    const fullPath = this._buildPath(path)
    return ref(this.db, fullPath)
  }

  /**
   * Create or update a record at a specific path
   * @param {string} path - Database path
   * @param {Object} data - Data to store
   * @returns {Promise<{success: boolean}>}
   */
  async setRecord(path, data) {
    try {
      const dbRef = this.getRef(path)
      await set(dbRef, {
        ...data,
        updatedAt: Date.now()
      })
      return { success: true }
    } catch (error) {
      console.error('Error setting record:', error)
      throw new Error(`Failed to set record at ${path}: ${error.message}`)
    }
  }

  /**
   * Update specific fields in a record
   * @param {string} path - Database path
   * @param {Object} updates - Fields to update
   * @returns {Promise<void>}
   */
  async updateRecord(path, updates) {
    try {
      const dbRef = this.getRef(path)
      await update(dbRef, {
        ...updates,
        updatedAt: Date.now()
      })
      return { success: true }
    } catch (error) {
      console.error('Error updating record:', error)
      throw new Error(`Failed to update record at ${path}: ${error.message}`)
    }
  }

  /**
   * Get a single record
   * @param {string} path - Database path
   * @returns {Promise<Object|null>}
   */
  async getRecord(path) {
    try {
      const dbRef = this.getRef(path)
      const snapshot = await get(dbRef)

      if (snapshot.exists()) {
        return snapshot.val()
      }
      return null
    } catch (error) {
      console.error('Error getting record:', error)
      throw new Error(`Failed to get record at ${path}: ${error.message}`)
    }
  }

  /**
   * Get all records at a path
   * @param {string} path - Database path
   * @returns {Promise<Object>}
   */
  async getRecords(path) {
    try {
      const dbRef = this.getRef(path)
      const snapshot = await get(dbRef)

      if (snapshot.exists()) {
        return snapshot.val()
      }
      return {}
    } catch (error) {
      console.error('Error getting records:', error)
      throw new Error(`Failed to get records at ${path}: ${error.message}`)
    }
  }

  /**
   * Filter records by a specific field value
   * @param {string} path - Database path
   * @param {string} field - Field to filter by
   * @param {*} value - Value to match
   * @param {number} limit - Optional limit
   * @returns {Promise<Object>}
   */
  async filterRecords(path, field, value, limit = null) {
    try {
      const dbRef = this.getRef(path)
      let dbQuery = query(dbRef, orderByChild(field), equalTo(value))

      if (limit) {
        dbQuery = query(dbRef, orderByChild(field), equalTo(value), limitToFirst(limit))
      }

      const snapshot = await get(dbQuery)

      if (snapshot.exists()) {
        return snapshot.val()
      }
      return {}
    } catch (error) {
      console.error('Error filtering records:', error)
      throw new Error(`Failed to filter records at ${path}: ${error.message}`)
    }
  }

  /**
   * Get records filtered by user ID
   * @param {string} path - Database path
   * @param {string} userId - User ID to filter by
   * @returns {Promise<Object>}
   */
  async getRecordsByUser(path, userId) {
    return this.filterRecords(path, 'userId', userId)
  }

  /**
   * Delete a record
   * @param {string} path - Database path
   * @returns {Promise<void>}
   */
  async deleteRecord(path) {
    try {
      const dbRef = this.getRef(path)
      await remove(dbRef)
      return { success: true }
    } catch (error) {
      console.error('Error deleting record:', error)
      throw new Error(`Failed to delete record at ${path}: ${error.message}`)
    }
  }

  /**
   * Push new record with auto-generated ID
   * @param {string} path - Database path
   * @param {Object} data - Data to store
   * @returns {Promise<string>} - Generated key
   */
  async pushRecord(path, data) {
    try {
      const dbRef = this.getRef(path)
      const newRef = push(dbRef)

      await set(newRef, {
        ...data,
        createdAt: Date.now(),
        updatedAt: Date.now()
      })

      return newRef.key
    } catch (error) {
      console.error('Error pushing record:', error)
      throw new Error(`Failed to push record to ${path}: ${error.message}`)
    }
  }

  /**
   * Get the latest N records
   * @param {string} path - Database path
   * @param {number} limit - Number of records to fetch
   * @returns {Promise<Object>}
   */
  async getLatestRecords(path, limit) {
    try {
      const dbRef = this.getRef(path)
      const dbQuery = query(dbRef, orderByChild('createdAt'), limitToLast(limit))
      const snapshot = await get(dbQuery)

      if (snapshot.exists()) {
        return snapshot.val()
      }
      return {}
    } catch (error) {
      console.error('Error getting latest records:', error)
      throw new Error(`Failed to get latest records at ${path}: ${error.message}`)
    }
  }

  /**
   * Check if a record exists
   * @param {string} path - Database path
   * @returns {Promise<boolean>}
   */
  async exists(path) {
    try {
      const dbRef = this.getRef(path)
      const snapshot = await get(dbRef)
      return snapshot.exists()
    } catch (error) {
      console.error('Error checking existence:', error)
      return false
    }
  }

  /**
   * Subscribe to real-time updates on a path
   * @param {string} path - Database path
   * @param {Function} callback - Callback function(data)
   * @returns {Function} - Unsubscribe function
   */
  subscribe(path, callback) {
    const dbRef = this.getRef(path)

    const listener = (snapshot) => {
      const data = snapshot.exists() ? snapshot.val() : null
      callback(data)
    }

    onValue(dbRef, listener)

    // Return unsubscribe function
    return () => off(dbRef, 'value', listener)
  }

  /**
   * Batch update multiple paths
   * @param {Object} updates - Object with paths as keys and data as values
   * @returns {Promise<void>}
   */
  async batchUpdate(updates) {
    try {
      const prefixedUpdates = {}

      for (const [path, data] of Object.entries(updates)) {
        const fullPath = this._buildPath(path)
        prefixedUpdates[fullPath] = data
      }

      const dbRef = ref(this.db)
      await update(dbRef, prefixedUpdates)
      return { success: true }
    } catch (error) {
      console.error('Error in batch update:', error)
      throw new Error(`Failed batch update: ${error.message}`)
    }
  }

  /**
   * Get current environment
   * @returns {string}
   */
  getEnvironment() {
    return this.env
  }

  /**
   * Transaction - atomic read-modify-write
   * @param {string} path - Database path
   * @param {Function} updateFn - Function that receives current data and returns new data
   * @returns {Promise<Object>}
   */
  async transaction(path, updateFn) {
    try {
      const dbRef = this.getRef(path)
      const snapshot = await get(dbRef)
      const currentData = snapshot.exists() ? snapshot.val() : null
      const newData = updateFn(currentData)

      if (newData !== undefined) {
        await set(dbRef, {
          ...newData,
          updatedAt: Date.now()
        })
      }

      return { success: true, data: newData }
    } catch (error) {
      console.error('Error in transaction:', error)
      throw new Error(`Failed transaction at ${path}: ${error.message}`)
    }
  }
}

// Export singleton instance
export const db = new Database()

// Export class for testing or multiple instances
export default Database

