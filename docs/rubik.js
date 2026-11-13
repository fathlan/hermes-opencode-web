(() => {
  'use strict';

  const size = 76; // px setiap keping kecil
  const half = size / 2;
  const step = size; // langkah antar keping
  const N = 3;

  const scene = document.getElementById('scene');
  const cube = document.getElementById('cube');
  const fx = document.getElementById('fx');
  const countEl = document.getElementById('count');
  const msgEl = document.getElementById('msg');

  const COL = {
    F: '#F2603D', B: '#F2B83D', U: '#FFFFFF', D: '#F2B83D', R: '#0E9AA7', L: '#2563EB'
  };

  let turnCount = 0;
  let rotationMap = {};
  let animating = false;

  // ===== 1. bangun kubus 3x3 =====
  const cubies = [];
  const faceOrder = [['F','B','U','D','R','L']];

  const faceDir = {
    F: { axis: 'Y', sign: 1, color: COL.F, text: '⬤ F' },
    B: { axis: 'Y', sign: -1, color: COL.B, text: '⬤ B' },
    U: { axis: 'X', sign: 1, color: COL.U, text: '⬤ U' },
    D: { axis: 'X', sign: -1, color: COL.D, text: '⬤ D' },
    R: { axis: 'Z', sign: 1, color: COL.R, text: '⬤ R' },
    L: { axis: 'Z', sign: -1, color: COL.L, text: '⬤ L' },
  };

  const faceMap = {
    F: { axis: 'Y', offset: 1, col: 'F' },
    B: { axis: 'Y', offset: -1, col: 'B' },
    U: { axis: 'X', offset: 1, col: 'U' },
    D: { axis: 'X', offset: -1, col: 'D' },
    R: { axis: 'Z', offset: 1, col: 'R' },
    L: { axis: 'Z', offset: -1, col: 'L' },
  };

  // Build cubies: each cubie at (x,y,z) in {-1,0,1}^3
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        const cubie = document.createElement('div');
        cubie.className = 'cubie';
        cubie.style.setProperty('--cx', (x * step) + 'px');
        cubie.style.setProperty('--cy', (y * step) + 'px');
        cubie.style.setProperty('--cz', (z * step) + 'px');

        for (let f = 0; f < 6; f++) {
          const faceName = faceOrder[0][f]; // F,B,U,D,R,L
          const face = document.createElement('div');
          face.className = 'face ' + faceName.toLowerCase();
          // warni per arah: hanya yang ke arah permukaan kubus besar
          const dir = faceDir[faceName].axis;
          const isOuter = (dir === 'X' && x === faceDir[faceName].sign) ||
                          (dir === 'Y' && y === faceDir[faceName].sign) ||
                          (dir === 'Z' && z === faceDir[faceName].sign);
          if (isOuter) {
            face.style.background = faceDir[faceName].color;
          } else {
            face.style.background = 'rgba(255,255,255,.08)';
          }
          cubie.appendChild(face);
        }
        cube.appendChild(cubie);
        cubies.push({ x, y, z, el: cubie });
      }
    }
  }

  // ===== 2. rotasi layer =====
  const rotCache = {}; // kunci layer -> sudut

  function rot(angle) { return 'rotate' + angle + '(' + angle + 'deg)'; }

  function rotateLayer(face, angle) {
    const key = face + angle;
    let layer = rotationMap[key];
    if (!layer) {
      layer = document.createElement('div');
      layer.className = 'layer';
      layer.style.transformStyle = 'preserve-3d';
      // let layer be positioned at center via scene; we re-apply cubie transforms on render
      rotationMap[key] = layer;
      // keep ref by face & angle; we will re-parent
    }
    // remove existing children to avoid duplicates
    const existing = layer;
    // We'll rebuild layer content each render: clear and re-add matching cubies
  }

  // rebuild a layer (face) with current angles applied to cubies
  function buildLayer(face) {
    const dir = faceDir[face].axis;
    const sign = faceDir[face].sign;
    const layerEl = rotationMap[face] || (rotationMap[face] = document.createElement('div'));
    layerEl.innerHTML = '';
    layerEl.style.transformStyle = 'preserve-3d';

    const mov = faceMap[face].axis;
    const offset = faceMap[face].offset;

    cubies.forEach((c) => {
      if (c[mov] === offset) {
        // position cubie, then apply rotation around cube center
        const rotStr = rot(angle);
        c.el.style.transform = 'translate3d(' + (c.x * step) + 'px, ' + (c.y * step) + 'px, ' + (c.z * step) + 'px) ' + rotStr;
        layerEl.appendChild(c.el);
      }
    });

    // insert layer at front of cube so it renders above others
    cube.prepend(layerEl);
    return layerEl;
  }

  function clearRotations() {
    Object.keys(rotationMap).forEach(k => {
      const l = rotationMap[k];
      l.innerHTML = '';
      l.style.transform = 'none';
    });
  }

  // ===== 3. emulasikan warna (tambahkan warna pergerakan) =====
  function swapFaceColors(face, angle) {
    // simple: reassign visible face colors based on geometry — placeholder for advanced own-color
    // (we keep static solved colors, fine for demo)
  }

  // ===== 4. event =====
  let count = 0;

  document.querySelectorAll('.face-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (animating) return;
      const face = btn.dataset.face;
      const dir = faceDir[face];
      const angle = dir.axis === 'X' ? 90 : -90; // arah "miring" umum
      // konversi ke rotasi y/z yang konsisten
      const ang = dir.axis === 'Y' ? 90 : 90; // X/y/z -> turn layer by 90

      // halte manual untuk konsistensi: setiap klik rotasi 90 derajat
      animating = true;
      msgEl.textContent = '';

      const layer = buildLayer(face);
      // apply rotation
      layer.style.animation = 'spin 1.2s ease';
      setTimeout(() => {
        layer.style.animation = 'none';
        turnCount++;
        countEl.textContent = turnCount;
        animating = false;
      }, 1200);
    });
  });

  // ===== animasi kiri-atas (flash) =====
  document.querySelector('.cube').addEventListener('click', (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const tw = (x / rect.width - 0.5) * 2;
    const ty = (y / rect.height - 0.5) * 2;
    // kiri-atas: tw & ty negatif besar
    const flash = document.getElementById('fx');
    if (x < rect.width * 0.3 && y < rect.height * 0.3) {
      flash.classList.remove('visible');
      void flash.offsetWidth;
      flash.classList.add('visible');
      // sparkle kecil di kiri atas
      const c = document.createElement('div');
      c.style.cssText = 'position:absolute;width:18px;height:18px;border-radius:50%;background:var(--coral);top:-10px;left:-10px;pointer-events:none';
      flash.appendChild(c);
      setTimeout(() => c.remove(), 700);
      msgEl.textContent = '✨ putaran kiri-atas!';
      if (!animating) turnCount++;
      countEl.textContent = turnCount;
    } else {
      msgEl.textContent = '🧩 klik <strong>kiri-atas</strong> kubus untuk gerakan cepat';
    }
  });

  // ===== random =====
  document.getElementById('btn-scramble').addEventListener('click', () => {
    if (animating) return;
    let attempts = 0;
    const run = () => {
      animating = true;
      const faces = ['F','B','U','D','R','L'];
      let seq = '';
      while (seq.length < 8) {
        const f = faces[Math.floor(Math.random() * 6)];
        seq += f;
      }
      // actual rotate layer sequentially (just visual)
      seq.split('').forEach((f, i) => {
        setTimeout(() => {
          const layer = buildLayer(f);
          layer.style.animation = 'spin 0.9s ease';
          setTimeout(() => {
            layer.style.animation = 'none';
            if (i === seq.length - 1) { animating = false; }
          }, 900);
        }, i * 120);
      });
      msgEl.textContent = '🔀 acak...';
    };
    run();
  });

  document.getElementById('btn-reset').addEventListener('click', () => {
    clearRotations();
    turnCount = 0;
    countEl.textContent = '0';
    msgEl.textContent = '🔙 sudah normal (solved)';
  });
})();
