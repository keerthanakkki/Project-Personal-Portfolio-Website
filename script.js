/* ============================================================
   script.js — Portfolio Interactive Features
   1. Theme (dark/light) + system preference
   2. Typing effect
   3. Scroll fade-in (IntersectionObserver)
   4. Skill progress bars
   5. Project gallery filter + lightbox
   6. Real-time form validation
   7. Toast notifications
   8. Quick Notes widget
   9. Particle canvas (hero background)
  10. Custom cursor
  11. Hamburger mobile nav
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initCursor();
    initHamburger();
    initParticles();
    initTyping();
    initScrollFade();
    initSkillBars();
    initGallery();
    initForm();
    initNotes();
});


/* ── 1. THEME ─────────────────────────────────────────────── */
function initTheme() {
    const btn  = document.getElementById('theme-toggle');
    const root = document.documentElement;
    const saved  = localStorage.getItem('portfolio-theme');
    const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

    applyTheme(saved || system);
    btn.addEventListener('click', () => {
        applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const icon = document.getElementById('theme-icon');
    if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('portfolio-theme', theme);
}


/* ── 2. TYPING EFFECT ─────────────────────────────────────── */
function initTyping() {
    const el    = document.getElementById('typing-text');
    const roles = [
        'Information Science Engineering Student',
        'AI & Machine Learning Enthusiast',
        'Full-Stack Developer',
        'Problem Solver 💡',
    ];
    let ri = 0, ci = 0, del = false;

    function tick() {
        const cur = roles[ri];
        el.textContent = del ? cur.slice(0, --ci) : cur.slice(0, ++ci);

        if (!del && ci === cur.length) { del = true; setTimeout(tick, 1800); return; }
        if (del && ci === 0)           { del = false; ri = (ri + 1) % roles.length; }
        setTimeout(tick, del ? 55 : 90);
    }
    tick();
}


/* ── 3. SCROLL FADE-IN ────────────────────────────────────── */
function initScrollFade() {
    const obs = new IntersectionObserver(
        entries => entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
        }),
        { threshold: 0.1 }
    );
    document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));
}


/* ── 4. SKILL BARS ────────────────────────────────────────── */
function initSkillBars() {
    const section = document.querySelector('.skills__bars');
    if (!section) return;

    const obs = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        document.querySelectorAll('.bar-item').forEach(item => {
            const lvl  = item.dataset.level;
            const fill = item.querySelector('.bar-item__fill') || item.querySelector('.bar-fill');
            const pct  = item.querySelector('.bar-pct');
            const track = item.querySelector('[role="progressbar"]');
            if (fill)  fill.style.width = lvl + '%';
            if (pct)   pct.textContent  = lvl + '%';
            if (track) track.setAttribute('aria-valuenow', lvl);
        });
        obs.unobserve(section);
    }, { threshold: 0.3 });

    obs.observe(section);
}


/* ── 5. GALLERY FILTER + LIGHTBOX ────────────────────────── */
function initGallery() {
    // Filter
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('filter-btn--active', 'active');
            });
            btn.classList.add('filter-btn--active');

            const f = btn.dataset.filter;
            document.querySelectorAll('.project-card').forEach(card => {
                const show = f === 'all' || card.dataset.category === f;
                card.classList.toggle('project-card--hidden', !show);
                card.classList.toggle('hidden', !show);
            });
        });
    });

    // Open lightbox on card or view-btn click
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', () => openLightbox(card));
    });

    document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
    document.getElementById('lightbox').addEventListener('click', e => {
        if (e.target === e.currentTarget) closeLightbox();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
}

function openLightbox(card) {
    const top   = card.querySelector('.project-card__top') || card.querySelector('.card-top');
    const emoji = card.querySelector('.project-card__emoji') || card.querySelector('.card-emoji');
    const thumb = document.getElementById('lightbox-top');

    thumb.style.background = top ? top.style.background : '';
    thumb.textContent       = emoji ? emoji.textContent : '';
    document.getElementById('lightbox-title').textContent = card.dataset.title || '';
    document.getElementById('lightbox-desc').textContent  = card.dataset.desc  || '';

    // Tech tags
    const techEl = document.getElementById('lightbox-tech');
    techEl.innerHTML = '';
    (card.dataset.tech || '').split('·').forEach(t => {
        const s = document.createElement('span');
        s.textContent = t.trim();
        techEl.appendChild(s);
    });

    document.getElementById('lightbox').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('open');
    document.body.style.overflow = '';
}


/* ── 6. FORM VALIDATION ───────────────────────────────────── */
function initForm() {
    const form  = document.getElementById('contact-form');
    const name  = document.getElementById('name');
    const email = document.getElementById('email');
    const msg   = document.getElementById('message');

    name.addEventListener('input',  () => validateName(name));
    email.addEventListener('input', () => validateEmail(email));
    msg.addEventListener('input',   () => validateMsg(msg));

    form.addEventListener('submit', e => {
        e.preventDefault();
        const ok = [validateName(name), validateEmail(email), validateMsg(msg)].every(Boolean);
        if (ok) {
            showToast('✅ Message sent! I\'ll get back to you soon.', 'success');
            form.reset();
            [name, email, msg].forEach(el => clearState(el, el.id + '-error'));
        } else {
            showToast('⚠️ Please fix the errors before submitting.', 'error');
        }
    });

    document.getElementById('clear-btn').addEventListener('click', () => {
        [name, email, msg].forEach(el => clearState(el, el.id + '-error'));
    });
}

function validateName(el) {
    return el.value.trim().length < 2
        ? setErr(el, 'name-error', 'Name must be at least 2 characters.')
        : setOk(el, 'name-error');
}
function validateEmail(el) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim())
        ? setOk(el, 'email-error')
        : setErr(el, 'email-error', 'Enter a valid email address.');
}
function validateMsg(el) {
    return el.value.trim().length < 10
        ? setErr(el, 'message-error', 'Message must be at least 10 characters.')
        : setOk(el, 'message-error');
}

function setErr(el, id, msg) {
    el.classList.replace('valid','invalid') || el.classList.add('invalid');
    el.classList.remove('valid');
    document.getElementById(id).textContent = msg;
    return false;
}
function setOk(el, id) {
    el.classList.replace('invalid','valid') || el.classList.add('valid');
    el.classList.remove('invalid');
    document.getElementById(id).textContent = '';
    return true;
}
function clearState(el, id) {
    el.classList.remove('valid','invalid');
    document.getElementById(id).textContent = '';
}


/* ── 7. TOAST ─────────────────────────────────────────────── */
function showToast(message, type = 'info') {
    const c     = document.getElementById('toast-container');
    const toast = document.createElement('div');
    // Support both old class names and new BEM names
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    c.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('toast--out');
        toast.addEventListener('animationend', () => toast.remove(), { once: true });
    }, 3500);
}


/* ── 8. NOTES WIDGET ──────────────────────────────────────── */
function initNotes() {
    const input    = document.getElementById('note-input');
    const addBtn   = document.getElementById('add-note-btn');
    const clearBtn = document.getElementById('clear-notes-btn');
    const list     = document.getElementById('notes-list');
    let notes      = JSON.parse(localStorage.getItem('portfolio-notes') || '[]');

    render();

    addBtn.addEventListener('click', add);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') add(); });
    clearBtn.addEventListener('click', () => {
        if (!notes.length) return;
        notes = [];
        save();
        showToast('🗑️ All notes cleared.', 'info');
    });

    function add() {
        const text = input.value.trim();
        if (!text) { showToast('⚠️ Note cannot be empty.', 'error'); return; }
        notes.unshift({ id: Date.now(), text });
        input.value = '';
        save();
        showToast('📌 Note added!', 'success');
    }

    function save() { localStorage.setItem('portfolio-notes', JSON.stringify(notes)); render(); }

    function render() {
        list.innerHTML = '';
        if (!notes.length) {
            list.innerHTML = '<li style="color:var(--text-muted);font-size:.88rem;text-align:center;padding:10px 0">No notes yet.</li>';
            return;
        }
        notes.forEach(n => {
            const li  = document.createElement('li');
            li.className = 'notes__item';

            const span = document.createElement('span');
            span.textContent = n.text;

            const del = document.createElement('button');
            del.className   = 'notes__item-delete';
            del.textContent = '✕';
            del.setAttribute('aria-label', 'Delete note');
            del.addEventListener('click', () => {
                notes = notes.filter(x => x.id !== n.id);
                save();
            });

            li.append(span, del);
            list.appendChild(li);
        });
    }
}


/* ── 9. PARTICLE CANVAS ───────────────────────────────────── */
function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles;

    function resize() {
        W = canvas.width  = canvas.offsetWidth;
        H = canvas.height = canvas.offsetHeight;
    }

    function createParticles() {
        const count = Math.floor((W * H) / 14000);
        particles = Array.from({ length: count }, () => ({
            x:  Math.random() * W,
            y:  Math.random() * H,
            r:  Math.random() * 1.8 + 0.4,
            dx: (Math.random() - 0.5) * 0.4,
            dy: (Math.random() - 0.5) * 0.4,
            o:  Math.random() * 0.5 + 0.2,
        }));
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(167,139,250,${p.o})`;
            ctx.fill();

            p.x += p.dx;
            p.y += p.dy;
            if (p.x < 0 || p.x > W) p.dx *= -1;
            if (p.y < 0 || p.y > H) p.dy *= -1;
        });
        requestAnimationFrame(draw);
    }

    resize();
    createParticles();
    draw();
    window.addEventListener('resize', () => { resize(); createParticles(); });
}


/* ── 10. CUSTOM CURSOR ────────────────────────────────────── */
function initCursor() {
    const dot  = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;

    let mx = 0, my = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    // Dot follows instantly, ring lags slightly
    (function animateCursor() {
        dot.style.left  = mx + 'px';
        dot.style.top   = my + 'px';
        rx += (mx - rx) * 0.15;
        ry += (my - ry) * 0.15;
        ring.style.left = rx + 'px';
        ring.style.top  = ry + 'px';
        requestAnimationFrame(animateCursor);
    })();

    // Grow ring on hoverable elements
    document.querySelectorAll('a, button, .project-card, .skills__badge').forEach(el => {
        el.addEventListener('mouseenter', () => {
            ring.style.width  = '52px';
            ring.style.height = '52px';
            ring.style.opacity = '0.4';
        });
        el.addEventListener('mouseleave', () => {
            ring.style.width  = '32px';
            ring.style.height = '32px';
            ring.style.opacity = '0.6';
        });
    });

    // Hide on mobile
    if ('ontouchstart' in window) {
        dot.style.display  = 'none';
        ring.style.display = 'none';
    }
}


/* ── 11. HAMBURGER MENU ───────────────────────────────────── */
function initHamburger() {
    const btn   = document.getElementById('hamburger');
    const links = document.getElementById('nav-links');
    if (!btn || !links) return;

    btn.addEventListener('click', () => {
        const open = links.classList.toggle('nav__links--open');
        btn.setAttribute('aria-expanded', open);
    });

    // Close when a link is clicked
    links.querySelectorAll('.nav__link').forEach(a => {
        a.addEventListener('click', () => {
            links.classList.remove('nav__links--open');
            btn.setAttribute('aria-expanded', 'false');
        });
    });
}
