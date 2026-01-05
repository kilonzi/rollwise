<template>
  <div class="auth-container" :class="mode">
    <div class="auth-card">
      <div class="auth-header">
        <div class="logo-wrapper">
          <Logo :mode="mode === 'technician' ? 'dark' : 'light'" />
        </div>
        <h1 class="brand-title">Rollwise {{ mode === 'pro' ? 'Pro' : '' }}</h1>
        <p class="auth-subtitle">
          <span v-if="mode === 'pro'" class="badge-pro">PRO PARTNER PORTAL</span>
          <span v-else>Door Systems & Logistics</span>
        </p>
      </div>

      <div v-if="step === 'phone'" class="input-group fade-in">
        <p class="portal-tag">{{ portalMessage }}</p>
        <label for="phone">Mobile Number</label>
        <div class="input-wrapper">
          <span class="prefix">🇺🇸 +1</span>
          <input
            id="phone"
            type="tel"
            :value="formattedPhone"
            @input="handlePhoneInput"
            placeholder="(555) 000-0000"
            @keyup.enter="handleLogin"
            class="uber-input phone-input"
            maxlength="14"
          />
        </div>
        <button @click="handleLogin" class="uber-button primary full-width" :disabled="isSending || authStore.isLoading">
          {{ isSending || authStore.isLoading ? 'Sending...' : buttonLabel }}
        </button>
        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
      </div>

      <div v-if="step === 'verify_code'" class="input-group fade-in">
        <label>Verification Code</label>
        <p class="code-instruction">
          Enter the 6-digit code sent to {{ formattedPhone }} 
          <button @click="step = 'phone'" class="change-link">Change</button>
        </p>
        
        <div class="otp-container">
          <input
            v-for="(digit, index) in otpDigits"
            :key="index"
            ref="otpInputs"
            type="text"
            inputmode="numeric"
            maxlength="1"
            v-model="otpDigits[index]"
            @keydown="handleOtpKeydown($event, index)"
            @input="handleOtpInput($event, index)"
            @paste="handleOtpPaste"
            class="otp-input"
            :class="{ filled: digit }"
          />
        </div>

        <button @click="confirmCode" class="uber-button primary full-width" :disabled="!isOtpComplete || isVerifying">
          {{ isVerifying ? 'Verifying...' : 'Verify & Login' }}
        </button>
        <button class="text-link" @click="resendCode" :disabled="isSending">
          Resend Code
        </button>
        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
      </div>

      <!-- new user choice removed: onboarding handled automatically -->
      <div id="recaptcha-container" class="recaptcha-holder"></div>

      <div class="auth-footer-links">
        <p v-if="selectedMode === 'client'">
          Are you a Pro Partner? <router-link to="/pro/login">Pro Sign-In</router-link>
        </p>
        <p v-if="selectedMode === 'pro'">
          Need a repair? <router-link to="/client/login">Client Sign-In</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/authStore.js'
import { sendPhoneVerification, confirmVerificationCode } from '@/firebase/auth.js'
import Logo from '@/components/Logo.vue'

export default {
  name: 'BaseAuthView',
  components: {
    Logo
  },
  props: {
    mode: {
      type: String,
      default: 'client'
    }
  },
  data() {
    return {
      step: 'phone',
      rawPhoneNumber: '', // Only digits
      otpDigits: ['', '', '', '', '', ''],
      isSending: false,
      isVerifying: false,
      confirmationResult: null,
      errorMessage: '',
      selectedMode: this.mode
    }
  },
  computed: {
    authStore() {
      return useAuthStore()
    },
    portalMessage() {
      if (this.selectedMode === 'pro') {
        return 'Pro Partner Portal · Access routes, triage, and wallet tools'
      }
      if (this.selectedMode === 'admin') {
        return 'Admin Portal · Access dispatch controls'
      }
      return 'Client Portal · Track repairs and book emergency dispatch'
    },
    buttonLabel() {
      return this.selectedMode === 'admin' ? 'Continue' : 'Get Login Code'
    },
    formattedPhone() {
      return this.formatAsUS(this.rawPhoneNumber)
    },
    isOtpComplete() {
      return this.otpDigits.every(d => d.length === 1)
    }
  },
  watch: {
    mode(newVal) {
      this.selectedMode = newVal
      this.authStore.setDesiredRole(newVal)
    }
  },
  created() {
    this.authStore.setDesiredRole(this.selectedMode)
    // Check for phone and pre-fill
    if (this.$route.query.phone) {
        // Simple formatting helper usage or raw?
        // rawPhoneNumber expects digits
        this.rawPhoneNumber = this.$route.query.phone.replace(/\D/g, '').slice(0, 10)
    }
  },
  methods: {
    async handleLogin() {
      this.errorMessage = ''

      if (this.rawPhoneNumber.length < 10) {
        this.errorMessage = 'Please enter a valid 10-digit mobile number.'
        return
      }

      this.authStore.setDesiredRole(this.selectedMode)

      try {
        this.isSending = true
        const formatted = `+1${this.rawPhoneNumber}`
        this.confirmationResult = await sendPhoneVerification(formatted, 'recaptcha-container')
        this.step = 'verify_code'
      } catch (error) {
        this.errorMessage = error?.message || 'Failed to send verification code.'
      } finally {
        this.isSending = false
      }
    },

    async resendCode() {
      if (!this.phoneNumber) return
      await this.handleLogin()
    },

    async confirmCode() {
      const code = this.otpDigits.join('')
      if (!this.confirmationResult || code.length !== 6) return
      this.errorMessage = ''

      try {
        this.isVerifying = true
        await confirmVerificationCode(this.confirmationResult, code)
        await this.completeLogin(this.rawPhoneNumber)
      } catch (error) {
        this.errorMessage = error?.message || 'Invalid verification code.'
      } finally {
        this.isVerifying = false
      }
    },

    async completeLogin(phoneRaw) {
      try {
         // reconstruct phone passed to login
        const fullPhone = `+1${phoneRaw}`
        const result = await this.authStore.login(fullPhone)

        if (!result) {
          this.errorMessage = 'Unable to log in. Please try again.'
          return
        }

        if (result.role === 'new') {
          await this.handleNewUser(result.requestedRole || this.selectedMode)
          return
        }

        const destination = this.authStore.homeRoute || '/'
        this.$router.push(destination)
      } catch (error) {
        this.errorMessage = error?.message || 'Login failed. Please try again.'
      }
    },

    async handleNewUser(requestedRole) {
      const role = requestedRole || this.authStore.desiredRole || 'client'
      this.errorMessage = ''

      try {
        if (role === 'client') {
          const destination = await this.authStore.registerClient()
          this.$router.push(destination || this.authStore.homeRoute || '/client-portal')
          return
        }

        if (role === 'pro') {
          await this.authStore.startProOnboarding()
          this.$router.push('/pro/onboarding')
          return
        }

        if (role === 'admin') {
          await this.authStore.completeNewUser('admin')
          this.$router.push(this.authStore.homeRoute || '/admin-dashboard')
          return
        }

        this.errorMessage = 'Unsupported role. Please contact support.'
      } catch (error) {
        this.errorMessage = error?.message || 'Failed to complete registration.'
      }
    },

    handlePhoneInput(e) {
      const input = e.target.value
      // Strip everything but digits
      const digits = input.replace(/\D/g, '')
      // Limit to 10 chars
      this.rawPhoneNumber = digits.slice(0, 10)
    },

    formatAsUS(digits) {
      if (!digits) return ''
      const x = digits.match(/(\d{0,3})(\d{0,3})(\d{0,4})/)
      return !x[2] ? x[1] : `(${x[1]}) ${x[2]}` + (x[3] ? `-${x[3]}` : '')
    },

    handleOtpInput(e, index) {
      const val = e.target.value
      // If user typed a digit
      if (val.match(/^\d$/)) {
        this.otpDigits[index] = val
        // Focus next
        if (index < 5) {
          this.$nextTick(() => this.$refs.otpInputs[index + 1].focus())
        } else {
            // Auto submit on last digit?
            // this.confirmCode()
        }
      } else {
        // invalid input, clear
         this.otpDigits[index] = ''
      }
    },

    handleOtpKeydown(e, index) {
      if (e.key === 'Backspace' && !this.otpDigits[index]) {
        // Focus previous on backspace if empty
        if (index > 0) {
           this.$nextTick(() => this.$refs.otpInputs[index - 1].focus())
        }
      }
    },
    
    handleOtpPaste(e) {
      e.preventDefault()
      const data = e.clipboardData.getData('text').trim()
      if (!data || !/^\d{6}$/.test(data)) return
      const digits = data.split('')
      digits.forEach((d, i) => {
          if(i < 6) this.otpDigits[i] = d
      })
      // Focus last
      this.$nextTick(() => this.$refs.otpInputs[5].focus())
    }
  }
}
</script>

<style scoped>
/* include same styles as original AuthView */
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8fafc;
  padding: 20px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  transition: background-color 0.3s ease;
}

.auth-container.technician {
  background-color: #0f172a; /* Slate 900 */
}

.auth-card {
  background: white;
  width: 100%;
  max-width: 400px;
  padding: 40px;
  border-radius: 24px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.auth-container.technician .auth-card {
  background: #1e293b; /* Slate 800 */
  border: 1px solid #334155;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.auth-header {
  text-align: center;
  margin-bottom: 40px;
}

.brand-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: #0f172a;
  margin: 16px 0 4px;
  letter-spacing: -0.03em;
}

.auth-container.technician .brand-title {
  color: #f8fafc;
}

.auth-subtitle {
  color: #64748b;
  margin: 0;
  font-size: 0.95rem;
  font-weight: 500;
}

.auth-container.technician .auth-subtitle {
  color: #94a3b8;
}

.badge-pro {
  background: #3b82f6;
  color: white;
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

label {
  font-weight: 500;
  font-size: 0.9rem;
  color: #333;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.prefix {
  position: absolute;
  left: 16px;
  font-weight: 600;
  color: #64748b;
  font-size: 1.1rem;
  pointer-events: none;
}

.uber-input {
  width: 100%;
  padding: 16px;
  font-size: 1.1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  transition: all 0.2s ease;
  outline: none;
  font-weight: 600;
  color: #1e293b;
}

.uber-input.phone-input {
  padding-left: 80px; /* Make room for prefix */
}

.uber-input:focus {
  border-color: #0f172a;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(15, 23, 42, 0.05);
}

/* Technician Input Styles */
.auth-container.technician .uber-input {
  background: #0f172a;
  border-color: #334155;
  color: white;
}

.auth-container.technician .uber-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
}

.auth-container.technician label {
  color: #94a3b8;
}


.uber-button {
  padding: 16px;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.1s ease, background-color 0.2s;
}

.uber-button.primary {
  background-color: #000;
  color: #fff;
}

.uber-button.primary:hover {
  background-color: #333;
}

.uber-button.full-width {
  width: 100%;
}

.uber-button.secondary {
  background-color: #f3f4f6;
  color: #111827;
}

.uber-button.secondary:hover {
  background-color: #e5e7eb;
}

.error-text {
  color: var(--color-error, #EF4444);
  font-weight: 600;
  margin: 0;
}

.recaptcha-holder {
  width: 0;
  height: 0;
  overflow: hidden;
}

.welcome-text {
  text-align: center;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 24px;
}


.mode-subtitle {
  margin: 0 0 0.5rem 0;
  font-weight: 600;
  color: #4b5563;
}

.portal-tag {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #1d4ed8;
}

.choice-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #f9fafb;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  margin-bottom: 16px;
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.2s ease;
}

.choice-card.dark {
  background: #000;
  color: #fff;
}

.choice-card.dark .text-content p {
  color: #aaa;
}

.choice-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px rgba(0,0,0,0.05);
}

.icon-circle {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  background: #f0f0f0;
  border-radius: 50%;
}

.text-content {
  flex: 1;
}

.arrow-icon {
  font-size: 1.4rem;
  opacity: 0.5;
}

.otp-container {
  display: flex;
  gap: 8px;
  justify-content: space-between;
}

.otp-input {
  width: 100%;
  height: 56px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  outline: none;
  transition: all 0.2s;
}

.otp-input:focus {
  border-color: #0f172a;
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.otp-input.filled {
  border-color: #94a3b8;
  background: white;
}

/* Tech OTP Styles */
.auth-container.technician .otp-input {
  background: #0f172a;
  border-color: #334155;
  color: white;
}

.auth-container.technician .otp-input:focus {
  border-color: #3b82f6;
  background: #1e293b;
}

.text-link {
  background: none;
  border: none;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
}

.text-link:hover {
  text-decoration: underline;
  color: #0f172a;
}

.auth-container.technician .text-link {
  color: #94a3b8;
}

.auth-container.technician .text-link:hover {
  color: white;
}

.change-link {
  background: none;
  border: none;
  color: #3b82f6;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  margin-left: 4px;
  font-size: 0.85rem;
  text-decoration: underline;
}

.code-instruction {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
}

.auth-container.technician .code-instruction {
  color: #94a3b8;
}

.fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.auth-footer-links {
  margin-top: 32px;
  text-align: center;
  border-top: 1px solid #f1f5f9;
  padding-top: 24px;
}

.auth-footer-links p {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0;
}

.auth-footer-links a {
  color: #3b82f6;
  font-weight: 700;
  text-decoration: none;
}

.auth-footer-links a:hover {
  text-decoration: underline;
}

.auth-container.technician .auth-footer-links {
  border-top-color: #334155;
}

.auth-container.technician .auth-footer-links p {
  color: #94a3b8;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
