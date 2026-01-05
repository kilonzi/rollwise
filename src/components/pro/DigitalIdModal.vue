<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="id-card-modal">
      <div class="notch"></div>
      
      <header class="company-header">
        <span class="logo-text">ROLLWISE</span>
        <span class="verified-badge">
          <span class="material-symbols-rounded">verified</span>
          Verified
        </span>
      </header>

      <div class="photo-section">
        <div class="photo-frame">
          <img :src="photoUrl" alt="Technician Photo" />
        </div>
      </div>

      <div class="tech-details">
        <h2>{{ name }}</h2>
        <p class="role">Senior Technician</p>
        <div class="meta-grid">
          <div>
            <label>ID Number</label>
            <p>{{ techId }}</p>
          </div>
          <div>
            <label>License</label>
            <p>{{ licenseNumber }}</p>
          </div>
        </div>
      </div>

      <div class="qr-section">
        <img :src="qrCodeUrl" alt="Verification QR Code" />
        <p>Scan to verify employment status</p>
      </div>

      <footer>
        <button @click="$emit('close')">Close ID</button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  techId: {
    type: String,
    required: true
  },
  photoUrl: {
    type: String,
    default: 'https://i.pravatar.cc/300?img=11' // Placeholder
  },
  licenseNumber: {
    type: String,
    default: 'PENDING'
  }
})

defineEmits(['close'])

const qrCodeUrl = computed(() => {
  const data = `https://rollwise.app/verify/${props.techId}`
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data)}`
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.id-card-modal {
  background: white;
  width: 100%;
  max-width: 340px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  position: relative;
  border: 4px solid white;
}

/* Simulated physical card look */
.company-header {
  background: #0f172a;
  padding: 24px 20px 60px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.logo-text {
  font-weight: 800;
  letter-spacing: 0.05em;
  font-size: 0.9rem;
}

.verified-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: 99px;
  font-size: 0.7rem;
  font-weight: 600;
}

.verified-badge span {
  font-size: 14px;
}

.photo-section {
  margin-top: -40px;
  display: flex;
  justify-content: center;
}

.photo-frame {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 4px solid white;
  background: white;
  overflow: hidden;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.photo-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tech-details {
  text-align: center;
  padding: 16px 20px 0;
}

.tech-details h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  color: #1e293b;
}

.role {
  margin: 4px 0 16px;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

.meta-grid {
  display: flex;
  justify-content: center;
  gap: 24px;
  border-top: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
  padding: 16px 0;
}

.meta-grid label {
  display: block;
  font-size: 0.7rem;
  color: #94a3b8;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.meta-grid p {
  margin: 0;
  font-weight: 700;
  color: #334155;
  font-variant-numeric: tabular-nums;
}

.qr-section {
  padding: 24px;
  text-align: center;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qr-section img {
  width: 120px;
  height: 120px;
  mix-blend-mode: multiply;
}

.qr-section p {
  margin: 12px 0 0;
  font-size: 0.8rem;
  color: #64748b;
}

footer {
  padding: 16px;
  background: white;
}

footer button {
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  background: #0f172a;
  color: white;
  border: none;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
}
</style>
