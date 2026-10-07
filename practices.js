/* QB Master Class - team practices (shared by calendar.html and team.html).
   Stored in qbmc_team_practices as [{id, date, title, focus, minutes, drills:[{name, src}], notes, attendees:[playerId]|null, rating}].
   Needs training-data.js (drill library + the activity helpers that count a practice as an active day). */
(function () {
    'use strict';
    const KEY = 'qbmc_team_practices', ROSTER_KEY = 'qbmc_team_roster';
    const FOCUS = { full: 'אימון מלא', offense: 'התקפה', defense: 'הגנה', special: 'יחידות מיוחדות', qb: 'קוורטרבקים וקבלות', conditioning: 'כושר וסיבולת', walkthrough: 'Walkthrough (בלי מגע)', scrimmage: 'משחק אימון פנימי', film: 'וידאו וישיבת צוות', other: 'אחר' };
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

    function readAll() { try { const v = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(v) ? v.filter(p => p && typeof p === 'object' && DATE_RE.test(p.date || '')) : []; } catch (e) { return []; } }
    function writeAll(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); return true; } catch (e) { return false; } }
    function roster() {
        try { const r = JSON.parse(localStorage.getItem(ROSTER_KEY)); return r && Array.isArray(r.players) ? r.players.filter(p => p && typeof p === 'object' && p.id && p.name) : []; } catch (e) { return []; }
    }
    function forDate(ds) { return readAll().filter(p => p.date === ds); }
    function clean(p) {
        const num = (v, lo, hi, d) => { const n = Math.round(Number(v)); return isFinite(n) ? Math.max(lo, Math.min(hi, n)) : d; };
        return {
            id: String(p.id || ('pr' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6))),
            date: DATE_RE.test(p.date) ? p.date : '',
            title: String(p.title || '').trim().slice(0, 80) || 'אימון קבוצה',
            focus: FOCUS[p.focus] ? p.focus : 'full',
            minutes: num(p.minutes, 0, 600, 0),
            drills: (Array.isArray(p.drills) ? p.drills : []).map(d => ({ name: String(d && d.name || '').trim().slice(0, 80), src: d && d.src === 'library' ? 'library' : 'custom' })).filter(d => d.name).slice(0, 40),
            notes: String(p.notes || '').slice(0, 1000),
            attendees: Array.isArray(p.attendees) ? p.attendees.map(String).slice(0, 200) : null,
            rating: num(p.rating, 0, 5, 0)
        };
    }
    function save(p) {
        const c = clean(p);
        if (!c.date) return null;
        const all = readAll(), i = all.findIndex(x => x.id === c.id);
        if (i >= 0) all[i] = c; else all.push(c);
        all.sort((a, b) => a.date.localeCompare(b.date));
        return writeAll(all) ? c : null;
    }
    function remove(id) { return writeAll(readAll().filter(p => p.id !== id)); }

    function summaryHtml(p) {
        const ros = roster(), att = Array.isArray(p.attendees) ? p.attendees : null;
        const known = att ? att.filter(id => ros.some(r => r.id === id)).length : null;
        return `<div class="qp-sum"><div class="qp-sum-h"><b>${esc(p.title)}</b><span class="qp-tag">${esc(FOCUS[p.focus] || '')}</span>${p.minutes ? `<span class="qp-tag">${p.minutes} דק׳</span>` : ''}${p.rating ? `<span class="qp-tag">${'★'.repeat(p.rating)}${'☆'.repeat(5 - p.rating)}</span>` : ''}</div>
            ${p.drills.length ? `<ul class="qp-dr">${p.drills.map(d => `<li>${d.src === 'library' ? '🎯' : '📝'} ${esc(d.name)}</li>`).join('')}</ul>` : '<div class="qp-mu">לא נוספו תרגילים</div>'}
            ${known !== null ? `<div class="qp-mu">נוכחות: ${known}${ros.length ? ' מתוך ' + ros.length : ''}</div>` : ''}
            ${p.notes ? `<div class="qp-notes">${esc(p.notes)}</div>` : ''}</div>`;
    }

    // Renders the add/edit form for `date` into `container`. opts: { editId, onSaved(practice), onCancel() }
    function renderForm(container, date, opts) {
        opts = opts || {};
        const QT = window.QB_TRAINING, ros = roster();
        const existing = opts.editId ? readAll().find(p => p.id === opts.editId) : null;
        const d = existing ? JSON.parse(JSON.stringify(existing)) : { date, title: '', focus: 'full', minutes: 90, drills: [], notes: '', attendees: ros.length ? ros.map(r => r.id) : null, rating: 0 };
        const libOpts = QT ? Object.keys(QT.DRILL_CATEGORY_META).map(cat => {
            const items = QT.DRILLS_DATABASE.map((x, i) => ({ x, i })).filter(o => o.x.category === cat);
            return `<optgroup label="${esc(QT.DRILL_CATEGORY_META[cat].icon + ' ' + QT.DRILL_CATEGORY_META[cat].label)}">${items.map(o => `<option value="${o.i}">${esc(o.x.name)}</option>`).join('')}</optgroup>`;
        }).join('') : '';
        function draw() {
            container.innerHTML = `<div class="qp-form">
                <div class="qp-h">${existing ? '✏️ עריכת אימון קבוצה' : '➕ אימון קבוצה חדש'} <span class="qp-mu">${esc(d.date)}</span></div>
                <div class="qp-grid">
                    <label>שם האימון<input data-f="title" maxlength="80" value="${esc(d.title)}" placeholder="למשל: אימון יום ג׳ – התקפה"></label>
                    <label>סוג<select data-f="focus">${Object.entries(FOCUS).map(([k, v]) => `<option value="${k}"${d.focus === k ? ' selected' : ''}>${v}</option>`).join('')}</select></label>
                    <label>משך (דקות)<input data-f="minutes" type="number" min="0" max="600" value="${esc(d.minutes)}"></label>
                    <label>איך היה האימון<select data-f="rating"><option value="0">—</option>${[1, 2, 3, 4, 5].map(n => `<option value="${n}"${d.rating === n ? ' selected' : ''}>${'★'.repeat(n)}</option>`).join('')}</select></label>
                </div>
                <div class="qp-sec">🎯 תרגילים באימון</div>
                <div class="qp-row">
                    ${QT ? `<select data-lib><option value="">בחר מספריית הדרילים…</option>${libOpts}</select><button type="button" data-addlib class="qp-btn">הוסף</button>` : '<span class="qp-mu">ספריית הדרילים לא נטענה (training-data.js).</span>'}
                </div>
                <div class="qp-row"><input data-custom maxlength="80" placeholder="או כתוב תרגיל חופשי…"><button type="button" data-addcustom class="qp-btn">הוסף</button></div>
                <ul class="qp-dr">${d.drills.map((x, i) => `<li>${x.src === 'library' ? '🎯' : '📝'} ${esc(x.name)} <button type="button" data-rm="${i}" class="qp-x" title="הסר">✕</button></li>`).join('') || '<li class="qp-mu">עדיין לא נוספו תרגילים</li>'}</ul>
                ${ros.length ? `<div class="qp-sec">👥 נוכחות <button type="button" data-all class="qp-link">כולם</button> <button type="button" data-none class="qp-link">אף אחד</button></div>
                    <div class="qp-att">${ros.map(r => `<label class="qp-chip"><input type="checkbox" data-att="${esc(r.id)}"${(d.attendees || []).includes(r.id) ? ' checked' : ''}> ${esc(r.name)}</label>`).join('')}</div>` : '<div class="qp-mu">אין עדיין סגל בדף הקבוצה, ולכן לא נרשמת נוכחות.</div>'}
                <label class="qp-full">הערות<textarea data-f="notes" rows="2" maxlength="1000" placeholder="מה עבד, מה לשפר, מי בלט…">${esc(d.notes)}</textarea></label>
                <div class="qp-row"><button type="button" data-save class="qp-btn qp-pri">💾 ${existing ? 'עדכן' : 'שמור אימון'}</button><button type="button" data-cancel class="qp-btn">ביטול</button><span data-msg class="qp-mu"></span></div>
            </div>`;
        }
        function pull() {   // read the text inputs back into `d` before any redraw
            container.querySelectorAll('[data-f]').forEach(el => { d[el.dataset.f] = el.type === 'number' ? el.value : el.value; });
            d.rating = Math.round(Number(d.rating)) || 0;
            if (container.querySelector('[data-att]')) d.attendees = [...container.querySelectorAll('[data-att]:checked')].map(el => el.dataset.att);
        }
        container.onclick = e => {
            const t = e.target.closest('button'); if (!t || !container.contains(t)) return;
            if (t.hasAttribute('data-addlib')) {
                const sel = container.querySelector('[data-lib]'); pull();
                const dr = QT && QT.DRILLS_DATABASE[Number(sel.value)];
                if (dr && !d.drills.some(x => x.name === dr.name) && d.drills.length < 40) d.drills.push({ name: dr.name, src: 'library' });
                draw();
            } else if (t.hasAttribute('data-addcustom')) {
                pull(); const inp = container.querySelector('[data-custom]'); const v = inp.value.trim().slice(0, 80);
                if (v && !d.drills.some(x => x.name === v) && d.drills.length < 40) d.drills.push({ name: v, src: 'custom' });
                draw();
            } else if (t.dataset.rm !== undefined) { pull(); d.drills.splice(Number(t.dataset.rm), 1); draw(); }
            else if (t.hasAttribute('data-all')) { pull(); d.attendees = ros.map(r => r.id); draw(); }
            else if (t.hasAttribute('data-none')) { pull(); d.attendees = []; draw(); }
            else if (t.hasAttribute('data-cancel')) { if (opts.onCancel) opts.onCancel(); else container.innerHTML = ''; }
            else if (t.hasAttribute('data-save')) {
                pull();
                const saved = save(d);
                if (!saved) { container.querySelector('[data-msg]').textContent = 'השמירה נכשלה (אחסון מלא או תאריך לא תקין).'; return; }
                if (opts.onSaved) opts.onSaved(saved); else container.innerHTML = '';
            }
        };
        draw();
    }

    const css = `.qp-form{background:#0f172a;border:1px solid #475569;border-radius:14px;padding:12px;font-size:12px;color:#e2e8f0;display:flex;flex-direction:column;gap:8px}
.qp-h{font-weight:800;color:#fbbf24;font-size:13px}.qp-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px}
.qp-form label{display:flex;flex-direction:column;gap:3px;color:#94a3b8}.qp-form input,.qp-form select,.qp-form textarea{background:#020617;border:1px solid #475569;border-radius:8px;padding:6px 8px;color:#fff;font-size:12px;font-family:inherit}
.qp-sec{font-weight:700;color:#cbd5e1;margin-top:4px}.qp-row{display:flex;gap:6px;flex-wrap:wrap;align-items:center}.qp-row select,.qp-row input{flex:1;min-width:120px}
.qp-btn{background:#1e293b;border:1px solid #475569;border-radius:8px;padding:6px 12px;color:#e2e8f0;cursor:pointer;font-size:12px;font-weight:700}.qp-pri{background:#047857;border-color:#34d399;color:#fff}
.qp-dr{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:3px}.qp-dr li{background:#1e293b80;border:1px solid #334155;border-radius:8px;padding:4px 8px;display:flex;justify-content:space-between;align-items:center;gap:6px}
.qp-x{background:none;border:none;color:#f87171;cursor:pointer}.qp-mu{color:#64748b;font-size:11px}.qp-att{display:flex;flex-wrap:wrap;gap:4px}
.qp-chip{flex-direction:row!important;align-items:center;background:#1e293b;border:1px solid #334155;border-radius:999px;padding:2px 8px;color:#e2e8f0!important}.qp-link{background:none;border:none;color:#38bdf8;cursor:pointer;font-size:11px;text-decoration:underline}
.qp-full{display:flex;flex-direction:column}.qp-sum{background:#0f172a99;border:1px solid #334155;border-radius:10px;padding:8px;font-size:12px;color:#e2e8f0;display:flex;flex-direction:column;gap:4px}
.qp-sum-h{display:flex;flex-wrap:wrap;gap:6px;align-items:center}.qp-tag{background:#334155;border-radius:999px;padding:1px 8px;font-size:10px;color:#cbd5e1}.qp-notes{color:#94a3b8;font-size:11px;white-space:pre-wrap}`;
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    window.QBPractice = { FOCUS, list: readAll, forDate, save, remove, roster, summaryHtml, renderForm, esc };
})();
