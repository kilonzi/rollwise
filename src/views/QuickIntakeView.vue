<template>
  <div class="quick-intake-view container" :class="{ 'embedded': embedded }">
    <div v-if="isLoading" class="loading-overlay">
       <span class="loader"></span>
       <p>Loading your request...</p>
    </div>

    <!-- Top Bar -->
    <div class="top-bar">
      <div class="dispatch-id">
        <span class="label">Job ID:</span>
        <span class="value">#{{ jobIdRef || 'NEW' }}</span>
      </div>
      <div class="status">
        <span class="status-dot" :class="{ pulsing: currentStep < 5 }"></span>
        <span class="material-symbols-rounded status-icon" aria-hidden="true">{{ statusIcon }}</span>
        Status: {{ statusText }}
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="progress-track">
      <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
    </div>

    <!-- Step Cards -->
    <div class="step-container">
      <!-- Step 1: Where -->
      <transition name="slide-fade" mode="out-in">
        <div v-if="currentStep === 1" class="step-card" key="step1">
          <div class="card-header">
            <span class="step-number">1</span>
            <h2 class="step-title">Location Details</h2>
          </div>
          <div v-if="isResumeMode" class="resume-banner">
             Hi {{ formData.fullName.split(' ')[0] }}, please complete your request below.
          </div>

          <!-- Client Type Toggle -->
          <div class="client-type-toggle">
            <button 
              class="type-btn" 
              :class="{ active: clientType === 'residential' }"
              @click="clientType = 'residential'"
            >
              <span class="material-symbols-rounded">home</span>
              Residential
            </button>
            <button 
              class="type-btn" 
              :class="{ active: clientType === 'commercial' }"
              @click="clientType = 'commercial'"
            >
              <span class="material-symbols-rounded">domain</span>
              Commercial
            </button>
          </div>

          <p class="step-subtitle">Where should we send the Pro?</p>
          
          <div class="input-group">
            <!-- Google Maps Autocomplete Input -->
            <LocationInput
              v-model="formData.address"
              placeholder="Enter service address"
              :api-key="mapsApiKey"
              @place-selected="handlePlaceSelected"
            />
          </div>

          <div class="card-actions">
            <button 
              class="primary-btn" 
              :disabled="!formData.address"
              @click="nextStep"
            >
              Next: Assess Damage
            </button>
          </div>
        </div>
      
        <!-- Step 2: What -->
        <div v-else-if="currentStep === 2" class="step-card" key="step2">
          <div class="card-header">
            <span class="step-number">2</span>
            <h2 class="step-title">What's the issue?</h2>
          </div>
          <p class="step-subtitle">Help us triage the problem for a faster fix.</p>
          
          <!-- Issue Grid -->
          <div class="issue-grid">
            <button 
              v-for="issue in commonIssues" 
              :key="issue.value"
              class="issue-card"
              :class="{ selected: formData.issueType === issue.value }"
              @click="formData.issueType = issue.value"
            >
              <span class="material-symbols-rounded issue-icon">{{ issue.icon }}</span>
              <span class="issue-label">{{ issue.label }}</span>
            </button>
          </div>

          <!-- Description -->
          <div class="input-group">
            <label>Description (Optional)</label>
            <textarea 
              v-model="formData.description" 
              class="modern-input" 
              rows="3" 
              placeholder="E.g. The door is stuck halfway up and making a grinding noise."
            ></textarea>
          </div>

          <div class="card-actions">
            <button class="secondary-btn" @click="prevStep">Back</button>
            <button 
              class="primary-btn" 
              :disabled="!formData.issueType"
              @click="nextStep"
            >
              Next: Photos
            </button>
          </div>
        </div>

        <!-- Step 3: Photos (NEW) -->
        <div v-else-if="currentStep === 3" class="step-card" key="step3">
          <div class="card-header">
            <span class="step-number">3</span>
            <h2 class="step-title">Visual Evidence</h2>
          </div>
          <p class="step-subtitle">Upload photos or video to help us prepare the right parts.</p>

          <div class="dropzone" :class="{ 'has-files': formData.files.length > 0 }" @click="triggerFileInput" @drop.prevent="handleDrop" @dragover.prevent>
             <input 
              ref="fileInput" 
              type="file" 
              multiple 
              accept="image/*,video/*" 
              style="display: none"
              @change="handleFileSelect"
            />
            
            <div v-if="formData.files.length === 0" class="dropzone-content-large">
              <span class="material-symbols-rounded upload-icon">add_a_photo</span>
              <p>Tap to upload photos / video</p>
              <p class="hint">or drag and drop here</p>
            </div>

            <div v-else class="file-preview-grid">
               <div v-for="(file, index) in formData.files" :key="index" class="file-preview">
                 <img v-if="file.type.startsWith('image')" :src="file.preview" />
                 <div v-else class="video-preview"><span class="material-symbols-rounded">videocam</span></div>
                 <button class="remove-file" @click.stop="removeFile(index)">×</button>
               </div>
               <div class="add-more" @click.stop="triggerFileInput">
                  <span class="material-symbols-rounded">add</span>
               </div>
            </div>
          </div>

          <div class="card-actions">
            <button class="secondary-btn" @click="prevStep">Back</button>
            <button 
              class="primary-btn" 
              @click="nextStep"
            >
              {{ formData.files.length > 0 ? 'Next: Service Priority' : 'Skip Photos' }}
            </button>
          </div>
        </div>
 
        <!-- Step 4: When -->
        <div v-else-if="currentStep === 4" class="step-card" key="step4">
          <div class="card-header">
            <span class="step-number">4</span>
            <h2 class="step-title">Service Priority</h2>
          </div>
          <p class="step-subtitle">How urgent is this request?</p>
          
          <div class="priority-grid">
            <div 
              class="priority-option" 
              :class="{ selected: formData.priority === 'rapid' }"
              @click="formData.priority = 'rapid'"
            >
              <div class="option-header">
                <span class="material-symbols-rounded icon">rocket_launch</span>
                <h3>Rapid Response</h3>
              </div>
              <div class="option-content">
                <div class="time-est">&lt; 60 Mins</div>
                <div class="price-tag">+$49 Priority Fee</div>
                <ul class="benefits">
                  <li>Priority dispatch status</li>
                  <li>Truck pre-loaded</li>
                </ul>
              </div>
            </div>

            <div 
              class="priority-option" 
              :class="{ selected: formData.priority === 'standard' }"
              @click="formData.priority = 'standard'"
            >
              <div class="option-header">
                <span class="material-symbols-rounded icon">schedule</span>
                <h3>Standard</h3>
              </div>
              <div class="option-content">
                <div class="time-est">2-4 Hours</div>
                <div class="price-tag">Standard Rate</div>
                <ul class="benefits">
                  <li>Next available Pro</li>
                  <li>Standard diagnosis</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="card-actions">
            <button class="secondary-btn" @click="prevStep">Back</button>
            <button class="primary-btn" @click="nextStep">
              Next: Contact Info
            </button>
          </div>
        </div>

        <!-- Step 5: Contact -->
        <div v-else-if="currentStep === 5" class="step-card" key="step5">
          <div class="card-header">
            <span class="step-number">5</span>
            <h2 class="step-title">Confirm & Dispatch</h2>
          </div>
          <p class="step-subtitle">Review your contact details.</p>
          
          <div class="form-stack">
            <!-- Authenticated View -->
            <div v-if="isAuthenticated" class="auth-confirmation">
               <div class="confirm-box">
                  <div class="confirm-row">
                    <span class="material-symbols-rounded icon">person</span>
                    <div>
                      <span class="label">Contact Name</span>
                      <p class="value">{{ formData.fullName }}</p>
                    </div>
                  </div>
                  <div class="confirm-row">
                    <span class="material-symbols-rounded icon">call</span>
                    <div>
                      <span class="label">Phone Number</span>
                      <p class="value">{{ formData.phone }}</p>
                    </div>
                  </div>
               </div>
               <p class="auth-note">
                 <span class="material-symbols-rounded">verified_user</span>
                 You are logged in. We'll use your profile details.
               </p>
            </div>

            <!-- Guest View -->
            <template v-else>
              <div class="input-group">
                <label>Full Name</label>
                <input 
                  v-model="formData.fullName" 
                  type="text" 
                  class="modern-input"
                  placeholder="Enter full name"
                />
              </div>

              <div class="input-group">
                <label>Phone Number</label>
                <input 
                  v-model="formData.phone" 
                  type="tel" 
                  class="modern-input"
                  placeholder="(774) 292 5110"
                  maxlength="14"
                  @input="formatPhone"
                />
              </div>
              
              <label class="checkbox-wrapper">
                <input type="checkbox" v-model="formData.phoneConfirmed" />
                <span class="checkbox-text">I confirm this is the best number to reach me</span>
              </label>

              <label class="checkbox-wrapper">
                <input type="checkbox" v-model="formData.smsConsent" />
                <span class="checkbox-text">Send me SMS updates with my tracking link</span>
              </label>

              <div class="terms-box">
                <label class="checkbox-wrapper">
                  <input type="checkbox" v-model="formData.acceptTerms" />
                  <span class="checkbox-text">I agree to the Terms & Cancellation Policy</span>
                </label>
              </div>
            </template>
          </div>

          <div class="card-actions">
            <button class="secondary-btn" @click="prevStep">Back</button>
            <button 
              class="primary-btn" 
              :disabled="(!isAuthenticated && (!isFormValid || !formData.acceptTerms))"
              @click="submitDispatch"
            >
              Dispatch Pro
            </button>
          </div>
        </div>


        <!-- Step 6: Success -->
        <div v-else class="step-card success-card" key="step6">
          <div class="success-icon">
            <span class="material-symbols-rounded">check_circle</span>
          </div>
          <h2>{{ isResumeMode ? 'Order Updated!' : 'Order Received!' }}</h2>
          <p class="eta-text">We're finding the best Pro for you.</p>
          
          <div class="summary-list">
            <div class="summary-item">
              <span>Job ID</span>
              <strong class="job-id-text">#{{ jobIdRef }}</strong>
            </div>
            <div class="summary-item">
              <span>Status</span>
              <strong class="text-blue-600">Pending Dispatch</strong>
            </div>
            <div class="summary-item link-item">
              <span>Tracking Link</span>
              <a :href="trackingLink" target="_blank" class="tracking-url">{{ trackingLink }}</a>
            </div>
          </div>

          <div class="card-actions vertical-actions">
            <!-- Share Button -->
            <button class="secondary-btn share-btn" @click="shareJob">
              <span class="material-symbols-rounded">ios_share</span>
              {{ canShare ? 'Share / Save to Phone' : 'Copy Tracking Link' }}
            </button>
            <p class="sms-note">You will also receive SMS updates shortly.</p>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>


<script>
import { useJobStore } from '@/stores/jobStore'
import { jobRepository } from '@/firebase/jobRepository'
import { storageRepository } from '@/firebase/storageRepository'
import LocationInput from '@/components/common/LocationInput.vue'

import { useAuthStore } from '@/stores/authStore'

export default {
  name: 'QuickIntakeView',
  components: { LocationInput },
  props: {
    jobId: {
      type: String,
      default: null
    },
    initialPhone: { type: String, default: '' },
    embedded: { type: Boolean, default: false }
  },
  emits: ['completed'],
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },
  data() {
    return {
      isLoading: false,
      currentStep: 1,
      jobIdRef: null,
      isResumeMode: false,
      clientType: 'residential',
      createdJobId: null,
      isSubmitting: false,
      formData: {
        address: '',
        files: [],
        issueType: '',
        description: '',
        priority: 'rapid',
        fullName: '',
        phone: '',
        phoneConfirmed: false,
        acceptTerms: false,
        smsConsent: true
      },
      rawFiles: [], // Store actual File objects for upload
      mapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    }
  },
  async mounted() {
    // Pre-fill from Auth if available
    if (this.authStore.isAuthenticated) {
        this.formData.fullName = this.authStore.userName || 'Valued Client'
        
        // Format phone for visual consistency if needed, but store raw is fine? 
        // Our input expects formatted string visually.
        // Let's just use what we have.
        this.formData.phone = this.authStore.userPhone || this.initialPhone || ''
        
        // Implicitly confirm
        this.formData.phoneConfirmed = true
        this.formData.acceptTerms = true
        this.formData.smsConsent = true
    } else if (this.initialPhone) {
      this.formData.phone = this.initialPhone
    }

    if (this.jobId) {
      this.jobIdRef = this.jobId
      await this.loadResumeJob(this.jobId)
    } else {
       // Generate a new temporary ID for display only
       this.jobIdRef = this.generateTempId()
    }
  },
  computed: {
    progressPercentage() {
      // 5 active steps (1-5). Step 6 is finish.
      if (this.currentStep > 5) return 100
      return ((this.currentStep - 1) / 4) * 100
    },
    statusText() {
      if (this.currentStep === 6) return 'En Route'
      if (this.isResumeMode) return 'Completing Order'
      return 'Intake'
    },
    statusIcon() {
      return this.currentStep === 6 ? 'local_shipping' : (this.isResumeMode ? 'edit_note' : 'pending_actions')
    },
    isFormValid() {
      // Step 5 validation
      return this.formData.fullName && this.formData.phoneConfirmed
    },
    commonIssues() {
      return [
        { value: 'Broken Spring', label: 'Broken Spring', icon: 'bolt' },
        { value: 'Opener Malfunction', label: 'Opener Issue', icon: 'sensors' },
        { value: 'Off-Track', label: 'Door Off Track', icon: 'railway_alert' },
        { value: 'Cable Snapped', label: 'Cable Snapped', icon: 'cable' },
        { value: 'Noisy Operation', label: 'Noisy/Rough', icon: 'volume_up' },
        { value: 'Other', label: 'Other/Unsure', icon: 'help' }
      ]
    },
    isAuthenticated() {
       return this.authStore.isAuthenticated
    },
    jobStore() {
        return useJobStore()
    },
    trackingLink() {
      // Use window.location.origin to adapt to dev/prod automatically
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://rollwise.app'
      return `${origin}/q/${this.jobIdRef}`
    },
    canShare() {
      return typeof navigator !== 'undefined' && !!navigator.share
    }
  },
  methods: {
    generateTempId() {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let result = "";
        for (let i = 0; i < 6; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
        return result;
    },
    async loadResumeJob(id) {
        this.isLoading = true
        try {
            // Simulate fetching from backend - using a direct call or store
            // For now, we'll try to get it from the store or assume it exists if passed
            // In a real app this would be: const job = await jobRepository.get(id)
            const job = { 
                id: id,
                address: '123 Verified St', // Mocked return
                clientName: 'valued Customer',
                clientPhone: '(555) 123-4567',
                clientType: 'residential',
                status: 'intake_pending'
            }
            
            // If job not found in real scenario, handle error
            if (!job) return

            this.isResumeMode = true
            this.formData.address = job.address || ''
            this.formData.fullName = job.clientName || ''
            this.formData.phone = job.clientPhone || ''
            this.clientType = job.clientType || 'residential'
            
            // Auto-advance if we have data
            if (this.formData.address) {
                // Address known? skip to 2 (Issue)
                // If issue also known (from AI), could skip to 3 (Photos)
                 this.currentStep = 3
            }
            
        } catch (e) {
            console.error(e)
        } finally {
            this.isLoading = false
        }
    },
    nextStep() { if (this.currentStep < 5) this.currentStep++ },
    prevStep() { if (this.currentStep > 1) this.currentStep-- },
    useCurrentLocation() { this.formData.address = '123 Main Street, Boston, MA' },
    triggerFileInput() { this.$refs.fileInput.click() },
    handleFileSelect(e) {
      if (e.target.files?.length) this.addFiles(e.target.files)
      e.target.value = ''
    },
    handleDrop(e) { if (e.dataTransfer.files?.length) this.addFiles(e.dataTransfer.files) },
    addFiles(list) {
      Array.from(list).forEach(file => {
        if (!file.type.match('image.*|video.*')) return
        // Store raw file for upload
        this.rawFiles.push(file)
        
        // Generate preview
        const reader = new FileReader()
        reader.onload = (e) => this.formData.files.push({
          type: file.type,
          preview: e.target.result
        })
        reader.readAsDataURL(file)
      })
    },
    removeFile(idx) { 
        this.formData.files.splice(idx, 1) 
        this.rawFiles.splice(idx, 1)
    },
    handlePlaceSelected(placeData) {
        // You could store lat/lng here if needed
        console.log("Selected Place:", placeData)
    },
    formatPhone(e) {
      // Basic formatting, kept simple
      let x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/)
      this.formData.phone = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '')
    },
    async submitDispatch() {
      if (this.isSubmitting) return
      this.isSubmitting = true
      
      try {
        // 1. Upload Files first (if any)
        let uploadedUrls = []
        if (this.rawFiles.length > 0) {
            // Generating ID early or using temp ID for path
            const jobIdForPath = this.jobIdRef || this.dispatchId || 'TEMP_' + Date.now()
            uploadedUrls = await storageRepository.uploadFiles(this.rawFiles, `jobs/${jobIdForPath}/intake`)
        }

        const payload = {
          clientName: this.formData.fullName,
          clientPhone: this.formData.phone,
          address: this.formData.address,
          clientType: this.clientType,
          type: 'Repair',
          title: this.formData.issueType,
          subtitle: this.formData.description || 'No description provided',
          description: this.formData.description,
          priority: this.formData.priority,
          status: 'lead', // Capture as Lead initially
          triage_status: 'pending',
          paymentSecured: false, 
          photos: uploadedUrls.length > 0 ? uploadedUrls : [],
          smsConsent: this.formData.smsConsent, 
          createdAt: Date.now()
        }

        if (this.isResumeMode && this.jobIdRef) {
             // Update existing
             // await this.jobStore.transition(this.jobIdRef, 'new', payload)
             // For demo:
             await this.jobStore.createJob({ ...payload, id: this.jobIdRef })
        } else {
            // Create new
            const result = await this.jobStore.createJob(payload)
            this.jobIdRef = result.id
        }
        
        // Move to Success Step (now Step 6)
        this.currentStep = 6
        this.$emit('completed', this.jobIdRef)
      } catch (error) {
        alert('Failed to submit: ' + error.message)
      } finally {
        this.isSubmitting = false
      }
    },
    async shareJob() {
      const shareData = {
        title: 'Rollwise Job #' + this.jobIdRef,
        text: `Track my garage door repair job #${this.jobIdRef}`,
        url: this.trackingLink
      }

      if (this.canShare) {
        try {
          await navigator.share(shareData)
        } catch (err) {
          console.log('Share canceled', err)
        }
      } else {
        // Fallback to clipboard
        try {
          await navigator.clipboard.writeText(this.trackingLink)
          alert('Tracking link copied to clipboard!')
        } catch (err) {
          console.error('Failed to copy', err)
          prompt('Copy this link:', this.trackingLink)
        }
      }
    }
  }
}
</script>

<style scoped>
.quick-intake-view {
  min-height: calc(100vh - 200px); /* Approx header/footer height */
  padding-top: 2rem;
  padding-bottom: 4rem;
  background-color: var(--slate-50);
}
.quick-intake-view.embedded {
  min-height: auto;
  padding: 1rem;
  background-color: transparent;
}

.loading-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255,255,255,0.9);
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.resume-banner {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1e40af;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: 600;
  font-size: 0.95rem;
}

/* Top Bar */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: white;
  border-radius: var(--radius-lg);
  border: 1px solid var(--slate-200);
}

.dispatch-id {
  display: flex;
  gap: 0.5rem;
  font-size: 0.9rem;
}
.dispatch-id .label { color: var(--slate-500); font-weight: 600; }
.dispatch-id .value { color: var(--slate-900); font-weight: 800; font-family: monospace; }

.status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--slate-700);
}
.status-dot {
  width: 8px; height: 8px;
  background-color: #22c55e;
  border-radius: 50%;
}
.status-dot.pulsing {
  box-shadow: 0 0 0 2px #bbf7d0;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.8; }
}

/* Progress */
.progress-track {
  height: 6px;
  background: var(--slate-200);
  border-radius: 3px;
  margin-bottom: 2rem;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: var(--blue-600);
  transition: width 0.4s ease;
}

/* Step Card */
.step-container {
  max-width: 600px;
  margin: 0 auto;
}

.step-card {
  background: white;
  padding: 2.5rem;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--slate-100);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Client Type Toggle */
.client-type-toggle {
  display: flex;
  background: var(--slate-100);
  padding: 4px;
  border-radius: var(--radius-lg);
  margin-bottom: 1.5rem;
}
.type-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  border: none;
  background: transparent;
  border-radius: var(--radius-md);
  color: var(--slate-600);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.type-btn.active {
  background: white;
  color: var(--blue-600);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}
.step-number {
  background: var(--slate-100);
  color: var(--slate-600);
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  font-weight: 700;
  font-size: 0.9rem;
}
.step-title {
  margin: 0;
  font-size: 1.5rem;
  color: var(--slate-900);
}
.step-subtitle {
  color: var(--slate-500);
  margin-bottom: 2rem;
  margin-left: 3rem; /* Align with title */
}

/* Inputs */
.input-group { margin-bottom: 1.5rem; }
.input-group label {
  display: block;
  font-weight: 600;
  color: var(--slate-700);
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}
.modern-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid var(--slate-300);
  border-radius: var(--radius-lg);
  font-size: 1rem;
  transition: all 0.2s;
}
.modern-input:focus {
  outline: none;
  border-color: var(--blue-600);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.location-btn {
  margin-top: 0.75rem;
  background: var(--slate-50);
  width: 100%;
  border: 1px dashed var(--slate-300);
  padding: 0.75rem;
  border-radius: var(--radius-lg);
  color: var(--slate-600);
  font-weight: 600;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
}
.location-btn:hover {
  background: var(--slate-100);
  border-color: var(--slate-400);
}

/* Auth Confirmation */
.auth-confirmation {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  margin-bottom: 24px;
}
.confirm-box {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
}
.confirm-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.confirm-row .icon {
  color: #64748b;
  font-size: 1.5rem;
}
.confirm-row .label {
  font-size: 0.75rem;
  color: #94a3b8;
  text-transform: uppercase;
  font-weight: 700;
}
.confirm-row .value {
  color: #0f172a;
  font-weight: 600;
  font-size: 1rem;
  margin: 0;
}
.auth-note {
  font-size: 0.85rem;
  color: #10b981;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  background: #dbeafe; /* Wait, using green for verified, blue bg? */
  background: #ecfdf5;
  padding: 8px 12px;
  border-radius: 8px;
}
.auth-note .material-symbols-rounded {
  font-size: 1.1rem;
}

/* Dropzone */
.dropzone {
  border: 2px dashed var(--slate-300);
  border-radius: var(--radius-xl);
  padding: 2rem;
  background: var(--slate-50);
  cursor: pointer;
  transition: all 0.2s;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.dropzone:hover {
  border-color: var(--blue-600);
  background: #eff6ff;
}
.dropzone-empty { text-align: center; color: var(--slate-500); }
.dropzone-empty .upload-icon { font-size: 3rem; margin-bottom: 0.5rem; color: var(--slate-400); }
.file-preview-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; width: 100%;
}
.file-preview {
  aspect-ratio: 1; border-radius: var(--radius-md); overflow: hidden; position: relative;
  border: 1px solid var(--slate-200);
}
.file-preview img { width: 100%; height: 100%; object-fit: cover; }
.remove-file {
  position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.6); color: white;
  border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;
  border: none; cursor: pointer;
}
.add-more {
  border: 2px dashed var(--slate-300); aspect-ratio: 1; border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center; color: var(--slate-400);
}

/* Priority Options */
.priority-grid { display: flex; flex-direction: column; gap: 1rem; }
.priority-option {
  border: 1px solid var(--slate-200);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
}
.priority-option:hover { border-color: var(--blue-600); }
.priority-option.selected {
  border-color: var(--blue-600);
  background: #eff6ff;
  box-shadow: 0 0 0 2px var(--blue-600) inset;
}
.option-header {
  display: flex; align-items: center; gap: 12px; margin-bottom: 0.75rem;
}
.option-header .icon { color: var(--blue-600); }
.option-header h3 { margin: 0; font-size: 1.1rem; color: var(--slate-900); }

.option-content {
  padding-left: 2.25rem;
  color: var(--slate-600);
  font-size: 0.9rem;
}
.time-est { font-weight: 700; color: var(--slate-800); }
.benefits { margin-top: 0.5rem; padding-left: 1rem; }

/* Success Step Enhancements */
.job-id-text {
  font-family: monospace;
  font-size: 1.1rem;
  letter-spacing: 1px;
  background: var(--slate-100);
  padding: 2px 6px;
  border-radius: 4px;
}

.link-item {
  flex-direction: column;
  align-items: flex-start !important;
  gap: 4px;
}

.tracking-url {
  font-size: 0.9rem;
  color: var(--blue-600);
  text-decoration: none;
  word-break: break-all;
}
.tracking-url:hover { text-decoration: underline; }

.vertical-actions {
  flex-direction: column;
  gap: 1rem;
}

.share-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
}

/* Payment */
.payment-section { margin-bottom: 2rem; }
.split-inputs { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.checkbox-wrapper { display: flex; gap: 12px; align-items: flex-start; cursor: pointer; }
.checkbox-text { font-size: 0.9rem; color: var(--slate-700); }
.small-print { font-size: 0.8rem; color: var(--slate-500); margin-top: 0.5rem; padding-left: 1.8rem; }

/* Actions */
.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--slate-100);
}

.primary-btn {
  background: var(--blue-600);
  color: white;
  border: none;
  padding: 0.875rem 2rem;
  border-radius: var(--radius-lg);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.primary-btn:hover:not(:disabled) { background: var(--blue-700); transform: translateY(-1px); }
.primary-btn:disabled { background: var(--slate-300); cursor: not-allowed; }

.secondary-btn {
  background: transparent;
  color: var(--slate-600);
  border: 1px solid var(--slate-300);
  padding: 0.875rem 1.5rem;
  border-radius: var(--radius-lg);
  font-weight: 600;
  cursor: pointer;
}
.secondary-btn:hover { background: var(--slate-50); color: var(--slate-900); }

/* Success */
.success-card { text-align: center; padding: 4rem 2rem; }
.success-icon {
  font-size: 4rem; color: #22c55e; margin-bottom: 1rem;
}
.success-card h2 { margin-bottom: 0.5rem; }
.eta-text { font-size: 1.25rem; font-weight: 700; color: var(--blue-600); margin-bottom: 2rem; }
.summary-list {
  background: var(--slate-50); padding: 1.5rem; border-radius: var(--radius-lg);
  text-align: left; display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 2rem;
}
.summary-item { display: flex; justify-content: space-between; font-size: 0.9rem; }
.sms-note { color: var(--slate-500); font-size: 0.9rem; }

/* Issue Grid Styles */
.issue-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  margin-bottom: 2rem;
}

.issue-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: var(--slate-50);
  border: 2px solid var(--slate-200);
  border-radius: var(--radius-lg);
  padding: 1.5rem 1rem;
  cursor: pointer;
  transition: all 0.2s;
  height: 120px;
}

.issue-card:hover {
  border-color: var(--blue-400);
  background: #eff6ff;
}

.issue-card.selected {
  border-color: var(--blue-600);
  background: var(--blue-50);
  color: var(--blue-700);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
}

.issue-icon { font-size: 2rem; color: var(--slate-400); }
.issue-card.selected .issue-icon { color: var(--blue-600); }
.issue-label { font-size: 0.9rem; font-weight: 600; text-align: center; }

/* Large Dropzone for Step 3 */
.dropzone-content-large {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  color: var(--slate-500);
}
.dropzone-content-large .upload-icon {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  color: var(--slate-400);
}
.dropzone.has-files {
  padding: 1rem;
}
.file-preview-grid {
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); 
  gap: 12px; 
  width: 100%;
}
.video-preview {
  width: 100%; height: 100%; background: #000; display: flex; align-items: center; justify-content: center; color: white;
}

/* Commercial Billing Options */
.billing-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 1.5rem;
}
.radio-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 1rem;
  border: 1px solid var(--slate-200);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s;
}
.radio-card input { display: none; }
.radio-card:hover { border-color: var(--blue-400); background: #f8fafc; }
.radio-card.selected {
  border-color: var(--blue-600);
  background: #eff6ff;
  color: var(--blue-700);
}
</style>
