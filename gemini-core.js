/* QB Master Class - the ONE shared Gemini access layer (AI page, coach chat, press room). Key from localStorage (qbmc_gemini_key),
   model discovery with a fallback chain, one retry on transient errors, and a timeout.
   call(opts): { system, contents | parts | prompt, generationConfig, json, temperature, timeoutMs, softBlocked, blockedText, noKeyMessage }
   Errors carry .noKey / .fatal / .transient / .detail / .blocked. */
(function () {
    'use strict';
    const CANDIDATES = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash', 'gemini-flash-latest', 'gemini-flash-lite-latest'];
    const RETRYABLE = [429, 500, 502, 503, 504];
    let cached = null;
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    function getKey() { try { return localStorage.getItem('qbmc_gemini_key') || ''; } catch (e) { return ''; } }
    function cleanError(t) { try { const p = JSON.parse(t); if (p.error && p.error.message) return p.error.message; } catch (e) {} return String(t).slice(0, 200); }
    async function discover(key) {
        if (cached && cached.length) return cached;
        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
            if (!res.ok) return [];
            const data = await res.json();
            const usable = (data.models || []).filter(m => (m.supportedGenerationMethods || []).includes('generateContent') && /flash/i.test(m.name) && !/embedding|vision|tts|image|audio|preview|exp/i.test(m.name)).map(m => m.name.replace('models/', ''));
            usable.sort((a, b) => a.length - b.length);
            if (usable.length) cached = usable.slice(0, 4);
            return cached || [];
        } catch (e) { return []; }
    }
    // Resolves to the reply text. With softBlocked, an empty/blocked reply resolves to blockedText instead of throwing.
    async function call(opts) {
        opts = opts || {};
        const key = getKey();
        if (!key) { const e = new Error(opts.noKeyMessage || 'לא הוגדר מפתח Gemini API.'); e.noKey = true; throw e; }
        const contents = opts.contents || [{ role: 'user', parts: opts.parts || [{ text: String(opts.prompt || '') }] }];
        const models = [...new Set([...(await discover(key)), ...CANDIDATES])];
        let last = null, quota = false;
        for (const model of models) {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
            for (let attempt = 1; attempt <= 2; attempt++) {
                const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), opts.timeoutMs || 90000);
                try {
                    const gc = Object.assign({}, opts.generationConfig || {}, opts.temperature != null ? { temperature: opts.temperature } : {}, opts.json ? { responseMimeType: 'application/json' } : {});
                    const body = { contents };
                    if (Object.keys(gc).length) body.generationConfig = gc;     // nothing is sent unless a caller asked for it (model defaults otherwise)
                    if (opts.system) body.systemInstruction = { parts: [{ text: opts.system }] };
                    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: ctrl.signal, body: JSON.stringify(body) });
                    clearTimeout(timer);
                    if (res.ok) {
                        const data = await res.json(), cand = data.candidates && data.candidates[0];
                        if (cand && cand.content && cand.content.parts) return cand.content.parts.map(p => p.text || '').join('\n').trim();
                        const msg2 = opts.blockedText || 'המודל לא החזיר תשובה (ייתכן שהתוכן נחסם). נסה שוב או נסח אחרת.';
                        if (opts.softBlocked) return msg2;
                        const e = new Error(msg2); e.blocked = true; throw e;
                    }
                    const msg = cleanError(await res.text()); last = new Error(msg);
                    if (res.status === 404) { cached = null; break; }
                    if (RETRYABLE.includes(res.status)) { if (res.status === 429) quota = true; if (attempt < 2) await sleep(1200 + Math.random() * 600); continue; }
                    if (res.status === 401 || /api key/i.test(msg)) { const f = new Error('מפתח ה-API נדחה: ' + msg); f.fatal = true; throw f; }
                    break;
                } catch (err) { clearTimeout(timer); if (err.fatal || err.blocked) throw err; last = err; if (attempt < 2) await sleep(1200 + Math.random() * 600); }
            }
        }
        const fin = new Error(quota ? 'הגעת למגבלת הבקשות של המפתח או ש-Gemini עמוס כרגע.' : 'Gemini לא זמין כרגע (עומס זמני בצד גוגל).');
        fin.transient = true; fin.detail = last ? last.message : ''; throw fin;
    }
    // Pulls the first JSON object out of a reply (tolerates code fences and surrounding text). Throws if there is none.
    function parseJson(text) {
        const a = String(text).indexOf('{'), b = String(text).lastIndexOf('}');
        if (a < 0 || b <= a) throw new Error('no-json');
        return JSON.parse(String(text).slice(a, b + 1));
    }
    window.QBGemini = { call, parseJson, getKey, hasKey: () => !!getKey() };
})();
