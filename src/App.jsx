import React, { useState, useEffect, useMemo } from "react";
import { ChevronRight, ChevronLeft, ArrowRight, BookOpen, Home as HomeIcon } from "lucide-react";

// ---------- بيانات تجريبية (استبدلها لاحقاً بمانجتك وفصولك) ----------
const MANGA = {
  title: "ظلال الساموراي",
  subtitle: "Shadows of the Samurai",
  cover: null,
  synopsis:
    "في زمنٍ مزّقته الحروب، يسير \"كيتارو\" وحيداً بحثاً عن معنى القوة، بين سيفٍ ورثه عن أبيه وماضٍ يلاحقه في كل ظل. ترجمة خاصة، فصلاً بعد فصل.",
  status: "مستمرة",
  genres: ["أكشن", "دراما", "ساموراي"],
  chapters: Array.from({ length: 12 }, (_, i) => {
    const n = 12 - i;
    return {
      number: n,
      title: n === 12 ? "اللقاء الأخير" : n === 1 ? "البداية" : `الفصل ${n}`,
      pages: 6 + (n % 4),
      date: n === 12 ? "اليوم" : n === 11 ? "منذ يومين" : `منذ ${n} أيام`,
    };
  }),
};

// ---------- توليد لوحة صفحة مانجا وهمية (تُستبدل لاحقاً بصورك) ----------
function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function MockPage({ chapterNum, pageNum }) {
  const rnd = useMemo(() => seededRandom(chapterNum * 97 + pageNum * 13), [chapterNum, pageNum]);
  const panelCount = 3 + Math.floor(rnd() * 3);
  const panels = Array.from({ length: panelCount }, (_, i) => {
    const tones = ["tone-a", "tone-b", "tone-c", "tone-d"];
    return {
      tone: tones[Math.floor(rnd() * tones.length)],
      flex: 0.6 + rnd() * 1.4,
    };
  });

  return (
    <div className="manga-page">
      {panels.map((p, i) => (
        <div
          key={i}
          className={`panel ${p.tone}`}
          style={{ flex: p.flex }}
        >
          <span className="panel-mark">頁</span>
        </div>
      ))}
      <div className="page-footer">
        <span>صفحة {pageNum}</span>
      </div>
    </div>
  );
}

// ---------- الشعار / الختم ----------
function Hanko() {
  return (
    <div className="hanko" title="ترجمة خاصة">
      <span>ترجمة
خاصة</span>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("home"); // 'home' | 'reader'
  const [activeChapter, setActiveChapter] = useState(null);
  const [page, setPage] = useState(1);

  const chapter = activeChapter
    ? MANGA.chapters.find((c) => c.number === activeChapter)
    : null;

  function openChapter(num) {
    setActiveChapter(num);
    setPage(1);
    setView("reader");
  }

  function nextPage() {
    if (!chapter) return;
    if (page < chapter.pages) {
      setPage(page + 1);
    } else {
      const idx = MANGA.chapters.findIndex((c) => c.number === chapter.number);
      const nextCh = MANGA.chapters[idx - 1]; // القائمة تنازلية
      if (nextCh) openChapter(nextCh.number);
    }
  }

  function prevPage() {
    if (!chapter) return;
    if (page > 1) {
      setPage(page - 1);
    } else {
      const idx = MANGA.chapters.findIndex((c) => c.number === chapter.number);
      const prevCh = MANGA.chapters[idx + 1];
      if (prevCh) {
        setActiveChapter(prevCh.number);
        setPage(prevCh.pages);
      }
    }
  }

  useEffect(() => {
    if (view !== "reader") return;
    function onKey(e) {
      if (e.key === "ArrowLeft") nextPage();
      if (e.key === "ArrowRight") prevPage();
      if (e.key === "Escape") setView("home");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view, page, chapter]);

  return (
    <div dir="rtl" className="app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lalezar&family=Tajawal:wght@400;500;700;900&display=swap');

        * { box-sizing: border-box; }
        .app {
          font-family: 'Tajawal', sans-serif;
          background: #14100E;
          color: #EDE6D6;
          min-height: 100vh;
          background-image:
            radial-gradient(circle at 1px 1px, rgba(237,230,214,0.05) 1px, transparent 0);
          background-size: 18px 18px;
        }
        .display { font-family: 'Lalezar', sans-serif; }

        /* ---------- الشريط العلوي ---------- */
        .topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 24px;
          border-bottom: 1px solid rgba(237,230,214,0.12);
          position: sticky; top: 0; z-index: 20;
          background: rgba(20,16,14,0.85);
          backdrop-filter: blur(6px);
        }
        .brand { display:flex; align-items:center; gap:10px; }
        .brand-mark {
          width: 34px; height: 34px; border-radius: 8px;
          background: linear-gradient(135deg, #B23A2E, #7d2620);
          display:flex; align-items:center; justify-content:center;
          font-family:'Lalezar'; font-size: 18px; color:#EDE6D6;
          box-shadow: 0 0 0 1px rgba(237,230,214,0.15) inset;
        }
        .brand-name { font-family:'Lalezar'; font-size: 22px; letter-spacing: 0.5px; }
        .icon-btn {
          display:flex; align-items:center; gap:6px;
          color:#C9A227; background:transparent; border:1px solid rgba(201,162,39,0.4);
          padding:8px 14px; border-radius: 999px; font-size:14px; cursor:pointer;
          transition: all .15s ease;
        }
        .icon-btn:hover { background: rgba(201,162,39,0.12); }

        /* ---------- الصفحة الرئيسية ---------- */
        .hero {
          display:flex; gap: 36px; padding: 48px 24px 36px; max-width: 1000px; margin: 0 auto;
          align-items:flex-start; flex-wrap: wrap;
        }
        .cover {
          width: 220px; height: 310px; border-radius: 6px; flex-shrink:0;
          background-size: cover; background-position: center;
          position: relative; overflow:hidden;
          box-shadow: 0 18px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(237,230,214,0.08);
        }
        .cover::before {
          content:""; position:absolute; inset:0;
          background: linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(12,10,9,0.92) 100%);
        }
        .cover-title {
          position:absolute; bottom: 16px; right: 16px; left:16px;
          font-family:'Lalezar'; font-size: 26px; line-height: 1.25; color:#EDE6D6;
          text-shadow: 0 2px 10px rgba(0,0,0,0.8);
        }
        .hanko {
          position:absolute; top: 14px; left: 14px;
          width: 46px; height: 46px; border-radius: 50%;
          border: 2px solid #B23A2E; color:#B23A2E;
          display:flex; align-items:center; justify-content:center;
          transform: rotate(-8deg);
          font-size: 10px; font-weight: 700; text-align:center; line-height:1.15;
          white-space: pre; letter-spacing: 0.5px;
        }
        .meta { flex: 1; min-width: 260px; }
        .kicker {
          font-size: 12px; color:#C9A227; letter-spacing: 1px; margin-bottom: 8px;
          display:flex; align-items:center; gap:8px;
        }
        .kicker .dot { width:6px; height:6px; border-radius:50%; background:#C9A227; }
        h1.title { font-family:'Lalezar'; font-size: 42px; margin: 0 0 4px; }
        .subtitle { color:#A79C8E; font-size: 14px; margin-bottom: 16px; }
        .synopsis { color:#cfc6b8; line-height: 1.9; font-size: 15px; max-width: 560px; margin-bottom: 20px;}
        .tags { display:flex; gap:8px; margin-bottom: 22px; flex-wrap:wrap; }
        .tag {
          font-size: 12px; padding: 5px 12px; border-radius: 999px;
          border: 1px solid rgba(237,230,214,0.18); color:#cfc6b8;
        }
        .cta-row { display:flex; gap: 12px; }
        .btn-primary {
          background: #B23A2E; color:#fff; border:none; padding: 12px 22px;
          border-radius: 8px; font-family:'Tajawal'; font-weight:700; font-size:15px;
          display:flex; align-items:center; gap:8px; cursor:pointer;
          box-shadow: 0 8px 20px rgba(178,58,46,0.35);
          transition: transform .15s ease;
        }
        .btn-primary:hover { transform: translateY(-1px); }
        .btn-ghost {
          background:transparent; color:#EDE6D6; border:1px solid rgba(237,230,214,0.25);
          padding: 12px 22px; border-radius: 8px; font-size:15px; cursor:pointer;
        }

        /* ---------- قائمة الفصول ---------- */
        .chapters-section { max-width: 1000px; margin: 0 auto; padding: 8px 24px 60px; }
        .section-head {
          display:flex; align-items:baseline; justify-content:space-between;
          margin-bottom: 14px; border-bottom: 1px solid rgba(237,230,214,0.12); padding-bottom: 10px;
        }
        .section-head h2 { font-family:'Lalezar'; font-size: 22px; margin:0; }
        .section-head span { color:#A79C8E; font-size:13px; }
        .chapter-row {
          display:flex; align-items:center; gap: 16px;
          padding: 14px 10px; border-radius: 8px; cursor:pointer;
          border-bottom: 1px solid rgba(237,230,214,0.06);
          transition: background .12s ease;
        }
        .chapter-row:hover { background: rgba(237,230,214,0.05); }
        .chapter-num {
          font-family:'Lalezar'; font-size: 20px; color:#C9A227; width: 44px; text-align:center;
        }
        .chapter-info { flex:1; }
        .chapter-info .t { font-weight:700; font-size:15px; }
        .chapter-info .d { color:#8a8074; font-size:12px; margin-top:2px; }
        .chapter-arrow { color:#8a8074; }

        /* ---------- القارئ ---------- */
        .reader-bar {
          display:flex; align-items:center; justify-content:space-between;
          padding: 12px 20px; border-bottom: 1px solid rgba(237,230,214,0.12);
          position: sticky; top:0; background: rgba(20,16,14,0.92); backdrop-filter: blur(6px);
          z-index: 20;
        }
        .reader-bar .ch-title { font-weight:700; font-size:14px; }
        .reader-bar .ch-sub { color:#8a8074; font-size:12px; }
        .back-link { display:flex; align-items:center; gap:6px; color:#cfc6b8; cursor:pointer; font-size:14px; background:none; border:none; }
        .page-counter { color:#C9A227; font-size:13px; font-variant-numeric: tabular-nums; }

        .reader-body { max-width: 620px; margin: 0 auto; padding: 28px 16px 10px; }
        .manga-page {
          display:flex; gap: 4px; height: 640px; background:#0c0a09;
          border: 1px solid rgba(237,230,214,0.12); border-radius: 4px; padding: 6px;
          position: relative;
        }
        .panel {
          position: relative; border: 2px solid #EDE6D6; border-radius: 2px; overflow:hidden;
          display:flex; align-items:center; justify-content:center;
        }
        .panel-mark { font-family:'Lalezar'; font-size: 13px; color: rgba(237,230,214,0.35); }
        .tone-a { background: repeating-radial-gradient(circle at 3px 3px, rgba(237,230,214,0.5) 0 1.4px, transparent 1.5px 6px), #2b2521; }
        .tone-b { background: repeating-linear-gradient(0deg, rgba(237,230,214,0.35) 0 1px, transparent 1px 5px), #201a17; }
        .tone-c { background: linear-gradient(160deg, #3a2420, #17110f); }
        .tone-d { background: repeating-radial-gradient(circle at 2px 2px, rgba(178,58,46,0.4) 0 1px, transparent 1.5px 7px), #1a1512; }
        .page-footer {
          position:absolute; bottom: 10px; left:0; right:0; text-align:center;
          font-size: 11px; color:#5c554c;
        }

        .nav-row {
          display:flex; align-items:center; justify-content:space-between;
          max-width: 620px; margin: 18px auto 60px; padding: 0 16px;
        }
        .nav-btn {
          display:flex; align-items:center; gap:8px; background: rgba(237,230,214,0.06);
          border: 1px solid rgba(237,230,214,0.14); color:#EDE6D6; padding: 10px 18px;
          border-radius: 8px; cursor:pointer; font-size: 14px;
        }
        .nav-btn:disabled { opacity: 0.3; cursor: default; }
        .hint { text-align:center; color:#5c554c; font-size:12px; margin-bottom: 20px; }

        @media (max-width: 560px) {
          h1.title { font-size: 30px; }
          .hero { padding: 28px 16px; gap: 20px; }
          .cover { width: 150px; height: 210px; }
          .manga-page { height: 460px; }
        }
      `}</style>

      {/* ------- الشريط العلوي ------- */}
      <div className="topbar">
        <div className="brand" onClick={() => setView("home")} style={{ cursor: "pointer" }}>
          <div className="brand-mark">漫</div>
          <div className="brand-name">استوديو الترجمة</div>
        </div>
        {view === "reader" && (
          <button className="icon-btn" onClick={() => setView("home")}>
            <HomeIcon size={15} /> الرئيسية
          </button>
        )}
      </div>

      {view === "home" && (
        <>
          <div className="hero">
            <div
              className="cover"
              style={
                MANGA.cover
                  ? { backgroundImage: `url(${MANGA.cover})` }
                  : { background: "linear-gradient(160deg, #3a1f1a 0%, #1c1210 55%, #12100e 100%)" }
              }
            >
              <Hanko />
              <div className="cover-title">{MANGA.title}</div>
            </div>
            <div className="meta">
              <div className="kicker">
                <span className="dot" />
                {MANGA.status} — {MANGA.chapters.length} فصل مترجم
              </div>
              <h1 className="title">{MANGA.title}</h1>
              <div className="subtitle">{MANGA.subtitle}</div>
              <p className="synopsis">{MANGA.synopsis}</p>
              <div className="tags">
                {MANGA.genres.map((g) => (
                  <span className="tag" key={g}>{g}</span>
                ))}
              </div>
              <div className="cta-row">
                <button
                  className="btn-primary"
                  onClick={() => openChapter(MANGA.chapters[MANGA.chapters.length - 1].number)}
                >
                  <BookOpen size={16} /> ابدأ من الفصل الأول
                </button>
                <button
                  className="btn-ghost"
                  onClick={() => openChapter(MANGA.chapters[0].number)}
                >
                  أحدث فصل
                </button>
              </div>
            </div>
          </div>

          <div className="chapters-section">
            <div className="section-head">
              <h2>الفصول</h2>
              <span>{MANGA.chapters.length} فصل</span>
            </div>
            {MANGA.chapters.map((c) => (
              <div className="chapter-row" key={c.number} onClick={() => openChapter(c.number)}>
                <div className="chapter-num">{c.number}</div>
                <div className="chapter-info">
                  <div className="t">{c.title}</div>
                  <div className="d">{c.pages} صفحات — {c.date}</div>
                </div>
                <ChevronLeft size={18} className="chapter-arrow" />
              </div>
            ))}
          </div>
        </>
      )}

      {view === "reader" && chapter && (
        <>
          <div className="reader-bar">
            <button className="back-link" onClick={() => setView("home")}>
              <ArrowRight size={16} /> رجوع
            </button>
            <div style={{ textAlign: "center" }}>
              <div className="ch-title">الفصل {chapter.number} — {chapter.title}</div>
            </div>
            <div className="page-counter">{page} / {chapter.pages}</div>
          </div>

          <div className="reader-body">
            <MockPage chapterNum={chapter.number} pageNum={page} />
          </div>
          <div className="hint">استخدم الأسهم ← → للتنقل بين الصفحات</div>

          <div className="nav-row">
            <button className="nav-btn" onClick={nextPage}>
              التالي <ChevronLeft size={16} />
            </button>
            <button className="nav-btn" onClick={prevPage}>
              <ChevronRight size={16} /> السابق
            </button>
          </div>
        </>
      )}
    </div>
  );
}
