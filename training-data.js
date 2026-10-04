/* QB Master Class - shared training data + dated-log helpers.
   Single source of truth for the drill library, the weekly workout plan and the two dated logs
   (qbmc_drill_log, qbmc_workout_log). Used by training.html (mark done today) and calendar.html
   (add / remove an item on any past date), so both pages always run the exact same code. */
(function () {
        const DRILL_CATEGORY_META = {
            footwork: { label: 'עבודת רגליים ו-Drops', icon: '👟', color: '#38bdf8' },
            accuracy: { label: 'דיוק ומיקום כדור', icon: '🎯', color: '#f59e0b' },
            mechanics: { label: 'מכניקה וטיפוח זרוע', icon: '⚙️', color: '#a855f7' },
            reads: { label: 'קריאות וקבלת החלטות', icon: '🧠', color: '#10b981' },
            pocket: { label: 'תנועה בכיס ומילוט', icon: '🏃', color: '#ef4444' }
        };

        const DRILLS_DATABASE = [
            { name: '3-Step Drop Rhythm', category: 'footwork', duration: '10 חזרות', equipment: 'ללא ציוד', desc: 'נסיגה מהירה בת 3 צעדים מתוך Center/Gun, עם שחרור בצעד האחרון — מתאמן טיימינג ל-Quick Game.', cue: 'הרגל האחורית פוגשת קרקע בדיוק כשהכדור משתחרר.' },
            { name: '5-Step Drop Rhythm', category: 'footwork', duration: '10 חזרות', equipment: 'ללא ציוד', desc: 'נסיגה סטנדרטית בת 5 צעדים לתרגילי דרופבק בעומק בינוני.', cue: 'קצב אחיד — לא להאיץ בסוף הנסיגה.' },
            { name: '7-Step Drop & Climb', category: 'footwork', duration: '8 חזרות', equipment: 'ללא ציוד', desc: 'נסיגה עמוקה ל-7 צעדים עבור מסלולים עמוקים, כולל "טיפוס" קדימה בכיס לפני השחרור.', cue: 'הצעד האחרון קצר ומבוקר — לא קפיצה.' },
            { name: 'Gun Quick-Game Footwork (1-Step)', category: 'footwork', duration: '12 חזרות', equipment: 'ללא ציוד', desc: 'משחרור מיידי מ-Shotgun — צעד אחד בלבד לפני המסירה, לתרגילי Slant/Flat/Screen.', cue: 'הכתפיים כבר פתוחות לפני קבלת הכדור.' },
            { name: 'Bucket Step / Play-Action Footwork', category: 'footwork', duration: '10 חזרות', equipment: 'כדור בלבד', desc: 'תרגול צעד "הדלי" האחורי בהטעיית ריצה, ואז מעבר חלק לעמדת זריקה.', cue: 'עיניים על ה-Safety לאורך כל ההטעיה, לא על הרצפה.' },
            { name: 'Bag/Cone Target Throws', category: 'accuracy', duration: '20 זריקות', equipment: '4-6 קונוסים/שקיות', desc: 'זריקה למטרות סטטיות במרחקים שונים (Flat, Curl, Out, Deep) — בונה דיוק בסיסי לכל עומק.', cue: 'כל זריקה — קודם רגליים למטרה, אחר כך הכדור.' },
            { name: 'Moving Target Ladder Throws', category: 'accuracy', duration: '15 זריקות', equipment: 'שותף רץ', desc: 'זריקה לרסיבר שרץ מסלול אמיתי במהירות הולכת וגוברת — מתרגל תזמון והובלת המטרה.', cue: 'הובל את הרסיבר — זרוק לאן שהוא יגיע, לא לאן שהוא נמצא.' },
            { name: 'Back-Shoulder Placement Drill', category: 'accuracy', duration: '10 זריקות', equipment: 'שותף רץ', desc: 'זריקה מכוונת לכתף האחורית של הרסיבר כשה-CB רץ איתו צמוד — טכניקת מיסמאץ׳ קלאסית.', cue: 'הכדור נמוך וצמוד לגוף, לא גבוה מדי.' },
            { name: 'Red Zone Window Throws', category: 'accuracy', duration: '12 זריקות', equipment: '4 קונוסים (סימון 20 יארד)', desc: 'זריקות דיוק בשטח מצומצם (בתוך קו ה-20), בדגש על חלונות צרים ותזמון מהיר.', cue: 'אין זמן להיסוס — או שהחלון פתוח או שעוברים ליעד הבא.' },
            { name: 'Wrist Snap / Spiral Drill', category: 'mechanics', duration: '15 זריקות', equipment: 'ללא ציוד (טווח קצר)', desc: 'זריקות קצרות מטווח 5-7 יארד, בדגש מוחלט על סנאפ מפרק כף היד ליצירת ספירלה נקייה.', cue: 'האצבע המורה היא האחרונה שנוגעת בכדור.' },
            { name: 'Warm-Up Progression Throws', category: 'mechanics', duration: '5-7 דקות', equipment: 'ללא ציוד', desc: 'רצף חימום מובנה: זריקות קצרות ← בינוניות ← עמוקות, בעלייה הדרגתית בעצימות.', cue: 'לעולם לא לזרוק עמוק "קר" — זה המתכון לפציעת כתף.' },
            { name: 'One-Knee Throwing Drill', category: 'mechanics', duration: '10 זריקות', equipment: 'ללא ציוד', desc: 'זריקה מיציבה על ברך אחת — מבודדת את מכניקת פלג הגוף העליון בלי מעורבות רגליים.', cue: 'הכל קורה מהאגן והחזה, לא רק מהיד.' },
            { name: 'Follow-Through Freeze Drill', category: 'mechanics', duration: '10 זריקות', equipment: 'ללא ציוד', desc: 'אחרי כל זריקה — הקפאה של 2 שניות בעמדת הסיום, לחיזוק ההרגל המוטורי.', cue: 'היד הזורקת מסיימת ליד המותן הנגדית.' },
            { name: 'Progression Read Drill', category: 'reads', duration: '10 חזרות', equipment: 'שותף/מאמן מאותת', desc: 'שותף מאותת (בכרטיס/יד) איזה רסיבר "פתוח" תוך כדי ה-Drop — ה-QB חייב לעבור בסדר הקריאה הנכון.', cue: 'עיניים על ההגנה, לא על הרסיבר שאתה מתכנן לזרוק אליו.' },
            { name: 'Hot Read Recognition Drill', category: 'reads', duration: '10 חזרות', equipment: 'שותף מדמה בליץ', desc: 'שותף פורץ אקראית מכיוון לא ידוע — ה-QB חייב לזהות ולשחרר Hot Read תוך פחות משנייה וחצי.', cue: 'זהה את הרודף, לא את הרסיבר — הרודף מכתיב לאן זורקים.' },
            { name: 'Pre-Snap ID Drill', category: 'reads', duration: '15 תמונות/סבבים', equipment: 'תמונות/וידאו הגנות', desc: 'זיהוי מהיר (2-3 שניות) של מספר Safeties עמוקים וסוג הכיסוי הסביר, מתוך תמונת מגרש.', cue: 'קודם ספור Safeties, אחר כך תחליט הכל.' },
            { name: 'Two-Minute Drill Simulation', category: 'reads', duration: 'סבב אחד (2 דק׳)', equipment: 'שעון עצר', desc: 'סימולציית ניהול זמן וקריאות מהירות תחת לחץ שעון, כולל בחירה בין קליק אאוט ל-Spike.', cue: 'לדעת בכל רגע כמה זמן ובאיזה דאון-דיסטנס אתה נמצא.' },
            { name: 'Climb the Pocket Drill', category: 'pocket', duration: '8 חזרות', equipment: 'שני קונוסים (מדמים Rush)', desc: 'תרגול "טיפוס" קדימה בכיס כתגובה ללחץ מהצדדים, בלי לאבד עמדת זריקה.', cue: 'קדימה, לא אחורה — אחורה זה איפה שה-Sack קורה.' },
            { name: 'Contain/Escape Drill', category: 'pocket', duration: '8 חזרות', equipment: 'שותף מדמה Edge Rusher', desc: 'בריחה מבוקרת מהכיס כשהלחץ מגיע מהצד, עם איפוס רגליים לפני זריקה מחוץ לכיס.', cue: 'עצור, אפס רגליים, ואז זרוק — לא לזרוק תוך כדי ריצה אם לא חייבים.' },
            { name: 'Under Pressure Quick-Release Drill', category: 'pocket', duration: '10 חזרות', equipment: 'שותף מדמה לחץ מיידי', desc: 'שחרור כדור תוך פחות משנייה מרגע קבלת הלחץ הישיר — מתרגל קבלת החלטה תחת עומס.', cue: 'לפעמים הזריקה הכי טובה היא הכי מהירה, לא הכי "יפה".' }
        ];

    const WORKOUT_DAY_TITLES = {"1": "Upper Body — נפח ועוצמה (גב, חזה, כתפיים, זרועות ואמות)", "2": "Lower Body & Core — כוח ופיצוץ (רגליים וליבה)", "3": "מנוחה / אימון זריקות QB במגרש (Field Mechanics Session)", "4": "Upper Body — היפרטרופיה ודגש זרועות/אמות", "5": "Lower Body — כוח מתפרץ וזריזות", "6": "מנוחה פעילה / טיפוח זרוע ואימון זריקות קליל (Recovery & Arm Care)"};
    // Card styling (nameClass / detailClass / extraClass) is kept per exercise so the plan renders exactly as before.
    const WORKOUT_EXERCISES = [
    {
        "id": "d1e1",
        "day": "d1",
        "extraClass": "",
        "nameClass": "text-white",
        "name": "Bench Press / Incline DB Press",
        "detailClass": "text-sky-300",
        "detail": "4 סטים × 6–8 חזרות",
        "desc": "בניית חזה וכתפיים קדמיות לדחיפה ולעוצמה."
    },
    {
        "id": "d1e2",
        "day": "d1",
        "extraClass": "",
        "nameClass": "text-white",
        "name": "Barbell / Dumbbell Rows",
        "detailClass": "text-sky-300",
        "detail": "4 סטים × 8–10 חזרות",
        "desc": "עיבוי הרחב-גבי והגב העליון — קריטי ליציבות הזריקה והבלימה."
    },
    {
        "id": "d1e3",
        "day": "d1",
        "extraClass": "",
        "nameClass": "text-white",
        "name": "Overhead Dumbbell Press",
        "detailClass": "text-sky-300",
        "detail": "3 סטים × 8–10 חזרות",
        "desc": "חיזוק כתפיים וייצוב המפרק במנח אנכי."
    },
    {
        "id": "d1e4",
        "day": "d1",
        "extraClass": "",
        "nameClass": "text-amber-300",
        "name": "Superset זרועות (קדמית + אחורית)",
        "detailClass": "text-amber-400",
        "detail": "3 סטים × 10–12 חזרות",
        "desc": "Barbell Bicep Curls בשילוב Triceps Rope Pushdowns / Skullcrushers."
    },
    {
        "id": "d1e5",
        "day": "d1",
        "extraClass": "",
        "nameClass": "text-rose-300",
        "name": "עבודת אמות: Wrist Curls",
        "detailClass": "text-rose-400",
        "detail": "3 סטים × 15 חזרות",
        "desc": "כפיפות מפרק כף יד עם מוט/משקולות לחיזוק הספירלה והאחיזה."
    },
    {
        "id": "d1e6",
        "day": "d1",
        "extraClass": "",
        "nameClass": "text-rose-300",
        "name": "עבודת אמות: Farmer's Walk",
        "detailClass": "text-rose-400",
        "detail": "3 סטים של 45 שניות",
        "desc": "הליכה עם משקולות כבדות בידיים לחיזוק אחיזת ה-Grip והטרפזים."
    },
    {
        "id": "d2e1",
        "day": "d2",
        "extraClass": "",
        "nameClass": "text-white",
        "name": "Barbell Squat / Trap Bar Deadlift",
        "detailClass": "text-emerald-300",
        "detail": "4 סטים × 6–8 חזרות",
        "desc": "בניית בסיס הכוח ברגליים ובאגן לייצור אנרגיה בשרשרת הקינטית."
    },
    {
        "id": "d2e2",
        "day": "d2",
        "extraClass": "",
        "nameClass": "text-white",
        "name": "Romanian Deadlift (RDL)",
        "detailClass": "text-emerald-300",
        "detail": "3 סטים × 8–10 חזרות",
        "desc": "חיזוק המורכבים האחוריים (Hamstrings & Glutes) לנחיתה ויציבות."
    },
    {
        "id": "d2e3",
        "day": "d2",
        "extraClass": "",
        "nameClass": "text-white",
        "name": "Walking Lunges (מכרעים)",
        "detailClass": "text-emerald-300",
        "detail": "3 סטים × 10 צעדים לכל רגל",
        "desc": "יציבות מפרק ירך, עבודת רגליים ואיזון חד-רגלי."
    },
    {
        "id": "d2e4",
        "day": "d2",
        "extraClass": "",
        "nameClass": "text-white",
        "name": "Standing Calf Raises",
        "detailClass": "text-emerald-300",
        "detail": "3 סטים × 12–15 חזרות",
        "desc": "חיזוק התאומים והאכילס לדחיפה מהירה מהקרקע."
    },
    {
        "id": "d2e5",
        "day": "d2",
        "extraClass": "col-span-1 md:col-span-2",
        "nameClass": "text-amber-300",
        "name": "Rotational Core Work (Russian Twists / Cable Woodchops)",
        "detailClass": "text-amber-400",
        "detail": "3 סטים × 12 חזרות לכל צד",
        "desc": "חיזוק שרירי הבטן האלכסוניים (Obliques) לרוטציית טורסו עוצמתית בזריקה."
    },
    {
        "id": "d3e1",
        "day": "d3",
        "extraClass": "",
        "nameClass": "text-white",
        "name": "חימום קצר (Warm-up / Stationary)",
        "detailClass": "text-amber-300",
        "detail": "30 זריקות",
        "desc": "זריקות קצרות מעמידה נייחת להפעלת שרשרת הזריקה בהדרגה."
    },
    {
        "id": "d3e2",
        "day": "d3",
        "extraClass": "",
        "nameClass": "text-white",
        "name": "Dropback של 3/5 צעדים",
        "detailClass": "text-amber-300",
        "detail": "30 זריקות",
        "desc": "תרגול תזמון ה-Drop מול עומק המסירה."
    },
    {
        "id": "d3e3",
        "day": "d3",
        "extraClass": "",
        "nameClass": "text-white",
        "name": "זריקות בתנועה (Off-platform / Rollout)",
        "detailClass": "text-amber-300",
        "detail": "20 זריקות",
        "desc": "שמירת דיוק ומכניקה תוך תנועה מחוץ לכיס."
    },
    {
        "id": "d3e4",
        "day": "d3",
        "extraClass": "",
        "nameClass": "text-white",
        "name": "מסירות עמוקות לעץ המסלולים (Out, Dig, Deep Post)",
        "detailClass": "text-amber-300",
        "detail": "20 זריקות",
        "desc": "עבודת עוצמה ודיוק על המסלולים העמוקים."
    },
    {
        "id": "d4e1",
        "day": "d4",
        "extraClass": "",
        "nameClass": "text-white",
        "name": "Incline Dumbbell Press",
        "detailClass": "text-purple-300",
        "detail": "3 סטים × 8–10 חזרות",
        "desc": "מיקוד בחזה עליון ובכתף קדמית."
    },
    {
        "id": "d4e2",
        "day": "d4",
        "extraClass": "",
        "nameClass": "text-white",
        "name": "Lat Pulldowns / Pull-ups",
        "detailClass": "text-purple-300",
        "detail": "4 סטים × 8–12 חזרות",
        "desc": "פולי עליון / מתח לאיזון החלק האחורי של הכתף."
    },
    {
        "id": "d4e3",
        "day": "d4",
        "extraClass": "",
        "nameClass": "text-white",
        "name": "Lateral Raises (הרחקת זרועות)",
        "detailClass": "text-purple-300",
        "detail": "4 סטים × 12–15 חזרות",
        "desc": "הרחקת זרועות לצדדים ליצירת המראה הרחב והחזק בכתפיים."
    },
    {
        "id": "d4e4",
        "day": "d4",
        "extraClass": "",
        "nameClass": "text-amber-300",
        "name": "Hammer Curls (פטישים)",
        "detailClass": "text-amber-400",
        "detail": "3 סטים × 10–12 חזרות",
        "desc": "תרגיל אש לבניית הזרוע והאמה בו זמנית (Brachioradialis)."
    },
    {
        "id": "d4e5",
        "day": "d4",
        "extraClass": "",
        "nameClass": "text-amber-300",
        "name": "Triceps Overhead Extension",
        "detailClass": "text-amber-400",
        "detail": "3 סטים × 10–12 חזרות",
        "desc": "פשיטת מרפקים מעל הראש להגדלת הראש הארוך של היד האחורית."
    },
    {
        "id": "d4e6",
        "day": "d4",
        "extraClass": "",
        "nameClass": "text-rose-300",
        "name": "Plate Pinches / Reverse Wrist Curls",
        "detailClass": "text-rose-400",
        "detail": "3 סטים לכישלון",
        "desc": "תפיסת פלטות באצבעות וכפיפות אמה הפוכות לכישלון מוחלט לחיזוק האחיזה."
    },
    {
        "id": "d5e1",
        "day": "d5",
        "extraClass": "",
        "nameClass": "text-white",
        "name": "Front Squat / Goblet Squat",
        "detailClass": "text-rose-300",
        "detail": "3 סטים × 8 חזרות",
        "desc": "סקוואט קדמי הדורש החזקת גו זקוף ומפעיל את הארבע-ראשי והליבה במקביל."
    },
    {
        "id": "d5e2",
        "day": "d5",
        "extraClass": "",
        "nameClass": "text-white",
        "name": "Single-Leg Romanian Deadlift",
        "detailClass": "text-rose-300",
        "detail": "3 סטים × 8 חזרות לכל רגל",
        "desc": "דדליפט רומני על רגל אחת לשיפור שיווי משקל, יציבות קרסול ומניעת פציעות."
    },
    {
        "id": "d5e3",
        "day": "d5",
        "extraClass": "",
        "nameClass": "text-amber-300",
        "name": "Box Jumps / Plyometrics",
        "detailClass": "text-amber-400",
        "detail": "4 סטים × 5 קפיצות",
        "desc": "כוח מתפרץ (Explosive Power) ברגליים — מתורגם ישירות לעוצמת דחיפה מהקרקע בזריקה."
    },
    {
        "id": "d5e4",
        "day": "d5",
        "extraClass": "",
        "nameClass": "text-white",
        "name": "Plank Variations & Anti-Rotation (Pallof Press)",
        "detailClass": "text-rose-300",
        "detail": "3 סטים של דקה",
        "desc": "יציבות ליבה נגד רוטציה — שומרת על יישור האגן והכתפיים בזמן הזריקה."
    },
    {
        "id": "d6e1",
        "day": "d6",
        "extraClass": "",
        "nameClass": "text-white",
        "name": "Band Shoulder Care (Internal/External Rotation)",
        "detailClass": "text-teal-300",
        "detail": "3 סטים × 15 חזרות לכל כיוון",
        "desc": "חיזוק ה-Rotator Cuff למניעת פציעות זריקה כרוניות."
    },
    {
        "id": "d6e2",
        "day": "d6",
        "extraClass": "",
        "nameClass": "text-white",
        "name": "Foam Rolling & Mobility (גב עליון, לאט, ירכיים)",
        "detailClass": "text-teal-300",
        "detail": "10 דקות",
        "desc": "שחרור רקמות ושיפור טווחי תנועה לקראת שבוע האימונים הבא."
    },
    {
        "id": "d6e3",
        "day": "d6",
        "extraClass": "",
        "nameClass": "text-white",
        "name": "Light Throwing Tune-Up (עצימות נמוכה)",
        "detailClass": "text-teal-300",
        "detail": "40 זריקות קלות",
        "desc": "דגש על מכניקת רגליים ותזמון בלבד — ללא מאמץ מקסימלי על הזרוע."
    },
    {
        "id": "d6e4",
        "day": "d6",
        "extraClass": "",
        "nameClass": "text-white",
        "name": "מתיחות סטטיות + נשימה להתאוששות",
        "detailClass": "text-teal-300",
        "detail": "10 דקות",
        "desc": "הורדת דופק והפעלת מערכת העצבים הפאראסימפתטית לקראת המנוחה."
    }
];
    const EX_BY_ID = Object.fromEntries(WORKOUT_EXERCISES.map(e => [e.id, e]));

    const LS_DRILL = 'qbmc_drill_log', LS_WORKOUT = 'qbmc_workout_log';

    // Local calendar date (not UTC): toISOString() would stamp the previous day for anything
    // logged between local midnight and the UTC offset (00:00-03:00 in Israel), while
    // calendar.html keys its days by local date.
    function localDateStr(d) {
        d = d || new Date();
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }
    function readObj(key) {
        try {
            const v = JSON.parse(localStorage.getItem(key));
            return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
        } catch (e) { return {}; }
    }
    function writeObj(key, obj) { try { localStorage.setItem(key, JSON.stringify(obj)); } catch (e) {} }
    const loadDrillLog = () => readObj(LS_DRILL);
    const saveDrillLog = log => writeObj(LS_DRILL, log);
    const loadWorkoutLog = () => readObj(LS_WORKOUT);
    const saveWorkoutLog = log => writeObj(LS_WORKOUT, log);

    function datesOf(v) { return Array.isArray(v) ? v : []; }
    function lastOf(arr) { return arr.length ? arr.slice().sort().slice(-1)[0] : null; }

    // ---- drills: { drillName: ["YYYY-MM-DD", ...] } ----
    function isDrillDone(name, ds) { return datesOf(loadDrillLog()[name]).includes(ds); }
    function setDrillDone(name, ds, done) {
        const log = loadDrillLog();
        const arr = datesOf(log[name]).slice();
        const i = arr.indexOf(ds);
        if (done && i < 0) arr.push(ds); else if (!done && i >= 0) arr.splice(i, 1);
        arr.sort();
        log[name] = arr;
        saveDrillLog(log);
    }
    function drillStats(name) { const arr = datesOf(loadDrillLog()[name]); return { count: arr.length, last: lastOf(arr) }; }

    // ---- weekly-plan exercises: { exerciseId: { name, day, dates: [...] } } ----
    function isExerciseDone(id, ds) { const e = loadWorkoutLog()[id]; return !!e && datesOf(e.dates).includes(ds); }
    function setExerciseDone(id, ds, done) {
        const ex = EX_BY_ID[id];
        if (!ex) return;
        const log = loadWorkoutLog();
        const entry = log[id] && typeof log[id] === 'object' ? log[id] : {};
        const dates = datesOf(entry.dates).slice();
        const i = dates.indexOf(ds);
        if (done && i < 0) dates.push(ds); else if (!done && i >= 0) dates.splice(i, 1);
        dates.sort();
        log[id] = { name: ex.name, day: ex.day, dates }; // name/day re-synced from the plan on every write
        saveWorkoutLog(log);
    }
    function exerciseStats(id) { const e = loadWorkoutLog()[id]; const arr = e ? datesOf(e.dates) : []; return { count: arr.length, last: lastOf(arr) }; }

    // ---- AI video analysis of drills (written by ai-tools.html, shown on the drill cards) ----
    // { drillName: [ { date, score, confidence, summary, corrections:[{issue,cue}], clips }, ... ] }, newest last, max 15 per drill.
    const LS_DRILL_ANALYSIS = 'qbmc_drill_analysis', LS_DRILL_LINKS = 'qbmc_drill_links';
    const loadDrillAnalyses = () => readObj(LS_DRILL_ANALYSIS);
    function getDrillAnalyses(name) { const a = loadDrillAnalyses()[name]; return Array.isArray(a) ? a : []; }
    function latestDrillAnalysis(name) { const a = getDrillAnalyses(name); return a.length ? a[a.length - 1] : null; }
    function saveDrillAnalysis(name, entry) {
        if (!DRILLS_DATABASE.some(d => d.name === name)) return false;
        const all = loadDrillAnalyses();
        const list = Array.isArray(all[name]) ? all[name] : [];
        list.push(entry);
        list.sort((a, b) => String(a.date).localeCompare(String(b.date)));
        all[name] = list.slice(-15);
        writeObj(LS_DRILL_ANALYSIS, all);
        return true;
    }
    // "Best example" link per drill, chosen by the user. Only http(s) URLs are ever stored or rendered as links.
    function isSafeUrl(u) { return typeof u === 'string' && /^https?:\/\/[^\s<>"']+$/i.test(u.trim()); }
    function getDrillLink(name) { const u = readObj(LS_DRILL_LINKS)[name]; return isSafeUrl(u) ? u.trim() : ''; }
    function setDrillLink(name, url) {
        const all = readObj(LS_DRILL_LINKS);
        if (!url) delete all[name]; else if (isSafeUrl(url)) all[name] = url.trim(); else return false;
        writeObj(LS_DRILL_LINKS, all);
        return true;
    }
    function drillYoutubeSearchUrl(name) { return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(name + ' quarterback drill'); }

    // Letter grade on the app-wide 1-99 scale — same thresholds as madden.html gradeFor().
    function gradeFor(v) {
        if (v >= 95) return { l: 'A+', c: '#34d399' };
        if (v >= 90) return { l: 'A', c: '#34d399' };
        if (v >= 85) return { l: 'A-', c: '#4ade80' };
        if (v >= 80) return { l: 'B+', c: '#a3e635' };
        if (v >= 75) return { l: 'B', c: '#a3e635' };
        if (v >= 70) return { l: 'B-', c: '#facc15' };
        if (v >= 65) return { l: 'C+', c: '#facc15' };
        if (v >= 60) return { l: 'C', c: '#fb923c' };
        if (v >= 55) return { l: 'C-', c: '#fb923c' };
        if (v >= 50) return { l: 'D+', c: '#f87171' };
        if (v >= 45) return { l: 'D', c: '#f87171' };
        if (v >= 40) return { l: 'D-', c: '#f87171' };
        return { l: 'F', c: '#ef4444' };
    }

    // ---- Activity across the app (shared by calendar.html's week/year/all views and the hub's "My Day") ----
    // A day is ACTIVE if it has a manual calendar chip OR any specific exercise/drill logged on it. One definition,
    // used everywhere, so the numbers on the hub and the calendar can never disagree.
    function chipsFor(ds) {
        try { const v = JSON.parse(localStorage.getItem('qbmc_cal_' + ds)); return Array.isArray(v) ? v.filter(x => typeof x === 'string') : []; } catch (e) { return []; }
    }
    // ds -> { w: [{id, name}], d: [drillName] }, built once per render instead of re-parsing the logs for every day.
    function buildSpecificIndex() {
        const idx = {};
        const slot = ds => (idx[ds] = idx[ds] || { w: [], d: [] });
        Object.entries(loadWorkoutLog()).forEach(([id, e]) => {
            if (!e || !Array.isArray(e.dates)) return;
            const known = EX_BY_ID[id];
            e.dates.forEach(ds => { if (typeof ds === 'string') slot(ds).w.push({ id, name: known ? known.name : String(e.name || id) }); });
        });
        Object.entries(loadDrillLog()).forEach(([name, dates]) => {
            if (!Array.isArray(dates)) return;
            dates.forEach(ds => { if (typeof ds === 'string') slot(ds).d.push(name); });
        });
        return idx;
    }
    function dayActivity(ds, idx) {
        const chips = chipsFor(ds), s = (idx && idx[ds]) || { w: [], d: [] };
        return { ds, chips, workouts: s.w, drills: s.d, count: chips.length + s.w.length + s.d.length, active: chips.length > 0 || s.w.length > 0 || s.d.length > 0 };
    }
    function addDaysStr(ds, n) {
        const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ds);
        if (!m) return ds;
        return localDateStr(new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]) + n));
    }
    // Current streak of active days. If TODAY has nothing yet, the streak counts back from yesterday (the day isn't over),
    // so it doesn't read "0" every morning; `todayOpen` tells the caller that case happened.
    function currentStreak(todayDs, idx) {
        let ds = todayDs, n = 0, todayOpen = false;
        if (!dayActivity(ds, idx).active) { todayOpen = true; ds = addDaysStr(ds, -1); }
        for (let i = 0; i < 3700; i++) {
            if (!dayActivity(ds, idx).active) break;
            n++; ds = addDaysStr(ds, -1);
        }
        return { days: n, todayOpen };
    }
    function longestStreak(startDs, endDs, idx) {
        let best = 0, cur = 0, ds = startDs;
        for (let i = 0; i < 3700 && ds <= endDs; i++) {
            if (dayActivity(ds, idx).active) { cur++; if (cur > best) best = cur; } else cur = 0;
            ds = addDaysStr(ds, 1);
        }
        return best;
    }
    // Earliest date with any recorded activity (chips or specific items); null if none.
    function firstActivityDate(idx) {
        const dates = Object.keys(idx);
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith('qbmc_cal_') && /^\d{4}-\d{2}-\d{2}$/.test(k.slice(9)) && chipsFor(k.slice(9)).length) dates.push(k.slice(9));
        }
        const valid = dates.filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
        return valid.length ? valid[0] : null;
    }

    window.QB_TRAINING = {
        chipsFor, buildSpecificIndex, dayActivity, addDaysStr, currentStreak, longestStreak, firstActivityDate,
        getDrillAnalyses, latestDrillAnalysis, saveDrillAnalysis, isSafeUrl, getDrillLink, setDrillLink, drillYoutubeSearchUrl, gradeFor,
        DRILL_CATEGORY_META, DRILLS_DATABASE, WORKOUT_DAY_TITLES, WORKOUT_EXERCISES, EX_BY_ID,
        localDateStr, loadDrillLog, saveDrillLog, loadWorkoutLog, saveWorkoutLog,
        isDrillDone, setDrillDone, drillStats, isExerciseDone, setExerciseDone, exerciseStats
    };
})();
