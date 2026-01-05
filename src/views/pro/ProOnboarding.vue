<template>
  <div class="min-h-screen bg-slate-50 flex justify-center py-10 px-5">
    <!-- Focused Wizard Layout -->
    <div class="w-full max-w-3xl bg-white rounded-3xl shadow-xl p-10 border border-slate-200">
      
      <!-- Premium Header -->
      <header class="flex justify-between items-start mb-10">
        <div class="header-content">
          <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Pro Partner Setup</h1>
          <p class="text-slate-500 text-lg">Complete your profile to start accepting jobs.</p>
        </div>
        <div class="flex flex-col items-end gap-3">
           <span v-if="lastSaved" class="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">Saved {{ lastSaved }}</span>
           <div class="flex gap-3">
             <button @click="finishLater" class="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 hover:text-slate-900 transition-colors">Finish Later</button>
             <button @click="saveProgress" class="px-5 py-2.5 rounded-lg bg-slate-800 text-white font-bold hover:bg-slate-900 hover:-translate-y-px transition-all shadow-sm">Save Draft</button>
           </div>
        </div>
      </header>
 
      <!-- Progressive Wizard Steps -->
      <div class="mb-10">
         <div class="flex justify-between mb-3 items-end">
            <h2 class="text-xl font-bold text-slate-900">{{ activeStep.label }}</h2>
            <span class="text-sm font-bold text-blue-600 uppercase tracking-wide">Step {{ currentStepIndex + 1 }} of {{ steps.length }}</span>
         </div>
         <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
           <div class="h-full bg-blue-600 transition-all duration-500 ease-out" :style="{ width: overallProgress + '%' }"></div>
         </div>
      </div>

      <div class="bg-white rounded-2xl p-0 min-h-[480px]">
        
        <!-- Tab 1: Profile -->
        <div v-if="activeTab === 'profile'" class="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h2 class="text-2xl font-bold text-slate-900 mb-2">Business Profile</h2>
          <p class="text-slate-500 text-base mb-8">Your public professional identity.</p>
          
          <div class="grid grid-cols-2 gap-6 mb-6">
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-slate-500">Full Name</label>
              <!-- Enforced Proper Case -->
              <input type="text" v-model="formattedFullName" class="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all" placeholder="John Doe" />
            </div>
            
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-slate-500">Business Name (DBA)</label>
              <input type="text" v-model="form.businessName" class="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all" placeholder="JD Doors LLC" />
            </div>
          </div>
          
          <div class="space-y-2 mb-6">
            <label class="block text-sm font-semibold text-slate-500">Business Address</label>
            <LocationInput
              v-model="form.businessAddress"
              placeholder="123 Main St, Boston, MA"
              :api-key="mapsApiKey"
            />
          </div>

          <div class="space-y-2 mb-8">
            <label class="block text-sm font-semibold text-slate-500">Email Address</label>
            <!-- Enforced Lowercase -->
            <input type="email" v-model="formattedEmail" class="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all" placeholder="john@example.com" />
          </div>

          <div class="flex justify-end pt-4">
            <button @click="validateAndProceed('profile')" class="px-7 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 hover:-translate-y-0.5 shadow-lg shadow-blue-600/20 transition-all">
              Next: Skills
            </button>
          </div>
        </div>

        <!-- Tab 1b: Skills (NEW) -->
        <div v-if="activeTab === 'skills'" class="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h2 class="text-2xl font-bold text-slate-900 mb-2">Skills & Logistics</h2>
          <p class="text-slate-500 text-base mb-8">Define your capabilities and operational range.</p>
          
          <div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-8 mb-8">
            <div class="space-y-4">
               <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Residential</h3>
               <div class="flex flex-col gap-3">
                 <label v-for="s in skillOptions.residential" :key="s" class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors text-slate-700 font-medium text-sm">
                   <input type="checkbox" :value="s" v-model="form.skills" class="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" /> {{ s }}
                 </label>
               </div>
            </div>

            <div class="space-y-4">
               <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Commercial</h3>
               <div class="flex flex-col gap-3">
                 <label v-for="s in skillOptions.commercial" :key="s" class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors text-slate-700 font-medium text-sm">
                   <input type="checkbox" :value="s" v-model="form.skills" class="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" /> {{ s }}
                 </label>
               </div>
            </div>

            <div class="space-y-4">
               <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Vertical Transport</h3>
               <div class="flex flex-col gap-3">
                 <label v-for="s in skillOptions.vertical" :key="s" class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors text-slate-700 font-medium text-sm">
                   <input type="checkbox" :value="s" v-model="form.skills" class="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" /> {{ s }}
                 </label>
               </div>
            </div>

            <div class="space-y-4">
               <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Specialized</h3>
               <div class="flex flex-col gap-3">
                 <label v-for="s in skillOptions.specialized" :key="s" class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors text-slate-700 font-medium text-sm">
                   <input type="checkbox" :value="s" v-model="form.skills" class="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" /> {{ s }}
                 </label>
               </div>
            </div>
          </div>

          <div class="mt-8 mb-8">
             <h3 class="text-sm font-bold text-slate-500 mb-4">Service Area</h3>
             <ServiceRadiusSelector 
               v-model="form.serviceRadius"
               :address="form.businessAddress"
               :api-key="mapsApiKey"
             />
          </div>

          <div class="flex justify-between items-center pt-4 border-t border-slate-100">
            <button @click="activeTab = 'profile'" class="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 hover:text-slate-900 transition-colors">Back</button>
            <button @click="validateAndProceed('skills')" class="px-7 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 hover:-translate-y-0.5 shadow-lg shadow-blue-600/20 transition-all">
              Next: Resources & Verification
            </button>
          </div>
        </div>

        <!-- Tab 2: Verification (Updated) -->
        <div v-if="activeTab === 'verification'" class="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h2 class="text-2xl font-bold text-slate-900 mb-2">Resources & Documents</h2>
          <p class="text-slate-500 text-base mb-8">Verify your compliance and equipment availability.</p>
          
          <div class="space-y-6 mb-8">
             <!-- Vehicle Check -->
             <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
               <div class="flex justify-between items-center">
                 <div class="flex items-center gap-4">
                   <span class="material-symbols-rounded text-slate-400 text-3xl bg-slate-50 p-2 rounded-lg">local_shipping</span>
                   <div>
                     <h3 class="font-bold text-slate-900 text-lg">Work Vehicle</h3>
                     <p class="text-slate-500 text-sm">Do you have a reliable vehicle for jobs?</p>
                   </div>
                 </div>
                 <label class="relative inline-flex items-center cursor-pointer">
                   <input type="checkbox" v-model="form.hasVehicle" class="sr-only peer" />
                   <div class="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                 </label>
               </div>
             </div>

             <!-- Hourly Rate Preference -->
             <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
               <div class="flex justify-between items-center">
                 <div class="flex items-center gap-4">
                   <span class="material-symbols-rounded text-slate-400 text-3xl bg-slate-50 p-2 rounded-lg">payments</span>
                   <div>
                     <h3 class="font-bold text-slate-900 text-lg">Preferred Hourly Rate</h3>
                     <p class="text-slate-400 text-xs italic">Informational purposes only. Actual rates may vary by job.</p>
                   </div>
                 </div>
                 <div class="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 focus-within:bg-white transition-all">
                    <span class="text-slate-400 font-bold">$</span>
                    <input type="number" v-model="form.preferredRate" placeholder="0.00" class="w-20 bg-transparent border-none text-right font-bold text-slate-900 focus:outline-none" />
                    <span class="text-slate-400 font-semibold text-sm">/hr</span>
                 </div>
               </div>
             </div>

             <!-- Tool Checklist -->
             <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 class="font-bold text-slate-900 text-lg mb-2">Tool Checklist</h3>
                <p class="text-slate-500 text-sm mb-4">Please confirm you have the following essential tools:</p>
                <div class="grid grid-cols-2 gap-4">
                  <label v-for="tool in toolOptions" :key="tool.id" class="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors">
                    <input type="checkbox" v-model="form.tools" :value="tool.id" class="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <span class="text-slate-700 font-medium">{{ tool.label }}</span>
                  </label>
                </div>
             </div>
          </div>

          <div class="mt-8 mb-8">
            <!-- License Upload (Front & Back) -->
            <div class="mb-8">
               <h3 class="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wide">Driver's License (Required)</h3>
               
               <div class="mb-4">
                  <label class="block text-sm font-semibold text-slate-500 mb-1">License Number</label>
                  <input type="text" v-model="form.licenseNumber" class="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase font-mono tracking-wide" placeholder="D1234567" />
               </div>

               <div class="grid grid-cols-2 gap-6">
                 <!-- Front -->
                 <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-slate-500">Front</label>
                  <div class="relative w-full aspect-[1.586] bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl hover:bg-blue-50 hover:border-blue-300 overflow-hidden cursor-pointer transition-colors group">
                    <input type="file" @change="handleFileUpload('licenseFront', $event)" accept="image/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div class="absolute inset-0 flex flex-col items-center justify-center p-4 text-center pointer-events-none">
                      <div v-if="uploadStatus.licenseFront === 'uploading'" class="w-8 h-8 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin"></div>
                      <div v-else-if="previews.licenseFront" class="w-full h-full">
                         <img :src="previews.licenseFront" alt="Front Preview" class="w-full h-full object-cover rounded-lg" />
                      </div>
                      <span v-else class="text-slate-400 font-medium group-hover:text-blue-500 transition-colors">Tap to Upload Front</span>
                    </div>
                  </div>
                 </div>
                 <!-- Back -->
                 <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-slate-500">Back</label>
                  <div class="relative w-full aspect-[1.586] bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl hover:bg-blue-50 hover:border-blue-300 overflow-hidden cursor-pointer transition-colors group">
                    <input type="file" @change="handleFileUpload('licenseBack', $event)" accept="image/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div class="absolute inset-0 flex flex-col items-center justify-center p-4 text-center pointer-events-none">
                      <div v-if="uploadStatus.licenseBack === 'uploading'" class="w-8 h-8 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin"></div>
                      <div v-else-if="previews.licenseBack" class="w-full h-full">
                         <img :src="previews.licenseBack" alt="Back Preview" class="w-full h-full object-cover rounded-lg" />
                      </div>
                      <span v-else class="text-slate-400 font-medium group-hover:text-blue-500 transition-colors">Tap to Upload Back</span>
                    </div>
                  </div>
                 </div>
               </div>
            </div>

            <!-- Insurance Upload (Optional) -->
            <div>
              <label class="flex items-center gap-2 text-sm font-semibold text-slate-500 mb-2">
                Insurance (COI) <span class="text-xs font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded ml-1">Optional</span>
              </label>
              <div class="relative w-full h-32 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl hover:bg-blue-50 hover:border-blue-300 overflow-hidden cursor-pointer transition-colors group">
                 <input type="file" @change="handleFileUpload('insurance', $event)" accept="image/*,.pdf" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <div class="absolute inset-0 flex flex-col items-center justify-center p-4 text-center pointer-events-none">
                  <div v-if="uploadStatus.insurance === 'uploading'" class="w-8 h-8 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin"></div>
                   <div v-else-if="previews.insurance" class="w-full h-full flex items-center justify-center">
                       <img v-if="!isPdf(previews.insurance)" :src="previews.insurance" alt="COI Preview" class="h-full object-contain rounded-lg" />
                       <span v-else class="material-symbols-rounded text-5xl text-red-500">picture_as_pdf</span>
                   </div>
                  <span v-else class="text-slate-400 font-medium group-hover:text-blue-500 transition-colors">Tap to Upload Document</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="flex justify-between items-center pt-4 border-t border-slate-100">
             <button @click="activeTab = 'skills'" class="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 hover:text-slate-900 transition-colors">Back</button>
             <button @click="validateAndProceed('verification')" class="px-7 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 hover:-translate-y-0.5 shadow-lg shadow-blue-600/20 transition-all">
              Next: Agreements
            </button>
          </div>
        </div>

        <!-- Tab 3: Agreements -->
        <div v-if="activeTab === 'agreements'" class="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h2 class="text-2xl font-bold text-slate-900 mb-2">{{ isEditMode ? 'Save Changes' : 'Final Review' }}</h2>
          
          <div v-if="!isEditMode" class="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-6 max-h-[400px] overflow-y-auto">
             <div class="mb-6">
               <h3 class="text-sm font-bold text-slate-900 uppercase tracking-widest mb-2 border-b border-slate-200 pb-1">Non-Solicitation & Conduct</h3>
               <p class="text-sm text-slate-600 leading-relaxed mb-1">I agree not to solicit Rollwise clients for off-platform work. Violation results in immediate termination and a $5,000 fine per occurrence.</p>
               <router-link to="/legal/non-solicitation" target="_blank" class="text-xs text-blue-600 hover:underline font-medium">Read Full Agreement</router-link>
             </div>
             
             <div class="mb-6">
               <h3 class="text-sm font-bold text-slate-900 uppercase tracking-widest mb-2 border-b border-slate-200 pb-1">Liability Waiver & Indemnification</h3>
               <p class="text-sm text-slate-600 leading-relaxed mb-1">
                 I acknowledge that I am an independent contractor. I agree to indemnify Rollwise from all claims arising from my work. Rollwise connects Pros with Clients and accepts no liability for job outcomes.
               </p>
               <router-link to="/legal/waiver" target="_blank" class="text-xs text-blue-600 hover:underline font-medium">Read Full Waiver</router-link>
             </div>

             <div>
               <h3 class="text-sm font-bold text-slate-900 uppercase tracking-widest mb-2 border-b border-slate-200 pb-1">Document Verification</h3>
               <p class="text-sm text-slate-600 leading-relaxed">I confirm all uploaded documents (License, Insurance) are authentic, valid, and currently active.</p>
             </div>
          </div>

          <div v-if="!isEditMode" class="mb-8 p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-500 transition-colors cursor-pointer group">
            <label class="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" v-model="form.agreedToTerms" class="mt-1 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              <span class="text-slate-700 text-sm leading-relaxed group-hover:text-slate-900">
                I have read and agree to the 
                <router-link to="/legal/terms" target="_blank" class="text-blue-600 font-bold hover:underline">Terms of Service</router-link>, 
                <router-link to="/legal/waiver" target="_blank" class="text-blue-600 font-bold hover:underline">Liability Waiver</router-link>, and 
                <router-link to="/legal/non-solicitation" target="_blank" class="text-blue-600 font-bold hover:underline">Non-Solicitation Agreement</router-link>.
              </span>
            </label>
          </div>

          <div class="mt-8">
            <div class="flex justify-between items-center pt-4 border-t border-slate-100">
               <button @click="activeTab = 'verification'" class="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 hover:text-slate-900 transition-colors">Back</button>
               <button 
                  @click="submitApplication" 
                  class="px-8 py-3.5 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 hover:-translate-y-0.5 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
                >
                  <span class="material-symbols-rounded font-bold text-xl">{{ isEditMode ? 'save' : 'check_circle' }}</span>
                  {{ isEditMode ? 'Update Profile' : 'Submit Application' }}
                </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
// Logic updates
import { useAuthStore } from '@/stores/authStore'
import { userRepository } from '@/firebase/userRepository'
import { storageRepository } from '@/firebase/storageRepository'
import ServiceRadiusSelector from '@/components/common/ServiceRadiusSelector.vue'
import LocationInput from '@/components/common/LocationInput.vue'

// Ajv Validation
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import addErrors from 'ajv-errors'
import { proOnboardingSchema } from '@/schemas/proOnboardingSchema'

const ajv = new Ajv({ allErrors: true })
addFormats(ajv)
addErrors(ajv)
const validate = ajv.compile(proOnboardingSchema)

export default {
  name: 'ProOnboarding',
  components: { ServiceRadiusSelector, LocationInput },
  data() {
    return {
      activeTab: 'profile', // profile, skills, verification, agreements
      isSubmitting: false,
      steps: [
        { id: 'profile', label: 'Business Profile' },
        { id: 'skills', label: 'Skills & Logistics' },
        { id: 'verification', label: 'Docs & Resources' },
        { id: 'agreements', label: 'Final Review' }
      ],
      form: {
        fullName: '',
        businessName: '',
        businessAddress: '',
        email: '',
        skills: [],
        serviceRadius: 25,
        // Resources
        hasVehicle: true,
        preferredRate: '',
        tools: [],
        preferredRate: '',
        tools: [],
        // Docs
        licenseNumber: '',
        licenseFrontKey: null,
        licenseBackKey: null, 
        insuranceKey: null,
        agreedToTerms: false
      },
      previews: {
        licenseFront: null,
        licenseBack: null,
        insurance: null
      },
      uploadStatus: {
        licenseFront: 'idle',
        licenseBack: 'idle',
        insurance: 'idle'
      },
      mapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
      lastSaved: null,
      skillOptions: {
        residential: ['Garage Door Install', 'Spring Replacement', 'Opener Repair', 'Cable Fix', 'Panel Swap'],
        commercial: ['Rolling Steel Doors', 'Dock Levelers', 'High Speed Doors', 'Fire Doors'],
        vertical: ['Freight Elevators', 'Dumbwaiters', 'VRC Lifts'],
        specialized: ['Access Control', 'Gate Operators', 'Low Voltage Wiring']
      },
      // New Tool Checklist
      toolOptions: [
        { id: 'impact_driver', label: 'Impact Driver' },
        { id: 'winding_bars', label: 'Winding Bars' },
        { id: 'ladder_6ft', label: '6ft+ Ladder' },
        { id: 'socket_set', label: 'Socket Set' },
        { id: 'vice_grips', label: 'Vice Grips' },
        { id: 'level', label: 'Level' },
        { id: 'hammer', label: 'Hammer' },
        { id: 'multimeter', label: 'Multimeter' }
      ]
    }
  },
  setup() {
    const authStore = useAuthStore()
    return { authStore, userRepository }
  },
  computed: {
    isEditMode() {
      return this.$route.query.mode === 'edit'
    },
    // Computed Setter for Proper Case Name
    formattedFullName: {
       get() { return this.form.fullName },
       set(val) {
          // Simple Proper Case Logic
          this.form.fullName = val.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
       }
    },
    // Computed Setter for Lowercase Email
    formattedEmail: {
       get() { return this.form.email },
       set(val) {
          this.form.email = val.toLowerCase();
       }
    },
    currentStepIndex() {
      return this.steps.findIndex(s => s.id === this.activeTab)
    },
    activeStep() {
      return this.steps[this.currentStepIndex]
    },
    overallProgress() {
      return ((this.currentStepIndex) / (this.steps.length - 1)) * 100
    },
    // Kept helper for UI state (button disabled visual only), but logic relies on Schema
    isFullyComplete() {
      // Basic check for visual feedback if needed, but we rely on validate() on click
      return validate(this.form)
    }
  },
  async mounted() {
    if (this.authStore.isAuthenticated) {
      await this.loadExistingProfile()
    }
  },
  watch: {
    'authStore.isAuthenticated': {
      handler(isAuth) {
        if (isAuth) {
           this.loadExistingProfile()
        }
      },
      immediate: true 
    }
  },
  methods: {
    // Map schema fields to tabs for error navigation
    getTabForError(dataPath, params) {
      // dataPath is like "/fullName" OR params.missingProperty is "fullName"
      const property = dataPath ? dataPath.replace('/', '') : params.missingProperty;
      
      const map = {
        fullName: 'profile',
        businessName: 'profile',
        businessAddress: 'profile',
        email: 'profile',
        
        skills: 'skills',
        serviceRadius: 'skills',
        
        licenseFrontKey: 'verification',
        licenseBackKey: 'verification',
        hasVehicle: 'verification',
        tools: 'verification',
        
        agreedToTerms: 'agreements'
      };
      
      return map[property] || 'profile'; 
    },

    validateAndProceed(step) {
      // Partial validation for stepping forward
      // We run the FULL validation, then filter errors relevant to the CURRENT step
      const valid = validate(this.form);
      
      if (!valid) {
        // Collect errors for the current step
        const stepFields = {
          'profile': ['fullName', 'businessName', 'businessAddress', 'email'],
          'skills': ['skills', 'serviceRadius'],
          'profile': ['fullName', 'businessName', 'businessAddress', 'email'],
          'skills': ['skills', 'serviceRadius'],
          'verification': ['licenseNumber', 'licenseFrontKey', 'licenseBackKey'] // minimal required
        }[step] || [];

        const relevantErrors = validate.errors.filter(err => {
             const Prop = err.instancePath.replace('/', '') || err.params.missingProperty;
             return stepFields.includes(Prop);
        });

        if (relevantErrors.length > 0) {
          // Unique error messages
          const messages = [...new Set(relevantErrors.map(e => e.message))];
          alert('Please correct the following:\n\n- ' + messages.join('\n- '));
          return;
        }
      }

      // Progression Logic
      if (step === 'profile') this.activeTab = 'skills';
      else if (step === 'skills') this.activeTab = 'verification';
      else if (step === 'verification') this.activeTab = 'agreements';
      
      this.saveProgress(true); 
    },

    async loadExistingProfile() {
      // Small delay to ensure store population
      if (!this.authStore.userPhone) return
      
      try {
        const userRecord = await userRepository.getByPhone(this.authStore.userPhone)
        
        // Data is nested in roles.pro.application, not on the root profile
        const proData = userRecord?.roles?.pro
        
        if (proData && proData.application) {
          // Merge saved application data
          this.form = { ...this.form, ...proData.application }
          
          // Populate previews from saved keys
          if (this.form.licenseFrontKey) this.previews.licenseFront = this.form.licenseFrontKey
          if (this.form.licenseBackKey) this.previews.licenseBack = this.form.licenseBackKey
          if (this.form.insuranceKey) this.previews.insurance = this.form.insuranceKey

          // If editing, assume terms accepted previously
          if (this.isEditMode) this.form.agreedToTerms = true
        }
      } catch (e) {
        console.error('Failed to load profile', e)
      }
    },
    isPdf(url) {
      return url && url.toLowerCase().includes('.pdf')
    },
    async handleFileUpload(type, event) {
      const file = event.target.files[0]
      if (!file) return

      // Create local preview immediately
      if (file.type.startsWith('image/')) {
        this.previews[type] = URL.createObjectURL(file)
      } else {
        this.previews[type] = null 
      }

      this.uploadStatus[type] = 'uploading'
      
      try {
        const userId = this.authStore.userPhone ? this.authStore.userPhone.replace(/\D/g, '') : 'unknown'
        const path = `pro_docs/${userId}/${type}_${Date.now()}`
        const result = await storageRepository.uploadFile(file, path)
        
        // Save the key/url to form
        const keyMap = {
           'licenseFront': 'licenseFrontKey',
           'licenseBack': 'licenseBackKey',
           'insurance': 'insuranceKey'
        }
        this.form[keyMap[type]] = result 
        
        this.uploadStatus[type] = 'done'
      } catch (error) {
        console.error('Upload failed', error)
        this.uploadStatus[type] = 'error'
        alert('Upload failed: ' + error.message)
      }
    },
    async saveProgress(silent = false) {
      if (!this.authStore.userPhone) return
      try {
        await userRepository.updateRole(this.authStore.userPhone, 'pro', {
          application: { ...this.form, updatedAt: Date.now() },
          // Don't change status in saveProgress if editing
          ...(this.isEditMode ? {} : { status: 'onboarding' })
        })
        this.lastSaved = new Date().toLocaleTimeString()
        if (!silent) alert('Draft saved successfully!')
      } catch (e) {
        console.error('Save failed', e)
        if (!silent) alert('Failed to save draft.')
      }
    },
    async finishLater() {
      await this.saveProgress(true) // silent save
      this.$router.push('/pro/home')
    },
    async submitApplication() {
      const isValid = validate(this.form)
      
      if (!isValid && validate.errors && validate.errors.length > 0) {
         const firstError = validate.errors[0];
         // Determine which tab to jump to
         const targetTab = this.getTabForError(firstError.instancePath, firstError.params);
         
         this.activeTab = targetTab;
         
         requestAnimationFrame(() => {
             // Optional: highlight field logic here
             alert(`Validation Error: ${firstError.message}`);
         });
         return;
      }

      // Submission Logic
      try {
        if (this.isEditMode) {
          // Update without changing status
           await userRepository.updateRole(this.authStore.userPhone, 'pro', {
              application: { ...this.form, updatedAt: Date.now() }
           })
           alert('Profile updated successfully!')
        } else {
           // Use authStore action which handles the full submission logic (sets pending)
           await this.authStore.submitProApplication(this.form)
        }
        
        // Force refresh session/user data
        await this.authStore.restoreSession()
        
        this.$router.push('/pro/home')
      } catch (e) {
        console.error('Submission failed', e)
        alert('Failed to submit application. Please try again.')
      }
    }
  }
}
</script>

<style scoped>
.onboarding-container {
  min-height: 100vh;
  background: var(--bg-color);
  display: flex;
  justify-content: center;
  padding: 40px 20px;
}

.onboarding-main {
  width: 100%;
  max-width: 800px;
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.05);
  padding: 40px;
  border: 1px solid var(--border-color);
}

.onboarding-premium-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 40px;
}

.premium-title {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.premium-subtitle {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

/* Stepper */
.wizard-stepper {
  margin-bottom: 40px;
}

.stepper-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.step-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--blue-600);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.progress-track {
  height: 8px;
  background: var(--bg-muted);
  border-radius: 999px;
  overflow: hidden;
}

.progress-thumb {
  height: 100%;
  background: var(--blue-600);
  transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Wizard Pane */
.wizard-pane {
  background: var(--bg-surface);
  border-radius: var(--radius-xl);
  padding: 40px;
  border: 1px solid var(--border-primary);
  box-shadow: var(--card-shadow);
  min-height: 480px;
}

.tab-pane h2 {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.tab-desc {
  color: var(--text-secondary);
  font-size: 1rem;
  margin-bottom: 32px;
}

/* Form Styles */
.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.uber-input {
  width: 100%;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  background: var(--bg-muted);
  border: 1px solid var(--border-primary);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.2s ease;
}

.uber-input:focus {
  outline: none;
  border-color: var(--blue-600);
  background: var(--bg-surface);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

/* Skills Grid */
.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 32px;
}

.skill-category h3 {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-muted);
}

.checklist {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checklist label {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-primary);
  font-weight: 500;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  background: var(--bg-muted);
  transition: all 0.2s;
}

.checklist label:hover {
  background: var(--border-muted);
}

.checklist input[type="checkbox"] {
  width: 20px;
  height: 20px;
  accent-color: var(--blue-600);
}

/* Action Buttons */
.btn-slate {
  background: var(--text-primary);
  color: var(--bg-primary);
  border: none;
  padding: 10px 20px;
  border-radius: var(--radius-md);
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s, opacity 0.2s;
}

.btn-slate:hover { transform: translateY(-1px); opacity: 0.9; }

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-primary);
  padding: 10px 20px;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-ghost:hover {
  background: var(--bg-muted);
  color: var(--text-primary);
}

.uber-button.primary {
  background: var(--blue-600);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: var(--radius-lg);
  font-weight: 700;
  font-size: 1.125rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.2);
}

.uber-button.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.3);
  background: var(--blue-700);
}

.nav-row {
  margin-top: 40px;
  display: flex;
  justify-content: flex-end;
}

/* Animations */
.fade-in {
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .onboarding-premium-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .header-actions {
    align-items: flex-start;
    width: 100%;
  }
  .btn-group {
    width: 100%;
  }
  .btn-group button {
    flex: 1;
  }
  .grid-2 {
    grid-template-columns: 1fr;
  }
  .wizard-pane {
    padding: 24px;
  }
}

/* Resources & Document Styles */
.resources-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.resource-card {
  background: var(--bg-muted);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: 20px;
  transition: all 0.2s;
}

.resource-card:hover {
  background: white;
  border-color: var(--blue-600);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.flex-row-center {
  display: flex;
  align-items: center;
  gap: 16px;
}

.resource-card .icon {
  font-size: 2rem;
  color: var(--blue-600);
  padding: 12px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.resource-card .text {
  flex: 1;
}

.resource-card h3 {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.resource-card p {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.toggle-switch {
  position: relative;
  width: 52px;
  height: 28px;
  flex-shrink: 0;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: var(--border-primary);
  transition: .4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

input:checked + .slider {
  background-color: var(--blue-600);
}

input:checked + .slider:before {
  transform: translateX(24px);
}

.rate-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--border-primary);
}

.rate-input {
  width: 80px;
  border: none;
  font-size: 1rem;
  font-weight: 700;
  text-align: right;
  outline: none;
}

/* Uploads */
.uploads-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.upload-group h3 {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.upload-card {
  position: relative;
}

.upload-card label {
  display: block;
  font-weight: 600;
  font-size: 0.85rem;
  margin-bottom: 8px;
  color: var(--text-secondary);
}

.optional-badge {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 400;
  background: var(--bg-muted);
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
}

.file-input-wrapper {
  position: relative;
  height: 120px;
  background: var(--bg-muted);
  border: 2px dashed var(--border-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all 0.2s;
  cursor: pointer;
}

.file-input-wrapper:hover {
  border-color: var(--blue-600);
  background: rgba(37, 99, 235, 0.02);
}

.file-input-wrapper input[type="file"] {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  cursor: pointer;
}

.file-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 500;
  pointer-events: none;
}

.preview-container {
  width: 100%;
  height: 100%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-container img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid var(--border-primary);
  border-top-color: var(--blue-600);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Legal Section Styles */
.legal-box {
  background: var(--bg-muted);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: 24px;
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 24px;
}

.legal-section {
  margin-bottom: 24px;
}

.legal-section:last-child {
  margin-bottom: 0;
}

.legal-section h3 {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.legal-section p {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.checkbox-group {
  margin-bottom: 32px;
  background: white;
  border: 1px solid var(--border-primary);
  padding: 16px;
  border-radius: var(--radius-lg);
  transition: border-color 0.2s;
}

.checkbox-group:hover {
  border-color: var(--blue-600);
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  font-size: 0.95rem;
  color: var(--text-primary);
  line-height: 1.5;
}

.checkbox-label input[type="checkbox"] {
  margin-top: 4px;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  accent-color: var(--blue-600);
}

.checkbox-label strong {
  color: var(--blue-600);
}

.submit-section .nav-row {
  align-items: center;
}

.submit-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #10b981; /* Emerald 500 */
}

.submit-btn:disabled {
  background: var(--bg-muted);
  color: var(--text-muted);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

</style>
```
