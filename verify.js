/**
 * ============================================================
 *  verify.js — OTP Verification System
 *  Stable Fortunes SACCO · Production-ready · Vanilla JS
 * ============================================================
 *
 *  Public API (called from form HTML):
 *    triggerVerify(type)          — opens the OTP modal
 *    changeVerified(type)         — unlocks verified field for editing
 *
 *  Helper functions (used internally):
 *    generateOTP()                — returns a random 4-digit string
 *    openOTPModal(type, masked)   — renders and opens the modal
 *    verifyOTP(type)              — checks entered code vs stored OTP
 *    startResendTimer(type)       — runs the 30-second countdown
 *    maskPhone(phone)             — masks a phone number
 *    maskEmail(email)             — masks an email address
 *    closeOTPModal()              — hides and cleans up the modal
 *    showToast(msg, ok)           — brief status toast
 * ============================================================
 */

'use strict';

/* ──────────────────────────────────────────────────────────
   STATE  — temporary in-memory storage (never persisted)
────────────────────────────────────────────────────────── */
const OTPState = {
  phone: { otp: null, verified: false, timer: null },
  email: { otp: null, verified: false, timer: null },
};

/* ──────────────────────────────────────────────────────────
   1.  generateOTP
    Returns a zero-padded 4-digit string, e.g. "0847"
────────────────────────────────────────────────────────── */
function generateOTP() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

/* ──────────────────────────────────────────────────────────
   2.  maskPhone
    "0712345678"  →  "07******78"
────────────────────────────────────────────────────────── */
function maskPhone(phone) {
  const p = phone.replace(/[\s\-()]/g, '');
  if (p.length < 4) return p;
  return p.slice(0, 2) + '******' + p.slice(-2);
}

/* ──────────────────────────────────────────────────────────
   3.  maskEmail
    "jane.doe@email.com"  →  "ja*****@email.com"
────────────────────────────────────────────────────────── */
function maskEmail(email) {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const visible = local.slice(0, 2);
  const stars   = '*'.repeat(Math.max(3, local.length - 2));
  return `${visible}${stars}@${domain}`;
}

/* ──────────────────────────────────────────────────────────
   4.  triggerVerify  (called by the "Verify" buttons in HTML)
    type = 'phone' | 'email'
────────────────────────────────────────────────────────── */
function triggerVerify(type) {
  const inputEl = document.getElementById(type === 'phone' ? 'f_contact_phone' : 'f_contact_email');
  if (!inputEl) return;

  const raw = inputEl.value.trim();

  /* ── Basic validation before sending ── */
  if (type === 'phone') {
    const clean = raw.replace(/[\s\-()]/g, '');
    if (!/^0[0-9]{9}$/.test(clean)) {
      shakeInput(inputEl);
      showFieldError(type === 'phone' ? 'e_contact_phone' : 'e_contact_email',
        'Enter a valid Kenyan phone number before verifying');
      return;
    }
  } else {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
      shakeInput(inputEl);
      showFieldError('e_contact_email', 'Enter a valid email address before verifying');
      return;
    }
  }

  clearFieldError(type === 'phone' ? 'e_contact_phone' : 'e_contact_email');

  /* ── Generate & "send" OTP ── */
  const otp    = generateOTP();
  OTPState[type].otp = otp;

  /* Console log for demo/testing purposes */
  console.log(`%c[OTP Demo] ${type.toUpperCase()} OTP: ${otp}`, 'background:#1a4731;color:#c9a84c;font-size:14px;padding:4px 8px;border-radius:4px');

  const masked = type === 'phone' ? maskPhone(raw) : maskEmail(raw);
  openOTPModal(type, masked);
}

/* ──────────────────────────────────────────────────────────
   5.  openOTPModal
    Builds the modal DOM and injects it, then animates in
────────────────────────────────────────────────────────── */
function openOTPModal(type, masked) {
  /* Remove any stale modal */
  closeOTPModal(true);

  const isPhone = type === 'phone';
  const icon    = isPhone ? '📱' : '✉️';
  const label   = isPhone ? 'Phone Number' : 'Email Address';
  const channel = isPhone ? 'SMS' : 'email';

  /* ── Build HTML ── */
  const html = `
  <div class="otp-backdrop" id="otpBackdrop" role="dialog" aria-modal="true"
       aria-label="Verify your ${label}" tabindex="-1">
    <div class="otp-card" id="otpCard">

      <!-- Close -->
      <button class="otp-close" onclick="closeOTPModal()" aria-label="Close">&times;</button>

      <!-- Header -->
      <div class="otp-header">
        <div class="otp-icon-wrap">${icon}</div>
        <h2 class="otp-title">Verify Your ${label}</h2>
        <p class="otp-subtitle">
          A 4-digit code was sent via ${channel} to
          <strong class="otp-masked">${masked}</strong>
        </p>
      </div>

      <!-- OTP inputs -->
      <div class="otp-inputs" id="otpInputs" role="group" aria-label="Enter verification code">
        <input class="otp-box" type="text" inputmode="numeric" maxlength="1"
               autocomplete="one-time-code" aria-label="Digit 1" data-idx="0">
        <input class="otp-box" type="text" inputmode="numeric" maxlength="1"
               autocomplete="off" aria-label="Digit 2" data-idx="1">
        <input class="otp-box" type="text" inputmode="numeric" maxlength="1"
               autocomplete="off" aria-label="Digit 3" data-idx="2">
        <input class="otp-box" type="text" inputmode="numeric" maxlength="1"
               autocomplete="off" aria-label="Digit 4" data-idx="3">
      </div>

      <!-- Status message -->
      <div class="otp-msg" id="otpMsg" role="alert" aria-live="polite"></div>

      <!-- Verify button -->
      <button class="otp-verify-btn" id="otpVerifyBtn"
              onclick="verifyOTP('${type}')" disabled>
        <span class="otp-btn-text">Verify Code</span>
        <span class="otp-btn-spin" aria-hidden="true"></span>
      </button>

      <!-- Resend -->
      <div class="otp-resend">
        <span class="otp-resend-text" id="otpResendText">
          Resend code in <strong id="otpCountdown">30</strong>s
        </span>
        <button class="otp-resend-btn" id="otpResendBtn"
                style="display:none" onclick="resendOTP('${type}')">
          Resend OTP
        </button>
      </div>

      <!-- Loading shimmer overlay (shown during "sending") -->
      <div class="otp-loading" id="otpLoading">
        <div class="otp-loading-inner">
          <div class="otp-spinner"></div>
          <p>Sending your code…</p>
        </div>
      </div>

    </div>
  </div>`;

  document.body.insertAdjacentHTML('beforeend', html);

  /* ── Wire up input behaviour ── */
  const boxes = document.querySelectorAll('.otp-box');
  boxes.forEach(box => {
    box.addEventListener('keydown', otpKeyDown);
    /* bind type as the SECOND argument; first is the event object */
    box.addEventListener('input',  (e) => otpInput(e, type));
    box.addEventListener('paste',  (e) => otpPaste(e, type));
    box.addEventListener('focus',  () => box.select());
  });

  /* ── Close on backdrop click ── */
  document.getElementById('otpBackdrop').addEventListener('click', e => {
    if (e.target.id === 'otpBackdrop') closeOTPModal();
  });

  /* ── Keyboard close ── */
  document.addEventListener('keydown', otpEscListener);

  /* ── Simulate sending delay, then show inputs ── */
  setTimeout(() => {
    const loading = document.getElementById('otpLoading');
    if (loading) loading.classList.add('otp-loading-done');
    /* Focus first box after shimmer fades */
    setTimeout(() => {
      const firstBox = document.querySelector('.otp-box');
      if (firstBox) firstBox.focus();
      startResendTimer(type);
    }, 350);
  }, 1200); /* 1.2 s simulated send time */

  /* Animate card in */
  requestAnimationFrame(() => {
    const backdrop = document.getElementById('otpBackdrop');
    if (backdrop) backdrop.classList.add('otp-visible');
  });
}

/* ──────────────────────────────────────────────────────────
   OTP INPUT HANDLERS
────────────────────────────────────────────────────────── */

/** Block non-numeric, handle Backspace navigation */
function otpKeyDown(e) {
  const box   = e.currentTarget;                          /* fix: was `this` — broken in strict mode with .bind() */
  const idx   = parseInt(box.dataset.idx);
  const boxes = [...document.querySelectorAll('.otp-box')];

  if (e.key === 'Backspace') {
    if (box.value === '' && idx > 0) {
      boxes[idx - 1].value = '';
      boxes[idx - 1].focus();
    }
  }

  /* Allow: digits, Backspace, Tab, Arrow keys, Delete */
  if (!/^\d$/.test(e.key) &&
      !['Backspace','Tab','ArrowLeft','ArrowRight','Delete'].includes(e.key)) {
    e.preventDefault();
  }
}

/** Auto-advance after valid digit input */
function otpInput(e, type) {
  const box   = e.currentTarget;                          /* fix: was `this` — broken when bound */
  const boxes = [...document.querySelectorAll('.otp-box')];
  const idx   = parseInt(box.dataset.idx);

  /* Sanitise: keep only the last typed digit */
  box.value = box.value.replace(/\D/g, '').slice(-1);

  /* Advance focus to next box */
  if (box.value && idx < 3) {
    boxes[idx + 1].focus();
  }

  /* Enable/disable Verify Code button */
  const allFilled = boxes.every(b => b.value.length === 1);
  const btn = document.getElementById('otpVerifyBtn');
  if (btn) btn.disabled = !allFilled;

  /* Auto-submit when all 4 boxes are filled */
  if (allFilled) {
    setTimeout(() => verifyOTP(type), 300);
  }

  /* Clear any previous error message */
  clearOTPError();
}

/** Handle paste — distribute digits across boxes */
function otpPaste(e, type) {
  e.preventDefault();
  const pasted = (e.clipboardData || window.clipboardData)
    .getData('text').replace(/\D/g, '').slice(0, 4);
  if (!pasted) return;

  const boxes = [...document.querySelectorAll('.otp-box')];
  pasted.split('').forEach((d, i) => { if (boxes[i]) boxes[i].value = d; });

  /* Focus last filled or last box */
  const lastIdx = Math.min(pasted.length - 1, 3);
  boxes[lastIdx].focus();

  const allFilled = boxes.every(b => b.value.length === 1);
  const btn = document.getElementById('otpVerifyBtn');
  if (btn) btn.disabled = !allFilled;

  if (allFilled) {
    setTimeout(() => verifyOTP(type), 300);
  }
}

/** ESC key closes modal */
function otpEscListener(e) {
  if (e.key === 'Escape') closeOTPModal();
}

/* ──────────────────────────────────────────────────────────
   6.  verifyOTP
────────────────────────────────────────────────────────── */
function verifyOTP(type) {
  const boxes    = [...document.querySelectorAll('.otp-box')];
  const entered  = boxes.map(b => b.value).join('');
  const expected = OTPState[type].otp;

  if (entered.length < 4) return;

  const btn = document.getElementById('otpVerifyBtn');

  /* Loading state */
  if (btn) { btn.disabled = true; btn.classList.add('otp-btn-loading'); }

  /* Simulate network verification delay */
  setTimeout(() => {
    if (btn) btn.classList.remove('otp-btn-loading');

    if (entered === expected) {
      /* ── SUCCESS ── */
      OTPState[type].verified = true;
      clearInterval(OTPState[type].timer);

      showOTPSuccess(type);

      /* After success animation, close modal & mark field */
      setTimeout(() => {
        closeOTPModal();
        markFieldVerified(type);
        showToast(`${type === 'phone' ? 'Phone number' : 'Email address'} verified successfully! ✓`, true);
      }, 1500);

    } else {
      /* ── FAILURE ── */
      showOTPError('Incorrect code. Please try again.');
      shakeOTPBoxes();
      boxes.forEach(b => { b.value = ''; });
      boxes[0].focus();
      if (btn) btn.disabled = true;
    }
  }, 800);
}

/* ──────────────────────────────────────────────────────────
   7.  startResendTimer
────────────────────────────────────────────────────────── */
function startResendTimer(type) {
  /* Clear any existing timer */
  if (OTPState[type].timer) clearInterval(OTPState[type].timer);

  let seconds = 30;
  updateCountdownUI(seconds);

  OTPState[type].timer = setInterval(() => {
    seconds--;
    updateCountdownUI(seconds);
    if (seconds <= 0) {
      clearInterval(OTPState[type].timer);
      showResendButton();
    }
  }, 1000);
}

function updateCountdownUI(s) {
  const cd   = document.getElementById('otpCountdown');
  const text = document.getElementById('otpResendText');
  if (cd)   cd.textContent = s;
  if (text) text.style.display = s > 0 ? 'block' : 'none';
}

function showResendButton() {
  const btn = document.getElementById('otpResendBtn');
  if (btn) btn.style.display = 'inline-flex';
}

/* ──────────────────────────────────────────────────────────
   resendOTP — re-generates and re-sends
────────────────────────────────────────────────────────── */
function resendOTP(type) {
  const otp = generateOTP();
  OTPState[type].otp = otp;
  console.log(`%c[OTP Demo] Resent ${type.toUpperCase()} OTP: ${otp}`, 'background:#1a4731;color:#c9a84c;font-size:14px;padding:4px 8px;border-radius:4px');

  /* Reset UI */
  const boxes = [...document.querySelectorAll('.otp-box')];
  boxes.forEach(b => { b.value = ''; });
  boxes[0].focus();

  const btn = document.getElementById('otpVerifyBtn');
  if (btn) btn.disabled = true;

  const resendBtn = document.getElementById('otpResendBtn');
  if (resendBtn) resendBtn.style.display = 'none';

  clearOTPError();
  showOTPMsg('A new code has been sent!', 'info');
  startResendTimer(type);
}

/* ──────────────────────────────────────────────────────────
   8.  closeOTPModal
────────────────────────────────────────────────────────── */
function closeOTPModal(silent = false) {
  const backdrop = document.getElementById('otpBackdrop');
  if (!backdrop) return;

  document.removeEventListener('keydown', otpEscListener);

  if (silent) {
    backdrop.remove();
    return;
  }

  backdrop.classList.remove('otp-visible');
  backdrop.classList.add('otp-closing');
  setTimeout(() => backdrop.remove(), 350);
}

/* ──────────────────────────────────────────────────────────
   markFieldVerified  — locks the input, shows green badge
────────────────────────────────────────────────────────── */
function markFieldVerified(type) {
  const inputId  = type === 'phone' ? 'f_contact_phone' : 'f_contact_email';
  const wrapId   = type === 'phone' ? 'vw_phone'        : 'vw_email';
  const errId    = type === 'phone' ? 'e_contact_phone'  : 'e_contact_email';
  const verifyId = type === 'phone' ? 'verifyPhoneBtn'   : 'verifyEmailBtn';

  const input    = document.getElementById(inputId);
  const wrap     = document.getElementById(wrapId);
  const verifyBtn= document.getElementById(verifyId);

  if (input) {
    input.readOnly = true;
    input.classList.add('fc-verified');
    input.setAttribute('aria-description', 'Verified');
  }
  clearFieldError(errId);

  /* Swap "Verify" button for badge + "Change" link */
  if (verifyBtn) verifyBtn.style.display = 'none';

  const badge = document.createElement('div');
  badge.className = 'verified-badge';
  badge.id = `badge_${type}`;
  badge.innerHTML = `
    <span class="verified-icon">✓</span>
    <span class="verified-label">Verified</span>
    <button class="change-btn" onclick="changeVerified('${type}')" type="button"
            aria-label="Change ${type}">Change</button>`;

  if (wrap) wrap.appendChild(badge);

  /* Animate badge in */
  requestAnimationFrame(() => badge.classList.add('badge-visible'));
}

/* ──────────────────────────────────────────────────────────
   changeVerified  — re-unlocks a verified field
────────────────────────────────────────────────────────── */
function changeVerified(type) {
  const inputId  = type === 'phone' ? 'f_contact_phone' : 'f_contact_email';
  const verifyId = type === 'phone' ? 'verifyPhoneBtn'   : 'verifyEmailBtn';

  const input    = document.getElementById(inputId);
  const verifyBtn= document.getElementById(verifyId);
  const badge    = document.getElementById(`badge_${type}`);

  if (input) {
    input.readOnly = false;
    input.classList.remove('fc-verified');
    input.value = '';
    setTimeout(() => input.focus(), 50);
  }

  OTPState[type].verified = false;
  OTPState[type].otp      = null;

  if (badge)     badge.remove();
  if (verifyBtn) verifyBtn.style.display = 'none'; /* re-hidden; shown on input */
}

/* ──────────────────────────────────────────────────────────
   VERIFICATION GATE  — called inside submitProfile()
   Returns true if both phone and email are verified.
────────────────────────────────────────────────────────── */
function checkVerificationGate() {
  let ok = true;

  if (!OTPState.phone.verified) {
    showFieldError('e_contact_phone', 'Please verify your phone number before submitting');
    ok = false;
  }
  if (!OTPState.email.verified) {
    showFieldError('e_contact_email', 'Please verify your email address before submitting');
    ok = false;
  }

  if (!ok) {
    const first = document.querySelector('#e_contact_phone.show, #e_contact_email.show');
    if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  return ok;
}

/* ──────────────────────────────────────────────────────────
   UI HELPERS
────────────────────────────────────────────────────────── */

function showOTPMsg(msg, type = 'info') {
  const el = document.getElementById('otpMsg');
  if (!el) return;
  el.textContent  = msg;
  el.className    = `otp-msg otp-msg-${type} otp-msg-show`;
}
function showOTPError(msg) { showOTPMsg(msg, 'error'); shakeOTPBoxes(); }
function showOTPSuccess(type) {
  const el = document.getElementById('otpMsg');
  if (el) {
    el.textContent = `✓ ${type === 'phone' ? 'Phone number' : 'Email'} verified!`;
    el.className   = 'otp-msg otp-msg-success otp-msg-show';
  }
  document.querySelectorAll('.otp-box').forEach(b => b.classList.add('otp-box-success'));
}
function clearOTPError() {
  const el = document.getElementById('otpMsg');
  if (el) el.className = 'otp-msg';
}

function shakeOTPBoxes() {
  const wrap = document.getElementById('otpInputs');
  if (!wrap) return;
  wrap.classList.remove('otp-shake');
  requestAnimationFrame(() => wrap.classList.add('otp-shake'));
  setTimeout(() => wrap.classList.remove('otp-shake'), 600);
}

function shakeInput(el) {
  if (!el) return;
  el.classList.remove('fc-shake');
  requestAnimationFrame(() => el.classList.add('fc-shake'));
  setTimeout(() => el.classList.remove('fc-shake'), 500);
}

function showFieldError(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.textContent = msg; el.classList.add('show'); }
}
function clearFieldError(id) {
  const el = document.getElementById(id);
  if (el) { el.textContent = ''; el.classList.remove('show'); }
}

/** Small toast notification */
function showToast(msg, success = true) {
  const existing = document.getElementById('sfToast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id        = 'sfToast';
  toast.className = `sf-toast ${success ? 'sf-toast-ok' : 'sf-toast-err'}`;
  toast.textContent = msg;
  toast.setAttribute('role', 'status');
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('sf-toast-show'));
  setTimeout(() => {
    toast.classList.remove('sf-toast-show');
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

/* ──────────────────────────────────────────────────────────
   VERIFY BUTTON VISIBILITY  — show/hide Verify button
   as the user types in phone/email fields
────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  const phoneInput = document.getElementById('f_contact_phone');
  const emailInput = document.getElementById('f_contact_email');
  const phoneBtn   = document.getElementById('verifyPhoneBtn');
  const emailBtn   = document.getElementById('verifyEmailBtn');

  /* Show "Verify" button automatically once field has content */
  function toggleVerifyBtn(input, btn, state) {
    if (!input || !btn) return;
    if (!state.verified) {
      btn.style.display = input.value.trim().length > 3 ? 'inline-flex' : 'none';
    }
  }

  if (phoneInput) {
    phoneInput.addEventListener('input', () => toggleVerifyBtn(phoneInput, phoneBtn, OTPState.phone));
  }
  if (emailInput) {
    emailInput.addEventListener('input', () => toggleVerifyBtn(emailInput, emailBtn, OTPState.email));
  }
});