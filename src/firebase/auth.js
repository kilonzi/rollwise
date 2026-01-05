import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
import { firebaseApp, TENANT_ID } from '@/firebase/config'

const auth = getAuth(firebaseApp)
// NOTE: Phone Auth (signInWithPhoneNumber) is NOT supported on Tenants in the JS SDK.
// We must use project-level auth.
// if (TENANT_ID) {
//   auth.tenantId = TENANT_ID
// }

let recaptchaVerifier

export const initRecaptcha = (containerId = 'recaptcha-container') => {
  if (recaptchaVerifier) return recaptchaVerifier

  recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible'
  })

  return recaptchaVerifier
}

export const sendPhoneVerification = async (phoneNumber, containerId) => {
  if (!phoneNumber) throw new Error('Phone number is required')

  const verifier = initRecaptcha(containerId)
  return signInWithPhoneNumber(auth, phoneNumber, verifier)
}

export const confirmVerificationCode = async (confirmationResult, code) => {
  if (!confirmationResult || !code) throw new Error('Invalid verification attempt')

  return confirmationResult.confirm(code)
}
