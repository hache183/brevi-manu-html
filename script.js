document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.navbar-links');
  const navbar = document.querySelector('.navbar');
  let prevScrollPos = window.scrollY;

  // Menu toggle con debugging
  if (menuToggle && navLinks) {
    // Inizializza aria-expanded
    menuToggle.setAttribute('aria-expanded', 'false');
    
    menuToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const isActive = navLinks.classList.contains('active');
      
      if (isActive) {
        navLinks.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      } else {
        navLinks.classList.add('active');
        menuToggle.setAttribute('aria-expanded', 'true');
      }
      
      console.log('Menu toggled:', !isActive); // Debug
    });

    // Chiudi menu cliccando fuori
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.navbar') && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Chiudi menu quando si clicca su un link
    navLinks.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        navLinks.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Gestione tasto Escape per chiudere menu
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  } else {
    console.error('Menu toggle o nav links non trovati'); // Debug
  }

  // Navbar scroll behavior
  if (navbar) {
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
  }

  // Form submission con Formspree e validazione privacy
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitButton = contactForm.querySelector('button[type="submit"]');
      const originalText = submitButton.textContent;
      
      // UI feedback immediato
      submitButton.textContent = 'Invio in corso...';
      submitButton.disabled = true;
      submitButton.style.opacity = '0.7';
      
      const formData = new FormData(contactForm);
      const nome = formData.get('nome');
      const email = formData.get('email');
      const messaggio = formData.get('messaggio');
      const privacyConsent = formData.get('privacy_consent');

      // Validazione lato client
      if (!nome || !email || !messaggio) {
        showNotification('❌ Compila tutti i campi richiesti', 'error');
        resetButton();
        return;
      }

      // Validazione consenso privacy
      if (!privacyConsent) {
        showNotification('❌ È necessario accettare il trattamento dei dati personali per procedere', 'error');
        resetButton();
        return;
      }

      try {
        await sendEmailWithFormspree(nome, email, messaggio, privacyConsent);
      } catch (error) {
        console.error('Errore invio:', error);
        showNotification('❌ Errore durante l\'invio. Riprova o contattaci direttamente.', 'error');
      }

      function resetButton() {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        submitButton.style.opacity = '1';
      }

      resetButton();
    });
  }

  // Invio email con Formspree
  async function sendEmailWithFormspree(nome, email, messaggio, privacyConsent) {
    // SOSTITUISCI 'myzpgqno' CON IL TUO ID FORMSPREE
    const formspreeEndpoint = 'https://formspree.io/f/myzpgqno';

    const payload = {
      name: nome,
      email: email,
      message: messaggio,
      privacy_consent: privacyConsent ? 'Accettato' : 'Non accettato',
      _replyto: email,
      _subject: `Nuovo contatto da ${nome} - Sito Brevi Manu`,
      _format: 'plain'
    };

    try {
      const response = await fetch(formspreeEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok) {
        showNotification('✅ Messaggio inviato con successo! Ti risponderemo presto.', 'success');
        contactForm.reset();
        return true;
      } else {
        // Gestione errori specifici Formspree
        if (result.errors) {
          const errorMessages = result.errors.map(error => error.message).join(', ');
          throw new Error(`Errore validazione: ${errorMessages}`);
        } else {
          throw new Error('Errore sconosciuto durante l\'invio');
        }
      }
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Errore di connessione. Verifica la tua connessione internet.');
      } else {
        throw error;
      }
    }
  }

  // Sistema di notifiche elegante
  function showNotification(message, type = 'info') {
    // Rimuovi notifiche esistenti
    const existingNotification = document.querySelector('.custom-notification');
    if (existingNotification) {
      existingNotification.remove();
    }

    // Crea nuova notifica
    const notification = document.createElement('div');
    notification.className = `custom-notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;

    // Stili inline per evitare dipendenze CSS
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      min-width: 300px;
      max-width: 500px;
      padding: 16px 20px;
      border-radius: 12px;
      color: white;
      font-family: inherit;
      font-size: 14px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(10px);
      transform: translateX(100%);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      ${type === 'success' ? 'background: linear-gradient(135deg, #10b981, #059669);' : ''}
      ${type === 'error' ? 'background: linear-gradient(135deg, #ef4444, #dc2626);' : ''}
      ${type === 'info' ? 'background: linear-gradient(135deg, #3b82f6, #2563eb);' : ''}
    `;

    const contentStyle = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    `;

    const closeStyle = `
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 16px;
      line-height: 1;
      transition: background 0.2s;
    `;

    notification.querySelector('.notification-content').style.cssText = contentStyle;
    notification.querySelector('.notification-close').style.cssText = closeStyle;

    // Aggiungi hover effect al pulsante close
    notification.querySelector('.notification-close').addEventListener('mouseenter', function() {
      this.style.background = 'rgba(255, 255, 255, 0.3)';
    });
    notification.querySelector('.notification-close').addEventListener('mouseleave', function() {
      this.style.background = 'rgba(255, 255, 255, 0.2)';
    });

    document.body.appendChild(notification);

    // Animazione di entrata
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    // Auto-rimozione dopo 5 secondi
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.remove();
          }
        }, 300);
      }
    }, 5000);
  }

  // Smooth scrolling per i link interni
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const navbarHeight = navbar ? navbar.offsetHeight : 0;
        const targetPosition = target.offsetTop - navbarHeight - 20;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // Intersection Observer per animazioni
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Osserva elementi per le animazioni
  const animatedElements = document.querySelectorAll(
    '.progetto-card, .chi-siamo-text, .contatti-form, .contatti-info, .contributo-item, .privacy-section'
  );
  
  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });

  // Lazy loading per le immagini
  const images = document.querySelectorAll('img[src]');
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.style.opacity = '1';
        imageObserver.unobserve(img);
      }
    });
  });

  images.forEach(img => {
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.3s ease';
    img.addEventListener('load', () => {
      img.style.opacity = '1';
    });
    imageObserver.observe(img);
  });

  // Debounce per gli eventi di scroll
  let scrollTimeout;
  const debounceScroll = (func, delay) => {
    return (...args) => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => func.apply(this, args), delay);
    };
  };

  // Ottimizzazione performance scroll
  window.addEventListener('scroll', debounceScroll(() => {
    // Eventuali operazioni aggiuntive di scroll qui
  }, 10));

  // Gestione errori globale
  window.addEventListener('error', (e) => {
    console.error('Errore JavaScript:', e.error);
  });

  // Preload delle immagini critiche
  const criticalImages = [
    '../src/images/castello.jpg',
    '../src/images/mountains.jpg',
    '../src/images/sfondo3.png'
  ];

  criticalImages.forEach(src => {
    const img = new Image();
    img.src = src;
  });
});