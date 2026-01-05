<template>
  <footer class="the-footer">
    <div class="footer-content container">
      <!-- Brand Column -->
      <div class="footer-col brand-col">
        <h3 class="footer-logo">ROLLWISE</h3>
        <p class="tagline">Keeping your business moving with reliable door systems and logistics support.</p>
        <div class="copyright">
          &copy; {{ new Date().getFullYear() }} Rollwise. All rights reserved.
        </div>
      </div>

      <!-- Contact Column -->
      <div class="footer-col">
        <h4>Contact Us</h4>
        <div class="contact-item">
          <span class="material-symbols-rounded icon">call</span>
          <a href="tel:+17742925110" class="contact-link phone">(774) 292-5110</a>
        </div>
        <div class="contact-item">
          <span class="material-symbols-rounded icon">mail</span>
          <a href="mailto:dispatch@rollwise.com" class="contact-link">dispatch@rollwise.com</a>
        </div>
        <div class="contact-item">
          <span class="material-symbols-rounded icon">location_on</span>
          <span>Serving MA, NH & RI</span>
        </div>
      </div>

      <!-- Portals -->
      <div class="footer-col">
        <h4>Access</h4>
        <div class="link-stack">
          <router-link to="/client/login">Client Portal</router-link>
          <router-link to="/pro/login">Pro Partner Login</router-link>
          <router-link to="/admin/login">Admin Access</router-link>
        </div>
      </div>

      <!-- Partners -->
      <div class="footer-col">
        <h4>Partners</h4>
        <p class="mb-4 text-sm text-slate-400">Join our network of skilled door professionals.</p>
        <router-link to="/pro/login" class="text-slate-300 hover:text-white underline">
          Pro Portal Login
        </router-link>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'TheFooter'
}
</script>

<style scoped>
.the-footer {
  background-color: #111827; /* Dark Slate/Black */
  color: #9ca3af;
  padding: 4rem 1.5rem;
  margin-top: auto;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 3rem;
}

.footer-logo {
  color: #fff;
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
}

.tagline {
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  max-width: 300px;
}

.copyright {
  font-size: 0.85rem;
  color: #6b7280;
}

h4 {
  color: #fff;
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 1rem;
}

.contact-item .icon {
  color: #ef4444; /* Accent Red */
}

.contact-link {
  color: #d1d5db;
  text-decoration: none;
  transition: color 0.2s;
}

.contact-link.phone {
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
}

.contact-link:hover {
  color: #fff;
}

.link-stack {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.link-stack a {
  color: #d1d5db;
  text-decoration: none;
  transition: color 0.2s;
}

.link-stack a:hover {
  color: #fff;
}

.join-tech-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #2563eb;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
  transition: all 0.2s;
}
.join-tech-btn:hover {
  background: #1d4ed8;
  transform: translateY(-2px);
}
.join-tech-btn .material-symbols-rounded {
  font-size: 1.1rem;
}
</style>
