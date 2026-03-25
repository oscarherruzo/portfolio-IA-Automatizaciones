'use strict';

/* ══════════════════════════════════════════════════════
   OSCAR HERRUZO · script.js
   Formulario: Web3Forms (https://web3forms.com)
   ─────────────────────────────────────────────────────
   SETUP (1 minuto):
   1. Ve a https://web3forms.com
   2. Introduce tu email: oscarherruzom@gmail.com
   3. Te mandan una access key al instante
   4. En index.html, reemplaza TU_WEB3FORMS_KEY por esa key
   Listo — el formulario enviará a oscarherruzom@gmail.com
   y una confirmación automática al usuario.
══════════════════════════════════════════════════════ */

/* ──────────────────────────────────────────────
   SMOOTH SCROLL — nombre único para no colisionar
   con window.scrollTo nativo del navegador
────────────────────────────────────────────── */
function scrollToSection(id) {
  var el = document.getElementById(id);
  if (!el) return;
  var navH = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--nav-h')
  ) || 68;
  window.scrollTo({
    top: el.getBoundingClientRect().top + window.scrollY - navH - 16,
    behavior: 'smooth'
  });
}

/* ──────────────────────────────────────────────
   NAVBAR — efecto al hacer scroll
────────────────────────────────────────────── */
var navbar = document.getElementById('navbar');
if (navbar) {
  function updateNav() {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();
}

/* ──────────────────────────────────────────────
   MOBILE MENU
────────────────────────────────────────────── */
var hamburger  = document.getElementById('hamburger');
var mobileMenu = document.getElementById('mobileMenu');
var menuOpen   = false;

function openMenu() {
  menuOpen = true;
  if (mobileMenu) { mobileMenu.classList.add('open'); mobileMenu.setAttribute('aria-hidden', 'false'); }
  document.body.style.overflow = 'hidden';
  if (hamburger) {
    hamburger.setAttribute('aria-expanded', 'true');
    var s = hamburger.querySelectorAll('span');
    if (s[0]) s[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    if (s[1]) s[1].style.opacity   = '0';
    if (s[2]) s[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  }
}

function closeMenu() {
  menuOpen = false;
  if (mobileMenu) { mobileMenu.classList.remove('open'); mobileMenu.setAttribute('aria-hidden', 'true'); }
  document.body.style.overflow = '';
  if (hamburger) {
    hamburger.setAttribute('aria-expanded', 'false');
    var s = hamburger.querySelectorAll('span');
    if (s[0]) s[0].style.transform = '';
    if (s[1]) s[1].style.opacity   = '';
    if (s[2]) s[2].style.transform = '';
  }
}

if (hamburger) hamburger.addEventListener('click', function() { menuOpen ? closeMenu() : openMenu(); });
document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && menuOpen) closeMenu(); });

/* ──────────────────────────────────────────────
   REVEAL ON SCROLL
   Contenido siempre visible (opacity:1 en CSS base).
   Las animaciones se activan opcionalmente cuando JS
   funciona correctamente — nunca bloquean el contenido.
────────────────────────────────────────────── */
(function() {
  try {
    var els = document.querySelectorAll('.reveal');

    // Activar clase animate-ready para habilitar transiciones
    els.forEach(function(el) { el.classList.add('animate-ready'); });

    // Marcar como visible inmediatamente si ya está en viewport
    function checkEl(el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight + 50) {
        el.classList.add('visible');
      }
    }

    // Observer para los que quedan fuera del viewport inicial
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

    els.forEach(function(el) {
      checkEl(el);
      if (!el.classList.contains('visible')) obs.observe(el);
    });

    // Fallback extra para asegurar que nada quede invisible
    window.addEventListener('scroll', function() {
      document.querySelectorAll('.reveal.animate-ready:not(.visible)').forEach(checkEl);
    }, { passive: true });

  } catch(e) {
    // Si algo falla, quitar animate-ready para que todo sea visible
    document.querySelectorAll('.reveal').forEach(function(el) {
      el.classList.remove('animate-ready');
    });
  }
})();

/* ──────────────────────────────────────────────
   METRIC COUNTER — animación del número en hero
────────────────────────────────────────────── */
var metricVal = document.querySelector('.metric-val');
if (metricVal) {
  new IntersectionObserver(function(entries) {
    if (!entries[0].isIntersecting) return;
    var t0 = performance.now();
    function tick(now) {
      var p = Math.min((now - t0) / 1600, 1);
      var ease = 1 - Math.pow(1 - p, 3);
      metricVal.textContent = (ease * 14.2).toFixed(1) + 'h';
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, { threshold: 0.5 }).observe(metricVal);
}

/* ──────────────────────────────────────────────
   FAQ — acordeón
────────────────────────────────────────────── */
document.querySelectorAll('.faq-q').forEach(function(btn) {
  btn.addEventListener('click', function() {
    var item = btn.parentElement;
    var isOpen = item.classList.contains('open');
    // Cerrar todos
    document.querySelectorAll('.faq-item').forEach(function(i) {
      i.classList.remove('open');
      i.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
    });
    // Abrir el clickado si estaba cerrado
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

/* ──────────────────────────────────────────────
   ACTIVE NAV LINK — resaltar sección activa
────────────────────────────────────────────── */
var navAnchors = document.querySelectorAll('.nav-links a');
document.querySelectorAll('section[id]').forEach(function(sec) {
  new IntersectionObserver(function(entries) {
    if (entries[0].isIntersecting) {
      navAnchors.forEach(function(a) {
        a.style.color = a.getAttribute('href') === '#' + sec.id ? 'var(--text-1)' : '';
      });
    }
  }, { threshold: 0.4 }).observe(sec);
});

/* ──────────────────────────────────────────────
   TOAST — notificación flotante
────────────────────────────────────────────── */
var toastEl    = document.getElementById('toast');
var toastTitle = document.getElementById('toastTitle');
var toastMsg   = document.getElementById('toastMsg');
var toastTimer;

function showToast(opts) {
  if (!toastEl) return;
  toastTitle.textContent = opts.title || '';
  toastMsg.textContent   = opts.msg   || '';
  toastEl.classList.toggle('toast--error', !!opts.isError);
  var icon = toastEl.querySelector('.toast-icon');
  if (icon) icon.textContent = opts.isError ? '✕' : '✓';
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function() { toastEl.classList.remove('show'); }, 5500);
}

/* ──────────────────────────────────────────────
   FORM — validación de campos
────────────────────────────────────────────── */
function clearErrors() {
  document.querySelectorAll('.form-group input, .form-group textarea').forEach(function(el) {
    el.classList.remove('is-error');
  });
  document.querySelectorAll('.field-error').forEach(function(el) {
    el.textContent = '';
    el.classList.remove('visible');
  });
}

function setError(fieldId, msg) {
  var field = document.getElementById(fieldId);
  var errId = 'err' + fieldId.replace('field', '');
  var err   = document.getElementById(errId);
  if (field) field.classList.add('is-error');
  if (err)   { err.textContent = msg; err.classList.add('visible'); }
}

function validateForm(data) {
  clearErrors();
  var ok = true;
  if (!data.name || data.name.length < 2)
    { setError('fieldName',    'Introduce tu nombre'); ok = false; }
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    { setError('fieldEmail',   'Email inválido'); ok = false; }
  if (!data.message || data.message.length < 10)
    { setError('fieldMessage', 'Cuéntame un poco más (mín. 10 caracteres)'); ok = false; }
  return ok;
}

/* ──────────────────────────────────────────────
   FORM SUBMIT — Web3Forms
   Envía a oscarherruzom@gmail.com (configurado en
   la access key) + confirmación automática al usuario.
   
   Si la key no está configurada, abre el cliente
   de email como fallback.
────────────────────────────────────────────── */
var contactForm = document.getElementById('contactForm');
var submitBtn   = document.getElementById('submitBtn');

if (contactForm && submitBtn) {
  var submitText    = submitBtn.querySelector('.btn-submit-text');
  var submitArrow   = submitBtn.querySelector('.btn-submit-arrow');
  var submitSpinner = submitBtn.querySelector('.btn-submit-spinner');

  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();

    var name    = (document.getElementById('fieldName')?.value    || '').trim();
    var email   = (document.getElementById('fieldEmail')?.value   || '').trim();
    var company = (document.getElementById('fieldCompany')?.value || '').trim();
    var message = (document.getElementById('fieldMessage')?.value || '').trim();

    if (!validateForm({ name: name, email: email, message: message })) return;

    // Sync reply-to con el email del usuario para que
    // Web3Forms envíe la confirmación automática al remitente
    var hiddenReplyTo = document.getElementById('hiddenReplyTo');
    if (hiddenReplyTo) hiddenReplyTo.value = email;

    // Comprobar si la key está configurada
    var keyInput = contactForm.querySelector('input[name="access_key"]');
    var key = keyInput ? keyInput.value.trim() : '';
    var keyConfigured = key && key !== 'TU_WEB3FORMS_KEY' && key.length > 10;

    if (!keyConfigured) {
      // FALLBACK: abrir cliente de email nativo
      var subject = encodeURIComponent('Propuesta — ' + name + (company ? ' · ' + company : ''));
      var body    = encodeURIComponent(
        'Nombre: ' + name + '\n' +
        'Email: ' + email + '\n' +
        (company ? 'Empresa: ' + company + '\n' : '') +
        '\nMensaje:\n' + message
      );
      window.location.href = 'mailto:oscarherruzom@gmail.com?subject=' + subject + '&body=' + body;
      showToast({
        title: 'Abriendo email...',
        msg:   'Configura Web3Forms para enviar directamente desde la web.'
      });
      return;
    }

    // ── Estado cargando ──
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    if (submitText)    submitText.style.display    = 'none';
    if (submitArrow)   submitArrow.style.display   = 'none';
    if (submitSpinner) submitSpinner.style.display = 'block';

    // ── Envío a Web3Forms ──
    var formData = new FormData(contactForm);
    // Añadir mensaje de confirmación personalizado al usuario
    formData.set('botcheck', '');

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.success) {
        // ── Éxito ──
        submitBtn.classList.remove('loading');
        submitBtn.classList.add('success');
        if (submitText) {
          submitText.textContent  = '¡Enviado! ✓';
          submitText.style.display = 'block';
        }
        if (submitArrow)   submitArrow.style.display   = 'none';
        if (submitSpinner) submitSpinner.style.display = 'none';

        contactForm.reset();
        clearErrors();
        showToast({
          title: '¡Mensaje recibido!',
          msg:   'Te he enviado un email de confirmación. Respondo antes de 24h.'
        });

        setTimeout(function() {
          submitBtn.classList.remove('success');
          submitBtn.disabled = false;
          if (submitText) {
            submitText.textContent   = 'Enviar propuesta';
            submitText.style.display = 'block';
          }
          if (submitArrow) submitArrow.style.display = 'inline';
        }, 5000);

      } else {
        throw new Error(data.message || 'Error desconocido');
      }
    })
    .catch(function(err) {
      console.error('[OH] Error al enviar:', err);
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
      if (submitText) {
        submitText.textContent   = 'Enviar propuesta';
        submitText.style.display = 'block';
      }
      if (submitArrow)   submitArrow.style.display   = 'inline';
      if (submitSpinner) submitSpinner.style.display = 'none';
      showToast({
        title: 'Error al enviar',
        msg:   'Escríbeme directamente a oscarherruzom@gmail.com',
        isError: true
      });
    });
  });
}
