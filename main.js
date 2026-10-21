// Energie- und Gebäudetechnik Irlbacher GmbH — Website · Bewegung ist additiv: ohne JS bleibt alles lesbar.
document.documentElement.classList.remove('kein-js');
const ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
const maus = matchMedia('(hover:hover) and (pointer:fine)').matches;
if (ruhig) document.querySelectorAll('video[autoplay]').forEach(v => { v.removeAttribute('autoplay'); v.pause(); });

/* ---------- Seitenwechsel: der Ring schließt sich, die nächste Seite öffnet ihn ---------- */
const wipe = document.querySelector('.wipe');
const ankunft = document.documentElement.classList.contains('ankunft');
try { sessionStorage.removeItem('irl-wipe'); } catch (e) {}
if (wipe && !ruhig) {
  addEventListener('pageshow', e => { if (e.persisted) wipe.classList.remove('los'); });
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target && a.target !== '_self') return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || /^[a-z]+:/i.test(href)) return;
    const ziel = new URL(href, location.href);
    if (ziel.origin !== location.origin) return;
    if (ziel.pathname === location.pathname && ziel.hash) return;
    e.preventDefault();
    try { sessionStorage.setItem('irl-wipe', '1'); } catch (e2) {}
    wipe.classList.add('los');
    setTimeout(() => { location.href = ziel.href; }, 560);
  });
}
const geladen = () => document.body.classList.add('geladen');
if (ankunft && !ruhig) { setTimeout(geladen, 120); }
else { requestAnimationFrame(geladen); setTimeout(geladen, 40); }
document.addEventListener('visibilitychange', geladen);

/* ---------- Header · Thermostat · Scroll-Scrub ---------- */
const kopf = document.querySelector('header');
const thermo = document.querySelector('.thermo');
const thermoFill = thermo && thermo.querySelector('.thermo-rohr i');
const thermoGrad = thermo && thermo.querySelector('b');
const heroEl = document.querySelector('.hero, .hero-u');
const scrubs = [...document.querySelectorAll('[data-scrub]')];
const wurzel = document.documentElement;
let ticking = false, letztY = scrollY, letztT = performance.now(), tempo = 0, klingtAb = false;
function scrub() {
  if (ruhig) return;
  if (heroEl) heroEl.style.setProperty('--p', Math.min(scrollY / (heroEl.offsetHeight || 1), 1).toFixed(4));
  scrubs.forEach(el => {
    if (el.classList.contains('statement')) {
      // Skill scroll-text (22.09.2026): das TEXTELEMENT messen, Füllung durch die Bildmitte (78 % → 32 %), nur vorwärts
      const t = (el.querySelector('h2') || el).getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.78 - t.top) / (innerHeight * 0.46))); // Noah, 22.09.2026 abends: Effekt klar sichtbar, läuft in beide Richtungen
      el.style.setProperty('--p', p.toFixed(4));
      return;
    }
    const r = el.getBoundingClientRect();
    const p = (innerHeight - r.top) / (innerHeight + r.height);
    el.style.setProperty('--p', Math.min(Math.max(p, 0), 1).toFixed(4));
  });
  // Ringe drehen mit dem Scroll — jeder relativ zu seiner Lage im Fenster
  document.querySelectorAll('.ring:not(.hero .ring)').forEach(r => {
    const b = r.getBoundingClientRect();
    if (b.bottom < -200 || b.top > innerHeight + 200) return;
    r.style.setProperty('--p', ((innerHeight - b.top) / (innerHeight + b.height)).toFixed(4));
  });
}
function abklingen() {
  tempo *= 0.86;
  if (Math.abs(tempo) < 0.01) { tempo = 0; klingtAb = false; }
  wurzel.style.setProperty('--vs', tempo.toFixed(3));
  if (klingtAb) requestAnimationFrame(abklingen);
}
function beiScroll() {
  const y = scrollY;
  if (kopf) kopf.classList.toggle('scrolled', y > 40);
  const hoehe = document.documentElement.scrollHeight - innerHeight;
  const f = hoehe > 0 ? y / hoehe : 0;
  if (thermoFill) {
    thermoFill.style.setProperty('--f', (f * 100).toFixed(1) + '%');
    if (thermoGrad) thermoGrad.textContent = (18 + f * 4).toFixed(1).replace('.', ',') + '°';
    thermo.classList.toggle('warm', f > 0.5);
    // über dunklen Flächen hell zeichnen
    const el = document.elementFromPoint(innerWidth - 24, innerHeight / 2);
    thermo.classList.toggle('dunkel-bg', !!(el && el.closest('.dunkel, .hero, .hero-u, .statement, .cta, footer, .jobs-band, .info-karte')));
  }
  if (!ruhig) {
    const t = performance.now();
    const dt = Math.min(Math.max(t - letztT, 1), 100);
    tempo = Math.max(-1, Math.min(1, (y - letztY) / dt / 3));
    letztY = y; letztT = t;
    wurzel.style.setProperty('--vs', tempo.toFixed(3));
    if (!klingtAb) { klingtAb = true; requestAnimationFrame(abklingen); }
  }
  scrub();
  ticking = false;
}
addEventListener('resize', scrub);
addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(beiScroll); ticking = true; } }, { passive: true });
beiScroll();

/* ---------- Reveal + Iris ---------- */
const io = new IntersectionObserver(es => {
  es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('da'); io.unobserve(e.target); } });
}, { threshold: 0, rootMargin: '0px 0px -4% 0px' });
document.querySelectorAll('.rev, .iris').forEach(el => io.observe(el));
const nachholen = () => {
  const unten = scrollY + innerHeight;
  document.querySelectorAll('.rev:not(.da), .iris:not(.da)').forEach(el => {
    if (el.getBoundingClientRect().top + scrollY < unten) el.classList.add('da');
  });
};
addEventListener('scroll', nachholen, { passive: true });
setTimeout(nachholen, 3200);

/* ---------- Zahlen zählen hoch ---------- */
const zio = new IntersectionObserver(es => {
  es.forEach(e => {
    if (!e.isIntersecting) return;
    zio.unobserve(e.target);
    const el = e.target, ziel = parseFloat(el.dataset.zahl), nach = el.dataset.nach || '', vor = el.dataset.vor || '';
    const komma = (el.dataset.zahl.split('.')[1] || '').length;
    const setz = v => { el.innerHTML = vor + v.toFixed(komma).replace('.', ',') + (nach ? '<em>' + nach + '</em>' : ''); };
    if (ruhig || isNaN(ziel)) { setz(ziel); return; }
    const start = performance.now(), dauer = 1300;
    (function lauf(jetzt) {
      const p = Math.min((jetzt - start) / dauer, 1);
      setz(ziel * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(lauf);
    })(start);
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-zahl]').forEach(el => zio.observe(el));

/* ---------- Hero-Video-Montage ---------- */
const montage = document.querySelectorAll('[data-montage] video');
if (montage.length) {
  montage.forEach((v, i) => { if (i === 0) v.classList.add('an'); v.play().catch(() => {}); });
  if (montage.length > 1 && !ruhig) {
    let aktiv = 0;
    setInterval(() => {
      montage[aktiv].classList.remove('an');
      aktiv = (aktiv + 1) % montage.length;
      montage[aktiv].currentTime = 0; montage[aktiv].play().catch(() => {});
      montage[aktiv].classList.add('an');
    }, 5600);
  }
}

/* ---------- Mobil-Menü ---------- */
const menuKnopf = document.querySelector('.menu-knopf');
const menuFlaeche = document.querySelector('.menu-flaeche');
if (menuKnopf && menuFlaeche) {
  menuFlaeche.hidden = false;
  menuKnopf.addEventListener('click', () => {
    const auf = document.body.classList.toggle('menu-auf');
    menuKnopf.setAttribute('aria-expanded', auf ? 'true' : 'false');
    document.body.style.overflow = auf ? 'hidden' : '';
  });
  menuFlaeche.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    document.body.classList.remove('menu-auf'); document.body.style.overflow = '';
  }));
}

/* ---------- FAQ ---------- */
document.querySelectorAll('.faq-eintrag.auf .faq-antwort').forEach(a => { a.style.maxHeight = a.scrollHeight + 'px'; });   // erste Frage steht offen
document.querySelectorAll('.faq-frage').forEach(knopf => {
  knopf.addEventListener('click', () => {
    const eintrag = knopf.closest('.faq-eintrag'), antwort = eintrag.querySelector('.faq-antwort');
    const auf = eintrag.classList.toggle('auf');
    knopf.setAttribute('aria-expanded', auf ? 'true' : 'false');
    antwort.style.maxHeight = auf ? antwort.scrollHeight + 'px' : '';
  });
});

/* ---------- Kreislauf: das Rohr füllt sich, Ventile schalten ---------- */
const kreis = document.querySelector('.kreislauf');
if (kreis) {
  const fluss = kreis.querySelector('.rohr .fluss');
  const ventile = [...kreis.querySelectorAll('.ventil')];
  const messen = () => {
    if (!fluss) return;
    const H = kreis.offsetHeight, W = 120;
    // ein Rohr mit Bögen: gerade runter, an jedem Schritt ein kleiner Schwung zur Karte
    const p = [`M60 0`];
    ventile.forEach((v, i) => {
      const y = v.offsetTop + v.offsetHeight / 2;
      p.push(`L60 ${Math.max(0, y - 40)}`, `Q60 ${y} 60 ${y + 40}`);
    });
    p.push(`L60 ${H}`);
    const d = p.join(' ');
    kreis.querySelectorAll('.rohr path').forEach(pa => pa.setAttribute('d', d));
    const len = fluss.getTotalLength();
    fluss.style.setProperty('--len', len);
    kreis.querySelector('.rohr svg').setAttribute('viewBox', `0 0 ${W} ${H}`);
    const g = kreis.querySelector('#fluss-verlauf'); if (g) g.setAttribute('y2', H);
  };
  messen(); addEventListener('resize', messen); setTimeout(messen, 800);
  const schalten = () => {
    if (ruhig) { ventile.forEach(v => v.classList.add('an')); if (fluss) fluss.style.setProperty('--p', 1); return; }
    const r = kreis.getBoundingClientRect();
    const p = Math.min(Math.max((innerHeight * 0.75 - r.top) / r.height, 0), 1);
    if (fluss) fluss.style.setProperty('--p', p.toFixed(4));
    ventile.forEach(v => {
      const vy = v.getBoundingClientRect().top + v.offsetHeight / 2 - r.top;
      v.classList.toggle('an', vy / r.height <= p);
    });
  };
  addEventListener('scroll', () => requestAnimationFrame(schalten), { passive: true });
  schalten();
}

/* ---------- Tagesablauf (Jobs): Zeitleiste füllt sich ---------- */
const tag = document.querySelector('.tag');
if (tag) {
  const punkte = [...tag.querySelectorAll('.tag-punkt')];
  const lauf = () => {
    if (ruhig) { tag.style.setProperty('--p', 1); punkte.forEach(p => p.classList.add('an')); return; }
    const r = tag.getBoundingClientRect();
    const p = Math.min(Math.max((innerHeight * 0.8 - r.top) / (r.height + innerHeight * 0.25), 0), 1);
    tag.style.setProperty('--p', p.toFixed(4));
    punkte.forEach((pt, i) => pt.classList.toggle('an', (i + 0.5) / punkte.length <= p));
  };
  addEventListener('scroll', () => requestAnimationFrame(lauf), { passive: true });
  lauf();
}

/* ---------- Galerie: ziehen mit der Maus ---------- */
document.querySelectorAll('.lauf').forEach(l => {
  let unten = false, sx = 0, sl = 0, bewegt = false;
  l.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; unten = true; bewegt = false; sx = e.clientX; sl = l.scrollLeft; l.classList.add('zieht'); l.setPointerCapture(e.pointerId); });
  l.addEventListener('pointermove', e => { if (!unten) return; const dx = e.clientX - sx; if (Math.abs(dx) > 6) bewegt = true; l.scrollLeft = sl - dx; });
  const los = () => { unten = false; l.classList.remove('zieht'); };
  l.addEventListener('pointerup', los); l.addEventListener('pointercancel', los);
  l.addEventListener('click', e => { if (bewegt) { e.preventDefault(); e.stopPropagation(); } }, true);
});

/* ---------- Handy-Video: Ton an/aus ---------- */
document.querySelectorAll('.handy').forEach(h => {
  const v = h.querySelector('video'), k = h.querySelector('.handy-ton');
  if (!v || !k) return;
  k.addEventListener('click', () => {
    v.muted = !v.muted;
    if (!v.muted) { v.currentTime = 0; v.play().catch(() => {}); }
    k.querySelector('span').textContent = v.muted ? 'Ton an' : 'Ton aus';
    k.classList.toggle('laut', !v.muted);
  });
});

/* ---------- Cursor (nur echte Maus) ---------- */
if (!ruhig && maus) {
  const punkt = document.createElement('div');
  punkt.className = 'cursor';
  document.body.appendChild(punkt);
  document.body.classList.add('mit-cursor');
  let x = innerWidth / 2, y = innerHeight / 2, zx = x, zy = y;
  addEventListener('mousemove', e => { zx = e.clientX; zy = e.clientY; punkt.classList.add('an'); }, { passive: true });
  document.addEventListener('mouseleave', () => punkt.classList.remove('an'));
  (function folge() {
    x += (zx - x) * 0.2; y += (zy - y) * 0.2;
    punkt.style.transform = `translate(${x}px, ${y}px) translate(-50%,-50%)`;
    requestAnimationFrame(folge);
  })();
  document.querySelectorAll('a, button, .kachel, .lauf-item, .gewerk, .karte-bild, .person').forEach(el => {
    el.addEventListener('mouseenter', () => punkt.classList.add('gross'));
    el.addEventListener('mouseleave', () => punkt.classList.remove('gross'));
  });
  document.querySelectorAll('[data-cursor]').forEach(el => {
    el.addEventListener('mouseenter', () => { punkt.dataset.text = el.dataset.cursor; punkt.classList.add('text'); });
    el.addEventListener('mouseleave', () => punkt.classList.remove('text'));
  });
}

/* ---------- Gewerke-Karten neigen sich zur Maus ---------- */
if (!ruhig && maus) {
  document.querySelectorAll('.gewerk').forEach(k => {
    k.addEventListener('mousemove', e => {
      const r = k.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
      k.style.setProperty('--ry', (px * 6).toFixed(2) + 'deg');
      k.style.setProperty('--rx', (-py * 6).toFixed(2) + 'deg');
    }, { passive: true });
    k.addEventListener('mouseleave', () => { k.style.setProperty('--ry', '0deg'); k.style.setProperty('--rx', '0deg'); });
  });
}

/* ---------- Intro: drei Bögen zeichnen sich, der Ring öffnet die Seite ---------- */
const intro = document.querySelector('.intro');
if (intro) {
  let schonGesehen = false;
  try { schonGesehen = !!sessionStorage.getItem('irl-intro'); } catch (e) {}
  if (ruhig || schonGesehen) {
    intro.remove();
  } else {
    try { sessionStorage.setItem('irl-intro', '1'); } catch (e) {}
    document.body.style.overflow = 'hidden';
    // Bogenlängen aus der Geometrie
    intro.querySelectorAll('circle[data-bogen]').forEach(c => {
      const r = parseFloat(c.getAttribute('r')), anteil = parseFloat(c.dataset.bogen);
      c.style.setProperty('--l', (2 * Math.PI * r * anteil).toFixed(1));
    });
    setTimeout(() => intro.classList.add('zeichnet'), 120);
    setTimeout(() => intro.classList.add('auf'), 1900);
    setTimeout(() => intro.classList.add('weg'), 2500);
    setTimeout(() => { intro.remove(); document.body.style.overflow = ''; }, 3200);
  }
}

/* ---------- Überschriften Wort für Wort ---------- */
if (!ruhig) {
  document.querySelectorAll('h2, .hero h1, .hero-u h1').forEach(el => {
    if (el.querySelector('.wort') || el.closest('.statement')) return;
    const teile = [...el.childNodes];
    el.innerHTML = '';
    teile.forEach(k => {
      if (k.nodeType === 3) {
        k.textContent.split(/(\s+)/).forEach(w => {
          if (!w.trim()) { el.appendChild(document.createTextNode(' ')); return; }
          const s = document.createElement('span'); s.className = 'wort';
          const i = document.createElement('i');
          // Satzzeichen am Wortende enger an das Wort (Plus Jakarta setzt , . ! ? in großer Schrift sichtbar ab — 21.10.2026)
          const z = w.match(/^(.*?)([.,!?;:]+)$/);
          if (z && z[1]) { i.textContent = z[1]; const p = document.createElement('span'); p.className = 'satz'; p.textContent = z[2]; i.appendChild(p); }
          else i.textContent = w;
          s.appendChild(i); el.appendChild(s);
        });
      } else if (k.nodeName === 'BR') { el.appendChild(k); }
      else {
        // dasselbe für Satzzeichen am Ende eines Elements (<em>Frische Luft.</em>)
        const letzt = k.lastChild;
        if (letzt && letzt.nodeType === 3) {
          const z = letzt.textContent.match(/^([\s\S]*?)([.,!?;:]+)$/);
          if (z && z[1]) { letzt.textContent = z[1]; const p = document.createElement('span'); p.className = 'satz'; p.textContent = z[2]; k.appendChild(p); }
        }
        const s = document.createElement('span'); s.className = 'wort';
        const i = document.createElement('i'); i.appendChild(k); s.appendChild(i); el.appendChild(s);
      }
    });
  });
  const zeigen = el => el.querySelectorAll('.wort').forEach(w => w.classList.add('da'));
  const wio = new IntersectionObserver(es => { es.forEach(e => { if (!e.isIntersecting) return; zeigen(e.target); wio.unobserve(e.target); }); }, { threshold: 0, rootMargin: '0px 0px -4% 0px' });
  document.querySelectorAll('h2').forEach(el => wio.observe(el));
  const heroStart = intro && intro.isConnected ? 2100 : 80;
  setTimeout(() => document.querySelectorAll('.hero h1 .wort, .hero-u h1 .wort').forEach(w => w.classList.add('da')), heroStart);
  setTimeout(() => document.querySelectorAll('h2, h1').forEach(zeigen), 3600);
}

/* ---------- Parallax in Bildrahmen ---------- */
const paras = document.querySelectorAll('.para img');
if (paras.length && !ruhig) {
  const parallax = () => {
    paras.forEach(im => {
      const r = im.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const mitte = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      im.style.transform = `translate3d(0,${(-mitte * 26).toFixed(1)}px,0) scale(1.12) skewY(calc(var(--vs,0) * 1.2deg))`;
    });
  };
  addEventListener('scroll', () => requestAnimationFrame(parallax), { passive: true });
  parallax();
}

/* ---------- Magnetische Knöpfe ---------- */
if (!ruhig && maus) {
  document.querySelectorAll('.btn').forEach(b => {
    b.addEventListener('mousemove', e => {
      const r = b.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) * 0.2, dy = (e.clientY - (r.top + r.height / 2)) * 0.28;
      b.style.transform = `translate(${dx}px, ${dy}px) scale(var(--druck,1))`;
    });
    b.addEventListener('mouseleave', () => { b.style.transform = ''; });
  });
}

/* ---------- Formular: geht per POST an den Formular-Dienst (Worker) und kommt als E-Mail bei Josef Irlbacher an.
   Der Worker leitet danach auf die Seite zurück: ?gesendet=1 (Danke) oder ?fehler=1 (Telefon + Mail statt stillem Verlust). */
document.querySelectorAll('form.formular[action]').forEach(form => {
  const meldung = form.querySelector('.form-meldung');
  const zeigen = (art, inhalt) => {
    const span = document.createElement('span'); span.append(...inhalt);
    meldung.replaceChildren(span);
    meldung.dataset.art = art;
    meldung.hidden = false;
  };
  const text = t => document.createTextNode(t);
  const link = (href, t) => { const a = document.createElement('a'); a.href = href; a.textContent = t; return a; };

  form.addEventListener('submit', e => {
    const fehlend = [...form.querySelectorAll('[required]')].filter(f => !f.value.trim() ||
      (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.value.trim())));
    form.querySelectorAll('.fehlt').forEach(f => f.classList.remove('fehlt'));
    if (fehlend.length) {
      e.preventDefault();
      fehlend.forEach(f => f.classList.add('fehlt'));
      const namen = fehlend.map(f => f.labels && f.labels[0] ? f.labels[0].textContent : 'ein Feld');
      zeigen('fehler', [text(fehlend.length === 1 ? 'Da fehlt noch etwas: ' + namen[0] + '.' : 'Bitte füllen Sie noch aus: ' + namen.join(', ') + '.')]);
      fehlend[0].focus();
      return;
    }
    const knopf = form.querySelector('button[type=submit]');
    if (knopf) { knopf.disabled = true; knopf.style.opacity = '.6'; }
  });

  const q = new URLSearchParams(location.search);
  if (location.hash === '#anfrage' && (q.has('gesendet') || q.has('fehler'))) {
    if (q.has('gesendet')) {
      zeigen('ok', [text('Danke, Ihre Anfrage ist angekommen. Josef Irlbacher meldet sich persönlich bei Ihnen.')]);
      form.reset();
    } else {
      zeigen('fehler', [text('Das hat leider nicht geklappt. Rufen Sie uns bitte an unter '), link(form.dataset.telLink, form.dataset.tel),
        text(' oder schreiben Sie direkt an '), link('mailto:' + form.dataset.mail, form.dataset.mail), text('.')]);
    }
    history.replaceState(null, '', location.pathname + location.hash);
  }
  form.addEventListener('input', e => e.target.classList?.remove('fehlt'));
});

/* ---------- Seitenaufrufe zählen — ohne Cookies, ohne Speicher im Browser, ohne IP und ohne Kennung.
   Eigener Zähler der HandwerksManufaktur (Worker seiten-zaehler); gezählt wird nur: Seite, Zeitpunkt, Herkunfts-Website,
   Handy/Computer, Land. Beschrieben in der Datenschutzerklärung. */
(() => {
  if (!/(^|\.)hs-irlbacher\.de$/.test(location.hostname)) return;
  let r = 'direkt';
  try {
    const q = new URLSearchParams(location.search);
    if (q.get('utm_source')) r = 'utm:' + q.get('utm_source');
    else if (document.referrer) { const h = new URL(document.referrer).hostname.replace(/^www\./, ''); if (h && h !== location.hostname) r = h; }
  } catch (e) {}
  const d = JSON.stringify({ t: 'v', s: location.hostname, p: location.pathname, g: innerWidth < 768 ? 'm' : 'd',
    id: Math.random().toString(36).slice(2, 12), r });
  const Z = 'https://seiten-zaehler.handwerksmanufaktur.workers.dev/z';
  try { if (!(navigator.sendBeacon && navigator.sendBeacon(Z, new Blob([d], { type: 'text/plain' })))) fetch(Z, { method: 'POST', body: d, keepalive: true, mode: 'no-cors' }); } catch (e) {}
})();

/* Spam-Schutz ohne Cookie: Ladezeit ins Formular. Der Formular-Dienst verwirft Absendungen
   unter 3 s und solche mit leerem Feld (Bots ohne JavaScript). */
document.querySelectorAll('form input[name="ts"]').forEach(function (f) { f.value = String(Date.now()); });
