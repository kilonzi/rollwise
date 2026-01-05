<template>
  <div class="min-h-screen bg-white text-slate-900 font-sans">
    <!-- Hero Section -->
    <section class="relative flex flex-col items-center text-center pt-20 pb-12 px-6 bg-gradient-to-b from-brand-50 to-white overflow-hidden">
      <div class="max-w-3xl w-full flex flex-col items-center">
        <!-- Badge -->
        <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm text-sm font-semibold text-slate-600 mb-8">
          <span class="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_0_2px_rgba(16,185,129,0.2)]"></span>
          Now Serving MA, NH & RI
        </div>
        
        <!-- Headline -->
        <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
          Reliable Door Systems 
          <span class="bg-gradient-to-br from-brand-600 to-indigo-600 bg-clip-text text-transparent">& Logistics</span>
        </h1>
        
        <!-- Subheadline -->
        <p class="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mb-10">
          Professional repair, maintenance, and installation for residential and commercial properties. We keep your business moving.
        </p>

        <!-- CTAs -->
        <div class="flex flex-col sm:flex-row items-center gap-4 mb-8 w-full justify-center">
          <button 
            @click="handleBookService"
            class="w-full sm:w-auto px-8 py-4 bg-brand-900 hover:bg-black text-white rounded-full font-semibold text-lg shadow-lg shadow-blue-900/10 hover:shadow-xl transition-all transform hover:-translate-y-0.5"
          >
            Book Service
          </button>
          
          <button 
            @click="handleEmergency"
            class="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 text-red-600 font-semibold hover:bg-red-50 rounded-full transition-colors order-2 sm:order-none"
          >
            <span class="material-symbols-rounded">call</span>
            (774) 292-5110
          </button>
        </div>
        
        <p class="text-xs text-red-500 font-medium mb-8">
          For medical or fire emergencies, please call 911 immediately.
        </p>
        
        <!-- Arrival Time -->
        <p class="flex items-center gap-2 text-slate-500 text-sm font-medium">
          <span class="material-symbols-rounded text-lg">timer</span>
          Avg. arrival time: 45 mins
        </p>
      </div>
    </section>

    <!-- Value Props / How It Works -->
    <section class="py-20 px-6 max-w-7xl mx-auto">
      <div class="text-center max-w-2xl mx-auto mb-16">
        <h2 class="text-3xl font-bold text-slate-900 mb-4">Expert Service, Simplified</h2>
        <p class="text-slate-600 text-lg">We combine veteran expertise with modern technology.</p>
      </div>

      <div class="grid md:grid-cols-3 gap-8">
        <!-- Card 1 -->
        <div class="p-8 rounded-2xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-shadow">
          <div class="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-50 text-brand-600 mb-6">
            <span class="material-symbols-rounded text-3xl">calendar_clock</span>
          </div>
          <h3 class="text-xl font-bold text-slate-900 mb-3">Easy Booking</h3>
          <p class="text-slate-600 leading-relaxed">Schedule service in seconds without the phone tag.</p>
        </div>
        
        <!-- Card 2 -->
        <div class="p-8 rounded-2xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-shadow">
          <div class="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-50 text-brand-600 mb-6">
            <span class="material-symbols-rounded text-3xl">videocam</span>
          </div>
          <h3 class="text-xl font-bold text-slate-900 mb-3">Video Triage</h3>
          <p class="text-slate-600 leading-relaxed">Show us the issue securely for faster diagnostics.</p>
        </div>
        
        <!-- Card 3 -->
        <div class="p-8 rounded-2xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-shadow">
          <div class="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-50 text-brand-600 mb-6">
            <span class="material-symbols-rounded text-3xl">price_check</span>
          </div>
          <h3 class="text-xl font-bold text-slate-900 mb-3">Transparent Pricing</h3>
          <p class="text-slate-600 leading-relaxed">Upfront quotes and digital invoicing. No surprises.</p>
        </div>
      </div>
    </section>

    <!-- Trust Badges -->
    <section class="py-10 border-t border-slate-100">
      <div class="max-w-5xl mx-auto flex flex-wrap justify-center gap-6 px-6">
        <div class="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full text-slate-600 text-sm font-medium border border-slate-200">
          <span class="material-symbols-rounded text-brand-600">verified</span>
          Licensed & Insured
        </div>
        <div class="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full text-slate-600 text-sm font-medium border border-slate-200">
          <span class="material-symbols-rounded text-brand-600">workspace_premium</span>
          Google Guaranteed
        </div>
        <div class="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full text-slate-600 text-sm font-medium border border-slate-200">
          <span class="material-symbols-rounded text-brand-600">handshake</span>
          Veteran Owned
        </div>
      </div>
    </section>

  </div>
</template>

<script>
export default {
  name: 'HomeView',
  methods: {
    handleBookService() {
      this.$router.push({ name: 'quick-intake' })
    },
    handleEmergency() {
      window.location.href = 'tel:+17742925110'
    }
  }
}
</script>

<style scoped>
/* Any highly specific custom styles can go here, but prefer Tailwind classes */
</style>
