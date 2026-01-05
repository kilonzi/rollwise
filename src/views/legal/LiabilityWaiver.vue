<template>
  <div class="legal-page">
    <div class="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-sm border border-slate-200 my-10">
      <h1 class="text-3xl font-bold text-slate-900 mb-6">Liability Waiver & Indemnification</h1>
      
      <div class="prose prose-slate max-w-none">
        <section class="mb-6">
          <h2 class="text-xl font-bold text-slate-800 mb-3">1. Assumption of Risk</h2>
          <p>I, the Pro, acknowledge that the services I provide involve inherent risks, including but not limited to working with heavy machinery, high-tension springs, and electrical systems. I voluntarily assume all such risks.</p>
        </section>

        <section class="mb-6">
          <h2 class="text-xl font-bold text-slate-800 mb-3">2. Indemnification</h2>
          <p>I agree to indemnify, defend, and hold harmless Rollwise, its officers, directors, employees, and agents from and against any and all claims, liabilities, damages, losses, or expenses, including reasonable attorneys' fees and costs, arising out of or in any way connected with:</p>
          <ul class="list-disc pl-5 mt-2 space-y-1">
            <li>My access to or use of the Platform;</li>
            <li>My violation of these Terms;</li>
            <li>My violation of any third-party right, including without limitation any intellectual property right, publicity, confidentiality, property or privacy right;</li>
            <li>My performance of services for any Client.</li>
          </ul>
        </section>

        <section class="mb-6">
          <h2 class="text-xl font-bold text-slate-800 mb-3">3. No Insurance Coverage</h2>
          <p>I understand that Rollwise does not maintain insurance on my behalf (including Workers' Compensation) and that I am solely responsible for obtaining appropriate insurance coverage.</p>
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
