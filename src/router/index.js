import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import QuickIntakeView from '../views/QuickIntakeView.vue'
import ClientAuthView from '../views/client/AuthView.vue'
import ProAuthView from '../views/pro/ProAuthView.vue'
import AdminAuthView from '../views/admin/AuthView.vue'
import ClientDashboard from '../views/client/Dashboard.vue'
import ProDashboard from '../views/pro/ProDashboard.vue'
import AdminDashboard from '../views/admin/Dashboard.vue'
import ProPendingView from '../views/pro/ProPendingView.vue'
import { useAuthStore } from '@/stores/authStore.js'
import ProOnboarding from "@/views/pro/ProOnboarding.vue";
import JobAccessView from "@/views/client/JobAccessView.vue";
import TermsOfService from "@/views/legal/TermsOfService.vue";
import LiabilityWaiver from "@/views/legal/LiabilityWaiver.vue";
import NonSolicitation from "@/views/legal/NonSolicitation.vue";
import ProRegister from '../views/pro/ProRegister.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/snap',
      name: 'quick-intake',
      component: QuickIntakeView
    },
    {
      path: '/q/:jobId',
      name: 'quick-intake-job',
      component: QuickIntakeView,
      props: true,
      beforeEnter: (to, from, next) => {
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated) {
          return next({ name: 'job-access', query: { jobId: to.params.jobId } })
        }
        next()
      }
    },
    {
      path: '/client/access',
      name: 'job-access',
      component: JobAccessView,
      props: (route) => ({ jobId: route.query.jobId })
    },
    {
      path: '/auth',
      redirect: { name: 'client-login' }
    },
    {
      path: '/client/login',
      name: 'client-login',
      component: ClientAuthView,
      meta: { desiredRole: 'client' }
    },
    {
      path: '/pro/login',
      name: 'pro-login',
      component: ProAuthView,
      meta: { desiredRole: 'pro' }
    },
    {
      path: '/pro/apply',
      name: 'pro-apply',
      component: ProRegister
    },
    {
      path: '/partner/apply', // Alias for join
      redirect: { name: 'pro-apply' }
    },
    {
      path: '/admin/login',
      name: 'admin-login',
      component: AdminAuthView,
      meta: { desiredRole: 'admin' }
    },
    {
      path: '/pro/onboarding',
      name: 'pro-onboarding',
      component: ProOnboarding,
      meta: { requiresAuth: true, role: 'pro', layout: 'dashboard' }
    },
    {
      path: '/client/home',
      name: 'client-home',
      component: ClientDashboard,
      meta: { requiresAuth: true, role: 'client', layout: 'dashboard' }
    },
    {
      path: '/pro/home',
      name: 'pro-home',
      component: ProDashboard,
      meta: { requiresAuth: true, role: 'pro', layout: 'dashboard' }
    },
    {
      path: '/pro/pending',
      name: 'pro-pending',
      component: ProPendingView,
      meta: { requiresAuth: true, role: 'pro', layout: 'blank' }
    },
    {
      path: '/admin/home',
      name: 'admin-home',
      component: AdminDashboard,
      meta: { requiresAuth: true, role: 'admin', layout: 'blank' }
    },
    {
      path: '/client-portal',
      redirect: { name: 'client-home' }
    },
    {
      path: '/tech-dashboard',
      redirect: { name: 'pro-home' }
    },
    {
      path: '/pro-hub',
      redirect: { name: 'pro-home' }
    },
    {
      path: '/legal/terms',
      name: 'terms-of-service',
      component: TermsOfService
    },
    {
      path: '/legal/waiver',
      name: 'liability-waiver',
      component: LiabilityWaiver
    },
    {
      path: '/legal/non-solicitation',
      name: 'non-solicitation',
      component: NonSolicitation
    },
    {
      path: '/admin-dashboard',
      redirect: { name: 'admin-home' }
    }
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta?.desiredRole) {
    authStore.setDesiredRole(to.meta.desiredRole)
  }

  if (!to.meta?.requiresAuth) {
    return next()
  }

  if (!authStore.isAuthenticated) {
    const targetLogin = authStore.resolveLoginRoute(to.meta.role)
    return next({ name: targetLogin })
  }

  const targetRole = to.meta.role
  const currentRole = authStore.activeRole

  // 1. If route requires a specific role
  if (targetRole) {
    // 2. Check if user actually HAS this role
    if (!authStore.hasRole(targetRole)) {
      // User doesn't have the required role. Redirect to their actual home or login.
      // Don't let them proceed to this route.
      const actualHome = authStore.homeRoute
      if (actualHome && actualHome !== to.path) {
        return next({ path: actualHome })
      }
      return next({ name: 'client-login' })
    }

    // 3. User has role, but it's not active. Switch and reload.
    if (authStore.activeRole !== targetRole) {
      authStore.switchRole(targetRole)
      return next({ ...to, replace: true })
    }
  }

  // Pro State Checks
  if (authStore.activeRole === 'pro') {
    const status = authStore.activeStatus

    // 1. If Incomplete -> Force Onboarding (unless visiting dashboard)
    if ((status === 'onboarding' || !status) && !['pro-onboarding', 'pro-home'].includes(to.name)) {
      return next({ name: 'pro-onboarding' })
    }

    // 2. If trying to access Onboarding but already Pending/Approved -> Go Home
    if (to.name === 'pro-onboarding' && (status === 'pending_review' || status === 'approved')) {
      return next({ name: 'pro-home' })
    }
  }

  if (authStore.activeRole === 'admin' && authStore.activeStatus !== 'approved') {
    authStore.logout()
    return next({ name: 'client-login' })
  }

  return next()
})

export default router
