<template>
  <div class="legal-page">
    <div class="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-sm border border-slate-200 my-10">
      <h1 class="text-3xl font-bold text-slate-900 mb-6">Terms of Service</h1>
      
      <div class="prose prose-slate max-w-none">
        <p class="mb-4">Last Updated: {{ new Date().toLocaleDateString() }}</p>

        <section class="mb-6">
          <h2 class="text-xl font-bold text-slate-800 mb-3">1. Platform Nature of Services</h2>
          <p>Rollwise ("the Platform") operates exclusively as a specialized marketplace connecting independent service providers ("Pros") with clients seeking door and gate repair services ("Clients"). Rollwise is <strong>not</strong> a service provider, general contractor, or employer.</p>
        </section>

        <section class="mb-6">
          <h2 class="text-xl font-bold text-slate-800 mb-3">2. Relationship of Parties</h2>
          <p>Pros acting on the Platform are independent business entities. No employment, partnership, or joint venture relationship is created between Rollwise and any Pro or Client. Clients contract directly with Pros for all services.</p>
        </section>

        <section class="mb-6">
          <h2 class="text-xl font-bold text-slate-800 mb-3">3. Limitation of Liability</h2>
          <p>Rollwise expressly disclaims all liability for the actions, errors, omissions, representations, warranties, breaches, or negligence of any Pro or for any personal injuries, death, property damage, or other damages or expenses resulting there from.</p>
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
