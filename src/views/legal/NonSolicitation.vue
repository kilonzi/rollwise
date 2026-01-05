<template>
  <div class="legal-page">
    <div class="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-sm border border-slate-200 my-10">
      <h1 class="text-3xl font-bold text-slate-900 mb-6">Non-Solicitation Agreement</h1>
      
      <div class="prose prose-slate max-w-none">
        <section class="mb-6">
          <h2 class="text-xl font-bold text-slate-800 mb-3">1. Non-Circumvention</h2>
          <p>During the term of my use of the Platform and for a period of twelve (12) months thereafter, I agree not to directly or indirectly solicit, induce, or attempt to induce any Client introduced to me through Rollwise to bypass the Platform for services.</p>
        </section>

        <section class="mb-6">
          <h2 class="text-xl font-bold text-slate-800 mb-3">2. Liquidated Damages</h2>
          <p>I acknowledge that a breach of this Non-Solicitation Agreement damages Rollwise in ways that are difficult to quantify. Therefore, I agree that for each occurrence of off-platform solicitation or service delivery in violation of this agreement, I shall be liable for liquidated damages in the amount of $5,000.00 USD.</p>
        </section>

        <section class="mb-6">
          <h2 class="text-xl font-bold text-slate-800 mb-3">3. Platform Integrity</h2>
          <p>I agree to process all payments and communications related to initial jobs and follow-up work through the Rollwise platform to ensure proper record-keeping, dispute resolution, and platform sustainability.</p>
        </section>

        <div class="mt-8 pt-6 border-t border-slate-200">
           <button @click="$router.go(-1)" class="text-blue-600 hover:text-blue-800 font-medium">
             &larr; Back to Application
           </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.legal-page {
  min-height: 100vh;
  background-color: #f8fafc;
  padding: 20px;
}
</style>
