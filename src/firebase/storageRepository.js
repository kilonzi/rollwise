import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { firebaseApp } from './config'

const storage = getStorage(firebaseApp)

export const storageRepository = {
    /**
     * Uploads a file to Firebase Storage
     * @param {File} file - The file object to upload
     * @param {string} path - The path in storage (e.g. 'jobs/JOB_123/site_check.jpg')
     * @returns {Promise<string>} - The download URL
     */
    async uploadFile(file, path) {
        try {
            const storageRef = ref(storage, path)
            const snapshot = await uploadBytes(storageRef, file)
            const url = await getDownloadURL(snapshot.ref)
            return url
        } catch (error) {
            console.error('Error uploading file:', error)
            throw error
        }
    },

    /**
     * Uploads multiple files
     * @returns {Promise<string[]>} - Array of download URLs
     */
    async uploadFiles(files, basePath) {
        const uploadPromises = files.map((file, index) => {
            // Create unique name or keep original
            const fileName = `${Date.now()}_${index}_${file.name}`
            return this.uploadFile(file, `${basePath}/${fileName}`)
        })
        return Promise.all(uploadPromises)
    }
}
