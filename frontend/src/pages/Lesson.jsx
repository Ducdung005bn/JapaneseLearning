// src/pages/lesson.jsx
import { useEffect, useMemo, useState } from "react";
import { getFontSizeClass } from "../components/Other/SettingMenu.jsx";

export default function Lesson({ setting }) {
  // ---------- giả lập user ----------
  const [user, setUser] = useState({
    _id: "u1",
    fullName: "Demo User",
    selfStudyLessons: ["l1", "l2"],
    classes: [
      { class: "c1", role: "student" },
    ],
  });

  // ---------- giả lập lessons (Lesson documents) ----------
  const [lessons, setLessons] = useState([
    {
      _id: "l1",
      code: "LSS101",
      name: "Self Study: Kanji Basics 1",
      description: "First 50 kanji with examples",
      questions: [{}, {}, {}],
    },
    {
      _id: "l2",
      code: "LSS102",
      name: "Self Study: Kanji Basics 2",
      description: "Next 50 kanji",
      questions: [{}, {}],
    },
    {
      _id: "l3",
      code: "LSS201",
      name: "Grammar Mini Test",
      description: "Mini grammar drills",
      questions: [{}, {}, {}, {}, {}],
    },
  ]);

  // ---------- giả lập classes (Class documents) ----------
  const [classList, setClassList] = useState([
    {
      _id: "c1",
      code: "CABC01",
      name: "Japanese Beginners A",
      description: "Beginner class focusing on basics.",
      settings: { allowSelfJoin: true, requireApprovalOnJoin: false },
      pendingJoinRequests: [],
      lessons: ["l1", "l3"], // lesson ids
      announcements: [],
      createdAt: Date.now(),
    },
    {
      _id: "c2",
      code: "CBETA2",
      name: "Japanese Intermediate",
      description: "Grammar and composition practice.",
      settings: { allowSelfJoin: true, requireApprovalOnJoin: false },
      pendingJoinRequests: [],
      lessons: ["l2"],
      announcements: [],
      createdAt: Date.now(),
    },
    {
      _id: "c3",
      code: "CSECRET",
      name: "Private Teacher Class",
      description: "Only teacher can add students.",
      settings: { allowSelfJoin: false, requireApprovalOnJoin: true },
      pendingJoinRequests: [],
      lessons: [],
      announcements: [],
      createdAt: Date.now(),
    },
  ]);

  // ---------- UI state ----------
  const [keyword, setKeyword] = useState("");
  const [codeQuery, setCodeQuery] = useState("");
  const [searchingByCodeResult, setSearchingByCodeResult] = useState(null);
  const [keywordResults, setKeywordResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Create class modal full-screen
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create class form state (pre-populate defaults)
  const [newClassForm, setNewClassForm] = useState({
    code: "",
    name: "",
    description: "",
    allowSelfJoin: false,
    requireApprovalOnJoin: true,
    lessons: [], // lesson ids
  });

  // ---------- Derived lists ----------
  // Self-study lessons full objects for the user (preserve order)
  const userSelfStudyLessons = useMemo(
    () => lessons.filter((ls) => user.selfStudyLessons.includes(ls._id)),
    [lessons, user.selfStudyLessons]
  );

  // Classes that the user has already joined (with role)
  const userClassesFull = useMemo(() => {
    return user.classes
      .map((c) => {
        const cls = classList.find((cl) => cl._id === c.class);
        if (!cls) return null;
        return { ...cls, membershipRole: c.role };
      })
      .filter(Boolean);
  }, [user, classList]);

  // Helper: check if user is member of a class id
  const isUserInClass = (classId) => {
    return user.classes.some((c) => c.class === classId);
  };

  // ---------- Search handlers ----------
  // Search by code: exact match on class.code (case-insensitive but exact characters)
  const handleSearchByCode = () => {
    const q = (codeQuery || "").trim().toUpperCase();
    setSearchingByCodeResult(null);
    setKeywordResults([]);
    if (!q) return;
    setSearchLoading(true);
    setTimeout(() => {
      const found = classList.find((cl) => cl.code === q);
      setSearchingByCodeResult(found || null);
      setSearchLoading(false);
    }, 200);
  };

  // Search by keyword: fuzzy on code/name/description
  const handleSearchByKeyword = () => {
    const q = (keyword || "").trim().toLowerCase();
    setSearchingByCodeResult(null);
    setKeywordResults([]);
    if (!q) {
      setKeywordResults([]);
      return;
    }
    setSearchLoading(true);
    setTimeout(() => {
      const res = classList.filter((cl) => {
        return (
          (cl.code || "").toLowerCase().includes(q) ||
          (cl.name || "").toLowerCase().includes(q) ||
          (cl.description || "").toLowerCase().includes(q)
        );
      });
      setKeywordResults(res);
      setSearchLoading(false);
    }, 250);
  };

  // ---------- Join handler ----------
  const handleJoinClass = (clsId, message = "") => {
    const cls = classList.find((c) => c._id === clsId);
    if (!cls) {
      alert("Class not found.");
      return;
    }

    if (isUserInClass(clsId)) {
      alert("You already joined this class.");
      return;
    }

    // If allowSelfJoin && not requireApproval -> immediate join
    if (cls.settings.allowSelfJoin && !cls.settings.requireApprovalOnJoin) {
      // add to user.classes
      setUser((prev) => ({
        ...prev,
        classes: [...prev.classes, { class: clsId, role: "student" }],
      }));
      alert(`You joined ${cls.name}`);
    } else {
      // Add to pendingJoinRequests
      setClassList((prevList) =>
        prevList.map((c) =>
          c._id === clsId
            ? {
                ...c,
                pendingJoinRequests: [
                  ...(c.pendingJoinRequests || []),
                  { user: user._id, requestedAt: new Date(), message },
                ],
              }
            : c
        )
      );
      alert(`Join request sent to ${cls.name}`);
    }
  };

  // ---------- Create class handlers (modal) ----------
  useEffect(() => {
    // reset form when opening modal
    if (showCreateModal) {
      setNewClassForm({
        code: "",
        name: "",
        description: "",
        allowSelfJoin: false,
        requireApprovalOnJoin: true,
        lessons: [],
      });
    }
  }, [showCreateModal]);

  const handleCreateClassSubmit = (e) => {
    e.preventDefault();
    const name = (newClassForm.name || "").trim();
    if (!name) {
      alert("Class name is required.");
      return;
    }

    // Ensure code unique in local list; if empty -> generate
    let code = (newClassForm.code || "").trim().toUpperCase();
    if (!code) {
      do {
        code = genRandomCode("C");
      } while (classList.some((c) => c.code === code));
    } else {
      if (classList.some((c) => c.code === code)) {
        alert("Code already exists. Please choose another.");
        return;
      }
    }

    const newClass = {
      _id: "c" + (classList.length + 1) + "_" + Date.now(),
      code,
      name,
      description: newClassForm.description || "",
      settings: {
        allowSelfJoin: !!newClassForm.allowSelfJoin,
        requireApprovalOnJoin:
          newClassForm.requireApprovalOnJoin === undefined
            ? true
            : !!newClassForm.requireApprovalOnJoin,
      },
      pendingJoinRequests: [],
      lessons: [...(newClassForm.lessons || [])],
      announcements: [],
      createdAt: Date.now(),
    };

    // add class to classList and also add to user's classes as teacher
    setClassList((prev) => [newClass, ...prev]);
    setUser((prev) => ({
      ...prev,
      classes: [{ class: newClass._id, role: "teacher" }, ...prev.classes],
    }));

    setShowCreateModal(false);
    alert(`Class "${name}" created and you are the teacher.`);
  };

  // ---------- Utility: toggle lesson selection in create form ----------
  const toggleSelectLessonInForm = (lessonId) => {
    setNewClassForm((prev) => {
      const has = prev.lessons.includes(lessonId);
      return {
        ...prev,
        lessons: has ? prev.lessons.filter((l) => l !== lessonId) : [...prev.lessons, lessonId],
      };
    });
  };

  // ---------- Render UI ----------
  return (
    <div className="p-4 max-w-5xl mx-auto">
      {/* Top bar: search code | search keyword | create */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
        <div className="flex gap-2 w-full md:max-w-2xl">
          {/* CODE search (exact) */}
          <div className="flex gap-2 items-center w-full">
            <input
              placeholder="Search by CODE (exact, e.g. CABC01)"
              value={codeQuery}
              onChange={(e) => setCodeQuery(e.target.value)}
              className={`flex-1 px-3 py-2 rounded-lg border border-slate-300 focus:outline-none ${getFontSizeClass(
                setting.fontSize,
                "medium"
              )}`}
            />
            <button
              onClick={handleSearchByCode}
              className="px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              Find by Code
            </button>
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto items-center">
          {/* KEYWORD search */}
          <input
            placeholder="Search by keyword (name, description, code)"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className={`px-3 py-2 rounded-lg border border-slate-300 focus:outline-none ${getFontSizeClass(
              setting.fontSize,
              "medium"
            )} md:w-96`}
          />
          <button
            onClick={handleSearchByKeyword}
            className="px-3 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white"
          >
            Search
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
          >
            + Create Class
          </button>
        </div>
      </div>

      {/* Self-study lessons (user's) */}
      <section className="mb-6">
        <h3 className={`font-semibold mb-2 ${getFontSizeClass(setting.fontSize, "medium")}`}>
          Self-study Lessons
        </h3>
        {userSelfStudyLessons.length === 0 ? (
          <p className="text-slate-500">No self-study lessons.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {userSelfStudyLessons.map((ls) => (
              <div
                key={ls._id}
                className="grid grid-cols-4 gap-3 items-center p-3 rounded-xl bg-white/60 backdrop-blur shadow hover:bg-emerald-50 transition cursor-pointer"
                onClick={() => alert(`Open lesson ${ls.name}`)}
              >
                <div className="font-bold">{ls.code}</div>
                <div className={`${getFontSizeClass(setting.fontSize, "medium")}`}>{ls.name}</div>
                <div className="text-sm text-slate-600 truncate">{ls.description}</div>
                <div className="text-right">{(ls.questions || []).length} questions</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Your classes (joined) */}
      <section className="mb-6">
        <h3 className={`font-semibold mb-2 ${getFontSizeClass(setting.fontSize, "medium")}`}>Your Classes</h3>
        {userClassesFull.length === 0 ? (
          <p className="text-slate-500">You are not a member of any class yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {userClassesFull.map((cls) => (
              <div
                key={cls._id}
                className="grid grid-cols-6 gap-3 items-center p-3 rounded-xl bg-white/60 backdrop-blur shadow hover:bg-emerald-50 transition"
              >
                <div className="col-span-1 font-bold">{cls.code}</div>
                <div className="col-span-2">
                  <div className={`${getFontSizeClass(setting.fontSize, "medium")} font-semibold`}>{cls.name}</div>
                  <div className="text-sm text-slate-600 truncate">{cls.description}</div>
                </div>
                <div className="col-span-1">{(cls.lessons || []).length} lessons</div>
                <div className="col-span-1">Role: {cls.membershipRole}</div>
                <div className="col-span-1 flex gap-2 justify-end">
                  <button
                    onClick={() => alert(`View class ${cls.name}`)}
                    className="px-3 py-1 rounded-lg bg-emerald-500 text-white"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Search results area (distinct from Your Classes) */}
      <section className="mb-6">
        <h3 className={`font-semibold mb-2 ${getFontSizeClass(setting.fontSize, "medium")}`}>Search Results</h3>

        {searchLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-slate-600">Searching...</div>
          </div>
        ) : searchingByCodeResult ? (
          // exact code result (single)
          <div className="grid grid-cols-5 gap-3 p-3 rounded-xl bg-white/60 backdrop-blur shadow">
            <div className="font-bold">{searchingByCodeResult.code}</div>
            <div className={`${getFontSizeClass(setting.fontSize, "medium")} font-semibold`}>
              {searchingByCodeResult.name}
            </div>
            <div className="text-sm text-slate-600 truncate">{searchingByCodeResult.description}</div>
            <div>{(searchingByCodeResult.lessons || []).length} lessons</div>
            <div className="flex gap-2 justify-end">
              {isUserInClass(searchingByCodeResult._id) ? (
                <button
                  onClick={() => alert(`View class: ${searchingByCodeResult.name}`)}
                  className="px-3 py-1 rounded-lg bg-emerald-500 text-white"
                >
                  View
                </button>
              ) : (
                <button
                  onClick={() => {
                    // if require approval, ask for message
                    if (searchingByCodeResult.settings.requireApprovalOnJoin) {
                      const message = prompt("Optional message to teacher:");
                      handleJoinClass(searchingByCodeResult._id, message || "");
                    } else {
                      handleJoinClass(searchingByCodeResult._id);
                    }
                  }}
                  className="px-3 py-1 rounded-lg bg-orange-500 text-white"
                >
                  Join
                </button>
              )}
            </div>
          </div>
        ) : keywordResults.length > 0 ? (
          <div className="flex flex-col gap-2">
            {keywordResults.map((cls) => (
              <div
                key={cls._id}
                className="grid grid-cols-5 gap-3 p-3 rounded-xl bg-white/60 backdrop-blur shadow hover:bg-emerald-50 transition"
              >
                <div className="font-bold">{cls.code}</div>
                <div className={`${getFontSizeClass(setting.fontSize, "medium")} font-semibold`}>{cls.name}</div>
                <div className="text-sm text-slate-600 truncate">{cls.description}</div>
                <div>{(cls.lessons || []).length} lessons</div>
                <div className="flex gap-2 justify-end">
                  {isUserInClass(cls._id) ? (
                    <button
                      onClick={() => alert(`View class: ${cls.name}`)}
                      className="px-3 py-1 rounded-lg bg-emerald-500 text-white"
                    >
                      View
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (cls.settings.requireApprovalOnJoin) {
                          const message = prompt("Optional message to teacher:");
                          handleJoinClass(cls._id, message || "");
                        } else {
                          handleJoinClass(cls._id);
                        }
                      }}
                      className="px-3 py-1 rounded-lg bg-orange-500 text-white"
                    >
                      Join
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500">No search results.</p>
        )}
      </section>

      {/* Create Class Modal (full screen) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white w-full h-full md:w-3/4 md:h-5/6 rounded-none md:rounded-xl overflow-auto p-6 relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute right-4 top-4 px-3 py-1 rounded bg-slate-200 hover:bg-slate-300"
            >
              ✕
            </button>
            <h2 className={`text-2xl font-bold mb-4 ${getFontSizeClass(setting.fontSize, "medium")}`}>
              Create Class
            </h2>

            <form onSubmit={handleCreateClassSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Class Name *</span>
                  <input
                    value={newClassForm.name}
                    onChange={(e) => setNewClassForm((p) => ({ ...p, name: e.target.value }))}
                    className={`px-3 py-2 rounded border border-slate-300 ${getFontSizeClass(
                      setting.fontSize,
                      "medium"
                    )}`}
                    required
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Code (optional, auto-generate if blank)</span>
                  <input
                    value={newClassForm.code}
                    onChange={(e) =>
                      setNewClassForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))
                    }
                    className={`px-3 py-2 rounded border border-slate-300 ${getFontSizeClass(
                      setting.fontSize,
                      "medium"
                    )}`}
                  />
                </label>
              </div>

              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">Description</span>
                <textarea
                  value={newClassForm.description}
                  onChange={(e) => setNewClassForm((p) => ({ ...p, description: e.target.value }))}
                  className={`px-3 py-2 rounded border border-slate-300 ${getFontSizeClass(
                    setting.fontSize,
                    "medium"
                  )}`}
                  rows={4}
                  maxLength={300}
                />
                <div className="text-xs text-slate-400">{newClassForm.description.length}/300</div>
              </label>

              <div className="flex gap-4 items-center">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newClassForm.allowSelfJoin}
                    onChange={(e) => setNewClassForm((p) => ({ ...p, allowSelfJoin: e.target.checked }))}
                  />
                  <span className="text-sm">Allow self-join</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newClassForm.requireApprovalOnJoin}
                    onChange={(e) =>
                      setNewClassForm((p) => ({ ...p, requireApprovalOnJoin: e.target.checked }))
                    }
                  />
                  <span className="text-sm">Require approval on join</span>
                </label>
              </div>

              <div>
                <div className="text-sm font-medium mb-2">Select lessons to include in this class</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {lessons.map((ls) => (
                    <label
                      key={ls._id}
                      className="flex items-center gap-2 p-2 border border-slate-200 rounded hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={newClassForm.lessons.includes(ls._id)}
                        onChange={() => toggleSelectLessonInForm(ls._id)}
                      />
                      <div>
                        <div className="font-semibold">{ls.name}</div>
                        <div className="text-sm text-slate-600">{ls.code} • {(ls.questions || []).length} Q</div>
                      </div>
                    </label>
                  ))}
                  {lessons.length === 0 && <div className="text-slate-500">No lessons available</div>}
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded bg-slate-200 hover:bg-slate-300"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
                  Create & Become Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
