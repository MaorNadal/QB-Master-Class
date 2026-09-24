/* QB Master Class - shared navigation (single source of truth for every page).
   Add a page or section here once and the nav bar, the section chips and the hub cards all update. */
(function () {
    const PAGES = [
        { file: 'learn.html', group: 'learn', icon: '📘', title: 'לימוד', desc: 'מכניקת זריקה, שרשרת קינטית, פרוטוקול Pre-Snap ומילון מונחים.',
          sections: [['mechanics', 'זריקה ומכניקה'], ['throwing-sequence', 'שרשרת קינטית'], ['presnap', 'Pre-Snap'], ['glossary', 'מילון מונחים']] },
        { file: 'game.html', group: 'game', icon: '🧠', title: 'קריאת משחק', desc: 'לוח 11 הגנות, עץ מסלולים 1-9, Playbook התקפי, סימולטור טקטי ובונה מהלכים.',
          sections: [['coverage-board', 'לוח הגנות מלא'], ['route-tree', 'עץ מסלולים 1-9'], ['playbook', 'Playbook התקפי'], ['simulator', 'סימולטור'], ['play-builder', 'בונה מהלכים']] },
        { file: 'training.html', group: 'train', icon: '🏋️', title: 'אימון', desc: 'ספריית דרילים לקוורטרבק ותוכנית האימונים השבועית עם מעקב ביצוע.',
          sections: [['drills', 'דרילים'], ['workout-plan', 'תוכנית אימונים']] },
        { file: 'metrics.html', group: 'track', icon: '📈', title: 'מעקב מדדים', desc: 'מדדים פיזיים ודירוגי Madden לאורך זמן, גרפים ודו"ח למאמן.' },
        { file: 'madden.html', group: 'track', icon: '🏈', title: 'דירוג QB (Madden)', desc: 'מחשבון דירוג שחקן בסגנון Madden, עם טעינה מהמדדים שלך.' },
        { file: 'calendar.html', group: 'track', icon: '📅', title: 'לוח שנה', desc: 'יומן אימונים חודשי, רצפים וחגי ישראל.' },
        { file: 'ai-tools.html', group: 'ai', icon: '🤖', title: 'עזרי AI ותזונה', desc: 'ניתוח וידאו, מחשבון ויומן תזונה וניתוח כולל.' },
        { file: 'film-study.html', group: 'ai', icon: '🎬', title: 'צפייה וניתוח NFL', desc: 'יומן צפייה בפוטבול ותיעוד מהלכים.' },
        { file: 'backup.html', group: 'backup', icon: '🗄️', title: 'מרכז גיבוי', desc: 'איחוד וגיבוי של כל נתוני האפליקציה בקובץ אחד.' }
    ];
    const GROUPS = [
        { id: 'learn', label: '📘 לימוד', cls: 'bg-sky-700 hover:bg-sky-600', card: 'border-sky-500/40 hover:border-sky-400', text: 'text-sky-400' },
        { id: 'game', label: '🧠 קריאת משחק', cls: 'bg-emerald-700 hover:bg-emerald-600', card: 'border-emerald-500/40 hover:border-emerald-400', text: 'text-emerald-400' },
        { id: 'train', label: '🏋️ אימון', cls: 'bg-rose-700 hover:bg-rose-600', card: 'border-rose-500/40 hover:border-rose-400', text: 'text-rose-400' },
        { id: 'track', label: '📊 מעקב', cls: 'bg-cyan-700 hover:bg-cyan-600', card: 'border-cyan-500/40 hover:border-cyan-400', text: 'text-cyan-400' },
        { id: 'ai', label: '🤖 AI וצפייה', cls: 'bg-violet-700 hover:bg-violet-600', card: 'border-violet-500/40 hover:border-violet-400', text: 'text-violet-400' },
        { id: 'backup', label: '🗄️ גיבוי', cls: 'bg-slate-700 hover:bg-slate-600', card: 'border-slate-500/40 hover:border-slate-400', text: 'text-slate-300' }
    ];
    window.QB_SITE = { PAGES, GROUPS };

    const cur = (location.pathname.split('/').pop() || 'index.html');
    const page = PAGES.find(p => p.file === cur);
    const curGroup = page ? page.group : null;

    const items = [`<a href="index.html" class="px-3 py-1.5 rounded-lg ${cur === 'index.html' ? 'bg-sky-600 text-white' : 'bg-slate-800 hover:bg-sky-600 text-slate-200'} transition">🏠 מרכז</a>`];
    GROUPS.forEach(g => {
        const pages = PAGES.filter(p => p.group === g.id);
        const active = curGroup === g.id ? ' ring-2 ring-white/70' : '';
        if (pages.length === 1) {
            items.push(`<a href="${pages[0].file}" class="px-3 py-1.5 rounded-lg ${g.cls} text-white transition${active}">${g.label}</a>`);
        } else {
            items.push(`<div class="relative" data-qbdd>
                <button type="button" class="px-3 py-1.5 rounded-lg ${g.cls} text-white transition${active}">${g.label} ▾</button>
                <div class="hidden absolute right-0 mt-1 min-w-[12rem] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50">
                    ${pages.map(p => `<a href="${p.file}" class="block px-3 py-2 rounded-lg hover:bg-slate-800 ${p.file === cur ? 'text-white font-bold bg-slate-800' : 'text-slate-300'}">${p.icon} ${p.title}</a>`).join('')}
                </div></div>`);
        }
    });
    items.push(`<button type="button" onclick="window.print()" class="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-300 transition" title="הדפס את הדף הנוכחי">🖨️</button>`);

    let html = `<nav class="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-3 shadow-xl">
        <div class="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
            <a href="index.html" class="flex items-center space-x-3 space-x-reverse">
                <span class="text-3xl">🏈</span>
                <span><span class="font-black text-xl tracking-wider text-sky-400 block leading-none">QB MASTER CLASS</span>
                <span class="text-[10px] text-slate-400 font-medium">${page ? page.icon + ' ' + page.title : 'מרכז הבקרה'}</span></span>
            </a>
            <div class="flex flex-wrap items-center gap-2 text-xs md:text-sm font-semibold">${items.join('')}</div>
        </div></nav>`;
    if (page && page.sections) {
        html += `<div class="no-print max-w-7xl mx-auto px-4 pt-4 flex flex-wrap gap-2 text-xs font-semibold">
            ${page.sections.map(s => `<a href="#${s[0]}" class="px-3 py-1.5 rounded-full bg-slate-800 hover:bg-sky-600 text-slate-200 border border-slate-700 transition">${s[1]}</a>`).join('')}</div>`;
    }

    const st = document.createElement('style');
    st.textContent = 'section[id]{scroll-margin-top:5rem}';
    document.head.appendChild(st);
    document.currentScript.insertAdjacentHTML('beforebegin', html);

    document.addEventListener('click', e => {
        const btn = e.target.closest('[data-qbdd] > button');
        document.querySelectorAll('[data-qbdd] > div').forEach(m => {
            if (btn && m.previousElementSibling === btn) m.classList.toggle('hidden'); else m.classList.add('hidden');
        });
    });
})();
