import { defineStore } from 'pinia'
import { chatRepository } from '@/firebase/chatRepository'
import { useAuthStore } from './authStore'

export const useChatStore = defineStore('chat', {
    state: () => ({
        messages: [],
        unsubscribe: null,
        isLoading: false
    }),

    actions: {
        /**
         * Initialize chat listener for the current pro
         */
        initChat() {
            const authStore = useAuthStore()
            if (!authStore.userPhone || this.unsubscribe) return

            this.isLoading = true
            this.unsubscribe = chatRepository.subscribeToThread(authStore.userPhone, (messages) => {
                this.messages = messages
                this.isLoading = false
            })
        },

        /**
         * Stop listening to messages
         */
        disposeChat() {
            if (this.unsubscribe) {
                this.unsubscribe()
                this.unsubscribe = null
            }
        },

        /**
         * Send a new message to dispatch
         * @param {string} text - Message content
         */
        async sendMessage(text) {
            if (!text.trim()) return

            const authStore = useAuthStore()
            if (!authStore.userPhone) return

            try {
                await chatRepository.sendMessage(authStore.userPhone, {
                    text: text.trim(),
                    sender: 'pro',
                    senderName: authStore.proName,
                    senderPhone: authStore.userPhone
                })
            } catch (error) {
                console.error('Failed to send message:', error)
                throw error
            }
        }
    }
})
