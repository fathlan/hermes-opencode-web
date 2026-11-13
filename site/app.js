/* ============ App: interactivity for the landing page ============ */

// 1. Mobile navigation toggle
const navToggle = document.getElementById("nav-toggle");
const nav = document.getElementById("nav");

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", isOpen);
  });

  // Close menu when a link is clicked
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// 2. Smooth scroll for anchor links (fallback for older browsers)
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const targetId = anchor.getAttribute("href");
    if (targetId === "#" || targetId === "") return;
    const target = document.querySelector(targetId);
    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

// 3. Contact form handler (no network call — keeps app empty of secrets)
const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = contactForm.name.value.trim();
    const email = contactForm.email.value.trim();
    const message = contactForm.message.value.trim();

    contactForm.classList.remove("error");
    formStatus.classList.remove("error");
    formStatus.textContent = "";

    if (!name || !email || !message) {
      formStatus.textContent = "Semua field harus diisi.";
      formStatus.classList.add("error");
      return;
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      formStatus.textContent = "Format email tidak valid.";
      formStatus.classList.add("error");
      return;
    }

    // Simulate a successful submission (no secrets, no backend)
    formStatus.textContent = "Pesan terkirim! Terima kasih " + name + ".";
    contactForm.reset();
  });
}
