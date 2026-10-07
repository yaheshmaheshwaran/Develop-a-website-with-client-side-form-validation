/* =============================================
   PROJECT 1 – Form Validation | script.js
   ============================================= */

'use strict';

// ─── Utilities ────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const setValid   = (group, errEl) => { group.classList.add('valid');   group.classList.remove('invalid', 'shake'); errEl.textContent = ''; errEl.classList.remove('visible'); };
const setInvalid = (group, errEl, msg) => {
  group.classList.add('invalid'); group.classList.remove('valid');
  errEl.textContent = msg; errEl.classList.add('visible');
  group.classList.remove('shake');
  void group.offsetWidth; // reflow to re-trigger animation
  group.classList.add('shake');
};
const clearState = (group, errEl) => { group.classList.remove('valid','invalid','shake'); errEl.textContent = ''; errEl.classList.remove('visible'); };

// ─── Validators ────────────────────────────────────────────────
const rules = {
  fullName(val) {
    if (!val.trim()) return 'Full name is required.';
    if (val.trim().length < 3) return 'Name must be at least 3 characters.';
    if (!/^[a-zA-Z\s'-]+$/.test(val.trim())) return 'Name can only contain letters, spaces, hyphens or apostrophes.';
    return null;
  },
  username(val) {
    if (!val.trim()) return 'Username is required.';
    if (val.length < 3) return 'Username must be at least 3 characters.';
    if (val.length > 20) return 'Username cannot exceed 20 characters.';
    if (!/^[a-zA-Z0-9_]+$/.test(val)) return 'Only letters, numbers and underscores allowed.';
    return null;
  },
  email(val) {
    if (!val.trim()) return 'Email address is required.';
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(val)) return 'Please enter a valid email address.';
    return null;
  },
  phone(val) {
    if (!val.trim()) return 'Phone number is required.';
    const cleaned = val.replace(/[\s\-().+]/g, '');
    if (!/^\d{7,15}$/.test(cleaned)) return 'Enter a valid phone number (7–15 digits).';
    return null;
  },
  password(val) {
    if (!val) return 'Password is required.';
    if (val.length < 8) return 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(val)) return 'Include at least one uppercase letter.';
    if (!/[a-z]/.test(val)) return 'Include at least one lowercase letter.';
    if (!/\d/.test(val)) return 'Include at least one number.';
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val)) return 'Include at least one special character.';
    return null;
  },
  confirm(val, ref) {
    if (!val) return 'Please confirm your password.';
    if (val !== ref) return 'Passwords do not match.';
    return null;
  },
  terms(checked) {
    if (!checked) return 'You must agree to the terms and conditions.';
    return null;
  }
};

// ─── Password Strength ─────────────────────────────────────────
function getStrength(val) {
  let score = 0;
  if (!val) return { score: 0, label: '', color: '' };
  if (val.length >= 8) score++;
  if (val.length >= 12) score++;
  if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
  if (/\d/.test(val)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val)) score++;

  const levels = [
    { label: '', color: '' },
    { label: 'Very Weak', color: '#ef4444' },
    { label: 'Weak', color: '#f59e0b' },
    { label: 'Fair', color: '#eab308' },
    { label: 'Strong', color: '#22c55e' },
    { label: 'Very Strong', color: '#10b981' },
  ];
  return { score, ...levels[score] };
}

function updateStrength(val) {
  const { score, label, color } = getStrength(val);
  const fill = $('strengthFill');
  const labelEl = $('strengthLabel');
  const pct = (score / 5) * 100;
  fill.style.width = `${pct}%`;
  fill.style.background = color;
  labelEl.textContent = label;
  labelEl.style.color = color;
}

// ─── Field validation wrappers ─────────────────────────────────
function validateField(fieldId) {
  const el = $(fieldId);
  const val = el ? el.value : '';
  const group = $(`group-${fieldId === 'fullName' ? 'name' : fieldId === 'confirmPassword' ? 'confirm' : fieldId}`);
  const errEl = $(`error-${fieldId === 'fullName' ? 'name' : fieldId === 'confirmPassword' ? 'confirm' : fieldId}`);
  let error;

  switch (fieldId) {
    case 'fullName':    error = rules.fullName(val); break;
    case 'username':    error = rules.username(val); break;
    case 'email':       error = rules.email(val); break;
    case 'phone':       error = rules.phone(val); break;
    case 'password':    error = rules.password(val); updateStrength(val); break;
    case 'confirmPassword': error = rules.confirm(val, $('password').value); break;
  }

  if (error) { setInvalid(group, errEl, error); return false; }
  else        { setValid(group, errEl); return true; }
}

// ─── Real-time listeners ────────────────────────────────────────
['fullName','username','email','phone','password','confirmPassword'].forEach(id => {
  const el = $(id);
  if (!el) return;
  el.addEventListener('input', () => {
    const groupId = id === 'fullName' ? 'group-name' : id === 'confirmPassword' ? 'group-confirm' : `group-${id}`;
    const errId   = id === 'fullName' ? 'error-name' : id === 'confirmPassword' ? 'error-confirm' : `error-${id}`;
    if ($(groupId).classList.contains('invalid') || $(groupId).classList.contains('valid')) {
      validateField(id);
    } else {
      // Just update strength bar even before first blur
      if (id === 'password') updateStrength(el.value);
    }
  });
  el.addEventListener('blur', () => validateField(id));
});

// ─── Toggle password visibility ─────────────────────────────────
$('togglePwd').addEventListener('click', () => {
  const input = $('password');
  const isText = input.type === 'text';
  input.type = isText ? 'password' : 'text';
  const icon = $('togglePwd').querySelector('.eye-icon');
  icon.innerHTML = isText
    ? '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'
    : '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
});

// ─── Form Submit ───────────────────────────────────────────────
$('signupForm').addEventListener('submit', async e => {
  e.preventDefault();

  // Validate all fields
  const fieldResults = ['fullName','username','email','phone','password','confirmPassword'].map(validateField);

  // Terms check
  const termsChecked = $('terms').checked;
  const termsGroup = $('group-terms');
  const termsErr   = $('error-terms');
  if (!termsChecked) {
    setInvalid(termsGroup, termsErr, 'You must accept the terms and conditions.');
    fieldResults.push(false);
  } else {
    setValid(termsGroup, termsErr);
    fieldResults.push(true);
  }

  if (fieldResults.includes(false)) return;

  // Simulate async submission
  const btn = $('submitBtn');
  const btnText = btn.querySelector('.btn-text');
  const loader  = $('btnLoader');
  btn.disabled = true;
  btnText.style.display = 'none';
  loader.style.display  = 'block';

  await new Promise(r => setTimeout(r, 1800));

  $('signupForm').style.display = 'none';
  $('successState').classList.add('visible');
});

// ─── Reset ──────────────────────────────────────────────────────
function resetForm() {
  $('signupForm').reset();
  $('signupForm').style.display = 'block';
  $('successState').classList.remove('visible');

  ['fullName','username','email','phone','password','confirmPassword'].forEach(id => {
    const groupId = id === 'fullName' ? 'group-name' : id === 'confirmPassword' ? 'group-confirm' : `group-${id}`;
    const errId   = id === 'fullName' ? 'error-name' : id === 'confirmPassword' ? 'error-confirm' : `error-${id}`;
    const group = $(groupId);
    const err   = $(errId);
    if (group && err) clearState(group, err);
  });

  $('strengthFill').style.width = '0';
  $('strengthLabel').textContent = '';
  const btn = $('submitBtn');
  btn.disabled = false;
  btn.querySelector('.btn-text').style.display = 'block';
  $('btnLoader').style.display = 'none';
}
