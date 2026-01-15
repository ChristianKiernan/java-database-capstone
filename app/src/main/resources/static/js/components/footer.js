// footer.js
// This file renders a consistent footer across all pages

function renderFooter() {
  const footer = document.getElementById("footer");

  if (!footer) {
    console.warn("⚠️ Footer container not found");
    return;
  }

  footer.innerHTML = `
    <footer class="footer">
      <div class="footer-container">

        <!-- Branding -->
        <div class="footer-logo">
          <img src="/assets/images/logo/logo.png" alt="Logo" />
          <p>© ${new Date().getFullYear()} HealthCare Portal. All rights reserved.</p>
        </div>

        <!-- Links -->
        <div class="footer-links">

          <!-- Company -->
          <div class="footer-column">
            <h4>Company</h4>
            <a href="#">About</a>
            <a href="#">Careers</a>
            <a href="#">Press</a>
          </div>

          <!-- Support -->
          <div class="footer-column">
            <h4>Support</h4>
            <a href="#">Account</a>
            <a href="#">Help Center</a>
            <a href="#">Contact</a>
          </div>

          <!-- Legal -->
          <div class="footer-column">
            <h4>Legal</h4>
            <a href="#">Terms</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Licensing</a>
          </div>

        </div>
      </div>
    </footer>
  `;
}

// Run immediately when file loads
renderFooter();
