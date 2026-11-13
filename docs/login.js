(() => {
  'use strict';

  const tabs = document.querySelectorAll('.tab');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const togglePass = document.getElementById('toggle-pass');
  const togglePassReg = document.getElementById('toggle-pass-reg');
  const passwordInput = document.getElementById('password');
  const passwordRegInput = document.getElementById('password-reg');
  const strengthBar = document.getElementById('strength-bar');
  const strengthText = document.getElementById('strength-text');
  const strengthBarReg = document.getElementById('strength-bar-reg');
  const strengthTextReg = document.getElementById('strength-text-reg');
  const submitBtn = document.getElementById('submit-btn');
  const registerBtn = document.getElementById('register-btn');
  const formMsg = document.getElementById('form-msg');
  const registerMsg = document.getElementById('register-msg');
  const emailInput = document.getElementById('email');
  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');
  const nameInput = document.getElementById('name');
  const nameError = document.getElementById('name-error');
  const emailRegInput = document.getElementById('email-reg');
  const emailRegError = document.getElementById('email-reg-error');
  const passwordRegError = document.getElementById('password-reg-error');

  let activeTab = 'login';

  // ---------- tab Masuk / Daftar ----------
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  function switchTab(name) {
    activeTab = name;
    loginForm.classList.toggle('active', name === 'login');
    registerForm.classList.toggle('active', name === 'register');
    tabs.forEach((t) => {
      const on = t.dataset.tab === name;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', String(on));
    });
  }

  // ---------- lihat / sembunyikan kata sandi ----------
  const setupToggle = (toggle, input) => {
    toggle.addEventListener('click', () => {
      const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
      input.setAttribute('type', type);
      toggle.setAttribute(
        'aria-label',
        type === 'password' ? 'Lihat kata sandi' : 'Sembunyikan kata sandi'
      );
      toggle.textContent = type === 'password' ? '👁' : '🙈';
    });
  };
  setupToggle(togglePass, passwordInput);
  setupToggle(togglePassReg, passwordRegInput);

  // ---------- pengukur kekuatan kata sandi ----------
  const updateStrength = (input, bar, text) => {
    const val = input.value;
    let score = 0;
    if (val.length >= 8) score += 20;
    if (val.length >= 12) score += 10;
    if (/[a-z]/.test(val) && /[A-Z]/.test(val)) score += 20;
    if (/\d/.test(val)) score += 20;
    if (/[^a-zA-Z0-9]/.test(val)) score += 30;

    let level = 'Lemah';
    let color = '#F2603D';
    if (score >= 70) {
      level = 'Kuat';
      color = '#1FA86E';
    } else if (score >= 40) {
      level = 'Cukup';
      color = '#E8A33D';
    }
    bar.style.width = score + '%';
    bar.style.background = color;
    text.textContent = level + ' (' + score + '%)';
    bar.classList.toggle('meter-weak', score < 40);
    bar.classList.toggle('meter-pass', score >= 70);
    bar.classList.toggle('meter-mid', score >= 40 && score < 70);
  };

  [passwordInput, passwordRegInput].forEach((input, i) => {
    const bar = i === 0 ? strengthBar : strengthBarReg;
    const text = i === 0 ? strengthText : strengthTextReg;
    input.addEventListener('input', () => updateStrength(input, bar, text));
  });
  updateStrength(passwordInput, strengthBar, strengthText);
  updateStrength(passwordRegInput, strengthBarReg, strengthTextReg);

  // ---------- validasi isian ----------
  const setError = (el, msg) => {
    el.textContent = msg;
    el.parentElement.classList.toggle('has-error', !!msg);
  };

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const validateLogin = () => {
    let ok = true;
    const email = emailInput.value.trim();
    const pass = passwordInput.value;

    if (!email) {
      setError(emailError, 'Email wajib diisi.');
      ok = false;
    } else if (!isValidEmail(email)) {
      setError(emailError, 'Masukkan format email yang benar.');
      ok = false;
    } else {
      setError(emailError, '');
    }
    if (!pass) {
      setError(passwordError, 'Kata sandi wajib diisi.');
      ok = false;
    } else if (pass.length < 6) {
      setError(passwordError, 'Kata sandi minimal 6 karakter.');
      ok = false;
    } else {
      setError(passwordError, '');
    }
    return ok;
  };

  const validateRegister = () => {
    let ok = true;
    if (!nameInput.value.trim()) {
      setError(nameError, 'Nama wajib diisi.');
      ok = false;
    } else {
      setError(nameError, '');
    }
    const email = emailRegInput.value.trim();
    if (!email) {
      setError(emailRegError, 'Email wajib diisi.');
      ok = false;
    } else if (!isValidEmail(email)) {
      setError(emailRegError, 'Masukkan format email yang benar.');
      ok = false;
    } else {
      setError(emailRegError, '');
    }
    const pass = passwordRegInput.value;
    if (!pass) {
      setError(passwordRegError, 'Kata sandi wajib diisi.');
      ok = false;
    } else if (pass.length < 8) {
      setError(passwordRegError, 'Kata sandi minimal 8 karakter.');
      ok = false;
    } else {
      setError(passwordRegError, '');
    }
    return ok;
  };

  // ---------- simulasi berhasil masuk ----------
  const showMsg = (el, text, color) => {
    el.textContent = text;
    el.style.color = color;
    el.classList.add('show');
  };

  const hideMsg = (el) => {
    el.textContent = '';
    el.classList.remove('show');
  };

  const confettiBurst = () => {
    const canvas = document.getElementById('fx');
    const ctx = canvas.getContext('2d');
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
    const particles = [];
    for (let i = 0; i < 70; i++) {
      particles.push({
        x: Math.random() * W,
        y: -10 - Math.random() * H * 0.2,
        w: 4 + Math.random() * 6,
        h: 6 + Math.random() * 8,
        color: `hsl(${Math.random() * 360}, 80%, 62%)`,
        vx: (Math.random() - 0.5) * 7,
        vy: 1.5 + Math.random() * 2.5,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 8,
        life: 1,
      });
    }
    let tick = 0;
    const maxTick = 45;
    const loop = () => {
      tick++;
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        if (p.life <= 0) continue;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04;
        p.rot += p.rotSpeed;
        p.life -= 0.025;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (tick < maxTick) requestAnimationFrame(loop);
      else ctx.clearRect(0, 0, W, H);
    };
    loop();
  };

  const runSim = (isLogin, okText, failText) => {
    const btn = isLogin ? submitBtn : registerBtn;
    const msg = isLogin ? formMsg : registerMsg;
    btn.disabled = true;
    btn.textContent = 'Memproses…';
    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = isLogin ? 'Masuk' : 'Daftar';
      showMsg(msg, okText, 'var(--teal)');
      confettiBurst();
      setTimeout(() => hideMsg(msg), 4000);
    }, 600);
  };

  submitBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (!validateLogin()) return;
    runSim(true, '✅ Berhasil masuk! (simulasi)', '❌ Login gagal. Cek email dan kata sandi.');
  });

  registerBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (!validateRegister()) return;
    runSim(false, '✅ Registrasi berhasil! (simulasi)', '❌ Registrasi gagal. Coba lagi.');
  });
})();
