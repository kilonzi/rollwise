<template>
  <div class="triage-view">
    <div class="container">
      <div v-if="jobId" class="job-badge">Job #{{ jobId }}</div>
      <h1 class="headline">Secure Video Triage</h1>
      <p class="subtext">Upload a photo or video of the issue for an instant assessment.</p>

      <!-- Upload Area -->
      <div class="upload-area">
        <button class="upload-zone">
          <span class="material-symbols-rounded camera-icon" aria-hidden="true">photo_camera</span>
          <span>Tap to Upload</span>
        </button>
      </div>

      <!-- Common Issues -->
      <div class="issues-list">
        <h2>Common Issues</h2>
        <div class="issue-grid">
          <button class="issue-card">
            <span class="material-symbols-rounded issue-icon" aria-hidden="true">bolt</span>
            <span>Broken Spring</span>
          </button>
          <button class="issue-card">
            <span class="material-symbols-rounded issue-icon" aria-hidden="true">power_settings_new</span>
            <span>Opener Malfunction</span>
          </button>
          <button class="issue-card">
            <span class="material-symbols-rounded issue-icon" aria-hidden="true">compare_arrows</span>
            <span>Off-Track</span>
          </button>
          <button class="issue-card">
            <span class="material-symbols-rounded issue-icon" aria-hidden="true">help</span>
            <span>Other</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TriageView',
  props: {
    jobId: {
      type: String,
      default: null
    }
  }
}
</script>

<style scoped>
.triage-view {
  padding: 2rem 1.5rem;
  min-height: 80vh;
}

.job-badge {
  display: inline-block;
  background-color: var(--color-primary);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 700;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.container {
  max-width: 600px;
  margin: 0 auto;
}

.headline {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  color: var(--color-text-dark);
}

.subtext {
  color: #6b7280;
  margin-bottom: 2rem;
}

.upload-area {
  margin-bottom: 3rem;
}

.upload-zone {
  width: 100%;
  height: 200px;
  border: 3px dashed #d1d5db;
  border-radius: 1.5rem;
  background-color: #f9fafb;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  transition: all 0.3s;
  color: #6b7280;
}

.upload-zone:active {
  background-color: #e5e7eb;
  border-color: #9ca3af;
}

.camera-icon {
  font-size: 4rem;
}

.upload-zone span {
  font-weight: 600;
  font-size: 1.25rem;
}

.issues-list h2 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: var(--color-text-dark);
}

.issue-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.issue-card {
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: transform 0.1s;
}

.issue-card:active {
  transform: scale(0.95);
}

.issue-icon {
  font-size: 2rem;
  color: var(--color-primary);
}

.issue-card span:last-child {
  font-weight: 600;
  color: var(--color-text-dark);
}
</style>
