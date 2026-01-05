import { defineStore } from 'pinia'

export const useDispatchStore = defineStore('dispatch', {
    state: () => ({
        clientType: 'residential', // 'residential' | 'commercial'
        isEmergency: false
    }),
    actions: {
        toggleClientType() {
            this.clientType = this.clientType === 'residential' ? 'commercial' : 'residential'
        },
        setEmergency(status) {
            this.isEmergency = status
        }
    }
})
