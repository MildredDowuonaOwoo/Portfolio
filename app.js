
  gsap.registerPlugin(ScrollTrigger, TextPlugin);

  // ---- CURSOR ----
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');
  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  (function animCursor() {
    cursor.style.left = mx + 'px';
    cursor.style.top = my + 'px';
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(animCursor);
  })();
  document.querySelectorAll('a, button, .project-card, .tool-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      gsap.to(ring, { scale: 1.8, opacity: 0.8, duration: 0.3 });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(ring, { scale: 1, opacity: 0.5, duration: 0.3 });
    });
  });

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
      document.getElementById('navbar').style.background =
        self.progress > 0 ? 'rgba(5,8,16,0.95)' : 'rgba(5,8,16,0.7)';
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

 

  /// ---- TOOL CARDS STAGGER ----
window.addEventListener('load', () => {
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
});

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

  async function handleSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const button = document.getElementById('submitBtn');
  button.disabled = true;
  button.textContent = 'Sending...';

  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(form)))
    });

    if (!response.ok) throw new Error('Message could not be sent.');

    button.textContent = 'Message Sent!';
    form.reset();
  } catch (error) {
    console.error(error);
    button.textContent = 'Could not send';
  }

  setTimeout(() => {
    button.textContent = 'Send Message';
    button.disabled = false;
  }, 3000);
  }
