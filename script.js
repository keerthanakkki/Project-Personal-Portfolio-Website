/* ============================================================
   script.js — Portfolio Interactive Features
   Sections:
     1. Dark / Light Mode
     2. Typing Effect
     3. Scroll Fade-In Animations
     4. Skill Progress Bars
     5. Project Gallery Filter + Lightbox
     6. Real-Time Form Validation
     7. Toast Notifications
     8. Quick Notes Widget
   ============================================================ */

/* ── Utility: run after DOM is ready ── */
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initTyping();
    initScrollFade();
    initSkillBars();
    initGallery();
    initForm();
    initNotes();
});


/* ============================================================
   1. DARK / LIGHT MODE
   Saves preference to localStorage so it persists on reload.
   ============================================================ */
function initTheme() {
    const btn  = document.getElementById('theme-toggle');
    const root = document.documentElement;

    // Restore saved preference (default: light)
    const saved = localStorage.getItem('theme') || 'light';
    applyTheme(saved);

    btn.addEventListener('click', () => {
        const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        localStorage.setItem('theme', next);
    });
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.getElementById('theme-toggle').textContent = theme === 'dark' ? '☀️' : '🌙';
}


/* ============================================================
   2. TYPING EFFECT
   Cycles through an array of role strings, types then erases.
   ============================================================ */
function initTyping() {
    const el     = document.getElementById('typing-text');
    const roles  = [
        'Information Science Engineering Student',
        'AI & Machine Learning Enthusiast',
        'Full-Stack Developer',
        'Problem Solver 💡',
    ];
    let roleIdx  = 0;
    let charIdx  = 0;
    let deleting = false;

    function tick() {
        const current = roles[roleIdx];

        if (!deleting) {
            // Type one character
            el.textContent = current.slice(0, ++charIdx);
            if (charIdx === current.length) {
                // Pause at end before deleting
                deleting = true;
                setTimeout(tick, 1800);
                return;
            }
        } else {
            // Erase one character
            el.textContent = current.slice(0, --charIdx);
            if (charIdx === 0) {
                deleting = false;
                roleIdx  = (roleIdx + 1) % roles.length;
            }
        }
        setTimeout(tick, deleting ? 55 : 90);
    }

    tick();
}


/* ============================================================
   3. SCROLL FADE-IN ANIMATIONS
   Uses IntersectionObserver to add .visible when in viewport.
   ============================================================ */
function initScrollFade() {
    const observer = new IntersectionObserver(
        (entries) => entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                observer.unobserve(e.target); // animate once
            }
        }),
        { threshold: 0.12 }
    );

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}


/* ============================================================
   4. SKILL PROGRESS BARS
   Animates bar widths when the bars section scrolls into view.
   ============================================================ */
function initSkillBars() {
    const barsSection = document.querySelector('.skill-bars');
    if (!barsSection) return;

    const observer = new IntersectionObserver(
        ([entry]) => {
            if (!entry.isIntersecting) return;
            document.querySelectorAll('.bar-item').forEach(item => {
                const level = item.dataset.level;
                item.querySelector('.bar-fill').style.width = level + '%';
                item.querySelector('.bar-pct').textContent  = level + '%';
            });
            observer.unobserve(barsSection);
        },
        { threshold: 0.3 }
    );

    observer.observe(barsSection);
}


/* ============================================================
   5. PROJECT GALLERY — Filter + Lightbox
   ============================================================ */
function initGallery() {
    /* ── Filter buttons ── */
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;
            document.querySelectorAll('.gallery-card').forEach(card => {
                const match = filter === 'all' || card.dataset.category === filter;
                card.classList.toggle('hidden', !match);
            });
        });
    });

    /* ── Lightbox open ── */
    document.querySelectorAll('.gallery-card').forEach(card => {
        card.addEventListener('click', () => openLightbox(card));
    });

    /* ── Lightbox close ── */
    document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
    document.getElementById('lightbox').addEventListener('click', e => {
        if (e.target === e.currentTarget) closeLightbox();
    });

    // Close on Escape key
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeLightbox();
    });
}

function openLightbox(card) {
    const lb    = document.getElementById('lightbox');
    const thumb = card.querySelector('.gallery-thumb');

    // Copy gradient background and icon into lightbox
    document.getElementById('lightbox-thumb').style.background = thumb.style.background;
    document.getElementById('lightbox-thumb').textContent       = thumb.querySelector('.gallery-icon').textContent;
    document.getElementById('lightbox-title').textContent       = card.dataset.title;
    document.getElementById('lightbox-desc').textContent        = card.dataset.desc;

    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('open');
    document.body.style.overflow = '';
}


/* ============================================================
   6. REAL-TIME FORM VALIDATION
   Validates on input (live) and on submit.
   ============================================================ */
function initForm() {
    const form    = document.getElementById('contact-form');
    const nameEl  = document.getElementById('name');
    const emailEl = document.getElementById('email');
    const msgEl   = document.getElementById('message');

    // Live validation listeners
    nameEl.addEventListener('input',  () => validateName(nameEl));
    emailEl.addEventListener('input', () => validateEmail(emailEl));
    msgEl.addEventListener('input',   () => validateMessage(msgEl));

    form.addEventListener('submit', e => {
        e.preventDefault();
        const ok = [
            validateName(nameEl),
            validateEmail(emailEl),
            validateMessage(msgEl),
        ].every(Boolean);

        if (ok) {
            showToast('✅ Message sent! I\'ll get back to you soon.', 'success');
            form.reset();
            clearFieldState(nameEl,  'name-error');
            clearFieldState(emailEl, 'email-error');
            clearFieldState(msgEl,   'message-error');
        } else {
            showToast('⚠️ Please fix the errors before submitting.', 'error');
        }
    });

    // Clear button resets validation styles too
    document.getElementById('clear-btn').addEventListener('click', () => {
        clearFieldState(nameEl,  'name-error');
        clearFieldState(emailEl, 'email-error');
        clearFieldState(msgEl,   'message-error');
    });
}

/* Individual validators — return true if valid */
function validateName(el) {
    const val = el.value.trim();
    if (val.length < 2) return setError(el, 'name-error', 'Name must be at least 2 characters.');
    return setValid(el, 'name-error');
}

function validateEmail(el) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(el.value.trim())) return setError(el, 'email-error', 'Enter a valid email address.');
    return setValid(el, 'email-error');
}

function validateMessage(el) {
    if (el.value.trim().length < 10) return setError(el, 'message-error', 'Message must be at least 10 characters.');
    return setValid(el, 'message-error');
}

function setError(el, errorId, msg) {
    el.classList.remove('valid');
    el.classList.add('invalid');
    document.getElementById(errorId).textContent = msg;
    return false;
}

function setValid(el, errorId) {
    el.classList.remove('invalid');
    el.classList.add('valid');
    document.getElementById(errorId).textContent = '';
    return true;
}

function clearFieldState(el, errorId) {
    el.classList.remove('valid', 'invalid');
    document.getElementById(errorId).textContent = '';
}


/* ============================================================
   7. TOAST NOTIFICATIONS
   showToast(message, type) — type: 'success' | 'error' | 'info'
   ============================================================ */
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast     = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    // Auto-remove after 3.5 s
    setTimeout(() => {
        toast.classList.add('fade-out');
        toast.addEventListener('animationend', () => toast.remove());
    }, 3500);
}


/* ============================================================
   8. QUICK NOTES WIDGET
   Saves notes array to localStorage so they persist.
   ============================================================ */
function initNotes() {
    const input    = document.getElementById('note-input');
    const addBtn   = document.getElementById('add-note-btn');
    const clearBtn = document.getElementById('clear-notes-btn');
    const list     = document.getElementById('notes-list');

    let notes = JSON.parse(localStorage.getItem('portfolio-notes') || '[]');
    renderNotes();

    addBtn.addEventListener('click', addNote);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') addNote(); });
    clearBtn.addEventListener('click', () => {
        if (!notes.length) return;
        notes = [];
        saveAndRender();
        showToast('🗑️ All notes cleared.', 'info');
    });

    function addNote() {
        const text = input.value.trim();
        if (!text) { showToast('⚠️ Note cannot be empty.', 'error'); return; }
        notes.unshift({ id: Date.now(), text });
        input.value = '';
        saveAndRender();
        showToast('📌 Note added!', 'success');
    }

    function deleteNote(id) {
        notes = notes.filter(n => n.id !== id);
        saveAndRender();
    }

    function saveAndRender() {
        localStorage.setItem('portfolio-notes', JSON.stringify(notes));
        renderNotes();
    }

    function renderNotes() {
        list.innerHTML = '';
        if (!notes.length) {
            list.innerHTML = '<li style="color:var(--text-muted);font-size:.88rem;text-align:center;padding:10px 0">No notes yet.</li>';
            return;
        }
        notes.forEach(note => {
            const li  = document.createElement('li');
            li.className = 'note-item';

            const span = document.createElement('span');
            span.textContent = note.text;

            const del = document.createElement('button');
            del.className   = 'note-delete';
            del.textContent = '✕';
            del.title       = 'Delete note';
            del.addEventListener('click', () => deleteNote(note.id));

            li.append(span, del);
            list.appendChild(li);
        });
    }
}
