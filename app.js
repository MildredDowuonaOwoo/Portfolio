gsap.registerPlugin(ScrollTrigger, TextPlugin);

// =========================================
// STYLISH ROUND ANIMATED CURSOR WITH SHADOW
// =========================================
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');

if (cursor && ring) {
  let mx = 0, my = 0;
  let rx = 0, ry = 0;
  let isCursorActive = false;

  // Initialize cursor position on first mouse move without sudden jump
  const onFirstMouseMove = (e) => {
    mx = e.clientX;
    my = e.clientY;
    rx = e.clientX;
    ry = e.clientY;
    cursor.style.left = `${mx}px`;
    cursor.style.top = `${my}px`;
    ring.style.left = `${rx}px`;
    ring.style.top = `${ry}px`;
    document.body.classList.add('custom-cursor-active');
    isCursorActive = true;
    window.removeEventListener('mousemove', onFirstMouseMove);
  };
  window.addEventListener('mousemove', onFirstMouseMove);

  // Continuously update position
  window.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = `${mx}px`;
    cursor.style.top = `${my}px`;
    if (!isCursorActive) {
      document.body.classList.add('custom-cursor-active');
      isCursorActive = true;
    }
  });

  // Smooth trailing physics loop
  (function renderCursor() {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    ring.style.left = `${rx}px`;
    ring.style.top = `${ry}px`;
    requestAnimationFrame(renderCursor);
  })();

  // Interactive Hover Effects (Magnetic scale & neon magenta glow)
  const interactiveElements = 'a, button, .project-card, .tool-card, input, textarea, .social-link';
  document.querySelectorAll(interactiveElements).forEach((el) => {
    el.addEventListener('mouseenter', () => {
      ring.classList.add('cursor-hover');
      gsap.to(ring, { scale: 1.7, duration: 0.3, ease: 'power2.out' });
      gsap.to(cursor, { scale: 0.5, duration: 0.2 });
    });
    el.addEventListener('mouseleave', () => {
      ring.classList.remove('cursor-hover');
      gsap.to(ring, { scale: 1, duration: 0.3, ease: 'power2.out' });
      gsap.to(cursor, { scale: 1, duration: 0.2 });
    });
  });

  // Tactile Click Feedback (Snap on mousedown, spring back on mouseup)
  window.addEventListener('mousedown', () => {
    ring.classList.add('cursor-active');
    gsap.to(ring, { scale: 0.75, duration: 0.15, ease: 'power2.out' });
    gsap.to(cursor, { scale: 1.5, duration: 0.15 });
  });

  window.addEventListener('mouseup', () => {
    ring.classList.remove('cursor-active');
    const isHovered = ring.classList.contains('cursor-hover');
    gsap.to(ring, { scale: isHovered ? 1.7 : 1, duration: 0.25, ease: 'back.out(2)' });
    gsap.to(cursor, { scale: isHovered ? 0.5 : 1, duration: 0.2 });
  });

  // Window exit and re-entry handling
  document.addEventListener('mouseleave', () => {
    document.body.classList.remove('custom-cursor-active');
  });
  document.addEventListener('mouseenter', () => {
    if (isCursorActive) {
      document.body.classList.add('custom-cursor-active');
    }
  });
}

// ---- HERO ENTRANCE ----
const heroTl = gsap.timeline({ delay: 0.2 });
heroTl
  .to('.hero-tag', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })
  .to('.hero-name span', {
    opacity: 1, y: 0,
    duration: 0.9,
    stagger: 0.12,
    ease: 'expo.out'
  }, '-=0.3')
  .to('.hero-sub', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.4')
  .to('.hero-cta', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.3')
  .to('.scroll-indicator', { opacity: 1, duration: 0.5 }, '-=0.1');

// ---- NAV SCROLL ----
ScrollTrigger.create({
  start: 'top -80',
  onUpdate: self => {
    const navbar = document.getElementById('navbar');
    if (navbar) {
      navbar.style.background = self.progress > 0 ? 'rgba(5,8,16,0.95)' : 'rgba(5,8,16,0.7)';
    }
  }
});

// ---- REVEAL ANIMATIONS ----
gsap.utils.toArray('.reveal').forEach(el => {
  gsap.fromTo(el,
    { opacity: 0, y: 50 },
    {
      opacity: 1, y: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    }
  );
});

// ---- SKILL BARS ----
document.querySelectorAll('.skill-fill').forEach(bar => {
  ScrollTrigger.create({
    trigger: bar,
    start: 'top 90%',
    onEnter: () => {
      bar.style.width = bar.dataset.w + '%';
    }
  });
});

// ---- TOOL CARDS STAGGER ----
function initToolCards() {
  gsap.fromTo('.tool-card',
    { opacity: 0, scale: 0.85 },
    {
      opacity: 1,
      scale: 1,
      stagger: 0.12,
      duration: 0.6,
      ease: 'back.out(1.4)',
      scrollTrigger: {
        trigger: '.tools-grid',
        start: 'top 85%',
        once: true
      }
    }
  );
  ScrollTrigger.refresh();
}

if (document.readyState === 'complete') {
  initToolCards();
} else {
  window.addEventListener('load', initToolCards);
}

// ---- PARALLAX HERO GLOWS ----
document.addEventListener('mousemove', e => {
  const xPct = (e.clientX / window.innerWidth - 0.5) * 30;
  const yPct = (e.clientY / window.innerHeight - 0.5) * 30;
  gsap.to('.hero-bg-glow', { x: xPct, y: yPct, duration: 1.5, ease: 'power1.out' });
  gsap.to('.hero-bg-glow2', { x: -xPct * 0.5, y: -yPct * 0.5, duration: 2, ease: 'power1.out' });
});

// ---- CONTACT TITLE SPLIT REVEAL ----
gsap.from('.contact-title', {
  opacity: 0,
  y: 80,
  duration: 1.2,
  ease: 'expo.out',
  scrollTrigger: { trigger: '.contact-title', start: 'top 85%' }
});

// ---- CONTACT FORM SUBMISSION ----
async function handleSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const button = document.getElementById('submitBtn');
  const statusEl = document.getElementById('formStatus');
  const originalText = 'Send Message';

  button.disabled = true;
  button.textContent = 'Sending...';
  if (statusEl) {
    statusEl.className = 'form-status';
    statusEl.style.display = 'none';
  }

  const recipient = 'mildredowoo520@gmail.com';

  try {
    const formData = new FormData(form);
    const name = formData.get('name') || '';
    const email = formData.get('email') || '';
    const subject = formData.get('subject') || 'Portfolio Inquiry';
    const message = formData.get('message') || '';

    // Direct Delivery straight to mildredowoo520@gmail.com
    const response = await fetch(`https://formsubmit.co/ajax/${recipient}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: name,
        email: email,
        _subject: `Portfolio Contact: ${subject} (${name})`,
        message: message,
        _captcha: 'false',
        _template: 'table'
      })
    });

    const data = await response.json().catch(() => ({}));

    // If FormSubmit requires one-time activation
    if (data.message && data.message.toLowerCase().includes('activate')) {
      button.textContent = 'Activation Required';
      if (statusEl) {
        statusEl.innerHTML = `📬 <strong>Check your Spam or Inbox:</strong> FormSubmit sent an activation email to <strong>${recipient}</strong>.<br>Please open that email and click <em>"Activate Form"</em> once to start receiving all messages directly!`;
        statusEl.className = 'form-status success';
        statusEl.style.display = 'block';
      }
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 7000);
      return;
    }

    if (response.ok && (data.success === 'true' || data.success === true || response.status === 200)) {
      button.textContent = 'Message Sent!';
      if (statusEl) {
        statusEl.innerHTML = '✓ Thank you! Your message was sent to my inbox.';
        statusEl.className = 'form-status success';
        statusEl.style.display = 'block';
      }
      form.reset();

      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 4000);
      return;
    }

    throw new Error(data.message || 'Direct delivery encountered an issue.');

  } catch (error) {
    console.warn('AJAX submission failed (e.g. file:/// origin). Submitting directly...', error);

    // Fallback: Submit directly through standard form navigation (never blocked by CORS)
    if (statusEl) {
      statusEl.innerHTML = '⏳ Submitting message directly...';
      statusEl.className = 'form-status success';
      statusEl.style.display = 'block';
    }

    setTimeout(() => {
      form.submit();
    }, 500);
  }
}
