// Manga site · JSX
import React, { useState, useEffect, useMemo, useRef } from "react";
import { ChevronRight, ChevronLeft, ArrowRight, BookOpen, Home as HomeIcon, Search, Heart, Palette, User, LogOut, X, Eye, EyeOff, Camera, Pencil, Check } from "lucide-react";
import { supabase } from "./supabaseClient";

// ---------- غيّر هذا لإيميلك عشان يصير حسابك هو الأدمن ----------
const ADMIN_EMAIL = "dary776688@gmail.com";

// ---------- بيانات المانجا الأساسية (الاسم والوصف بس — الفصول تجي من قاعدة البيانات) ----------
const MANGA = {
  title: "بليتش",
  subtitle: "BLEACH",
  cover: null,
  synopsis:
    "طالب ثانوي عادي يكتسب قدرات خارقة بعد لقاء غامض، فيجد نفسه مسؤولاً عن حماية عالمه من أرواح شريرة تهدد الأحياء والأموات على حد سواء. ترجمة خاصة، فصلاً بعد فصل.",
  status: "مستمرة",
  genres: ["أكشن", "خارق للطبيعة", "دراما"],
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
function KagiSeal({ size = 46, showLabel = false, logoUrl = null }) {
  return (
    <div className="seal-wrap" title="كاغي 影">
      {logoUrl ? (
        <img
          src={logoUrl}
          alt="كاغي 影"
          style={{ width: size, height: size, borderRadius: 8, objectFit: "cover" }}
        />
      ) : (
        <div className="seal-mark" style={{ width: size, height: size, fontSize: size * 0.52 }}>
          影
        </div>
      )}
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
  const [theme, setTheme] = useState("crimson"); // 'crimson' | 'white' | 'blue'
  const [themePickerOpen, setThemePickerOpen] = useState(false);
  const THEMES = [
    { id: "crimson", color: "#B23A2E" },
    { id: "white", color: "#F7F3EC" },
    { id: "blue", color: "#0B1622" },
  ];

  const [user, setUser] = useState(null);
  const [welcomeVisible, setWelcomeVisible] = useState(false);
  const [chapters, setChapters] = useState([]);
  const [chaptersLoading, setChaptersLoading] = useState(true);
  const [chapterPages, setChapterPages] = useState([]); // روابط صور الفصل المفتوح حالياً
  const [logoUrl, setLogoUrl] = useState(null);
  const [mangaCoverUrl, setMangaCoverUrl] = useState(null);

  // ---------- جلب قائمة الفصول من قاعدة البيانات (تتحدث بدون أي تعديل بالكود) ----------
  async function refetchChapters() {
    const { data } = await supabase
      .from("chapters")
      .select("*")
      .order("number", { ascending: false });
    setChapters(data || []);
    setChaptersLoading(false);
  }

  // ---------- جلب رابط الشعار من إعدادات الموقع (لو محطوط) ----------
  async function refetchLogo() {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "logo_url")
      .maybeSingle();
    if (data?.value) setLogoUrl(data.value);
  }

  // ---------- جلب رابط غلاف المانجا (منفصل تماماً عن شعار الموقع) ----------
  async function refetchMangaCover() {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "manga_cover_url")
      .maybeSingle();
    if (data?.value) setMangaCoverUrl(data.value);
  }

  useEffect(() => {
    refetchChapters();
    refetchLogo();
    refetchMangaCover();
  }, []);

  // ---------- جلب صور صفحات الفصل المفتوح ----------
  async function fetchChapterPages(chapterNumber) {
    const { data } = await supabase
      .from("chapter_pages")
      .select("page_number, image_url")
      .eq("chapter_number", chapterNumber)
      .order("page_number", { ascending: true });
    setChapterPages(data || []);
  }
  const [profile, setProfile] = useState(null); // { username, avatar_url }
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // 'login' | 'signup'
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authUsername, setAuthUsername] = useState("");
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [authNotice, setAuthNotice] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [usernameSaving, setUsernameSaving] = useState(false);

  const isAdmin = !!user && user.email === ADMIN_EMAIL;

  // ---------- جلب الجلسة الحالية والاستماع لتغيّرات تسجيل الدخول ----------
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // ---------- جلب بروفايل المستخدم (الاسم والصورة) بعد تسجيل الدخول ----------
  async function refetchProfile(userId) {
    const { data } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", userId)
      .maybeSingle();
    setProfile(data);
  }

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    refetchProfile(user.id);
  }, [user]);

  // ---------- إعادة جلب البروفايل تلقائياً لما ترجع لتبويب الموقع (يحدّث الصورة لو انرفعت من جهاز ثاني) ----------
  useEffect(() => {
    if (!user) return;
    function onFocus() {
      refetchProfile(user.id);
    }
    window.addEventListener("visibilitychange", onFocus);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("visibilitychange", onFocus);
      window.removeEventListener("focus", onFocus);
    };
  }, [user]);

  async function saveUsername() {
    const clean = newUsername.trim();
    setUsernameError("");
    if (clean.length < 3) {
      setUsernameError("3 أحرف على الأقل.");
      return;
    }
    if (clean === profile?.username) {
      setEditingUsername(false);
      return;
    }
    setUsernameSaving(true);
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .ilike("username", clean)
      .neq("id", user.id)
      .maybeSingle();
    if (existing) {
      setUsernameError("هذا الاسم مستخدم من قبل.");
      setUsernameSaving(false);
      return;
    }
    const { data: updated, error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, username: clean }, { onConflict: "id" })
      .select();
    if (error || !updated || updated.length === 0) {
      setUsernameError("ما انحفظ فعلياً: " + (error?.message || "خطأ غير معروف"));
    } else {
      setProfile((p) => ({ ...(p || {}), username: clean }));
      setEditingUsername(false);
    }
    setUsernameSaving(false);
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setAvatarUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase
      .storage
      .from("avatars")
      .upload(path, file, { upsert: true });
    if (!uploadError) {
      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      const avatarUrl = `${pub.publicUrl}?t=${Date.now()}`;
      const fallbackUsername = profile?.username || user.email.split("@")[0];
      const { data: updated, error: dbError } = await supabase
        .from("profiles")
        .upsert(
          { id: user.id, avatar_url: avatarUrl, username: fallbackUsername },
          { onConflict: "id" }
        )
        .select();
      if (!dbError && updated && updated.length > 0) {
        setProfile((p) => ({ ...(p || {}), avatar_url: avatarUrl, username: p?.username || fallbackUsername }));
      } else {
        alert("الصورة انرفعت بس ما انحفظت بحسابك: " + (dbError?.message || "خطأ غير معروف"));
      }
    } else {
      alert("فشل رفع الصورة: " + uploadError.message);
    }
    setAvatarUploading(false);
  }

  // ---------- جلب مفضلة المستخدم من قاعدة البيانات بعد تسجيل الدخول ----------
  useEffect(() => {
    if (!user) {
      setFavorites([]);
      return;
    }
    supabase
      .from("favorites")
      .select("manga_title")
      .eq("user_id", user.id)
      .then(({ data, error }) => {
        if (!error && data) setFavorites(data.map((r) => r.manga_title));
      });
  }, [user]);

  async function toggleFavorite(title) {
    if (!user) {
      setAuthModalOpen(true);
      setAuthMode("login");
      return;
    }
    const already = favorites.includes(title);
    if (already) {
      setFavorites((prev) => prev.filter((t) => t !== title));
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("manga_title", title);
    } else {
      setFavorites((prev) => [...prev, title]);
      await supabase.from("favorites").insert({ user_id: user.id, manga_title: title });
    }
  }

  async function handleAuthSubmit(e) {
    e.preventDefault();
    setAuthError("");
    setAuthNotice("");
    setAuthBusy(true);
    if (authMode === "signup") {
      const cleanUsername = authUsername.trim();
      if (cleanUsername.length < 3) {
        setAuthError("الاسم لازم يكون 3 أحرف على الأقل.");
        setAuthBusy(false);
        return;
      }
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .ilike("username", cleanUsername)
        .maybeSingle();
      if (existing) {
        setAuthError("هذا الاسم مستخدم من قبل، جرّب اسم ثاني.");
        setAuthBusy(false);
        return;
      }
      const { error } = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword,
        options: { data: { username: cleanUsername } },
      });
      if (error) setAuthError(error.message);
      else setAuthNotice("تم إنشاء الحساب! تحقق من إيميلك لتأكيده قبل تسجيل الدخول.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
      if (error) setAuthError(error.message);
      else {
        setAuthModalOpen(false);
        setAuthEmail("");
        setAuthPassword("");
        setWelcomeVisible(true);
        setTimeout(() => setWelcomeVisible(false), 4500);
      }
    }
    setAuthBusy(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setView("landing");
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
    ? chapters.find((c) => c.number === activeChapter)
    : null;

  function openChapter(num) {
    setActiveChapter(num);
    setPage(1);
    setView("reader");
    fetchChapterPages(num);
  }

  function nextPage() {
    if (!chapter) return;
    if (page < chapter.pages_count) {
      setPage(page + 1);
    } else {
      const idx = chapters.findIndex((c) => c.number === chapter.number);
      const nextCh = chapters[idx - 1]; // القائمة تنازلية
      if (nextCh) openChapter(nextCh.number);
    }
  }

  function prevPage() {
    if (!chapter) return;
    if (page > 1) {
      setPage(page - 1);
    } else {
      const idx = chapters.findIndex((c) => c.number === chapter.number);
      const prevCh = chapters[idx + 1];
      if (prevCh) {
        setActiveChapter(prevCh.number);
        setPage(prevCh.pages_count);
        fetchChapterPages(prevCh.number);
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
    <div dir="rtl" className="app" data-theme={theme}>
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
          --bg: #14100E; --bg-rgb: 20,16,14;
          --text: #EDE6D6; --text-rgb: 237,230,214;
          --muted: #8a8074; --soft: #cfc6b8;
          --accent: #B23A2E; --gold: #C9A227;
          --card-grad: linear-gradient(160deg, #3a1f1a 0%, #1c1210 55%, #12100e 100%);
          transition: background .35s ease, color .35s ease;
          font-family: 'Tajawal', sans-serif;
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          background-image:
            radial-gradient(circle at 1px 1px, rgba(var(--text-rgb),0.05) 1px, transparent 0);
          background-size: 18px 18px;
        }
        .app[data-theme="white"] {
          --bg: #F7F3EC; --bg-rgb: 247,243,236;
          --text: #241C17; --text-rgb: 36,28,23;
          --muted: #8d8275; --soft: #4a4038;
          --card-grad: linear-gradient(160deg, #efe6d8 0%, #e3d6c2 55%, #d8c7ae 100%);
        }
        .app[data-theme="blue"] {
          --bg: #0B1622; --bg-rgb: 11,22,34;
          --text: #E6F0FB; --text-rgb: 230,240,251;
          --muted: #7d93ad; --soft: #c2d3e6;
          --card-grad: linear-gradient(160deg, #14283d 0%, #0e1c2c 55%, #0b1622 100%);
        }
        .display { font-family: 'Lalezar', sans-serif; }

        /* ---------- منتقي الثيم ---------- */
        .seal-btn { display:flex; }
        .theme-picker { position: relative; }
        .palette-btn {
          display:flex; align-items:center; justify-content:center;
          width: 30px; height: 30px; border-radius: 50%; cursor:pointer;
          background: rgba(var(--text-rgb),0.08); border: 1px solid rgba(var(--text-rgb),0.18);
          color: var(--text);
        }
        .theme-dots {
          position: absolute; top: 120%; left: 0; z-index: 40;
          display:flex; gap: 10px; background: #14100E;
          border: 1px solid rgba(255,255,255,0.15); border-radius: 999px;
          padding: 9px; opacity:0; transform: translateY(-6px) scale(0.9); pointer-events:none;
          transition: opacity .22s ease, transform .22s ease;
        }
        .theme-dots.open { opacity:1; transform: translateY(0) scale(1); pointer-events:auto; }
        .theme-dot {
          width: 22px; height: 22px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.25);
          cursor:pointer; padding:0; transition: transform .15s ease, border-color .15s ease;
        }
        .theme-dot.active { border-color: #B23A2E; transform: scale(1.15); }
        .theme-dot:hover { transform: scale(1.1); }

        /* ---------- الشريط العلوي ---------- */
        .topbar {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; row-gap: 12px;
          padding: 14px 20px;
          border-bottom: 1px solid rgba(var(--text-rgb),0.12);
          position: sticky; top: 0; z-index: 20;
          background: rgba(var(--bg-rgb),0.92);
          backdrop-filter: blur(6px);
        }
        .brand { display:flex; align-items:center; gap:10px; }
        .seal-wrap { display:flex; align-items:center; gap:8px; }
        .seal-mark {
          background:#0c0a09; border-radius: 8px;
          display:flex; align-items:center; justify-content:center;
          font-family:'Lalezar'; color:#C1483A;
          box-shadow: 0 6px 16px rgba(178,58,46,0.28), 0 0 0 1px rgba(var(--text-rgb),0.08) inset;
        }
        .seal-label { font-family:'Lalezar'; font-size: 15px; color:var(--soft); }
        .brand-name { font-family:'Lalezar'; font-size: 22px; letter-spacing: 0.5px; }
        .icon-btn {
          display:flex; align-items:center; gap:6px;
          color:#C9A227; background:transparent; border:1px solid rgba(201,162,39,0.4);
          padding:8px 14px; border-radius: 999px; font-size:14px; cursor:pointer;
          transition: all .15s ease;
        }
        .icon-btn:hover { background: rgba(201,162,39,0.12); }
        .account-chip {
          display:flex; align-items:center; gap:6px;
          background: rgba(var(--text-rgb),0.08); border:1px solid rgba(var(--text-rgb),0.18);
          color: var(--text); padding: 7px 14px; border-radius: 999px; font-size:13px; cursor:pointer;
          font-family:'Tajawal';
        }
        .account-chip:hover { border-color: var(--accent); }

        /* ---------- نافذة تسجيل الدخول ---------- */
        @keyframes welcomeIn {
          from { opacity: 0; transform: translateY(-16px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .welcome-toast {
          position: fixed; top: 18px; left: 50%; transform: translateX(-50%);
          z-index: 200; max-width: 360px; width: calc(100% - 32px);
          border-radius: 12px; padding: 16px 18px; color: #fff;
          box-shadow: 0 14px 34px rgba(0,0,0,0.4);
          animation: welcomeIn 0.35s ease;
        }
        .welcome-toast.on-light { color: #1c1815; }
        .welcome-close {
          position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.15);
          border: none; border-radius: 50%; width: 22px; height: 22px;
          color: inherit; cursor: pointer; display:flex; align-items:center; justify-content:center;
        }
        .welcome-title { font-family:'Lalezar'; font-size: 18px; margin-bottom: 4px; }
        .welcome-text { font-size: 13px; opacity: 0.9; line-height: 1.7; }

        .auth-overlay {
          position: fixed; inset:0; z-index: 100; background: rgba(0,0,0,0.6);
          display:flex; align-items:center; justify-content:center; padding: 20px;
          backdrop-filter: blur(3px);
        }
        .auth-modal {
          background: var(--bg); border: 1px solid rgba(var(--text-rgb),0.15);
          border-radius: 14px; padding: 28px 24px; width: 100%; max-width: 360px;
          position: relative; box-shadow: 0 20px 50px rgba(0,0,0,0.5);
        }
        .auth-close {
          position:absolute; top:14px; left:14px; background:none; border:none;
          color: var(--muted); cursor:pointer;
        }
        .auth-title { font-family:'Lalezar'; font-size: 22px; margin: 0 0 16px; text-align:center; }
        .auth-tabs {
          display:flex; gap:6px; background: rgba(var(--text-rgb),0.06); border-radius: 999px;
          padding: 4px; margin-bottom: 18px;
        }
        .auth-tab {
          flex:1; background:none; border:none; padding: 8px; border-radius: 999px;
          color: var(--muted); font-family:'Tajawal'; font-size:13px; cursor:pointer;
        }
        .auth-tab.active { background: var(--accent); color:#fff; font-weight:700; }
        .auth-form { display:flex; flex-direction:column; gap:12px; }
        .auth-input {
          background: rgba(var(--text-rgb),0.06); border:1px solid rgba(var(--text-rgb),0.16);
          border-radius: 8px; padding: 11px 14px; color: var(--text); font-family:'Tajawal';
          font-size: 14px; outline:none;
        }
        .auth-input:focus { border-color: var(--accent); }
        .auth-password-wrap { position: relative; }
        .auth-password-wrap .auth-input { width: 100%; padding-left: 40px; }
        .auth-eye {
          position:absolute; left: 10px; top: 50%; transform: translateY(-50%);
          background:none; border:none; color: var(--muted); cursor:pointer; padding:4px;
        }
        .auth-error { color:#ff8a76; font-size:13px; text-align:center; }
        .auth-notice { color:#8fd19e; font-size:13px; text-align:center; }
        .auth-submit { justify-content:center; width:100%; }

        .account-card {
          max-width: 1000px; margin: 0 auto; padding: 0 24px 60px;
        }
        .account-row { display:flex; align-items:center; gap:12px; margin-bottom: 18px; }
        .avatar-upload {
          position: relative; width: 56px; height: 56px; border-radius: 50%; cursor:pointer;
          flex-shrink:0;
        }
        .avatar-img { width:100%; height:100%; border-radius:50%; object-fit:cover; }
        .avatar-fallback {
          width:100%; height:100%; border-radius:50%; background: rgba(var(--text-rgb),0.1);
          display:flex; align-items:center; justify-content:center; color: var(--muted);
        }
        .avatar-edit-badge {
          position:absolute; bottom:-2px; left:-2px; width:20px; height:20px; border-radius:50%;
          background: var(--accent); color:#fff; display:flex; align-items:center; justify-content:center;
          font-size:10px; border: 2px solid var(--bg);
        }
        .account-email { font-weight:700; font-size:15px; }
        .account-role { color: var(--muted); font-size:12px; margin-top:2px; }

        .account-centered {
          display:flex; flex-direction:column; align-items:center; text-align:center;
          padding: 20px 0 10px;
        }
        .avatar-upload-lg { width: 96px; height: 96px; margin-bottom: 16px; }
        .avatar-upload-lg .avatar-edit-badge {
          width:28px; height:28px; bottom:2px; left:2px;
        }
        .username-row { display:flex; align-items:center; gap:8px; }
        .username-row .account-email { font-size: 18px; }
        .icon-round-btn {
          width:26px; height:26px; border-radius:50%; display:flex; align-items:center; justify-content:center;
          background: rgba(var(--text-rgb),0.08); border:1px solid rgba(var(--text-rgb),0.16);
          color: var(--text); cursor:pointer; flex-shrink:0;
        }
        .icon-round-btn:hover { border-color: var(--accent); }
        .username-edit-row { display:flex; align-items:center; gap:8px; width:100%; max-width:280px; }
        .username-edit-input { text-align:center; }
        .account-signout { margin-top: 26px; }

        /* ---------- شريط علوي: تنقّل + تصنيفات + بحث ---------- */
        .nav-links { display:flex; align-items:center; gap: 22px; }
        .nav-link {
          background:none; border:none; color:#A79C8E; font-size:14px; cursor:pointer;
          font-family:'Tajawal'; font-weight: 500; padding: 4px 0; position:relative;
        }
        .nav-link.active { color:var(--text); font-weight:700; }
        .nav-link.active::after {
          content:""; position:absolute; bottom:-14px; right:0; left:0; height:2px; background:#B23A2E;
        }
        .search-box {
          display:flex; align-items:center; gap:8px;
          background: rgba(var(--text-rgb),0.06); border: 1px solid rgba(var(--text-rgb),0.14);
          border-radius: 999px; padding: 8px 14px; width: 100%;
        }
        .search-box input {
          background:none; border:none; outline:none; color:var(--text); font-family:'Tajawal';
          font-size: 13px; width: 100%; min-width: 0;
        }
        .search-box input::placeholder { color:var(--muted); }
        .explore-search-wrap { max-width: 1000px; margin: 0 auto; padding: 14px 24px 0; }

        /* ---------- صفحة الهبوط ---------- */
        .categories-row {
          display:flex; gap:8px; padding: 18px 24px 6px; max-width: 1000px; margin:0 auto;
          flex-wrap:wrap;
        }
        .cat-btn {
          font-size: 13px; padding: 7px 16px; border-radius: 999px; cursor:pointer;
          border: 1px solid rgba(var(--text-rgb),0.16); background: transparent; color:var(--soft);
          font-family:'Tajawal'; transition: all .15s ease;
        }
        .cat-btn.active { background:#B23A2E; border-color:#B23A2E; color:#fff; font-weight:700; }
        .cat-btn:hover:not(.active) { border-color: rgba(var(--text-rgb),0.35); }

        .section-title {
          max-width: 1000px; margin: 22px auto 14px; padding: 0 24px;
          display:flex; align-items:center; gap:10px;
        }
        .section-title h2 { font-family:'Lalezar'; font-size: 24px; margin:0; }
        .section-title .rule { flex:1; height:1px; background: rgba(var(--text-rgb),0.12); }

        .cards-grid {
          max-width: 1000px; margin: 0 auto; padding: 0 24px 60px;
          display:grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 20px;
        }
        .manga-card { cursor:pointer; }
        .card-cover {
          width:100%; aspect-ratio: 2/3; border-radius: 8px; position:relative; overflow:hidden;
          background-size: cover; background-position:center;
          box-shadow: 0 10px 24px rgba(0,0,0,0.45), 0 0 0 1px rgba(var(--text-rgb),0.08);
          transition: transform .15s ease;
        }
        .manga-card:hover .card-cover { transform: translateY(-3px); }
        .card-cover::after {
          content:""; position:absolute; inset:0;
          background: linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(12,10,9,0.9) 100%);
        }
        .new-tag {
          position:absolute; top:8px; left:8px; z-index:2;
          background:#C9A227; color:#1a1512; font-size:10px; font-weight:700;
          padding: 3px 9px; border-radius: 999px; font-family:'Tajawal';
        }
        .card-cover-title {
          position:absolute; bottom:10px; right:10px; left:10px; z-index:2;
          font-family:'Lalezar'; font-size: 17px; color:var(--text); line-height:1.2;
        }
        .card-meta { margin-top: 8px; font-size:12px; color:var(--muted); }
        .empty-state {
          max-width: 1000px; margin: 40px auto; padding: 0 24px; text-align:center; color:var(--muted);
        }

        /* ---------- الشاشة المتحركة (Hero Carousel) ---------- */
        .hero-carousel {
          position: relative; max-width: 1000px; margin: 18px auto 0; padding: 0 20px;
          height: 200px; border-radius: 14px; overflow: hidden;
          background: linear-gradient(135deg, #241512 0%, #12100e 70%);
          border: 1px solid rgba(var(--text-rgb),0.1);
          cursor: grab; user-select: none; touch-action: pan-y;
        }
        .hero-carousel:active { cursor: grabbing; }
        .hc-arrow {
          position:absolute; top:50%; transform: translateY(-50%); z-index:3;
          width:32px; height:32px; border-radius:50%; border:none; cursor:pointer;
          background: rgba(12,10,9,0.55); color:var(--text);
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
        .hc-desc { color:var(--soft); font-size: 13px; max-width: 480px; margin: 0 0 6px; }
        .hc-dots { position:absolute; bottom: 14px; right: 32px; display:flex; gap:6px; }
        .hc-dot {
          width: 7px; height: 7px; border-radius: 50%; background: rgba(var(--text-rgb),0.25);
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
            background: rgba(var(--bg-rgb),0.96); backdrop-filter: blur(10px);
            border-top: 1px solid rgba(var(--text-rgb),0.12);
            padding: 8px 6px calc(8px + env(safe-area-inset-bottom));
          }
          .bn-item {
            background:none; border:none; color:var(--muted); display:flex; flex-direction:column;
            align-items:center; gap:3px; font-size: 10px; font-family:'Tajawal'; cursor:pointer;
            padding: 4px 10px; flex:1;
          }
          .bn-item.active { color:var(--text); }
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
          box-shadow: 0 18px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(var(--text-rgb),0.08);
        }
        .cover::before {
          content:""; position:absolute; inset:0;
          background: linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(12,10,9,0.92) 100%);
        }
        .cover-title {
          position:absolute; bottom: 16px; right: 16px; left:16px;
          font-family:'Lalezar'; font-size: 26px; line-height: 1.25; color:var(--text);
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
        .synopsis { color:var(--soft); line-height: 1.9; font-size: 15px; max-width: 560px; margin-bottom: 20px;}
        .tags { display:flex; gap:8px; margin-bottom: 22px; flex-wrap:wrap; }
        .tag {
          font-size: 12px; padding: 5px 12px; border-radius: 999px;
          border: 1px solid rgba(var(--text-rgb),0.18); color:var(--soft);
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
          background:transparent; color:var(--text); border:1px solid rgba(var(--text-rgb),0.25);
          padding: 12px 22px; border-radius: 8px; font-size:15px; cursor:pointer;
        }
        .btn-fav {
          display:flex; align-items:center; gap:8px;
          background:transparent; color:var(--soft); border:1px solid rgba(var(--text-rgb),0.25);
          padding: 12px 18px; border-radius: 8px; font-size:14px; cursor:pointer;
          transition: all .15s ease;
        }
        .btn-fav:hover { border-color: rgba(178,58,46,0.5); }
        .btn-fav.active { background: rgba(178,58,46,0.14); border-color:#B23A2E; color:#ff8a76; }

        /* ---------- قائمة الفصول ---------- */
        .chapters-section { max-width: 1000px; margin: 0 auto; padding: 8px 24px 60px; }
        .section-head {
          display:flex; align-items:baseline; justify-content:space-between;
          margin-bottom: 14px; border-bottom: 1px solid rgba(var(--text-rgb),0.12); padding-bottom: 10px;
        }
        .section-head h2 { font-family:'Lalezar'; font-size: 22px; margin:0; }
        .section-head span { color:#A79C8E; font-size:13px; }
        .chapter-row {
          display:flex; align-items:center; gap: 16px;
          padding: 14px 10px; border-radius: 8px; cursor:pointer;
          border-bottom: 1px solid rgba(var(--text-rgb),0.06);
          transition: background .12s ease;
        }
        .chapter-row:hover { background: rgba(var(--text-rgb),0.05); }
        .chapter-num {
          font-family:'Lalezar'; font-size: 20px; color:#C9A227; width: 44px; text-align:center;
        }
        .chapter-info { flex:1; }
        .chapter-info .t { font-weight:700; font-size:15px; }
        .chapter-info .d { color:var(--muted); font-size:12px; margin-top:2px; }
        .chapter-arrow { color:var(--muted); }

        /* ---------- القارئ ---------- */
        .reader-bar {
          display:flex; align-items:center; justify-content:space-between;
          padding: 12px 20px; border-bottom: 1px solid rgba(var(--text-rgb),0.12);
          position: sticky; top:0; background: rgba(var(--bg-rgb),0.92); backdrop-filter: blur(6px);
          z-index: 20;
        }
        .reader-bar .ch-title { font-weight:700; font-size:14px; }
        .reader-bar .ch-sub { color:var(--muted); font-size:12px; }
        .back-link { display:flex; align-items:center; gap:6px; color:var(--soft); cursor:pointer; font-size:14px; background:none; border:none; }
        .page-counter { color:#C9A227; font-size:13px; font-variant-numeric: tabular-nums; }

        .reader-body { max-width: 620px; margin: 0 auto; padding: 28px 16px 10px; animation: viewFadeIn 0.22s ease; }
        .real-page {
          width: 100%; display:block; border-radius: 4px;
          border: 1px solid rgba(var(--text-rgb),0.12);
        }
        .manga-page {
          display:flex; gap: 4px; height: 640px; background:#0c0a09;
          border: 1px solid rgba(var(--text-rgb),0.12); border-radius: 4px; padding: 6px;
          position: relative;
        }
        .panel {
          position: relative; border: 2px solid var(--text); border-radius: 2px; overflow:hidden;
          display:flex; align-items:center; justify-content:center;
        }
        .panel-mark { font-family:'Lalezar'; font-size: 13px; color: rgba(var(--text-rgb),0.35); }
        .tone-a { background: repeating-radial-gradient(circle at 3px 3px, rgba(var(--text-rgb),0.5) 0 1.4px, transparent 1.5px 6px), #2b2521; }
        .tone-b { background: repeating-linear-gradient(0deg, rgba(var(--text-rgb),0.35) 0 1px, transparent 1px 5px), #201a17; }
        .tone-c { background: linear-gradient(160deg, #3a2420, #17110f); }
        .tone-d { background: repeating-radial-gradient(circle at 2px 2px, rgba(178,58,46,0.4) 0 1px, transparent 1.5px 7px), #1a1512; }
        .page-footer {
          position:absolute; bottom: 10px; left:0; right:0; text-align:center;
          font-size: 11px; color:var(--muted);
        }

        .nav-row {
          display:flex; align-items:center; justify-content:space-between;
          max-width: 620px; margin: 18px auto 60px; padding: 0 16px;
        }
        .nav-btn {
          display:flex; align-items:center; gap:8px; background: rgba(var(--text-rgb),0.06);
          border: 1px solid rgba(var(--text-rgb),0.14); color:var(--text); padding: 10px 18px;
          border-radius: 8px; cursor:pointer; font-size: 14px;
        }
        .nav-btn:disabled { opacity: 0.3; cursor: default; }
        .hint { text-align:center; color:var(--muted); font-size:12px; margin-bottom: 20px; }

        @media (max-width: 560px) {
          h1.title { font-size: 30px; }
          .hero { padding: 28px 16px; gap: 20px; }
          .cover { width: 150px; height: 210px; }
          .manga-page { height: 460px; }
        }
      `}</style>

      {/* ------- الشريط العلوي ------- */}
      <div className="topbar">
        <div className="brand">
          <div
            className="seal-btn"
            onClick={() => setView("landing")}
            style={{ cursor: "pointer" }}
          >
            <KagiSeal size={38} logoUrl={logoUrl} />
          </div>
          <div
            className="brand-name"
            onClick={() => setView("landing")}
            style={{ cursor: "pointer" }}
          >
            كاغي 影
          </div>
          <div className="theme-picker">
            <button
              className="palette-btn"
              onClick={() => setThemePickerOpen((o) => !o)}
              aria-label="تغيير ألوان الموقع"
              title="تغيير ألوان الموقع"
            >
              <Palette size={16} />
            </button>
            <div className={`theme-dots ${themePickerOpen ? "open" : ""}`}>
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  className={`theme-dot ${theme === t.id ? "active" : ""}`}
                  style={{ background: t.color }}
                  onClick={() => {
                    setTheme(t.id);
                    setThemePickerOpen(false);
                  }}
                  aria-label={`ثيم ${t.id}`}
                />
              ))}
            </div>
          </div>
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
            حسابي
          </button>
          {user ? (
            <button className="account-chip" onClick={() => setView("more")}>
              <User size={14} />
              {isAdmin ? "الأدمن" : user.email.split("@")[0]}
            </button>
          ) : (
            <button className="account-chip" onClick={() => setAuthModalOpen(true)}>
              <User size={14} /> تسجيل الدخول
            </button>
          )}
        </div>
      </div>

      {welcomeVisible && (
        <div
          className={`welcome-toast ${theme === "white" ? "on-light" : ""}`}
          style={{ background: THEMES.find((t) => t.id === theme)?.color }}
        >
          <button className="welcome-close" onClick={() => setWelcomeVisible(false)}>
            <X size={14} />
          </button>
          <div className="welcome-title">أهلاً بك 👋</div>
          <div className="welcome-text">
            {profile?.username ? `يا ${profile.username}, ` : ""}سعداء برجوعك لـ كاغي 影 — شكراً لك!
          </div>
        </div>
      )}

      {authModalOpen && (
        <div className="auth-overlay" onClick={() => setAuthModalOpen(false)}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <button className="auth-close" onClick={() => setAuthModalOpen(false)}>
              <X size={16} />
            </button>
            <h2 className="auth-title">{authMode === "login" ? "تسجيل الدخول" : "إنشاء حساب"}</h2>
            <div className="auth-tabs">
              <button
                className={`auth-tab ${authMode === "login" ? "active" : ""}`}
                onClick={() => { setAuthMode("login"); setAuthError(""); setAuthNotice(""); }}
              >
                دخول
              </button>
              <button
                className={`auth-tab ${authMode === "signup" ? "active" : ""}`}
                onClick={() => { setAuthMode("signup"); setAuthError(""); setAuthNotice(""); }}
              >
                حساب جديد
              </button>
            </div>
            <form onSubmit={handleAuthSubmit} className="auth-form">
              {authMode === "signup" && (
                <input
                  type="text"
                  required
                  minLength={3}
                  placeholder="اسم المستخدم (يظهر لباقي الأعضاء)"
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  className="auth-input"
                />
              )}
              <input
                type="email"
                required
                placeholder="الإيميل"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="auth-input"
              />
              <div className="auth-password-wrap">
                <input
                  type={showAuthPassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="كلمة المرور (6 أحرف على الأقل)"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="auth-input"
                />
                <button
                  type="button"
                  className="auth-eye"
                  onClick={() => setShowAuthPassword((s) => !s)}
                  aria-label={showAuthPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                >
                  {showAuthPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {authError && <div className="auth-error">{authError}</div>}
              {authNotice && <div className="auth-notice">{authNotice}</div>}
              <button className="btn-primary auth-submit" disabled={authBusy} type="submit">
                {authBusy ? "..." : authMode === "login" ? "دخول" : "إنشاء الحساب"}
              </button>
            </form>
          </div>
        </div>
      )}

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
                    mangaCoverUrl
                      ? { backgroundImage: `url(${mangaCoverUrl})` }
                      : { background: "var(--card-grad)" }
                  }
                >
                  <span className="new-tag">جديد</span>
                  <div className="card-cover-title">{m.title}</div>
                </div>
                <div className="card-meta">
                  {chapters.length > 0
                    ? `الفصل ${chapters[0].number} — ${chapters[0].release_date}`
                    : "لا توجد فصول بعد"}
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
              <Search size={14} color="var(--muted)" />
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
                      mangaCoverUrl
                        ? { backgroundImage: `url(${mangaCoverUrl})` }
                        : { background: "var(--card-grad)" }
                    }
                  >
                    <div className="card-cover-title">{m.title}</div>
                  </div>
                  <div className="card-meta">
                    {chapters.length > 0 ? `الفصل ${chapters[0].number} — ${chapters[0].release_date}` : "لا توجد فصول بعد"}
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
                mangaCoverUrl
                  ? { backgroundImage: `url(${mangaCoverUrl})` }
                  : { background: "var(--card-grad)" }
              }
            >
              <KagiSeal size={54} logoUrl={logoUrl} />
              <div className="cover-title">{MANGA.title}</div>
            </div>
            <div className="meta">
              <div className="kicker">
                <span className="dot" />
                {MANGA.status} — {chapters.length} فصل مترجم
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
                  disabled={chapters.length === 0}
                  onClick={() => openChapter(chapters[chapters.length - 1].number)}
                >
                  <BookOpen size={16} /> ابدأ من الفصل الأول
                </button>
                <button
                  className="btn-ghost"
                  disabled={chapters.length === 0}
                  onClick={() => openChapter(chapters[0].number)}
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
              <span>{chapters.length} فصل</span>
            </div>
            {chaptersLoading ? (
              <div className="empty-state">جاري تحميل الفصول...</div>
            ) : chapters.length === 0 ? (
              <div className="empty-state">
                ما فيه فصول مضافة بعد. {isAdmin && "أضفها من لوحة Supabase (جدول chapters)."}
              </div>
            ) : (
              chapters.map((c) => (
                <div className="chapter-row" key={c.number} onClick={() => openChapter(c.number)}>
                  <div className="chapter-num">{c.number}</div>
                  <div className="chapter-info">
                    <div className="t">{c.title}</div>
                    <div className="d">{c.pages_count} صفحات — {c.release_date}</div>
                  </div>
                  <ChevronLeft size={18} className="chapter-arrow" />
                </div>
              ))
            )}
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
            <div className="page-counter">{page} / {chapter.pages_count}</div>
          </div>

          <div className="reader-body" key={`${chapter.number}-${page}`}>
            {chapterPages.find((p) => p.page_number === page) ? (
              <img
                className="real-page"
                src={chapterPages.find((p) => p.page_number === page).image_url}
                alt={`صفحة ${page}`}
              />
            ) : (
              <MockPage chapterNum={chapter.number} pageNum={page} />
            )}
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
                      mangaCoverUrl
                        ? { backgroundImage: `url(${mangaCoverUrl})` }
                        : { background: "var(--card-grad)" }
                    }
                  >
                    <div className="card-cover-title">{m.title}</div>
                  </div>
                  <div className="card-meta">
                    {chapters.length > 0
                      ? `الفصل ${chapters[0].number} — ${chapters[0].release_date}`
                      : "لا توجد فصول بعد"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {view === "more" && (
        <>
          <div className="section-title" style={{ marginTop: 24 }}>
            <h2>حسابي</h2>
            <div className="rule" />
          </div>
          <div className="account-card">
            {user ? (
              <div className="account-centered">
                <label className="avatar-upload avatar-upload-lg">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="avatar-img" />
                  ) : (
                    <div className="avatar-fallback"><User size={36} /></div>
                  )}
                  <div className="avatar-edit-badge">
                    {avatarUploading ? "..." : <Camera size={14} />}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleAvatarUpload}
                    disabled={avatarUploading}
                  />
                </label>

                {editingUsername ? (
                  <div className="username-edit-row">
                    <input
                      className="auth-input username-edit-input"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      autoFocus
                    />
                    <button className="icon-round-btn" onClick={saveUsername} disabled={usernameSaving}>
                      <Check size={16} />
                    </button>
                    <button
                      className="icon-round-btn"
                      onClick={() => { setEditingUsername(false); setUsernameError(""); }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="username-row">
                    <div className="account-email">{profile?.username || user.email.split("@")[0]}</div>
                    <button
                      className="icon-round-btn"
                      onClick={() => {
                        setNewUsername(profile?.username || "");
                        setEditingUsername(true);
                      }}
                      aria-label="تعديل الاسم"
                    >
                      <Pencil size={14} />
                    </button>
                  </div>
                )}
                {usernameError && <div className="auth-error">{usernameError}</div>}

                <div className="account-role" style={{ marginTop: 4 }}>
                  {isAdmin ? "حساب الأدمن" : "قارئ"} — {user.email}
                </div>

                <button className="btn-ghost account-signout" onClick={handleSignOut}>
                  <LogOut size={16} /> تسجيل الخروج
                </button>
              </div>
            ) : (
              <>
                <p style={{ color: "var(--muted)", marginBottom: 14 }}>
                  سجّل دخول عشان تحفظ مفضلتك بشكل دائم.
                </p>
                <button className="btn-primary" onClick={() => setAuthModalOpen(true)}>
                  <User size={16} /> تسجيل الدخول
                </button>
              </>
            )}
          </div>
        </>
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
          <span>حسابي</span>
        </button>
      </div>
    </div>
  );
}
