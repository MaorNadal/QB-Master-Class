/* QB Master Class - shared avatars (photo or an illustrated face drawn from a small JSON description).
   Used by the team page (players) and the press room (journalists). Everything is checked against allow-lists, so
   imported / tampered JSON can never inject markup into the generated SVG. */
(function () {
    'use strict';
    const OPT = {
        skin: ['#f8d9c0', '#eec39d', '#d9a06f', '#b97a4b', '#8a5a36', '#5c3a21'],
        hairColor: ['#161311', '#3b2a1c', '#6b4423', '#a9743a', '#d8b25a', '#8c8c8c', '#b23a2e', '#f1f5f9'],
        hair: ['short', 'buzz', 'curly', 'long', 'bald', 'afro', 'bun', 'sidepart'],
        eyes: ['round', 'narrow', 'wide'],
        brows: ['flat', 'angled', 'thick'],
        nose: ['small', 'wide', 'long'],
        mouth: ['smile', 'neutral', 'grin', 'serious'],
        facial: ['none', 'stubble', 'beard', 'mustache'],
        outfit: ['jersey', 'suit', 'hoodie'],
        clothColor: ['#1d4ed8', '#b91c1c', '#15803d', '#7e22ce', '#0f172a', '#ea580c', '#0e7490', '#64748b'],
        accent: ['#facc15', '#e5e7eb', '#ef4444', '#38bdf8', '#111827']      // tie / jersey number / cap colour
    };
    const LABELS = { skin: 'גוון עור', hairColor: 'צבע שיער', hair: 'תסרוקת', eyes: 'עיניים', brows: 'גבות', nose: 'אף', mouth: 'פה', facial: 'שיער פנים', outfit: 'לבוש', clothColor: 'צבע לבוש', accent: 'צבע משני' };
    const VALUE_LABELS = {
        hair: { short: 'קצר', buzz: 'גזור', curly: 'מתולתל', long: 'ארוך', bald: 'קירח', afro: 'אפרו', bun: 'קוקו עליון', sidepart: 'פס צד' },
        eyes: { round: 'עגולות', narrow: 'צרות', wide: 'רחבות' }, brows: { flat: 'ישרות', angled: 'זוויתיות', thick: 'עבות' },
        nose: { small: 'קטן', wide: 'רחב', long: 'ארוך' }, mouth: { smile: 'חיוך', neutral: 'רגוע', grin: 'חיוך רחב', serious: 'רציני' },
        facial: { none: 'בלי', stubble: 'זיפים', beard: 'זקן', mustache: 'שפם' }, outfit: { jersey: 'חולצת משחק', suit: 'חליפה', hoodie: 'קפוצ׳ון' }
    };
    const DEFAULT_FACE = { skin: '#eec39d', hairColor: '#3b2a1c', hair: 'short', eyes: 'round', brows: 'flat', nose: 'small', mouth: 'smile', facial: 'none', glasses: false, cap: false, outfit: 'jersey', clothColor: '#1d4ed8', accent: '#e5e7eb' };
    const HEX = /^#[0-9a-f]{6}$/i;
    const PHOTO_OK = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+\/=]+$/;
    let uid = 0;

    function sanitizeFace(input) {
        const src = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
        const out = Object.assign({}, DEFAULT_FACE);
        ['skin', 'hairColor', 'clothColor', 'accent'].forEach(k => { if (typeof src[k] === 'string' && HEX.test(src[k])) out[k] = src[k].toLowerCase(); });
        ['hair', 'eyes', 'brows', 'nose', 'mouth', 'facial', 'outfit'].forEach(k => { if (OPT[k].includes(src[k])) out[k] = src[k]; });
        out.glasses = src.glasses === true; out.cap = src.cap === true;
        return out;
    }
    function sanitizeAvatar(v) {
        const src = v && typeof v === 'object' && !Array.isArray(v) ? v : {};
        const photo = typeof src.photo === 'string' && PHOTO_OK.test(src.photo) ? src.photo : '';
        return { mode: src.mode === 'photo' && photo ? 'photo' : 'face', face: sanitizeFace(src.face), photo };
    }
    function shade(hex, amt) {   // amt -1..1
        const n = parseInt(hex.slice(1), 16);
        let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
        const f = c => Math.max(0, Math.min(255, Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt)));
        return '#' + [f(r), f(g), f(b)].map(c => c.toString(16).padStart(2, '0')).join('');
    }

    // A bust (head, neck and shoulders) in a 200x200 viewBox. opts: { number } shown on a game jersey.
    function svg(faceIn, opts) {
        opts = opts || {};
        const c = sanitizeFace(faceIn), id = 'qa' + (++uid);
        const skinD = shade(c.skin, -0.14), skinL = shade(c.skin, 0.12), clothD = shade(c.clothColor, -0.25), hc = c.hairColor, hcD = shade(hc, -0.25);
        let hairBack = '', hairFront = '';
        if (c.hair === 'long') hairBack = `<path d="M44 92 C36 36 164 36 156 92 L164 158 L36 158 Z" fill="${hc}"/>`;
        if (c.hair === 'afro') hairBack = `<circle cx="100" cy="66" r="52" fill="${hc}"/>`;
        if (c.hair === 'bun') hairBack = `<circle cx="100" cy="30" r="15" fill="${hc}"/>`;
        if (c.hair === 'short') hairFront = `<path d="M50 84 C46 34 154 34 150 84 C140 62 120 58 100 58 C80 58 60 62 50 84 Z" fill="${hc}"/>`;
        if (c.hair === 'sidepart') hairFront = `<path d="M50 86 C44 34 156 32 150 86 C146 66 128 56 96 56 C72 56 56 66 50 86 Z" fill="${hc}"/><path d="M92 55 C108 50 134 56 150 84" stroke="${hcD}" stroke-width="3" fill="none"/>`;
        if (c.hair === 'buzz') hairFront = `<path d="M52 82 C50 44 150 44 148 82 C138 66 120 62 100 62 C80 62 62 66 52 82 Z" fill="${hc}" opacity=".85"/>`;
        if (c.hair === 'curly') hairFront = `<g fill="${hc}"><circle cx="58" cy="70" r="16"/><circle cx="78" cy="55" r="17"/><circle cx="102" cy="50" r="18"/><circle cx="124" cy="56" r="17"/><circle cx="143" cy="72" r="16"/></g>`;
        if (c.hair === 'afro') hairFront = `<path d="M54 84 C54 56 146 56 146 84 C134 70 118 66 100 66 C82 66 66 70 54 84 Z" fill="${hc}"/>`;
        if (c.hair === 'bun') hairFront = `<path d="M50 84 C46 38 154 38 150 84 C140 64 120 60 100 60 C80 60 60 64 50 84 Z" fill="${hc}"/>`;
        const eye = { round: [5, 5.5], narrow: [6, 3.2], wide: [6.5, 6.5] }[c.eyes];
        const eyes = [76, 124].map(x => `<ellipse cx="${x}" cy="96" rx="${eye[0] + 2}" ry="${eye[1] + 1.5}" fill="#fff"/><circle cx="${x}" cy="96.5" r="${Math.min(eye[1], 4)}" fill="#1f2937"/><circle cx="${x + 1.5}" cy="95" r="1.2" fill="#fff"/>`).join('');
        const brow = { flat: (x) => `<path d="M${x - 11} 83 L${x + 11} 83" stroke="${hc}" stroke-width="3.5" stroke-linecap="round"/>`,
                       angled: (x, s) => `<path d="M${x - 11} ${s > 0 ? 86 : 82} L${x + 11} ${s > 0 ? 82 : 86}" stroke="${hc}" stroke-width="3.5" stroke-linecap="round"/>`,
                       thick: (x) => `<path d="M${x - 12} 83 L${x + 12} 83" stroke="${hc}" stroke-width="6" stroke-linecap="round"/>` }[c.brows];
        const brows = brow(76, 1) + brow(124, -1);
        const nose = { small: `<path d="M100 100 L96 116 L104 116" stroke="${skinD}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
                       wide: `<path d="M100 100 L92 117 Q100 122 108 117 Z" fill="${skinD}"/>`,
                       long: `<path d="M100 96 L95 122 L105 122" stroke="${skinD}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` }[c.nose];
        const mouth = { smile: `<path d="M84 132 Q100 146 116 132" stroke="#7a2e2e" stroke-width="4" fill="none" stroke-linecap="round"/>`,
                        neutral: `<path d="M86 136 L114 136" stroke="#7a2e2e" stroke-width="4" stroke-linecap="round"/>`,
                        grin: `<path d="M82 130 Q100 152 118 130 Z" fill="#fff" stroke="#7a2e2e" stroke-width="3" stroke-linejoin="round"/>`,
                        serious: `<path d="M88 137 Q100 133 112 137" stroke="#7a2e2e" stroke-width="4" fill="none" stroke-linecap="round"/>` }[c.mouth];
        let facial = '';
        if (c.facial === 'stubble') facial = `<path d="M62 118 Q100 172 138 118 L138 132 Q100 176 62 132 Z" fill="${hc}" opacity=".28"/>`;
        if (c.facial === 'beard') facial = `<path d="M58 112 Q100 184 142 112 L146 130 Q100 190 54 130 Z" fill="${hc}"/>`;
        if (c.facial === 'mustache') facial = `<path d="M82 126 Q100 118 118 126 Q100 132 82 126 Z" fill="${hc}"/>`;
        const glasses = c.glasses ? `<g fill="#ffffff22" stroke="#111827" stroke-width="3"><rect x="60" y="86" width="32" height="22" rx="8"/><rect x="108" y="86" width="32" height="22" rx="8"/><path d="M92 96 L108 96"/></g>` : '';
        const cap = c.cap ? `<path d="M48 82 C48 36 152 36 152 82 Z" fill="${c.accent}"/><path d="M44 82 L156 82 L166 90 L34 90 Z" fill="${c.accent}"/><rect x="48" y="80" width="104" height="3" fill="#00000033"/>` : '';
        let body;
        if (c.outfit === 'suit') {
            body = `<path d="M24 200 C28 160 60 148 100 148 C140 148 172 160 176 200 Z" fill="${c.clothColor}"/><path d="M100 150 L78 200 L122 200 Z" fill="#f8fafc"/><path d="M100 152 L92 166 L100 192 L108 166 Z" fill="${c.accent}"/><path d="M100 150 L74 148 L84 176 L98 160 Z M100 150 L126 148 L116 176 L102 160 Z" fill="${clothD}"/>`;
        } else if (c.outfit === 'hoodie') {
            body = `<path d="M22 200 C26 158 60 146 100 146 C140 146 174 158 178 200 Z" fill="${c.clothColor}"/><path d="M70 150 Q100 176 130 150 Q100 164 70 150 Z" fill="${clothD}"/><path d="M92 160 L90 186 M108 160 L110 186" stroke="${c.accent}" stroke-width="3" stroke-linecap="round"/>`;
        } else {
            body = `<path d="M24 200 C26 158 58 148 100 148 C142 148 174 158 176 200 Z" fill="${c.clothColor}"/><path d="M24 200 C22 176 30 160 52 154 L56 200 Z M176 200 C178 176 170 160 148 154 L144 200 Z" fill="${clothD}"/><path d="M82 150 Q100 166 118 150" stroke="${c.accent}" stroke-width="4" fill="none"/>` +
                   (opts.number != null && String(opts.number).trim() !== '' ? `<text x="100" y="180" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="26" fill="${c.accent}" stroke="${clothD}" stroke-width="1">${String(opts.number).replace(/[^0-9A-Za-z]/g, '').slice(0, 3)}</text>` : '');
        }
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%" role="img" aria-hidden="true">
<defs><radialGradient id="${id}s" cx="45%" cy="38%" r="70%"><stop offset="0" stop-color="${skinL}"/><stop offset="1" stop-color="${c.skin}"/></radialGradient></defs>
${hairBack}${body}
<path d="M84 124 L84 154 Q100 166 116 154 L116 124 Z" fill="${skinD}"/>
<ellipse cx="52" cy="102" rx="8" ry="12" fill="${c.skin}"/><ellipse cx="148" cy="102" rx="8" ry="12" fill="${c.skin}"/>
<path d="M52 84 C52 44 148 44 148 84 L148 112 C148 146 124 160 100 160 C76 160 52 146 52 112 Z" fill="url(#${id}s)"/>
<ellipse cx="68" cy="118" rx="9" ry="5" fill="#ef444422"/><ellipse cx="132" cy="118" rx="9" ry="5" fill="#ef444422"/>
${hairFront}${eyes}${brows}${nose}${mouth}${facial}${glasses}${cap}
</svg>`;
    }
    function html(avatarIn, opts) {
        const a = sanitizeAvatar(avatarIn);
        if (a.mode === 'photo') return `<img src="${a.photo}" alt="" style="width:100%;height:100%;object-fit:cover;display:block">`;
        return svg(a.face, opts);
    }
    function randomFace(role) {
        const pick = a => a[Math.floor(Math.random() * a.length)];
        return sanitizeFace({ skin: pick(OPT.skin), hairColor: pick(OPT.hairColor), hair: pick(OPT.hair), eyes: pick(OPT.eyes), brows: pick(OPT.brows), nose: pick(OPT.nose), mouth: pick(OPT.mouth),
            facial: Math.random() < 0.35 ? pick(OPT.facial) : 'none', glasses: Math.random() < (role === 'journalist' ? 0.4 : 0.15), cap: false,
            outfit: role === 'journalist' ? pick(['suit', 'suit', 'hoodie']) : 'jersey', clothColor: pick(OPT.clothColor), accent: pick(OPT.accent) });
    }
    // Resizes a user photo to a small JPEG data URL (square-cropped from the centre) so many avatars fit in browser storage.
    function compressPhoto(file, size) {
        size = size || 160;
        return new Promise(resolve => {
            if (!file || !/^image\//.test(file.type)) return resolve(null);
            const r = new FileReader();
            r.onerror = () => resolve(null);
            r.onload = e => {
                const img = new Image();
                img.onerror = () => resolve(null);
                img.onload = () => {
                    const side = Math.min(img.width, img.height), sx = (img.width - side) / 2, sy = (img.height - side) / 2;
                    const cv = document.createElement('canvas'); cv.width = cv.height = size;
                    cv.getContext('2d').drawImage(img, sx, sy, side, side, 0, 0, size, size);
                    const out = cv.toDataURL('image/jpeg', 0.78);
                    resolve(PHOTO_OK.test(out) ? out : null);
                };
                img.src = e.target.result;
            };
            r.readAsDataURL(file);
        });
    }
    function esc(s) { return String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch])); }

    // Editor: renders controls into `container` and reports every change through onChange(newAvatar).
    // opts: { role: 'player' | 'journalist', number: () => value }
    function editor(container, initial, onChange, opts) {
        opts = opts || {};
        let state = sanitizeAvatar(initial), jsonOpen = false;
        const eid = 'qe' + (++uid);
        function emit() { onChange(sanitizeAvatar(state)); }
        function draw() {
            const f = state.face;
            const sw = (key, list) => list.map(col => `<button type="button" data-k="${key}" data-v="${col}" class="qa-sw${f[key] === col ? ' on' : ''}" style="background:${col}" title="${col}"></button>`).join('');
            const sel = key => `<select data-s="${key}" class="qa-sel">${OPT[key].map(v => `<option value="${v}"${f[key] === v ? ' selected' : ''}>${VALUE_LABELS[key][v]}</option>`).join('')}</select>`;
            const row = (label, inner) => `<div class="qa-row"><span class="qa-lab">${label}</span>${inner}</div>`;
            container.innerHTML = `<div class="qa-ed">
                <div class="qa-prev">${html(state, { number: opts.number ? opts.number() : null })}</div>
                <div class="qa-ctl">
                    <div class="qa-modes"><button type="button" data-mode="face" class="qa-btn${state.mode === 'face' ? ' on' : ''}">🎭 פנים מאוירות</button><button type="button" data-mode="photo" class="qa-btn${state.mode === 'photo' ? ' on' : ''}">🖼️ תמונה</button></div>
                    ${state.mode === 'photo' ? `<div class="qa-row"><label class="qa-btn">בחר תמונה<input type="file" accept="image/*" data-photo style="display:none"></label>${state.photo ? '<button type="button" data-rmphoto class="qa-btn">הסר</button>' : ''}<span class="qa-hint">התמונה מוקטנת ונשמרת רק בדפדפן.</span></div>` : `
                    ${row(LABELS.skin, `<div class="qa-sws">${sw('skin', OPT.skin)}</div>`)}
                    ${row(LABELS.hair, sel('hair') + `<div class="qa-sws">${sw('hairColor', OPT.hairColor)}</div>`)}
                    ${row('פנים', sel('eyes') + sel('brows') + sel('nose') + sel('mouth'))}
                    ${row(LABELS.facial, sel('facial'))}
                    ${row(LABELS.outfit, sel('outfit') + `<div class="qa-sws">${sw('clothColor', OPT.clothColor)}</div>`)}
                    ${row('אביזרים', `<label class="qa-chk"><input type="checkbox" data-c="glasses"${f.glasses ? ' checked' : ''}> משקפיים</label><label class="qa-chk"><input type="checkbox" data-c="cap"${f.cap ? ' checked' : ''}> כובע</label><span class="qa-lab">${LABELS.accent}</span><div class="qa-sws">${sw('accent', OPT.accent)}</div>`)}
                    <div class="qa-row"><button type="button" data-rand class="qa-btn">🎲 אקראי</button></div>
                    <details class="qa-json"${jsonOpen ? ' open' : ''}><summary>{ } JSON</summary><textarea dir="ltr" rows="5" data-json>${esc(JSON.stringify(state.face, null, 2))}</textarea><div><button type="button" data-apply class="qa-btn">החל JSON</button> <span data-jstat class="qa-hint"></span></div></details>`}
                </div></div>`;
        }
        container.onclick = e => {
            const t = e.target.closest('button'); if (!t || !container.contains(t)) return;
            if (t.dataset.mode) { state.mode = t.dataset.mode === 'photo' ? 'photo' : 'face'; draw(); emit(); }
            else if (t.dataset.k) { state.face[t.dataset.k] = t.dataset.v; state.face = sanitizeFace(state.face); state.mode = 'face'; draw(); emit(); }
            else if (t.hasAttribute('data-rand')) { state.face = randomFace(opts.role); state.mode = 'face'; draw(); emit(); }
            else if (t.hasAttribute('data-rmphoto')) { state.photo = ''; state.mode = 'face'; draw(); emit(); }
            else if (t.hasAttribute('data-apply')) {
                const st = container.querySelector('[data-jstat]');
                try { const p = JSON.parse(container.querySelector('[data-json]').value); if (!p || typeof p !== 'object' || Array.isArray(p)) throw 0; state.face = sanitizeFace(p); state.mode = 'face'; draw(); emit(); }
                catch (err) { st.textContent = 'JSON לא תקין'; st.style.color = '#f87171'; }
            }
        };
        container.addEventListener('toggle', e => { if (e.target && e.target.classList && e.target.classList.contains('qa-json')) jsonOpen = e.target.open; }, true);
        container.onchange = async e => {
            const s = e.target.closest('[data-s]'), c = e.target.closest('[data-c]'), ph = e.target.closest('[data-photo]');
            if (s) { state.face[s.dataset.s] = s.value; state.face = sanitizeFace(state.face); state.mode = 'face'; draw(); emit(); }
            else if (c) { state.face[c.dataset.c] = c.checked; state.mode = 'face'; draw(); emit(); }
            else if (ph && ph.files[0]) {
                const url = await compressPhoto(ph.files[0], 160);
                if (!url) { alert('לא ניתן לקרוא את קובץ התמונה.'); return; }
                state.photo = url; state.mode = 'photo'; draw(); emit();
            }
        };
        draw();
        return { get: () => sanitizeAvatar(state), refresh: draw };
    }
    const css = `.qa-ed{display:grid;grid-template-columns:120px 1fr;gap:12px;align-items:start}@media(max-width:520px){.qa-ed{grid-template-columns:1fr}}
.qa-prev{width:120px;height:120px;border-radius:14px;overflow:hidden;background:#1e293b;border:2px solid #475569}
.qa-ctl{font-size:12px;color:#cbd5e1;display:flex;flex-direction:column;gap:6px}.qa-row{display:flex;flex-wrap:wrap;align-items:center;gap:6px}.qa-lab{color:#94a3b8;min-width:54px}
.qa-sws{display:flex;gap:5px;flex-wrap:wrap}.qa-sw{width:20px;height:20px;border-radius:50%;border:2px solid #475569;cursor:pointer}.qa-sw.on{border-color:#fff}
.qa-sel{background:#0f172a;border:1px solid #475569;border-radius:8px;padding:3px 5px;color:#fff;font-size:12px}
.qa-btn{background:#1e293b;border:1px solid #475569;border-radius:8px;padding:4px 10px;color:#e2e8f0;cursor:pointer;font-size:12px}.qa-btn.on{background:#0369a1;border-color:#38bdf8;color:#fff}
.qa-chk{display:flex;gap:4px;align-items:center}.qa-hint{color:#64748b;font-size:11px}.qa-json textarea{width:100%;background:#020617;border:1px solid #334155;border-radius:8px;color:#e2e8f0;font:11px monospace;padding:6px}`;
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    window.QBAvatar = { OPT, DEFAULT_FACE, sanitizeFace, sanitizeAvatar, svg, html, randomFace, compressPhoto, editor };
})();
