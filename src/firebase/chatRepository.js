import { db } from './database.js'

const MESSAGES_COLLECTION = 'messages'

/**
 * Chat Repository for 1:1 Dispatch-Partner communication
 */
export const chatRepository = {
    /**
     * Subscribe to messages for a specific partner/dispatch thread
     * @param {string} partnerPhone - The professional's unique phone identifier
     * @param {Function} callback - Success callback
     */
    subscribeToThread(partnerPhone, callback) {
        if (!partnerPhone) return () => { }

        return db.subscribe(`${MESSAGES_COLLECTION}/${partnerPhone}`, (snapshot) => {
            if (!snapshot) {
                callback([])
                return
            }
            const messages = Object.entries(snapshot)
                .map(([id, value]) => ({ id, ...value }))
                .sort((a, b) => a.createdAt - b.createdAt)
            callback(messages)
        })
    },

    /**
     * Send a message to the dispatch thread
     * @param {string} partnerPhone - Professional identifier
     * @param {Object} message - Message payload { text, sender, senderName }
     */
    async sendMessage(partnerPhone, message) {
        if (!partnerPhone) throw new Error('Partner phone required for chat')

        return db.pushRecord(`${MESSAGES_COLLECTION}/${partnerPhone}`, {
            ...message,
            createdAt: Date.now()
        })
    }
}
