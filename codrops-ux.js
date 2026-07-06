/*
  Codrops-inspired UX layer for FoundationISTQB
  Adds lightweight interaction patterns without changing content.
*/

(function(){
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function markRevealTargets(){
    const selectors = [
      '.hero',
      'section.card',
      '.panel',
      '.mini-card',
      '.metric',
      '.persona',
      '.stat',
      '.q',
      '.diagram',
      'table',
      '.flashcards',
      '.source-card'
    ];

    document.querySelectorAll(selectors.join(',')).forEach((el, index) => {
      if(!el.hasAttribute('data-ux-reveal')){
        el.setAttribute('data-ux-reveal', '');
        el.style.transitionDelay = Math.min(index % 8 * 35, 245) + 'ms';
      }
    });
  }

  function initReveal(){
    if(prefersReducedMotion){
      document.querySelectorAll('[data-ux-reveal]').forEach(el => el.classList.add('ux-in'));
      return;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add('ux-in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12, rootMargin: '0px 0px -8% 0px' });

    document.querySelectorAll('[data-ux-reveal]').forEach(el => observer.observe(el));
  }

  function initPointerGlow(){
    if(prefersReducedMotion || window.innerWidth < 900){
      document.body.classList.add('ux-no-pointer');
      return;
    }

    const glow = document.createElement('div');
    glow.className = 'ux-pointer-glow';
    glow.setAttribute('aria-hidden', 'true');
    document.body.appendChild(glow);

    let raf = null;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;

    window.addEventListener('pointermove', event => {
      x = event.clientX;
      y = event.clientY;
      if(raf) return;
      raf = requestAnimationFrame(() => {
        glow.style.left = x + 'px';
        glow.style.top = y + 'px';
        raf = null;
      });
    }, { passive:true });

    window.addEventListener('pointerleave', () => { glow.style.opacity = '0'; });
    window.addEventListener('pointerenter', () => { glow.style.opacity = '.42'; });
  }

  function initCardTilt(){
    if(prefersReducedMotion || window.innerWidth < 900) return;

    const items = document.querySelectorAll('.mini-card, .metric, .persona, .stat, .option');
    items.forEach(card => {
      card.addEventListener('pointermove', event => {
        const rect = card.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - .5;
        const py = (event.clientY - rect.top) / rect.height - .5;
        card.style.transform = `translateY(-4px) rotateX(${py * -3}deg) rotateY(${px * 4}deg)`;
      });

      card.addEventListener('pointerleave', () => {
        card.style.transform = '';
      });
    });
  }

  function initActiveAnchors(){
    const links = Array.from(document.querySelectorAll('nav a[href^="#"]'));
    const sections = links
      .map(link => document.querySelector(link.getAttribute('href')))
      .filter(Boolean);

    if(!links.length || !sections.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(!entry.isIntersecting) return;
        const id = '#' + entry.target.id;
        links.forEach(link => link.classList.toggle('active', link.getAttribute('href') === id));
      });
    }, { threshold:.24, rootMargin:'-15% 0px -60% 0px' });

    sections.forEach(section => observer.observe(section));
  }

  function initMagneticButtons(){
    if(prefersReducedMotion || window.innerWidth < 900) return;

    document.querySelectorAll('.btn, .primary, .answer, .qnav').forEach(button => {
      button.addEventListener('pointermove', event => {
        const rect = button.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * .08;
        const y = (event.clientY - rect.top - rect.height / 2) * .08;
        button.style.transform = `translate(${x}px, ${y}px)`;
      });

      button.addEventListener('pointerleave', () => {
        button.style.transform = '';
      });
    });
  }

  function init(){
    markRevealTargets();
    initReveal();
    initPointerGlow();
    initCardTilt();
    initActiveAnchors();
    initMagneticButtons();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  }else{
    init();
  }
})();
