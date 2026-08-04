

// Manga site · JSX
import React, { useState, useEffect, useMemo, useRef } from "react";
import { ChevronRight, ChevronLeft, ArrowRight, BookOpen, Home as HomeIcon, Search, Heart } from "lucide-react";
 
// ---------- بيانات تجريبية (استبدلها لاحقاً بمانجتك وفصولك) ----------
const MANGA = {
  title: "بليتش",
  subtitle: "BLEACH",
  cover: null,
  synopsis:
    "طالب ثانوي عادي يكتسب قدرات خارقة بعد لقاء غامض، فيجد نفسه مسؤولاً عن حماية عالمه من أرواح شريرة تهدد الأحياء والأموات على حد سواء. ترجمة خاصة، فصلاً بعد فصل.",
  status: "مستمرة",
  genres: ["أكشن", "خارق للطبيعة", "دراما"],
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
 
// ---------- شعار "كاغي" — مربع أسود بزوايا ناعمة وكانجي أحمر متوهج ----------
function KagiSeal({ size = 46, showLabel = false }) {
  return (
    <div className="seal-wrap" title="كاغي 影">
      <div className="seal-mark" style={{ width: size, height: size, fontSize: size * 0.52 }}>
        影
      </div>
      {showLabel && <span className="seal-label">كاغي</span>}
    </div>
  );
}
 
export default function App() {
  const [view, setView] = useState("landing"); // 'landing' | 'explore' | 'manga' | 'reader' | 'favorites' | 'more'
  const [activeChapter, setActiveChapter] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activeGenre, setActiveGenre] = useState("الكل");
  const [slide, setSlide] = useState(0);
  const [favorites, setFavorites] = useState([]);
 
  function toggleFavorite(title) {
    setFavorites((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  }
 
  const SLIDES = [
    {
      tag: "جديد",
      title: "بليتش",
      desc: "الفصل 12 مضاف الآن — تابع القصة من حيث وقفت",
      cta: "اقرأ الفصل الجديد",
      action: () => setView("manga"),
    },
    {
      tag: "تحديث",
      title: "الموقع يكبر",
      desc: "قريباً نضيف مانجات جديدة ولوحة تحكم كاملة للمتابعة",
      cta: null,
    },
    {
      tag: "أهلاً",
      title: "كاغي 影",
      desc: "ترجمة خاصة، فصلاً بعد فصل، بأسلوبنا الخاص",
      cta: null,
    },
  ];
 
  const autoplayRef = useRef(null);
  const resumeTimeoutRef = useRef(null);
  const dragRef = useRef({ startX: 0, dragging: false });
 
  function clearAutoplay() {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    autoplayRef.current = null;
  }
 
  function startAutoplay() {
    clearAutoplay();
    autoplayRef.current = setInterval(() => {
      setSlide((s) => (s + 1) % SLIDES.length);
    }, 5000);
  }
 
  // يوقف التشغيل التلقائي فوراً، ويجدوله يرجع بعد 2.5 ثانية من آخر تفاعل
  function registerInteraction() {
    clearAutoplay();
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => startAutoplay(), 2500);
  }
 
  function goToSlide(i) {
    setSlide(((i % SLIDES.length) + SLIDES.length) % SLIDES.length);
    registerInteraction();
  }
 
  useEffect(() => {
    if (view !== "landing") return;
    startAutoplay();
    return () => {
      clearAutoplay();
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
  }, [view]);
 
  // ---------- التحكم بالسحب (جوال ولمس + ماوس بالديسكتوب) ----------
  function handleDragStart(x) {
    dragRef.current = { startX: x, dragging: true };
  }
  function handleDragEnd(x) {
    if (!dragRef.current.dragging) return;
    const delta = x - dragRef.current.startX;
    dragRef.current.dragging = false;
    if (Math.abs(delta) > 40) {
      if (delta < 0) goToSlide(slide + 1);
      else goToSlide(slide - 1);
    } else {
      registerInteraction();
    }
  }
 
  const MANGA_LIST = [MANGA];
  const ALL_CATEGORIES = [
    "الكل", "أكشن", "خارق للطبيعة", "دراما", "كوميديا", "رومانسية",
    "رعب", "مغامرات", "غموض", "خيال علمي", "رياضة", "تاريخي",
  ];
  const filteredList = MANGA_LIST.filter(
    (m) =>
      (activeGenre === "الكل" || m.genres.includes(activeGenre)) &&
      m.title.includes(search.trim())
  );
 
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
      if (e.key === "Escape") setView("manga");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view, page, chapter]);
 
  return (
    <div dir="rtl" className="app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lalezar&family=Tajawal:wght@400;500;700;900&display=swap');
 
        * { box-sizing: border-box; }
 
        @keyframes viewFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .view-fade { animation: viewFadeIn 0.32s ease; }
        @media (prefers-reduced-motion: reduce) {
          .view-fade { animation: none; }
        }
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
          flex-wrap: wrap; row-gap: 12px;
          padding: 14px 20px;
          border-bottom: 1px solid rgba(237,230,214,0.12);
          position: sticky; top: 0; z-index: 20;
          background: rgba(20,16,14,0.92);
          backdrop-filter: blur(6px);
        }
        .brand { display:flex; align-items:center; gap:10px; }
        .seal-wrap { display:flex; align-items:center; gap:8px; }
        .seal-mark {
          background:#0c0a09; border-radius: 8px;
          display:flex; align-items:center; justify-content:center;
          font-family:'Lalezar'; color:#C1483A;
          box-shadow: 0 6px 16px rgba(178,58,46,0.28), 0 0 0 1px rgba(237,230,214,0.08) inset;
        }
        .seal-label { font-family:'Lalezar'; font-size: 15px; color:#cfc6b8; }
        .brand-name { font-family:'Lalezar'; font-size: 22px; letter-spacing: 0.5px; }
        .icon-btn {
          display:flex; align-items:center; gap:6px;
          color:#C9A227; background:transparent; border:1px solid rgba(201,162,39,0.4);
          padding:8px 14px; border-radius: 999px; font-size:14px; cursor:pointer;
          transition: all .15s ease;
        }
        .icon-btn:hover { background: rgba(201,162,39,0.12); }
 
        /* ---------- شريط علوي: تنقّل + تصنيفات + بحث ---------- */
        .nav-links { display:flex; align-items:center; gap: 22px; }
        .nav-link {
          background:none; border:none; color:#A79C8E; font-size:14px; cursor:pointer;
          font-family:'Tajawal'; font-weight: 500; padding: 4px 0; position:relative;
        }
        .nav-link.active { color:#EDE6D6; font-weight:700; }
        .nav-link.active::after {
          content:""; position:absolute; bottom:-14px; right:0; left:0; height:2px; background:#B23A2E;
        }
        .search-box {
          display:flex; align-items:center; gap:8px;
          background: rgba(237,230,214,0.06); border: 1px solid rgba(237,230,214,0.14);
          border-radius: 999px; padding: 8px 14px; width: 100%;
        }
        .search-box input {
          background:none; border:none; outline:none; color:#EDE6D6; font-family:'Tajawal';
          font-size: 13px; width: 100%; min-width: 0;
        }
        .search-box input::placeholder { color:#6b6357; }
        .explore-search-wrap { max-width: 1000px; margin: 0 auto; padding: 14px 24px 0; }
 
        /* ---------- صفحة الهبوط ---------- */
        .categories-row {
          display:flex; gap:8px; padding: 18px 24px 6px; max-width: 1000px; margin:0 auto;
          flex-wrap:wrap;
        }
        .cat-btn {
          font-size: 13px; padding: 7px 16px; border-radius: 999px; cursor:pointer;
          border: 1px solid rgba(237,230,214,0.16); background: transparent; color:#cfc6b8;
          font-family:'Tajawal'; transition: all .15s ease;
        }
        .cat-btn.active { background:#B23A2E; border-color:#B23A2E; color:#fff; font-weight:700; }
        .cat-btn:hover:not(.active) { border-color: rgba(237,230,214,0.35); }
 
        .section-title {
          max-width: 1000px; margin: 22px auto 14px; padding: 0 24px;
          display:flex; align-items:center; gap:10px;
        }
        .section-title h2 { font-family:'Lalezar'; font-size: 24px; margin:0; }
        .section-title .rule { flex:1; height:1px; background: rgba(237,230,214,0.12); }
 
        .cards-grid {
          max-width: 1000px; margin: 0 auto; padding: 0 24px 60px;
          display:grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 20px;
        }
        .manga-card { cursor:pointer; }
        .card-cover {
          width:100%; aspect-ratio: 2/3; border-radius: 8px; position:relative; overflow:hidden;
          background-size: cover; background-position:center;
          box-shadow: 0 10px 24px rgba(0,0,0,0.45), 0 0 0 1px rgba(237,230,214,0.08);
          transition: transform .15s ease;
        }
        .manga-card:hover .card-cover { transform: translateY(-3px); }
        .card-cover::after {
          content:""; position:absolute; inset:0;
          background: linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(12,10,9,0.9) 100%);
        }
        .new-tag {
          position:absolute; top:8px; left:8px; z-index:2;
          background:#C9A227; color:#14100E; font-size:10px; font-weight:700;
          padding: 3px 9px; border-radius: 999px; font-family:'Tajawal';
        }
        .card-cover-title {
          position:absolute; bottom:10px; right:10px; left:10px; z-index:2;
          font-family:'Lalezar'; font-size: 17px; color:#EDE6D6; line-height:1.2;
        }
        .card-meta { margin-top: 8px; font-size:12px; color:#8a8074; }
        .empty-state {
          max-width: 1000px; margin: 40px auto; padding: 0 24px; text-align:center; color:#6b6357;
        }
 
        /* ---------- الشاشة المتحركة (Hero Carousel) ---------- */
        .hero-carousel {
          position: relative; max-width: 1000px; margin: 18px auto 0; padding: 0 20px;
          height: 200px; border-radius: 14px; overflow: hidden;
          background: linear-gradient(135deg, #241512 0%, #12100e 70%);
          border: 1px solid rgba(237,230,214,0.1);
          cursor: grab; user-select: none; touch-action: pan-y;
        }
        .hero-carousel:active { cursor: grabbing; }
        .hc-arrow {
          position:absolute; top:50%; transform: translateY(-50%); z-index:3;
          width:32px; height:32px; border-radius:50%; border:none; cursor:pointer;
          background: rgba(12,10,9,0.55); color:#EDE6D6;
          display:flex; align-items:center; justify-content:center;
          opacity: 0; transition: opacity .15s ease;
        }
        .hero-carousel:hover .hc-arrow { opacity: 1; }
        .hc-arrow-prev { right: 14px; }
        .hc-arrow-next { left: 14px; }
        .hc-slide {
          position:absolute; inset:0; padding: 30px 32px;
          display:flex; flex-direction:column; justify-content:center; gap:8px;
          opacity: 0; transform: translateX(12px); transition: opacity .5s ease, transform .5s ease;
          pointer-events: none;
        }
        .hc-slide.active { opacity: 1; transform: translateX(0); pointer-events: auto; }
        .hc-tag {
          align-self: flex-start; font-size: 11px; background: rgba(178,58,46,0.18); color:#ff8a76;
          border: 1px solid rgba(178,58,46,0.4); padding: 3px 10px; border-radius: 999px;
        }
        .hc-title { font-family:'Lalezar'; font-size: 30px; margin: 4px 0 0; }
        .hc-desc { color:#cfc6b8; font-size: 13px; max-width: 480px; margin: 0 0 6px; }
        .hc-dots { position:absolute; bottom: 14px; right: 32px; display:flex; gap:6px; }
        .hc-dot {
          width: 7px; height: 7px; border-radius: 50%; background: rgba(237,230,214,0.25);
          border: none; cursor: pointer; padding:0;
        }
        .hc-dot.active { background: #B23A2E; width: 20px; border-radius: 4px; transition: all .25s ease; }
 
        /* ---------- القائمة السفلية (جوال) ---------- */
        .bottom-nav { display: none; }
 
        @media (max-width: 720px) {
          .app { padding-bottom: 72px; }
          .nav-links { display: none; }
          .bottom-nav {
            display:flex; align-items:center; justify-content:space-around;
            position: fixed; bottom:0; right:0; left:0; z-index: 30;
            background: rgba(20,16,14,0.96); backdrop-filter: blur(10px);
            border-top: 1px solid rgba(237,230,214,0.12);
            padding: 8px 6px calc(8px + env(safe-area-inset-bottom));
          }
          .bn-item {
            background:none; border:none; color:#8a8074; display:flex; flex-direction:column;
            align-items:center; gap:3px; font-size: 10px; font-family:'Tajawal'; cursor:pointer;
            padding: 4px 10px; flex:1;
          }
          .bn-item.active { color:#EDE6D6; }
          .bn-item.active svg { color:#B23A2E; }
          .bn-more-dot { font-size: 14px; line-height:1; letter-spacing: -1px; }
          .hero-carousel { height: 170px; margin-top: 12px; }
          .hc-slide { padding: 20px 22px; }
          .hc-title { font-size: 24px; }
        }
 
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
        .cover .seal-wrap {
          position:absolute; top: 14px; left: 14px; z-index: 2;
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
        .cta-row { display:flex; gap: 12px; flex-wrap: wrap; }
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
        .btn-fav {
          display:flex; align-items:center; gap:8px;
          background:transparent; color:#cfc6b8; border:1px solid rgba(237,230,214,0.25);
          padding: 12px 18px; border-radius: 8px; font-size:14px; cursor:pointer;
          transition: all .15s ease;
        }
        .btn-fav:hover { border-color: rgba(178,58,46,0.5); }
        .btn-fav.active { background: rgba(178,58,46,0.14); border-color:#B23A2E; color:#ff8a76; }
 
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
 
        .reader-body { max-width: 620px; margin: 0 auto; padding: 28px 16px 10px; animation: viewFadeIn 0.22s ease; }
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
        <div className="brand" onClick={() => setView("landing")} style={{ cursor: "pointer" }}>
          <KagiSeal size={38} />
          <div className="brand-name">كاغي 影</div>
        </div>
        <div className="nav-links">
          <button
            className={`nav-link ${view === "landing" ? "active" : ""}`}
            onClick={() => setView("landing")}
          >
            الرئيسية
          </button>
          <button
            className={`nav-link ${view === "explore" ? "active" : ""}`}
            onClick={() => setView("explore")}
          >
            استكشف
          </button>
          <button
            className={`nav-link ${view === "favorites" ? "active" : ""}`}
            onClick={() => setView("favorites")}
          >
            المفضلة {favorites.length > 0 && `(${favorites.length})`}
          </button>
          <button
            className={`nav-link ${view === "more" ? "active" : ""}`}
            onClick={() => setView("more")}
          >
            المزيد
          </button>
        </div>
      </div>
 
      <div key={view} className="view-fade">
 
      {view === "landing" && (
        <>
          <div
            className="hero-carousel"
            onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
            onTouchEnd={(e) => handleDragEnd(e.changedTouches[0].clientX)}
            onMouseDown={(e) => handleDragStart(e.clientX)}
            onMouseUp={(e) => handleDragEnd(e.clientX)}
            onMouseLeave={() => { dragRef.current.dragging = false; }}
          >
            {SLIDES.map((s, i) => (
              <div key={i} className={`hc-slide ${i === slide ? "active" : ""}`}>
                <span className="hc-tag">{s.tag}</span>
                <h2 className="hc-title">{s.title}</h2>
                <p className="hc-desc">{s.desc}</p>
                {s.cta && (
                  <button className="btn-primary" onClick={s.action}>
                    <BookOpen size={16} /> {s.cta}
                  </button>
                )}
              </div>
            ))}
            <button
              className="hc-arrow hc-arrow-prev"
              onClick={() => goToSlide(slide - 1)}
              aria-label="السابق"
            >
              <ChevronRight size={18} />
            </button>
            <button
              className="hc-arrow hc-arrow-next"
              onClick={() => goToSlide(slide + 1)}
              aria-label="التالي"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="hc-dots">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  className={`hc-dot ${i === slide ? "active" : ""}`}
                  onClick={() => goToSlide(i)}
                  aria-label={`سلايد ${i + 1}`}
                />
              ))}
            </div>
          </div>
 
          <div className="section-title" style={{ marginTop: 24 }}>
            <h2>أُضيف حديثاً</h2>
            <div className="rule" />
          </div>
 
          <div className="cards-grid">
            {MANGA_LIST.map((m) => (
              <div
                key={m.title}
                className="manga-card"
                onClick={() => setView("manga")}
              >
                <div
                  className="card-cover"
                  style={
                    m.cover
                      ? { backgroundImage: `url(${m.cover})` }
                      : { background: "linear-gradient(160deg, #3a1f1a 0%, #1c1210 55%, #12100e 100%)" }
                  }
                >
                  <span className="new-tag">جديد</span>
                  <div className="card-cover-title">{m.title}</div>
                </div>
                <div className="card-meta">
                  الفصل {m.chapters[0].number} — {m.chapters[0].date}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
 
      {view === "explore" && (
        <>
          <div className="section-title" style={{ marginTop: 24 }}>
            <h2>استكشف</h2>
            <div className="rule" />
          </div>
 
          <div className="explore-search-wrap">
            <div className="search-box">
              <Search size={14} color="#6b6357" />
              <input
                placeholder="ابحث عن مانجا..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
 
          <div className="categories-row">
            {ALL_CATEGORIES.map((c) => (
              <button
                key={c}
                className={`cat-btn ${activeGenre === c ? "active" : ""}`}
                onClick={() => setActiveGenre(c)}
              >
                {c}
              </button>
            ))}
          </div>
 
          {filteredList.length === 0 ? (
            <div className="empty-state">ما فيه نتائج مطابقة، جرّب كلمة أو تصنيف ثاني.</div>
          ) : (
            <div className="cards-grid">
              {filteredList.map((m) => (
                <div
                  key={m.title}
                  className="manga-card"
                  onClick={() => setView("manga")}
                >
                  <div
                    className="card-cover"
                    style={
                      m.cover
                        ? { backgroundImage: `url(${m.cover})` }
                        : { background: "linear-gradient(160deg, #3a1f1a 0%, #1c1210 55%, #12100e 100%)" }
                    }
                  >
                    <div className="card-cover-title">{m.title}</div>
                  </div>
                  <div className="card-meta">
                    الفصل {m.chapters[0].number} — {m.chapters[0].date}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
 
      {view === "manga" && (
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
              <KagiSeal size={54} />
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
                <button
                  className={`btn-fav ${favorites.includes(MANGA.title) ? "active" : ""}`}
                  onClick={() => toggleFavorite(MANGA.title)}
                >
                  <Heart size={16} fill={favorites.includes(MANGA.title) ? "currentColor" : "none"} />
                  {favorites.includes(MANGA.title) ? "بالمفضلة" : "أضف للمفضلة"}
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
            <button className="back-link" onClick={() => setView("manga")}>
              <ArrowRight size={16} /> رجوع
            </button>
            <div style={{ textAlign: "center" }}>
              <div className="ch-title">الفصل {chapter.number} — {chapter.title}</div>
            </div>
            <div className="page-counter">{page} / {chapter.pages}</div>
          </div>
 
          <div className="reader-body" key={`${chapter.number}-${page}`}>
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
 
      {view === "favorites" && (
        <>
          <div className="section-title" style={{ marginTop: 24 }}>
            <h2>مفضلتي</h2>
            <div className="rule" />
          </div>
          {favorites.length === 0 ? (
            <div className="empty-state">
              ما ضفت أي مانجا للمفضلة بعد — افتح صفحة أي مانجا واضغط "أضف للمفضلة".
            </div>
          ) : (
            <div className="cards-grid">
              {MANGA_LIST.filter((m) => favorites.includes(m.title)).map((m) => (
                <div key={m.title} className="manga-card" onClick={() => setView("manga")}>
                  <div
                    className="card-cover"
                    style={
                      m.cover
                        ? { backgroundImage: `url(${m.cover})` }
                        : { background: "linear-gradient(160deg, #3a1f1a 0%, #1c1210 55%, #12100e 100%)" }
                    }
                  >
                    <div className="card-cover-title">{m.title}</div>
                  </div>
                  <div className="card-meta">
                    الفصل {m.chapters[0].number} — {m.chapters[0].date}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
 
      {view === "more" && (
        <div className="empty-state" style={{ marginTop: 60 }}>
          قسم "المزيد" — بيصير فيه لاحقاً: من نحن، تواصل معنا، وإعدادات الحساب.
        </div>
      )}
 
      </div>
 
      {/* ------- القائمة السفلية (جوال فقط) ------- */}
      <div className="bottom-nav">
        <button
          className={`bn-item ${view === "landing" ? "active" : ""}`}
          onClick={() => setView("landing")}
        >
          <HomeIcon size={20} />
          <span>الرئيسية</span>
        </button>
        <button
          className={`bn-item ${view === "explore" ? "active" : ""}`}
          onClick={() => setView("explore")}
        >
          <Search size={20} />
          <span>استكشف</span>
        </button>
        <button
          className={`bn-item ${view === "favorites" ? "active" : ""}`}
          onClick={() => setView("favorites")}
        >
          <BookOpen size={20} />
          <span>المفضلة</span>
        </button>
        <button
          className={`bn-item ${view === "more" ? "active" : ""}`}
          onClick={() => setView("more")}
        >
          <span className="bn-more-dot">•••</span>
          <span>المزيد</span>
        </button>
      </div>
    </div>
  );
}
 
