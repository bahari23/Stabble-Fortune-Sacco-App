/* nav-footer.js — shared nav and footer injection */

const NAV_HTML = `
<div class="top-bar">
  <div class="container">
    <div class="top-bar-left">
      <span>📍 Corner House, 6th Floor, Kimathi Street, Nairobi</span>
      <span>Mon–Sat: 8am–5:30pm</span>
    </div>
    <div class="top-bar-right">
      <a href="mailto:info@stablefortunes.com">info@stablefortunes.com</a>
      <a href="tel:0114914949">011 49 149 49</a>
    </div>
  </div>
</div>

<nav class="navbar">
  <div class="container">
    <a href="index.html" class="logo">
      <div class="logo-icon">SF</div>
      <div class="logo-text">
        <strong>Stable Fortunes</strong>
        <span>SACCO Society</span>
      </div>
    </a>

    <ul class="nav-links">
      <li class="nav-item"><a href="index.html" class="nav-link" id="nav-home">Home</a></li>
      <li class="nav-item">
        <a href="products.html" class="nav-link" id="nav-products">
          Products & Services
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </a>
        <div class="dropdown">
          <a href="products.html#savings">Saving Services</a>
          <a href="products.html#loans">Loan Products</a>
        </div>
      </li>
      <li class="nav-item"><a href="membership.html" class="nav-link" id="nav-membership">Membership</a></li>
      <li class="nav-item"><a href="career.html" class="nav-link" id="nav-career">Career</a></li>
      <li class="nav-item"><a href="contact.html" class="nav-link" id="nav-contact">Contact Us</a></li>
    </ul>

    <div class="nav-actions">
      <a href="auth.html" class="btn btn-green btn-sm">Login / Sign Up</a>
    </div>

    <button class="hamburger" id="hamburgerBtn" aria-label="Open menu">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>

<div class="mobile-nav" id="mobileNav">
  <button class="mobile-nav-close" id="mobileClose">✕</button>
  <a href="index.html">Home</a>
  <a href="products.html">Products & Services</a>
  <a href="membership.html">Membership</a>
  <a href="career.html">Career</a>
  <a href="contact.html">Contact Us</a>
  <a href="auth.html" style="color:var(--gold-light);margin-top:16px;">Login / Sign Up →</a>
</div>
`;

const FOOTER_HTML = `
<footer class="footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="index.html" class="logo" style="margin-bottom:4px">
          <div class="logo-icon">SF</div>
          <div class="logo-text">
            <strong>Stable Fortunes</strong>
            <span>SACCO Society</span>
          </div>
        </a>
        <p>A community-based society established in 2019 to build capacity, organize and promote the welfare and economic interests of our members.</p>
        <div class="social-links" style="margin-top:20px">
          <a href="#" class="social-link" aria-label="Facebook">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
          </a>
          <a href="#" class="social-link" aria-label="Twitter">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
          </a>
          <a href="#" class="social-link" aria-label="Instagram">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
          </a>
          <a href="mailto:info@stablefortunes.com" class="social-link" aria-label="Email">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </a>
        </div>
      </div>

      <div class="footer-col">
        <h4>Quick Links</h4>
        <ul>
          <li><a href="index.html">Home</a></li>
          <li><a href="products.html">Products & Services</a></li>
          <li><a href="membership.html">Membership</a></li>
          <li><a href="career.html">Career</a></li>
          <li><a href="contact.html">Contact Us</a></li>
          <li><a href="auth.html">Login / Register</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Our Services</h4>
        <ul>
          <li><a href="products.html#savings">Saving Accounts</a></li>
          <li><a href="products.html#loans">Loan Products</a></li>
          <li><a href="membership.html">Join as Member</a></li>
          <li><a href="products.html#networking">Networking</a></li>
          <li><a href="career.html#volunteer">Volunteer</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Contact</h4>
        <ul class="footer-contact">
          <li><strong>📍</strong> Corner House, 6th Floor, Kimathi St, Nairobi</li>
          <li><strong>📞</strong> 011 49 149 49 / 0725-021-709</li>
          <li><strong>✉️</strong> info@stablefortunes.com</li>
          <li><strong>💳</strong> Pay Bill: 4076949</li>
          <li><strong>🕐</strong> Mon–Fri: 8am–5:30pm, Sat: 8am–3pm</li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <span>© 2024 Stable Fortunes SACCO Society. All rights reserved.</span>
      <span>Regulated by SASRA · Privacy Policy · Terms of Service</span>
    </div>
  </div>
</footer>
`;

document.addEventListener('DOMContentLoaded', () => {
  // Inject nav
  const navContainer = document.getElementById('nav-placeholder');
  if (navContainer) navContainer.innerHTML = NAV_HTML;

  // Inject footer
  const footerContainer = document.getElementById('footer-placeholder');
  if (footerContainer) footerContainer.innerHTML = FOOTER_HTML;

  // Set active nav link
  const page = window.location.pathname.split('/').pop() || 'index.html';
  const map = {
    'index.html': 'nav-home',
    '': 'nav-home',
    'products.html': 'nav-products',
    'membership.html': 'nav-membership',
    'career.html': 'nav-career',
    'contact.html': 'nav-contact',
  };
  const activeId = map[page];
  if (activeId) {
    const el = document.getElementById(activeId);
    if (el) el.classList.add('active');
  }

  // Hamburger
  document.addEventListener('click', e => {
    if (e.target.closest('#hamburgerBtn')) {
      document.getElementById('mobileNav')?.classList.add('open');
    }
    if (e.target.closest('#mobileClose')) {
      document.getElementById('mobileNav')?.classList.remove('open');
    }
  });
});
