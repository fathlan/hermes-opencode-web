const $ = (s, el = document) => el.querySelector(s); // pintasan pilih elemen
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; // cek preferensi kurangi gerak
addEventListener('load', () => setTimeout(() => $('#loader').classList.add('done'), reduce ? 0 : 1500)); // tutup loader setelah gelembung
const root = document.documentElement; // elemen html untuk atur tema
try { root.dataset.theme = localStorage.getItem('tema') || 'terang'; } catch { root.dataset.theme = 'terang'; } // muat tema tersimpan
$('#theme').onclick = () => { // klik tombol tema
  root.dataset.theme = root.dataset.theme === 'gelap' ? 'terang' : 'gelap'; // balik tema
  try { localStorage.setItem('tema', root.dataset.theme); } catch {} // simpan pilihan tema
}; // akhir handler tema
const jawab = { // bank jawaban chatbot demo
  'Jam buka?': 'Kami buka setiap hari pukul 08.00 sampai 21.00.', // jawaban jam buka
  'Bisa antar?': 'Bisa! Antar gratis untuk jarak 3 km dari warung.', // jawaban antar
  'Ada promo?': 'Hari ini beli 2 kopi susu gratis 1 roti bakar.', // jawaban promo
  'Cara bayar?': 'Tunai, QRIS, atau transfer. Kirim bukti ke chat ini ya.', // jawaban bayar
}; // akhir bank jawaban
const log = $('#log'); // area percakapan
const say = (t, cls) => { // tambah gelembung pesan
  const p = document.createElement('p'); // buat elemen pesan
  p.className = cls; p.textContent = t; log.append(p); // isi dan tampilkan pesan
  log.scrollTop = log.scrollHeight; return p; // gulung ke bawah, kembalikan elemen
}; // akhir fungsi say
say('Halo! Saya asisten Warung Bu Sri. Pilih pertanyaan di bawah ya.', 'bot'); // sapaan awal
$('#chips').onclick = (e) => { // klik salah satu pertanyaan
  const q = e.target.closest('button'); if (!q) return; // abaikan klik di luar tombol
  say(q.textContent, 'me'); // tampilkan pertanyaan pengguna
  const d = say('•••', 'bot dots'); // tampilkan titik mengetik
  setTimeout(() => { d.className = 'bot'; d.textContent = jawab[q.textContent]; log.scrollTop = log.scrollHeight; }, reduce ? 0 : 900); // ganti dengan jawaban
}; // akhir handler chat
let z = 10; // urutan tumpukan catatan
document.querySelectorAll('.note').forEach((n) => { // setiap catatan tempel
  let x = 0, y = 0, sx = 0, sy = 0, on = false; // posisi dan status geser
  const h = $('.tape', n); // pita sebagai pegangan
  h.onpointerdown = (e) => { on = true; sx = e.clientX - x; sy = e.clientY - y; h.setPointerCapture(e.pointerId); n.classList.add('drag'); n.style.zIndex = ++z; }; // mulai geser
  h.onpointermove = (e) => { if (!on) return; x = e.clientX - sx; y = e.clientY - sy; n.style.translate = `${x}px ${y}px`; }; // ikuti pointer
  h.onpointerup = () => { on = false; n.classList.remove('drag'); }; // lepas catatan
}); // akhir loop catatan
let shown = 0; // angka hasil yang sedang tampil
const hitung = () => { // hitung dan animasikan hasil
  const jam = +$('#range').value, target = Math.round(jam * 0.6 * 22), from = shown, t0 = performance.now(); // ambil nilai slider
  $('#jam').textContent = jam; // tampilkan jam per hari
  const step = (t) => { // satu frame animasi angka
    const k = Math.min((t - t0) / 500, 1); // progres 0 sampai 1
    shown = Math.round(from + (target - from) * k); // interpolasi angka
    $('#hasil').textContent = shown; // tulis angka ke layar
    if (k < 1) requestAnimationFrame(step); // lanjut sampai selesai
  }; // akhir step
  requestAnimationFrame(step); // mulai animasi
}; // akhir hitung
$('#range').oninput = hitung; hitung(); // hitung saat slider digeser dan saat awal
const flow = $('.flow'); // daftar alur kerja
const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add('in')), { threshold: 0.5 }); // munculkan langkah saat terlihat
flow.querySelectorAll('li').forEach((li) => io.observe(li)); // amati tiap langkah
addEventListener('scroll', () => { // isi jalur sesuai scroll
  const r = flow.getBoundingClientRect(); // posisi daftar di layar
  flow.style.setProperty('--p', Math.min(Math.max((innerHeight * 0.65 - r.top) / r.height, 0), 1)); // hitung progres 0 sampai 1
}, { passive: true }); // listener ringan
const cv = $('#fx'), cx = cv.getContext('2d'); // kanvas konfeti
const boom = () => { // ledakan konfeti
  if (reduce) return; // lewati jika gerak dikurangi
  cv.width = innerWidth; cv.height = innerHeight; // samakan ukuran kanvas
  const ps = Array.from({ length: 100 }, () => ({ x: innerWidth / 2, y: innerHeight * 0.7, vx: (Math.random() - 0.5) * 16, vy: -Math.random() * 16 - 4, s: 4 + Math.random() * 6, c: ['#F4B41A', '#0E9AA7', '#F2603D', '#17233B'][Math.random() * 4 | 0] })); // buat partikel
  let f = 0; // hitung frame
  const tick = () => { // gambar satu frame
    cx.clearRect(0, 0, cv.width, cv.height); // bersihkan kanvas
    ps.forEach((p) => { p.x += p.vx; p.y += p.vy; p.vy += 0.4; cx.fillStyle = p.c; cx.fillRect(p.x, p.y, p.s, p.s); }); // gerakkan dan gambar
    if (++f < 110) requestAnimationFrame(tick); else cx.clearRect(0, 0, cv.width, cv.height); // ulangi lalu bersihkan
  }; // akhir tick
  tick(); // mulai animasi
}; // akhir boom
$('#form').onsubmit = (e) => { // kirim form (demo)
  e.preventDefault(); const f = e.target; // cegah reload halaman
  const nama = f.nama.value.trim(), ok = nama && f.pesan.value.trim().length >= 10; // validasi isian
  $('#msg').textContent = ok ? `Terima kasih, ${nama}! Pesanmu kami baca hari ini.` : 'Isi nama dan pesan minimal 10 huruf.'; // tampilkan hasil
  if (ok) { boom(); f.reset(); } // konfeti lalu kosongkan form
}; // akhir handler form
