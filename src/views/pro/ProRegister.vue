<template>
  <div class="register-container">
    <div class="register-card">
       
       <!-- Step 1: Form -->
        <div v-if="step === 1">
          <div class="header-section">
             <h1 class="title">Join the Rollwise Pro Fleet</h1>
             <p class="subtitle">Enter your mobile number to get started.</p>
          </div>

          <div class="form-section">
            <div class="input-group">
               <label>Mobile Number</label>
               <div class="phone-input-row">
                 <input 
                  v-model="form.phone" 
                  type="tel" 
                  class="uber-input" 
                  placeholder="(555) 000-0000" 
                  @input="formatPhone" 
                  @blur="checkExistingLead"
                  maxlength="14" 
                />
                <button v-if="!isLeadChecked && form.phone.length >= 14" @click="checkExistingLead" class="check-btn">
                  <span v-if="isLoading" class="spinner-small"></span>
                  <span v-else>Check</span>
                </button>
               </div>
            </div>

            <!-- Form Fields (reveal on check) -->
            <transition name="expand">
              <div v-if="isLeadChecked" class="form-reveal">
                
                <!-- Existing User Banner -->
                <div v-if="userAlreadyExists" class="already-exists-banner fade-in">
                  <span class="material-symbols-rounded">waving_hand</span>
                  <div class="banner-text">
                    <p><strong>Welcome back!</strong> This phone number is already registered.</p>
                    <button @click="proceedToLogin" class="text-link">Login to your portal →</button>
                  </div>
                </div>

                <div class="input-group">
                  <label>Full Name</label>
                  <input v-model="form.fullName" type="text" class="uber-input" placeholder="Enter your full name" />
                </div>
                
                <div class="input-group">
                  <label>Email Address</label>
                  <input v-model="form.email" type="email" class="uber-input" placeholder="partner@example.com" />
                </div>

                <div class="requirements-box">
                  <h3 class="req-title">Requirements & Assurances</h3>
                  
                  <label class="checkbox-row">
                    <input type="checkbox" v-model="checks.identify" />
                    <span class="text">
                      I agree to <strong>identify as a Rollwise Pro</strong> when servicing clients assigned through the platform.
                    </span>
                  </label>

                  <label class="checkbox-row">
                    <input type="checkbox" v-model="checks.insurance" />
                    <span class="text">
                      I confirm that I carry (or will obtain) <strong>General Liability Insurance</strong> with a minimum of $1,000,000 coverage.
                    </span>
                  </label>

                  <label class="checkbox-row">
                    <input type="checkbox" v-model="checks.residency" />
                    <span class="text">
                      I hold a valid Driver's License and I am a resident of <strong>MA, RI, NH, or CT</strong>.
                    </span>
                  </label>
                </div>

                <button 
                  @click="handleContinue" 
                  :disabled="!isValid"
                  class="uber-button primary full-width"
                >
                  {{ hasLead ? 'Continue Onboarding' : 'Start Verification' }}
                </button>
              </div>
            </transition>
            
            <p class="login-link">
               Already a partner? <router-link to="/pro/login">Log in here</router-link>
            </p>
          </div>
        </div>

       <!-- Step 2: Success / Instructions -->
       <div v-else class="success-step fade-in">
          <div class="success-icon">
            <span class="material-symbols-rounded">verified</span>
          </div>
          <h2>You're Eligible!</h2>
           <p class="success-desc">
            We've received your basic details. To securely finalize your profile and access the Pro Dashboard, please verify your mobile number.
          </p>
          
          <div class="next-steps">
             <div class="step-item">
               <span class="num">1</span>
               <span>Secure Verification (OTP)</span>
             </div>
             <div class="step-item">
               <span class="num">2</span>
               <span>Skills & Service Area</span>
             </div>
             <div class="step-item">
               <span class="num">3</span>
               <span>Compliance Verification</span>
             </div>
          </div>

          <button @click="proceedToLogin" class="uber-button primary full-width">
             Securely Verify & Continue
          </button>
       </div>

    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/authStore'

export default {
  name: 'ProRegister',
  data() {
    return {
      isLoading: false,
      isLeadChecked: false,
      hasLead: false,
      userAlreadyExists: false,
      step: 1,
      form: {
        fullName: '',
        email: '',
        phone: ''
      },
      checks: {
        identify: false,
        insurance: false,
        residency: false
      }
    }
  },
  computed: {
    isValid() {
       return this.form.fullName && 
              this.form.email && 
              this.form.phone && 
              this.checks.identify && 
              this.checks.insurance && 
              this.checks.residency
    }
  },
  methods: {
    async checkExistingLead() {
      if (this.form.phone.length < 14 || this.isLoading) return
      
      this.isLoading = true
      const authStore = useAuthStore()
      try {
        const result = await authStore.fetchProLead(this.form.phone)
        
        if (result?.userExists) {
          this.userAlreadyExists = true
        }

        if (result?.lead) {
          const lead = result.lead
          this.form.fullName = lead.fullName || ''
          this.form.email = lead.email || ''
          this.checks.identify = lead.identify || false
          this.checks.insurance = lead.insurance || false
          this.checks.residency = lead.residency || false
          this.hasLead = true
        }
        this.isLeadChecked = true
      } catch (e) {
        console.error(e)
        this.isLeadChecked = true 
      } finally {
        this.isLoading = false
      }
    },
    formatPhone(e) {
      let x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/)
      this.form.phone = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '')
      if (this.isLeadChecked && this.form.phone.length < 14) {
        this.isLeadChecked = false
        this.hasLead = false
        this.userAlreadyExists = false
      }
    },
    async handleContinue() {
       const authStore = useAuthStore()
       // Store data for onboarding pre-fill and persist lead
       await authStore.submitProLead({
          ...this.form,
          ...this.checks
       })
       this.step = 2
    },
    proceedToLogin() {
       this.$router.push({ name: 'pro-login', query: { phone: this.form.phone } })
    }
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #0f172a; /* Slate 900 */
  padding: 20px;
  font-family: 'Inter', sans-serif;
}

.register-card {
  background: #1e293b; /* Slate 800 */
  width: 100%;
  max-width: 500px;
  padding: 40px;
  border-radius: 24px;
  border: 1px solid #334155;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  color: white;
}

.header-section {
  text-align: center;
  margin-bottom: 32px;
}

.title {
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
}

.subtitle {
  color: #94a3b8;
  font-size: 1rem;
  line-height: 1.5;
}

.input-group {
  margin-bottom: 20px;
}

.already-exists-banner {
  background: #0ea5e9; /* Sky 600 */
  color: white;
  padding: 16px;
  border-radius: 12px;
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  align-items: center;
}

.already-exists-banner .banner-text p {
  margin: 0;
  font-size: 0.9rem;
}

.already-exists-banner .text-link {
  background: none;
  border: none;
  color: white;
  font-weight: 700;
  text-decoration: underline;
  padding: 0;
  margin-top: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #cbd5e1;
}

.uber-input {
  width: 100%;
  padding: 14px;
  background: #0f172a;
  border: 2px solid #334155;
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  transition: all 0.2s;
}

.uber-input:focus {
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.requirements-box {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 20px;
  margin: 32px 0;
}

.req-title {
  font-size: 0.9rem;
  text-transform: uppercase;
  color: #64748b;
  font-weight: 700;
  margin: 0 0 16px 0;
  letter-spacing: 0.05em;
}

.checkbox-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
  cursor: pointer;
}

.checkbox-row:last-child {
  margin-bottom: 0;
}

.checkbox-row input {
  margin-top: 4px;
  transform: scale(1.2);
  accent-color: #3b82f6;
}

.checkbox-row .text {
  font-size: 0.9rem;
  color: #cbd5e1;
  line-height: 1.5;
}

.uber-button {
  width: 100%;
  padding: 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.uber-button:hover {
  background: #2563eb;
}

.uber-button:disabled {
  background: #334155;
  color: #64748b;
  cursor: not-allowed;
}

.login-link {
  text-align: center;
  margin-top: 24px;
  color: #94a3b8;
  font-size: 0.9rem;
}

.login-link a {
  color: #3b82f6;
  font-weight: 600;
  text-decoration: none;
}
.login-link a:hover {
  text-decoration: underline;
}

.success-step {
  text-align: center;
  padding: 20px 0;
}

.success-icon {
  color: #10b981;
  font-size: 4rem;
  margin-bottom: 16px;
}
.success-icon span {
  font-size: 4rem;
}

.success-step h2 {
  font-size: 2rem;
  margin-bottom: 12px;
}

.success-desc {
  color: #94a3b8;
  margin-bottom: 32px;
  font-size: 1.1rem;
  line-height: 1.6;
}

.next-steps {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 20px;
  text-align: left;
  margin-bottom: 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 16px;
  color: #e2e8f0;
  font-weight: 600;
}

.step-item .num {
  background: #3b82f6;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 700;
}

.phone-input-row {
  display: flex;
  gap: 12px;
}

.check-btn {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0 20px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.check-btn:hover {
  background: #2563eb;
}

.spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: block;
}

.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
