import HomePg from "./pages/HomePg.jsx";
import Vocabulary from "./pages/Vocabulary.jsx";
import Kanji from "./pages/Kanji.jsx";
import KanjiDetail from "./pages/KanjiDetail.jsx";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SettingMenu, {getFontSizeClass} from "/src/components/Other/SettingMenu.jsx";
import AuthModal from "./pages/AuthModal.jsx";
import {BrowserRouter as Router, Routes, Route, Link, useLocation} from "react-router-dom";
import {
  Home,
  BookOpenText,
  Languages,
  PenLine,
  NotebookText,
  Users,
  Wrench,
  Info,
  ChevronRight,
  ChevronLeft,
  Sparkles,
} from "lucide-react";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [authModal, setAuthModal] = useState(null); // "login" | "register" | null


  //for SettingMenu
  const [setting, setSetting] = useState({
    fontSize: "medium"
  });

  const handleSuccess = (data) => {
    console.log("User logged in / registered:", data);
  };

  const PAGES = [
    { key: "Home", icon: Home, path: "/", element: <HomePg /> },
    { key: "Vocabulary", icon: BookOpenText, path: "/vocabulary", element: <Vocabulary /> },
    { key: "Kanji", icon: Languages, path: "/kanji", element: <Kanji setting={setting}/> },
    { key: "Lesson", icon: PenLine },
    { key: "Note", icon: NotebookText },
    { key: "Community", icon: Users },
    { key: "Function", icon: Wrench },
    { key: "Information", icon: Info },

  ];

  const location = useLocation(); 
  const active = useMemo(() => {
    if (location.pathname === "/") return "Home";

    // các path khác match cả dynamic route
    const page = PAGES.find(p => location.pathname.startsWith(p.path) && p.path !== "/");
    return page ? page.key : "";
  }, [location.pathname]);



  return (
      <div className={"min-h-screen w-full bg-gradient-to-b from-green-50 via-white to-green-50 transition-colors"}>
        {/* Background gradient */}
        <div className="min-h-screen w-full bg-green-200 transition-colors">
          {/* Top bar */}
          <header className="sticky top-0 z-30 backdrop-blur-xl supports-[backdrop-filter]:bg-white/40 bg-white/50 border-white/40">
            <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                  <div className="relative">
                    <Sparkles className="absolute -top-2 -right-2 h-4 w-4 text-fuchsia-500" />
                    <div className="h-9 w-9 grid place-content-center rounded-2xl bg-gradient-to-br from-red-300 via-red-400 to-rose-300 text-white shadow-lg shadow-red-300/30">
                      あ
                    </div>
                  </div>
                </motion.div>
                <div>
                  <p className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-600 via-rose-600 to-amber-500">Japanese Learning</p>
                  <h1 className="text-sm uppercase tracking-widest text-slate-600">
                    STUDY SUITE
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSidebarOpen((s) => !s)}
                  className={`inline-flex items-center gap-2 rounded-2xl px-3 py-2 ${getFontSizeClass(setting.fontSize, "medium")} font-medium border border-white/40 bg-white/60 hover:bg-white/80 transition shadow-sm`}
                  aria-label="Toggle sidebar"
                >
                  {sidebarOpen ? (
                    <>
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline">Collapse</span>
                    </>
                  ) : (
                    <>
                      <ChevronRight className="h-4 w-4" />
                      <span className="hidden sm:inline">Expand</span>
                    </>
                  )}
                </button>

                <SettingMenu onChange={(s) => setSetting(s)} setting={setting} />

                 {/* nút đăng nhập / đăng ký */}
                <button
                  onClick={() => setAuthModal("login")}
                  className="px-3 py-2 bg-red-200 text-black rounded-2xl"
                >
                  Login
                </button>
                <button
                  onClick={() => setAuthModal("register")}
                  className="px-3 py-2 bg-red-200 text-black rounded-2xl"
                >
                  Register
                </button>

              </div>
            </div>
          </header>

          {/* Layout */}
          <main className="mx-auto max-w-7xl px-2 sm:px-3 lg:px-4 py-3">
            <div
              className={`grid grid-cols-1 md:gap-3 ${ sidebarOpen ? "md:grid-cols-[auto,1fr]" : "md:grid-cols-1" } gap-2`}
            >
              {/* Sidebar */}
<AnimatePresence initial={false}>
  {sidebarOpen && (
    <motion.aside
      key="sidebar"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -20, opacity: 0 }}
      transition={{ type: "tween", duration: 0, ease: "easeOut" }}
      className="md:sticky md:top-24 h-max"
    >
      <div
        className={`w-full ${getFontSizeClass(
          setting.fontSize,
          "medium"
        )} md:w-56 rounded-3xl border border-slate-200/60 bg-slate-50/70 backdrop-blur-xl shadow-xl shadow-slate-300/20`}
      >
        <div className="p-3 sm:p-4">
          <nav className="mt-3 sm:mt-4 flex flex-col gap-2">
            {PAGES.map(({ key, icon: Icon, path }) => {
              const selected = key === active;
              return (
                <Link key={key} to={path}>
                  <motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActive(key)}
                    className={[
                      "group w-full text-left rounded-2xl px-3 py-3 sm:px-4 sm:py-3.5 border transition",
                      selected
                        ? "border-red-300/60 bg-gradient-to-r from-red-200/70 via-red-300/70 to-rose-200/70 shadow-lg shadow-red-300/20"
                        : "border-white/50 bg-white/60 hover:border-red-300/60 hover:bg-white/80",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={[
                          "grid place-content-center rounded-2xl p-2 border",
                          selected
                            ? "border-red-300/60 bg-white/70"
                            : "border-grey/300 bg-white/60 group-hover:border-red-300/60",
                        ].join(" ")}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold tracking-wide text-slate-800">
                            {key}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </motion.aside>
  )}
</AnimatePresence>


              {/* Content area placeholder (not implemented) */}
              <div className="max-w-6xl mx-auto">
                <Routes>
                  {
                    PAGES.map(({path, element}) => (
                      <Route key={path} path={path} element={element} Route/>
                    ))
                  }
                  <Route path="*" element={<HomePg />} />
                  <Route path="kanji/:character" element={<KanjiDetail setting={setting} />} />
                  <Route path="*" element={<p>Page not found</p>} />

                </Routes>
              
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className={`py-8 text-center ${getFontSizeClass(setting.fontSize, "medium")} text-slate-600/80`}>
            If you have any questions, suggestions, or feedback, please feel free to contact me at 23020655@vnu.edu.vn.
          </footer>

          {/* hiển thị modal */}
          {authModal && (
            <AuthModal
              mode={authModal}
              onClose={() => setAuthModal(null)}
              onSuccess={handleSuccess}
            />
          )}
        </div>
      </div>
  );

}


