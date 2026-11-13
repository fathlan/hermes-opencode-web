(() => {
  'use strict';

  // ---------------- palette (klasik Rubik) ----------------
  const C = {
    red: '#EF2D5E', orange: '#F28500', white: '#FFFFFF', yellow: '#F2B83D',
    teal: '#00A34A', blue: '#1C75BC'
  };
  const FACE_COL = { F: C.red, B: C.orange, U: C.white, D: C.yellow, R: C.teal, L: C.blue };
  const FACE_DIR = ['F', 'B', 'U', 'D', 'R', 'L'];
  const AXIS = { F: 'Z', B: 'Z', U: 'Y', D: 'Y', R: 'X', L: 'X' };
  const LAYER_VAL = { F: 1, B: -1, U: 1, D: -1, R: 1, L: -1 };
  // sign per face; opposite faces opposite
  const SIGN = { F: -1, B: 1, U: -1, D: 1, R: -1, L: 1 };

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  const scene = $('#scene'), cube = $('#cube'), fx = $('#fx');
  const countEl = $('#count'), msgEl = $('#msg');
  const timerEl = $('#timer');
  const moveBtn = $('#btn-move'), scrambleBtn = $('#btn-scramble'), resetBtn = $('#btn-reset');
  const faceBtns = $$('.face-btn');

  const SIZE = 60, HALF = SIZE / 2, STEP = SIZE;

  // state
  const scrambleCounts = { F: 0, B: 0, U: 0, D: 0, R: 0, L: 0 };
  let solved = true;
  let animating = false;

  // each cubie: {x,y,z, el, rot: [9] row-major rotation matrix}
  const cubies = [];

  // ---------- rotation helpers ----------
  // rotate vector v by 90*sign around axis
  const rotVec = (axis, s, v) => {
    const { x, y, z } = v;
    if (axis === 'X') return { x, y: -s * z, z: s * y };
    if (axis === 'Y') return { x: s * z, y, z: -s * x };
    return { x: -s * y, y: s * x, z };
  };

  // rotation matrix (3x3 row-major) for axis, sign
  const rotMatrix = (axis, s) => {
    if (axis === 'X') return [1, 0, 0, 0, 0, -s, 0, s, 0];
    if (axis === 'Y') return [0, 0, s, 0, 1, 0, -s, 0, 0];
    return [0, -s, 0, s, 0, 0, 0, 0, 1];
  };

  const matMul = (a, b) => {
    const r = [];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
      let s = 0;
      for (let k = 0; k < 3; k++) s += a[i * 3 + k] * b[k * 3 + j];
      r.push(s);
    }
    return r;
  };

  const vecMul = (m, v) => {
    return {
      x: m[0] * v.x + m[1] * v.y + m[2] * v.z,
      y: m[3] * v.x + m[4] * v.y + m[5] * v.z,
      z: m[6] * v.x + m[7] * v.y + m[8] * v.z
    };
  };

  const buildCubies = () => {
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const cx = x * STEP, cy = y * STEP, cz = z * STEP;
          const isCenter = !x && !y && !z;
          const el = document.createElement('div');
          el.className = 'cubie' + (isCenter ? ' no-face' : '');
          el.style.transform = `translate3d(${cx}px, ${cy}px, ${cz}px)`;
          const inner = document.createElement('div');
          inner.className = 'inner';
          el.appendChild(inner);
          for (const f of FACE_DIR) {
            const face = document.createElement('div');
            face.className = 'face ' + f.toLowerCase();
            face.style.background = FACE_COL[f];
            el.appendChild(face);
          }
          scene.appendChild(el);
          cubies.push({ x, y, z, el, rot: [1, 0, 0, 0, 1, 0, 0, 0, 1] });
        }
      }
    }
  };

  // apply a move to the layer, return list of changed cubies
  const applyMove = (axis, s, layerVal) => {
    const M = rotMatrix(axis, s);
    const list = [];
    for (const c of cubies) {
      let cc;
      if (axis === 'X') cc = c.x;
      else if (axis === 'Y') cc = c.y;
      else cc = c.z;
      if (cc === layerVal) list.push(c);
    }
    for (const c of list) {
      const p = { x: c.x, y: c.y, z: c.z };
      c.x = vecMul(M, p).x;
      c.y = vecMul(M, p).y;
      c.z = vecMul(M, p).z;
      c.rot = matMul(M, c.rot);
    }
    return list;
  };

  // colour cubie faces
  const draw = () => {
    for (const c of cubies) {
      const p = { x: c.x, y: c.y, z: c.z };
      for (let i = 0; i < 6; i++) {
        const dir = ['+X', '-X', '+Y', '-Y', '+Z', '-Z'][i];
        const face = c.el.querySelector('.' + dir.toLowerCase());
        // world direction of this local face = rot * dir
        const w = vecMul(c.rot, { x: dir === '+X' ? 1 : dir === '-X' ? -1 : 0, y: dir === '+Y' ? 1 : dir === '-Y' ? -1 : 0, z: dir === '+Z' ? 1 : dir === '-Z' ? -1 : 0 });
        const dot = p.x * w.x + p.y * w.y + p.z * w.z;
        const vis = Math.abs(dot) === 1;
        if (vis) {
          let big = null;
          if (w.x > 0) big = 'R'; else if (w.x < 0) big = 'L';
          else if (w.y > 0) big = 'U'; else if (w.y < 0) big = 'D';
          else if (w.z > 0) big = 'F'; else if (w.z < 0) big = 'B';
          face.style.background = FACE_COL[big];
        } else {
          face.style.background = '#16223A';
        }
      }
    }
  };

  const doMove = (axis, s, layerVal) => {
    if (animating) return;
    const list = applyMove(axis, s, layerVal);
    if (!list.length) return;
    animating = true;
    msgEl.textContent = '';
    list.forEach((c, i) => {
      requestAnimationFrame(() => {
        c.el.style.transition = `transform 150ms cubic-bezier(.3,.85,.4,1)`;
        c.el.style.transform = `translate3d(${c.x * STEP}px, ${c.y * STEP}px, ${c.z * STEP}px)`;
        setTimeout(() => {
          c.el.style.transition = `transform 90ms ease`;
          c.el.style.transform = `translate3d(${c.x * STEP}px, ${c.y * STEP}px, ${c.z * STEP}px) translateZ(${Math.random() * 2 - 1}px)`;
          setTimeout(() => { animating = false; }, 140);
        }, 70);
      });
    });
  };

  const reschuffle = () => {
    for (const k in scrambleCounts) scrambleCounts[k] = 0;
    solved = true;
    updateCount();
    draw();
    msgEl.textContent = '🔙 sudah normal (solved)';
  };

  const scramble = (n) => {
    n = n || 18;
    const faces = ['F', 'B', 'U', 'D', 'R', 'L'];
    let d = 0;
    while (d < n) {
      const f = faces[(Math.random() * 6) | 0];
      if (scrambleCounts[f] < 14) { scrambleCounts[f]++; d++; }
    }
    for (const f of faces) {
      let cnt = 0;
      for (let i = 0; i < 6 && cnt < scrambleCounts[f]; i++) {
        doMove(AXIS[f], SIGN[f], LAYER_VAL[f]);
        cnt++;
      }
    }
    solved = false;
    updateCount();
    msgEl.textContent = '🔀 acak selesai';
  };

  // ---------- events ----------
  faceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const face = btn.dataset.face;
      doMove(AXIS[face], SIGN[face], LAYER_VAL[face]);
    });
  });

  scrambleBtn.addEventListener('click', () => {
    if (animating) return;
    scramble(16);
    msgEl.textContent = '🔀 acak...';
  });
  resetBtn.addEventListener('click', reschuffle);
  moveBtn.addEventListener('click', () => {
    if (solved) { scramble(6); msgEl.textContent = '🔀 pancingan!'; return; }
    const f = ['F', 'B', 'U', 'D', 'R', 'L'][(Math.random() * 6) | 0];
    doMove(AXIS[f], SIGN[f], LAYER_VAL[f]);
  });

  cube.addEventListener('click', (e) => {
    const rect = cube.getBoundingClientRect();
    const cx = e.clientX - rect.left, cy = e.clientY - rect.top;
    const tw = (cx / rect.width - 0.5) * 2, ty = (cy / rect.height - 0.5) * 2;
    if (tw < -0.2 && ty < -0.2) {
      const f = ['F', 'B', 'U', 'D', 'R', 'L'][(Math.random() * 6) | 0];
      doMove(AXIS[f], SIGN[f], LAYER_VAL[f]);
    }
  });

  // timer
  const lastTick = Date.now();
  const tickTimer = () => {
    const diff = Math.floor((Date.now() - lastTick) / 1000);
    const m = String(Math.floor(diff / 60)).padStart(2, '0');
    const s = String(diff % 60).padStart(2, '0');
    timerEl.textContent = `${m}:${s}`;
  };
  tickTimer();
  setInterval(tickTimer, 250);

  // confetti
  const burst = () => {
    const cv = document.createElement('canvas');
    cv.style.position = 'fixed'; cv.style.pointerEvents = 'none';
    cv.style.zIndex = '999'; cv.style.left = '0'; cv.style.top = '0';
    cv.width = innerWidth; cv.height = innerHeight;
    const ctx = cv.getContext('2d');
    const colors = [C.red, C.orange, C.white, C.yellow, C.teal, C.blue, '#F4B41A'];
    const ps = Array.from({ length: 46 }, () => ({
      x: innerWidth / 2 + (Math.random() - 0.5) * 140,
      y: innerHeight / 2 + (Math.random() - 0.5) * 140,
      vx: (Math.random() - 0.5) * 11,
      vy: (Math.random() - 0.5) * 11 - 5,
      s: 4 + Math.random() * 7,
      c: colors[Math.random() * colors.length | 0]
    }));
    let f = 0;
    const tick = () => {
      ctx.clearRect(0, 0, cv.width, cv.height);
      ps.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.32; ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, p.s, p.s); });
      if (++f < 110) requestAnimationFrame(tick);
      else { document.body.removeChild(cv); }
    };
    document.body.appendChild(cv);
    tick();
  };

  // sparkle on hover
  cube.addEventListener('mousemove', (e) => {
    const rect = cube.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const tw = (x / rect.width - 0.5) * 2, ty = (y / rect.height - 0.5) * 2;
    if (tw < -0.35 && ty < -0.35) {
      fx.classList.remove('ring'); void fx.offsetWidth; fx.classList.add('ring');
      for (let i = 0; i < 5; i++) {
        const sp = document.createElement('div');
        sp.className = 'spark';
        sp.style.setProperty('--dx', (Math.random() - 0.5) * 40 + 'px');
        sp.style.setProperty('--dy', (Math.random() - 0.5) * 40 + 'px');
        sp.style.background = ['#EF2D5E', '#F4B41A', '#00A34A', '#1C75BC', '#F2B83D'][i % 5];
        cube.appendChild(sp);
        setTimeout(() => sp.remove(), 700);
      }
    }
  });

  buildCubies();
  draw();
})();
