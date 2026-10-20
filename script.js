(function () {
  'use strict';
  var root = document.documentElement;
  var body = document.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- theme toggle ---- */
  var stored = null;
  try { stored = localStorage.getItem('portfolio-theme'); } catch (e) {}
  if (stored === 'light' || stored === 'dark') root.setAttribute('data-theme', stored);
  document.getElementById('theme-btn').addEventListener('click', function () {
    var current = root.getAttribute('data-theme');
    if (!current) current = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    var next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('portfolio-theme', next); } catch (e) {}
  });

  /* ---- mobile menu ---- */
  var menuBtn = document.getElementById('menu-btn');
  var links = document.getElementById('links');
  function setMenu(open) {
    links.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  menuBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    setMenu(!links.classList.contains('open'));
  });
  links.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') setMenu(false);
  });
  document.addEventListener('click', function (e) {
    if (!links.contains(e.target)) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });

  /* ---- scroll progress and nav band ---- */
  var progress = document.getElementById('progress');
  var ticking = false;
  function onScroll() {
    var max = root.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    progress.style.setProperty('--p', p.toFixed(4));
    body.classList.toggle('scrolled', window.scrollY > 80);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---- scroll reveal and chart bars (only below-the-fold items start dimmed) ---- */
  if ('IntersectionObserver' in window && !reduce) {
    var vh = window.innerHeight;
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.remove('pre');
          revealIO.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    Array.prototype.forEach.call(document.querySelectorAll('[data-reveal], .cfill'), function (el, i) {
      var rect = el.getBoundingClientRect();
      if (rect.top < vh * 0.92) return;
      var delay = el.getAttribute('data-delay');
      if (delay) el.style.transitionDelay = delay + 'ms';
      el.classList.add('pre');
      revealIO.observe(el);
    });
  }

  /* ---- current section in nav ---- */
  if ('IntersectionObserver' in window) {
    var anchors = Array.prototype.slice.call(document.querySelectorAll('.links a'));
    var map = {};
    anchors.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && map[en.target.id]) {
          anchors.forEach(function (a) { a.removeAttribute('aria-current'); });
          map[en.target.id].setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) navIO.observe(el);
    });
  }

  /* ---- profile photo: fills the blank frame once photo.jpg exists ---- */
  var photo = document.getElementById('photo');
  if (photo && photo.getAttribute('data-src')) {
    var probe = new Image();
    probe.onload = function () {
      photo.src = probe.src;
      photo.hidden = false;
    };
    probe.src = photo.getAttribute('data-src');
  }

  /* ---- copy email ---- */
  var copyBtn = document.getElementById('copy-email');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var target = document.getElementById(copyBtn.getAttribute('data-copy'));
      var text = target.textContent.trim();
      function selectText() {
        var range = document.createRange();
        range.selectNodeContents(target);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
      function flash(msg) {
        copyBtn.textContent = msg;
        setTimeout(function () { copyBtn.textContent = 'Copy email'; }, 1800);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(
          function () { flash('Copied'); },
          function () { selectText(); flash('Selected, press Ctrl+C'); }
        );
      } else {
        selectText();
        flash('Selected, press Ctrl+C');
      }
    });
  }
})();
