import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Dialog } from "@headlessui/react";
import { useParams } from "react-router-dom";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import LoadingIcon from "../components/Other/LoadingIcon";
import { getFontSizeClass } from "../components/Other/SettingMenu";

const LessonDetail = ({ setting }) => {
  const [lesson, setLesson] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const textareaRef = useRef(null); 

    // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  // "create-question" | "create-parent-question" | "add-to-parent-question" | "edit-question" | "edit-parent-question-text" | "edit-question-in-parent-question"
  const [modalMode, setModalMode] = useState("create-question"); 
  const [editingQuestionId, setEditingQuestionId] = useState(null); 
  const [editingParentQuestionId, setEditingParentQuestionId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deletingQuestionId, setDeletingQuestionId] = useState(null);
  const [deletingQuestionInParentQuestionId, setDeletingQuestionInParentQuestionId] = useState(null);


  const [form, setForm] = useState({
    type: "fill-in",
    content: "",
    correctAnswers: [], // for fill-in and flashcard
    answers: [], // for multiple-choice: {answer, isCorrect}
    leftItems: [],
    rightItems: [],
    dragItems: [],
    distractors: [],
    timeLimit: 30,
    points: 1,
    parentText: "" // for parentQuestion
  });

    const resetForm = () => {
    setForm({
      type: "fill-in",
      content: "",
      correctAnswers: [],
      answers: [],
      leftItems: [],
      rightItems: [],
      dragItems: [],
      distractors: [],
      timeLimit: 30,
      points: 1,
      parentText: ""
    });
    setEditingQuestionId(null);
    setEditingParentQuestionId(null);
  };

  const openCreateQuestionModal = (parentQuestionId = null) => {
    resetForm();
    setModalMode(parentQuestionId ? "add-to-parent-question" : "create-question");
    setEditingParentQuestionId(parentQuestionId);
    setModalOpen(true);
  };

  const openEditQuestionModal = (q, questionId = null, parentQuestionId = null) => {
    // populate form from q
    setForm({
      type: q.type,
      content: q.content || "",
      correctAnswers: q.correctAnswers || [],
      answers: q.answers || [],
      leftItems: q.leftItems || [],
      rightItems: q.rightItems || [],
      dragItems: q.dragItems || [],
      distractors: q.distractors || [],
      timeLimit: q.timeLimit || 30,
      points: q.points || 1,
      parentText: ""
    });
    setEditingQuestionId(questionId);
    setEditingParentQuestionId(parentQuestionId);
    setModalMode(parentQuestionId ? "edit-question-in-parent-question" : "edit-question");
    setModalOpen(true);
  };

  const openCreateParentQuestionModal = () => {
    resetForm();
    setModalMode("create-parent-question");
    setModalOpen(true);
  };

  const openEditParentQuestionContentModal = (parentQuestionId, currentText = "") => {
    setForm(prev => ({ ...prev, parentText: currentText || "" }));
    setEditingParentQuestionId(parentQuestionId);
    setModalMode("edit-parent-question-text");
    setModalOpen(true);
  };

  const shuffleArray = (arr) => {
    const array = [...arr];
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const prepareQuestionForState = (q) => {
  const newQ = { ...q };

  if (q.type === "multiple-choice") {
    newQ.answers = shuffleArray(q.answers || []);
  } else if (q.type === "match") {
    // giữ leftItems nguyên, shuffle rightItems
    newQ.shuffledRightItems = shuffleArray(q.rightItems || []);
  } else if (q.type === "drag-drop") {
    // tạo shuffledDragOptions = shuffle(dragItems + distractors)
    const combined = [...(q.dragItems || []), ...(q.distractors || [])];
    newQ.shuffledDragOptions = shuffleArray(combined);
  }
  // fill-in và flashcard: giữ nguyên
  return newQ;
};

  // Create single question (POST /:id/:lessonId/question)
  const handleSubmitCreateQuestion = async () => {
    try {
      const payload = {
        type: form.type,
        content: form.content,
        correctAnswers: form.correctAnswers,
        answers: form.answers,
        leftItems: form.leftItems,
        rightItems: form.rightItems,
        dragItems: form.dragItems,
        distractors: form.distractors,
        timeLimit: form.timeLimit,
        points: form.points
      };
      const url = `http://localhost:5000/lesson/${userId}/${lessonId}/question`;
      const { data } = await axios.post(url, payload, { headers });
      
        // prepare question
      const newQ = prepareQuestionForState(data.question);

      // cập nhật lesson state
      setLesson(prev => ({
        ...prev,
        questions: [...prev.questions, newQ]
      }));

      setTotalQuestions(prev => prev + 1);

      setModalOpen(false);
    } catch (err) {
      console.error("Create question failed", err.response?.data || err);
      alert(err.response?.data?.message || "Create failed");
    }
  };

  // Create parentQuestion (POST /:id/:lessonId/parent-question)
  const handleSubmitCreateParentQuestion = async () => {
    try {
      // payload: text and optionally questions array (we just create with text)
      const url = `http://localhost:5000/lesson/${userId}/${lessonId}/parent-question`;
      const payload = { text: form.parentText, questions: [] };
      const { data } = await axios.post(url, payload, { headers });
      // not need to reload the current page
      location.reload();
      setModalOpen(false);
    } catch (err) {
      console.error("Create parent failed", err.response?.data || err);
      alert(err.response?.data?.message || "Create parent failed");
    }
  };

  // Add question to parent (POST /:id/:lessonId/:parentQuestionId)
  const handleSubmitAddToParentQuestion = async () => {
    try {
      const payload = {
        type: form.type,
        content: form.content,
        correctAnswers: form.correctAnswers,
        answers: form.answers,
        leftItems: form.leftItems,
        rightItems: form.rightItems,
        dragItems: form.dragItems,
        distractors: form.distractors,
        timeLimit: form.timeLimit,
        points: form.points
      };
      const url = `http://localhost:5000/lesson/${userId}/${lessonId}/${editingParentQuestionId}`;
      const { data } = await axios.post(url, payload, { headers });
      
      const newQ = prepareQuestionForState(data.question);

      setLesson(prev => ({
        ...prev,
        parentQuestions: prev.parentQuestions.map(pq =>
          pq._id === editingParentQuestionId
            ? { ...pq, questions: [...pq.questions, newQ] }
            : pq
        )
      }));

      setTotalQuestions(prev => prev + 1);


      setModalOpen(false);
    } catch (err) {
      console.error("Add to parent failed", err.response?.data || err);
      alert(err.response?.data?.message || "Add to parent failed");
    }
  };

  // Update question (PUT /:id/:lessonId/question/:questionId) - creates new version and replaces in lesson.questions
  const handleSubmitEditQuestion = async () => {
    try {
      const payload = {
        type: form.type,
        content: form.content,
        correctAnswers: form.correctAnswers,
        answers: form.answers,
        leftItems: form.leftItems,
        rightItems: form.rightItems,
        dragItems: form.dragItems,
        distractors: form.distractors,
        timeLimit: form.timeLimit,
        points: form.points
      };

      const url = `http://localhost:5000/lesson/${userId}/${lessonId}/question/${editingQuestionId}`;
      const { data } = await axios.put(url, payload, { headers });
      
      const updatedQ = prepareQuestionForState(data.newQuestion);

      setLesson(prev => ({
        ...prev,
        questions: prev.questions.map(q => 
          q._id === editingQuestionId ? updatedQ : q
        )
      }));

      setModalOpen(false);
    } catch (err) {
      console.error("Edit question failed", err.response?.data || err);
      alert(err.response?.data?.message || "Edit question failed");
    }
  };

  // Update question in parent (PUT /:id/:lessonId/:parentQuestionId/:questionId)
  const handleSubmitEditQuestionInParentQuestion = async () => {
    try {
      const payload = {
        type: form.type,
        content: form.content,
        correctAnswers: form.correctAnswers,
        answers: form.answers,
        leftItems: form.leftItems,
        rightItems: form.rightItems,
        dragItems: form.dragItems,
        distractors: form.distractors,
        timeLimit: form.timeLimit,
        points: form.points
      };
      const url = `http://localhost:5000/lesson/${userId}/${lessonId}/${editingParentQuestionId}/${editingQuestionId}`;
      const { data } = await axios.put(url, payload, { headers });
      
      const updatedQ = prepareQuestionForState(data.newQuestion);

      setLesson(prev => ({
        ...prev,
        parentQuestions: prev.parentQuestions.map(pq =>
          pq._id === editingParentQuestionId
            ? {
                ...pq,
                questions: pq.questions.map(q =>
                  q._id === editingQuestionId ? updatedQ : q
                ),
              }
            : pq
        ),
      }));


      setModalOpen(false);
    } catch (err) {
      console.error("Edit question in parent failed", err.response?.data || err);
      alert(err.response?.data?.message || "Edit in parent failed");
    }
  };

  // Remove question from parent (DELETE /:id/:lessonId/:parentQuestionId/:questionId)
  const handleDeleteQuestionInParentQuestion = async () => {
    try {
      await axios.delete(`http://localhost:5000/lesson/${userId}/${lessonId}/${deletingQuestionInParentQuestionId}/${deletingQuestionId}`, { headers });
      
      setLesson(prev => ({
        ...prev,
        parentQuestions: prev.parentQuestions.map(pq =>
          pq._id === deletingQuestionInParentQuestionId
            ? {
                ...pq,
                questions: pq.questions.filter(q => q._id !== deletingQuestionId),
              }
            : pq
        ),
      }));

      setTotalQuestions(prev => prev - 1);

      setShowConfirm(false);
      setDeletingQuestionId(null);
      setDeletingQuestionInParentQuestionId(null);

    } catch (err) {
      console.error("Remove from parent failed", err.response?.data || err);
    }
  };

  // Update content in parent (PATCH /:id/:lessonId/:parentQuestionId)
  const handleUpdateParentQuestionContent = async () => {
    try {
      const url = `http://localhost:5000/lesson/${userId}/${lessonId}/${editingParentQuestionId}`;
      const payload = { text: form.parentText };
      const { data } = await axios.patch(url, payload, { headers });
      
      const newVersion = {
        text: form.parentText,
        version: new Date().toISOString(),
      };

      // Thêm version mới vào mảng content
        setLesson(prev => ({
        ...prev,
        parentQuestions: prev.parentQuestions.map(pq =>
          pq._id === editingParentQuestionId
            ? {
                ...pq,
                content: [...(pq.content || []), newVersion],
              }
            : pq
        ),
      }));

      setModalOpen(false);
    } catch (err) {
      console.error("Update parent content failed", err.response?.data || err);
      alert(err.response?.data?.message || "Update parent failed");
    }
  };

  // Delete question (DELETE /:id/:lessonId/question/:questionId) - remove from lesson.questions
  const handleDeleteQuestion = async () => {
    try {
      await axios.delete(`http://localhost:5000/lesson/${userId}/${lessonId}/question/${deletingQuestionId}`, { headers });
      
      setLesson(prev => ({
        ...prev,
        questions: prev.questions.filter(q => q._id !== deletingQuestionId),
      }));

      setTotalQuestions(prev => prev - 1);


      setShowConfirm(false);
      setDeletingQuestionId(null);
      setDeletingQuestionInParentQuestionId(null);
    } catch (error) {
      console.error(error);
    }
  };


  const token = localStorage.getItem("token");
  const userId = token ? JSON.parse(atob(token.split(".")[1])).userId : null;
  const { lessonId } = useParams();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const [totalQuestions, setTotalQuestions] = useState(0);
  
  let questionCounter = 0; // Biến đếm toàn cục

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5000/lesson/${userId}/${lessonId}`,
          { headers }
        );
        setLesson(data);
        setTotalQuestions(
          data.questions.length +
            (data.parentQuestions?.reduce(
              (sum, pq) => sum + pq.questions.length,
              0
            ) || 0)
        );
      } catch (error) {
        console.error("Fetch lesson failed", error);
      }
    };
    if (userId && lessonId) fetchLesson();
  }, [lessonId, userId]);

  // Helpers
const renderFillIn = (q) => (
  <div className="flex mt-2 gap-2">
    <div
      className={`flex-1 h-12 rounded-2xl border flex items-center justify-center bg-white ${getFontSizeClass(
        setting.fontSize,
        "medium"
      )}`}
    >
      {showAnswer ? q.correctAnswers.join("・") : ""}
    </div>
  </div>
);

  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (!showAnswer) {
      setFlipped(false); 
    }
  }, [showAnswer]);


  const renderFlashcard = (q) => (
    <div
      className="relative mt-4 w-full h-28 [perspective:1000px]" // giảm chiều cao
      onClick={() => showAnswer && setFlipped((prev) => !prev)}
    >
      <div
        className={`${showAnswer ? "cursor-pointer" : ""} relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${
          flipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        {/* Mặt trước */}
        <div className="absolute w-full h-full rounded-2xl border border-black shadow-md bg-white flex items-center justify-center [backface-visibility:hidden]">
          <div className={`${getFontSizeClass(setting.fontSize, "medium")} font-bold`}>
            {q.content}
          </div>
        </div>

        {/* Mặt sau */}
        <div className="absolute w-full h-full rounded-2xl border border-black shadow-md bg-green-100 flex items-center justify-center [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <div className={`${getFontSizeClass(setting.fontSize, "medium")} text-blue-900 font-semibold`}>
            {q.correctAnswers.join("・")}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMultipleChoice = (q) => (
    <div className="mt-2 space-y-2">
      {q.answers.map((a, i) => (
        <div
          key={i}
          className={`flex items-center gap-2 p-2 rounded-2xl border ${
            showAnswer && a.isCorrect ? "bg-green-100 border-green-500" : "bg-white"
          }`}
        >
          <div
            className={`w-5 h-5 border rounded-full flex-shrink-0 flex items-center justify-center ${
              showAnswer && a.isCorrect ? "bg-green-500" : ""
            }`}
          >
            {showAnswer && a.isCorrect && <div className="w-2 h-2 bg-white rounded-full" />}
          </div>
          <span className={`${getFontSizeClass(setting.fontSize, "medium")}`}>{a.answer}</span>
        </div>
      ))}
    </div>
  );

const rowColors = [
  "bg-orange-200", 
  "bg-emerald-200", 
  "bg-yellow-200",    
  "bg-red-200",    
  "bg-purple-200",
];

const renderMatch = (q) => (
  <div
    className={`${getFontSizeClass(
      setting.fontSize,
      "medium"
    )} grid grid-cols-3 gap-4 mt-2`}
  >
    {/* Left column */}
    <div className="flex flex-col gap-1">
      {q.leftItems.map((item, i) => (
        <div
          key={i}
          className={`h-12 p-2 border flex items-center justify-center rounded-2xl ${
            rowColors[i % rowColors.length]
          }`}
        >
          {item}
        </div>
      ))}
    </div>

    {/* Middle column (user answer area) */}
    <div className="flex flex-col gap-1">
      {q.leftItems.map((_, i) => (
        <div
          key={i}
          className={`h-12 p-2 border flex items-center justify-center rounded-2xl ${
            rowColors[i % rowColors.length]
          } ${showAnswer ? `border-solid` : "border-dashed border-black"}`}
        >
          {/* Khi showAnswer thì show đáp án đúng (dựa vào q.rightItems gốc) */}
          {showAnswer ? q.rightItems[i] : ""}
        </div>
      ))}
    </div>

    {/* Right column (options để kéo hoặc click chọn) */}
    <div className="flex flex-col gap-1">
      {!showAnswer &&
        (q.shuffledRightItems || q.rightItems).map((item, i) => (
          <div
            key={i}
            className="h-12 p-2 border flex items-center justify-center bg-white rounded-2xl"
          >
            {item}
          </div>
        ))}
    </div>
  </div>
);

const renderDragDrop = (q) => {
  const parts = q.content.split("[drag-item]");
  return (
    <div className={`${getFontSizeClass(setting.fontSize, "medium")}`}>
      <div className="mt-2 flex flex-wrap gap-2 font-bold">
        {parts.map((part, i) => (
          <span key={i} className="inline-flex items-center gap-2">
            <span>{part}</span>
            {i < q.dragItems.length && (
              <div className="w-24 h-12 rounded-full bg-white border flex items-center justify-center border-dashed border-black">
                {showAnswer ? q.dragItems[i] : ""}
              </div>
            )}
          </span>
        ))}
      </div>

      {/* Drag options đã shuffle */}
      <div className="flex flex-wrap gap-5 mt-5 justify-center">
        {(q.shuffledDragOptions || [
          ...q.dragItems,
          ...(q.distractors || []),
        ]).map((item, i) => (
          <div
            key={i}
            className="p-2 border rounded-full bg-white flex items-center"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};



  if (!lesson) return <LoadingIcon setting={setting} />;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className={`text-2xl font-bold ${getFontSizeClass(setting.fontSize, "large")}`}>
          {lesson.name}
        </h2>
        <p className={`mt-2 text-gray-600 ${getFontSizeClass(setting.fontSize, "medium")}`}>
          {lesson.description}
        </p>
        <p className={`mt-2 text-gray-400 ${getFontSizeClass(setting.fontSize, "medium")}`}>
          ID: {lesson._id}
        </p>
        <div className={`mt-2 flex justify-end gap-3 ${getFontSizeClass(setting.fontSize, "medium")}`}>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-2xl"
            onClick={() => openCreateQuestionModal(null)}
          >
            + Create Question
          </button>
          <button className="px-4 py-2 bg-yellow-500 text-white rounded-2xl" onClick={openCreateParentQuestionModal}>
            + Create Parent Question
          </button>

          <button className="px-4 py-2 bg-blue-500 text-white rounded-2xl">Start Quiz</button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-2xl">Start Test</button>
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded-2xl"
            onClick={() => setShowAnswer((prev) => !prev)}
          >
            {showAnswer ? "Hide Answer" : "Show Answer"}
          </button>
        </div>
      </div>

{/* Hiển thị các câu hỏi độc lập */}
{lesson.questions.map((q) => {
  questionCounter++; // tăng khi gặp câu hỏi
  return (
    <div
      key={q._id}
      className={`p-4 bg-white rounded-2xl border border-black backdrop-blur-md shadow-md hover:bg-emerald-100 transition ${
        questionCounter !== totalQuestions ? "mb-4" : ""
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        {/* Bên trái: số thứ tự */}
        <div className={`${getFontSizeClass(setting.fontSize, "small")} text-gray-700`}>
          Question {questionCounter}/{totalQuestions}
        </div>

        {/* Bên phải: type | points | timelimit */}
        <div
          className={`flex items-center gap-2 ${getFontSizeClass(
            setting.fontSize,
            "small"
          )} text-gray-700`}
        >
          {q.type} | {q.points} pts | {q.timeLimit}s
          <button className="p-1 rounded-2xl text-gray-700 hover:bg-gray-200" onClick={() => openEditQuestionModal(q, q._id, null)}>
            <PencilIcon className="w-5 h-5" />
          </button>
          <button
            className="p-1 rounded-2xl text-gray-700 hover:bg-gray-200"
            onClick={() => {
              setDeletingQuestionId(q._id);
              setShowConfirm(true);
            }}
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Nội dung câu hỏi */}
      <div className={`${getFontSizeClass(setting.fontSize, "medium")} font-bold text-center`}>
        {q.type !== "flashcard" && q.type !== "drag-drop" ? q.content : ""}
      </div>

      {/* Question Body */}
      {q.type === "fill-in" && renderFillIn(q)}
      {q.type === "flashcard" && renderFlashcard(q)}
      {q.type === "multiple-choice" && renderMultipleChoice(q)}
      {q.type === "match" && renderMatch(q)}
      {q.type === "drag-drop" && renderDragDrop(q)}
    </div>
  );
})}

{/* Hiển thị parentQuestions */}
{lesson.parentQuestions?.map((pq) => {
  const latestContent = pq.content[pq.content.length - 1]?.text || "";

  return (
    <div key={pq._id} className="border-4 border-black rounded-3xl mb-4">
      <div className="flex justify-center gap-3 mt-2 mb-2">
        <button
          onClick={() => openCreateQuestionModal(pq._id)}
          className="px-4 py-2 bg-red-200 rounded-2xl text-black font-medium shadow-md hover:bg-red-300 hover:scale-105 transition"
        >
          ＋ Add Question
        </button>

        <button
          onClick={() =>
            openEditParentQuestionContentModal(
              pq._id,
              pq.content?.[pq.content.length - 1]?.text
            )
          }
          className="px-4 py-2 bg-red-200 rounded-2xl text-black font-medium shadow-md hover:bg-red-300 hover:scale-105 transition"
        >
          ✎ Edit Text
        </button>
      </div>


      {/* Context */}
      <div className={`${getFontSizeClass(setting.fontSize, "medium")} p-4 mb-4 bg-white rounded-2xl backdrop-blur-md shadow-md font-bold`}>
        {latestContent}
      </div>

     {/* Hiển thị các câu hỏi con */}
    {pq.questions.map((q, index) => {
      questionCounter++; // tăng tiếp
      const isLastInParent = index === pq.questions.length - 1;
      return (
        <div
          key={q._id}
          className={`p-4 bg-white rounded-2xl border border-black backdrop-blur-md shadow-md hover:bg-emerald-100 transition ${
            isLastInParent ? "" : "mb-4"
          }`}
        >
            {/* Header */}
            <div className="flex justify-between items-center">
              <div className={`${getFontSizeClass(setting.fontSize, "small")} text-gray-700`}>
                Question {questionCounter}/{totalQuestions}
              </div>

              <div
                className={`flex items-center gap-2 ${getFontSizeClass(
                  setting.fontSize,
                  "small"
                )} text-gray-700`}
              >
                {q.type} | {q.points} pts | {q.timeLimit}s
                <button className="p-1 rounded-2xl text-gray-700 hover:bg-gray-200" onClick={() => openEditQuestionModal(q, q._id, pq._id )}>
                  <PencilIcon className="w-5 h-5" />
                </button>

                <button
                  className="p-1 rounded-2xl text-gray-700 hover:bg-gray-200"
                  onClick={() => {
                    setDeletingQuestionId(q._id);
                    setDeletingQuestionInParentQuestionId(pq._id);
                    setShowConfirm(true);
                  }}
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Nội dung câu hỏi */}
            <div className={`${getFontSizeClass(setting.fontSize, "medium")} font-bold text-center`}>
              {q.type !== "flashcard" && q.type !== "drag-drop" ? q.content : ""}
            </div>

            {/* Question Body */}
            {q.type === "fill-in" && renderFillIn(q)}
            {q.type === "flashcard" && renderFlashcard(q)}
            {q.type === "multiple-choice" && renderMultipleChoice(q)}
            {q.type === "match" && renderMatch(q)}
            {q.type === "drag-drop" && renderDragDrop(q)}
          </div>
        );
      })}
    </div>
  );
})}

{/* ---------- Modal chung tạo / edit ---------- */}
<Dialog open={modalOpen} onClose={() => setModalOpen(false)} className="fixed z-20 inset-0 overflow-y-auto">
  <div className="flex items-center justify-center min-h-screen px-4">
    <Dialog.Panel className="w-full max-w-2xl bg-white p-6 rounded-2xl shadow-lg">
      <Dialog.Title className="text-lg font-bold mb-4">
        {modalMode === "create-question" && "Create Question"}
        {modalMode === "edit-question" && "Edit Question"}
        {modalMode === "create-parent-question" && "Create Parent Question"}
        {modalMode === "add-to-parent-question" && "Add Question to Parent Question"}
        {modalMode === "edit-question-in-parent-question" && "Edit Question in Parent Question"}
        {modalMode === "edit-parent-question-text" && "Edit Parent Question Text"}
      </Dialog.Title>

      {/* Parent content editor */}
      {(modalMode === "create-parent-question" || modalMode === "edit-parent-question-text") && (
        <>
          <textarea
            rows={4}
            value={form.parentText}
            onChange={(e) => setForm(prev => ({ ...prev, parentText: e.target.value }))}
            className="w-full p-2 border rounded-md mb-4"
          />
        </>
      )}

{/* Question Form */}
{(modalMode === "create-question" || modalMode === "add-to-parent-question" || modalMode === "edit-question" || modalMode === "edit-question-in-parent-question") && (
  <div className="space-y-4">
    {/* Type */}
    <div>
      <select
        value={form.type}
        onChange={e => setForm(prev => ({ ...prev, type: e.target.value }))}
        className="w-full p-2 border rounded-xl"
      >
        <option value="fill-in">Fill In</option>
        <option value="flashcard">Flashcard</option>
        <option value="multiple-choice">Multiple Choice</option>
        <option value="match">Match</option>
        <option value="drag-drop">Drag & Drop</option>
      </select>
    </div>

{/* Content */}
<div className="relative">
  <textarea
    rows={3}
    className="w-full p-2 border rounded-xl"
    value={form.content}
    onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))}
    ref={textareaRef}
  />
  {form.type === "drag-drop" && (
    <div className="mt-2 text-right">
      <button
        type="button"
        className="px-3 py-1 bg-blue-100 rounded-xl text-blue-700"
        onClick={() => {
          if (!textareaRef.current) return;
          const textarea = textareaRef.current;
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const newText = form.content.slice(0, start) + "[drag-item]" + form.content.slice(end);
          setForm(prev => ({ ...prev, content: newText }));

          // Move cursor after inserted text
          setTimeout(() => {
            textarea.focus();
            textarea.selectionStart = textarea.selectionEnd = start + "[drag-item]".length;
          }, 0);
        }}
      >
        INSERT
      </button>
    </div>
  )}
</div>

    {/* Fill In / Flashcard */}
    {(form.type === "fill-in" || form.type === "flashcard") && (
      <div>
        <label className="block text-sm font-semibold mb-2">CORRECT ANSWERS</label>
        {form.correctAnswers.map((ans, i) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <input
              className="flex-1 p-2 border rounded-xl"
              value={ans}
              onChange={e => {
                const newArr = [...form.correctAnswers];
                newArr[i] = e.target.value;
                setForm(prev => ({ ...prev, correctAnswers: newArr }));
              }}
            />
            <button
              onClick={() => setForm(prev => ({ ...prev, correctAnswers: prev.correctAnswers.filter((_, idx) => idx !== i) }))}
              className="px-2 py-1 bg-red-100 text-red-600 rounded-lg"
            >
              🗑
            </button>
          </div>
        ))}
        <button
          onClick={() => setForm(prev => ({ ...prev, correctAnswers: [...prev.correctAnswers, ""] }))}
          className="px-3 py-1 bg-blue-100 rounded-xl text-blue-700"
        >
          + Add
        </button>
      </div>
    )}

    {/* Multiple Choice */}
    {form.type === "multiple-choice" && (
      <div>
        <label className="block text-sm font-semibold mb-2">ANSWERS</label>
        {form.answers.map((a, i) => (
          <div key={i} className="flex items-center gap-3 mb-2">
            <input
              className="flex-1 p-2 border rounded-xl"
              value={a.answer}
              onChange={e => {
                const arr = [...form.answers];
                arr[i].answer = e.target.value;
                setForm(prev => ({ ...prev, answers: arr }));
              }}
            />
            <label className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={a.isCorrect}
                onChange={e => {
                  const arr = [...form.answers];
                  arr[i].isCorrect = e.target.checked;
                  setForm(prev => ({ ...prev, answers: arr }));
                }}
              />
              CORRECT
            </label>
            <button
              onClick={() => setForm(prev => ({ ...prev, answers: prev.answers.filter((_, idx) => idx !== i) }))}
              className="px-2 py-1 bg-red-100 text-red-600 rounded-lg"
            >
              🗑
            </button>
          </div>
        ))}
        <button
          onClick={() => setForm(prev => ({ ...prev, answers: [...prev.answers, { answer: "", isCorrect: false }] }))}
          className="px-3 py-1 bg-blue-100 rounded-xl text-blue-700"
        >
          + Add
        </button>
      </div>
    )}

    {/* Match */}
{form.type === "match" && (
  <div>
    <label className="block text-sm font-semibold mb-2">PAIRS</label>
    {form.leftItems.map((left, i) => (
      <div key={i} className="grid grid-cols-2 gap-2 mb-2 items-center">
        {/* Left */}
        <input
          className="p-2 border rounded-xl"
          value={left}
          placeholder="Left item"
          onChange={e => {
            const arr = [...form.leftItems];
            arr[i] = e.target.value;
            setForm(prev => ({ ...prev, leftItems: arr }));
          }}
        />

        {/* Right + Delete button */}
        <div className="flex gap-2">
          <input
            className="p-2 border rounded-xl flex-1"
            value={form.rightItems[i] || ""}
            placeholder="Right item"
            onChange={e => {
              const arr = [...form.rightItems];
              arr[i] = e.target.value;
              setForm(prev => ({ ...prev, rightItems: arr }));
            }}
          />


          <button
            className="px-2 py-1 bg-red-100 text-red-600 rounded-lg"
            onClick={() => {
              const leftArr = [...form.leftItems];
              const rightArr = [...form.rightItems];
              leftArr.splice(i, 1);
              rightArr.splice(i, 1);
              setForm(prev => ({
                ...prev,
                leftItems: leftArr,
                rightItems: rightArr
              }));
            }}
          >
            🗑
          </button>
        </div>
      </div>
    ))}

    {/* Add button */}
    <button
      type="button"
      onClick={() =>
        setForm(prev => ({
          ...prev,
          leftItems: [...prev.leftItems, ""],
          rightItems: [...prev.rightItems, ""]
        }))
      }
      className="px-3 py-1 bg-blue-100 rounded-xl text-blue-700"
    >
      + Add
    </button>
  </div>
)}


    {/* Drag & Drop */}
    {form.type === "drag-drop" && (
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-semibold mb-2">DRAG ITEMS</label>
          {form.dragItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <input
                className="flex-1 p-2 border rounded-xl"
                value={item}
                onChange={e => {
                  const arr = [...form.dragItems];
                  arr[i] = e.target.value;
                  setForm(prev => ({ ...prev, dragItems: arr }));
                }}
              />
              <button
                onClick={() => setForm(prev => ({ ...prev, dragItems: prev.dragItems.filter((_, idx) => idx !== i) }))}
                className="px-2 py-1 bg-red-100 text-red-600 rounded-lg"
              >
                🗑
              </button>
            </div>
          ))}
          <button
            onClick={() => setForm(prev => ({ ...prev, dragItems: [...prev.dragItems, ""] }))}
            className="px-3 py-1 bg-blue-100 rounded-xl text-blue-700"
          >
            + Add
          </button>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">DISTRACTORS</label>
          {form.distractors.map((item, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <input
                className="flex-1 p-2 border rounded-xl"
                value={item}
                onChange={e => {
                  const arr = [...form.distractors];
                  arr[i] = e.target.value;
                  setForm(prev => ({ ...prev, distractors: arr }));
                }}
              />
              <button
                onClick={() => setForm(prev => ({ ...prev, distractors: prev.distractors.filter((_, idx) => idx !== i) }))}
                className="px-2 py-1 bg-red-100 text-red-600 rounded-lg"
              >
                🗑
              </button>
            </div>
          ))}
          <button
            onClick={() => setForm(prev => ({ ...prev, distractors: [...prev.distractors, ""] }))}
            className="px-3 py-1 bg-blue-100 rounded-xl text-blue-700"
          >
            + Add
          </button>
        </div>
      </div>
    )}

    {/* Points & Time */}
    <div className="flex gap-3 mt-4">
      <div>
        <label className="block text-sm font-semibold">Points</label>
        <input
          type="number"
          min={0}
          value={form.points}
          onChange={e => setForm(prev => ({ ...prev, points: Number(e.target.value) }))}
          className="w-24 p-2 border rounded-xl"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold">Time Limit (s)</label>
        <input
          type="number"
          min={0}
          value={form.timeLimit}
          onChange={e => setForm(prev => ({ ...prev, timeLimit: Number(e.target.value) }))}
          className="w-24 p-2 border rounded-xl"
        />
      </div>
    </div>
  </div>
)}

      {/* Buttons */}
      <div className="mt-5 flex justify-end gap-3">
        <button className="px-4 py-2 bg-gray-200 rounded-2xl" onClick={() => { setModalOpen(false); resetForm(); }}>
          Cancel
        </button>

        {/* Choose action based on mode */}
        {modalMode === "create-question" && <button className="px-4 py-2 bg-green-600 text-white rounded-2xl" onClick={handleSubmitCreateQuestion}>Create</button>}
        {modalMode === "create-parent-question" && <button className="px-4 py-2 bg-green-600 text-white rounded-2xl" onClick={handleSubmitCreateParentQuestion}>Create</button>}
        {modalMode === "add-to-parent-question" && <button className="px-4 py-2 bg-green-600 text-white rounded-2xl" onClick={handleSubmitAddToParentQuestion}>Add</button>}
        {modalMode === "edit-question" && <button className="px-4 py-2 bg-blue-600 text-white rounded-2xl" onClick={handleSubmitEditQuestion}>Save</button>}
        {modalMode === "edit-question-in-parent-question" && <button className="px-4 py-2 bg-blue-600 text-white rounded-2xl" onClick={handleSubmitEditQuestionInParentQuestion}>Save</button>}
        {modalMode === "edit-parent-question-text" && <button className="px-4 py-2 bg-blue-600 text-white rounded-2xl" onClick={handleUpdateParentQuestionContent}>Save</button>}
      </div>
    </Dialog.Panel>
  </div>
</Dialog>


      {/* Modal Xác nhận xóa */}
      <Dialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        className="fixed z-10 inset-0 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen px-4">
          <Dialog.Panel className="bg-white p-6 rounded-2xl shadow-lg max-w-sm w-full">
            <Dialog.Title className="text-lg font-bold mb-4">Confirm Delete</Dialog.Title>
            <p className="mb-4">Are you sure you want to delete this question?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setDeletingQuestionId(null);
                  setDeletingQuestionInParentQuestionId(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-2xl"
                onClick={() => {
                  if (deletingQuestionInParentQuestionId) {
                    handleDeleteQuestionInParentQuestion();
                  } else {
                    handleDeleteQuestion();
                  }
                  setShowConfirm(false);
                }}

              >
                Delete
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>


    </div>
  );
};

export default LessonDetail;
