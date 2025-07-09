document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.navbar-links');
  const navbar   = document.querySelector('.navbar');
  let prevScrollPos = window.scrollY;

  menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    navLinks.classList.toggle('active');
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.navbar')) {
      navLinks.classList.remove('active');
    }
  });

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (prevScrollPos > currentScroll || currentScroll < 10) {
      navbar.classList.add('navbar-visible');
      navbar.classList.remove('navbar-hidden');
    } else {
      navbar.classList.add('navbar-hidden');
      navbar.classList.remove('navbar-visible');
    }
    prevScrollPos = currentScroll;
  });

  // Invio del form tramite fetch
  const contactForm = document.getElementById('contactForm');
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(contactForm);
    const payload = { testo: formData.get('messaggio') };

    try {
      const res = await fetch('http://localhost:5000/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert('Grazie per averci contattato!');
        contactForm.reset();
      } else {
        alert('Errore durante l\'invio.');
      }
    } catch (err) {
      console.error(err);
      alert('Errore di rete.');
    }
  });
});
