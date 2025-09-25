import { useState, useEffect } from "react";
import FillIn from "../Lesson/FillIn";
import Flashcard from "../Lesson/Flashcard";
import Match from "../Lesson/Match";
import MultipleChoice from "../Lesson/MultipleChoice";
import axios from "axios";
import { getFontSizeClass } from "../Other/SettingMenu";
import LoadingIcon from "../Other/LoadingIcon";

const QuizModal = ({ isOpen, onClose, vocabularyId, setting }) => {
  const [selectedType, setSelectedType] = useState(null);
  const [questionsCache, setQuestionsCache] = useState({});
  const [loading, setLoading] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [selectedLessonId, setSelectedLessonId] = useState(null);

  const token = localStorage.getItem("token");
  const userId = token ? JSON.parse(atob(token.split(".")[1])).userId : null;

  useEffect(() => {
    if (userId) {
      axios
        .get(`http://localhost:5000/lesson/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setLessons(res.data);
          if (res.data.length > 0) setSelectedLessonId(res.data[0]._id);
        })
        .catch((err) => console.error(err));
    }
  }, [userId]);

  if (!isOpen || !userId) return null;

  const handleSelectType = async (type) => {
    setSelectedType(type);
    setShowAnswer(false);

    if (questionsCache[type]) return;

    try {
      setLoading(true);
      const quizRes = await axios.get(
        `http://localhost:5000/vocabulary/${userId}/${vocabularyId}/${type}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuestionsCache((prev) => ({ ...prev, [type]: quizRes.data }));
    } catch (err) {
      console.error("Fetch quiz error:", err);
    } finally {
      setLoading(false);
    }
  };

  const questions = questionsCache[selectedType]?.questions || questionsCache[selectedType];

  const handleAddQuestionToLesson = (question) => {
    console.log("Add question to lesson:", selectedLessonId, question);
    // TODO: gọi API để thêm question vào lesson
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-2xl p-4 w-[1000px] h-[600px] shadow-lg overflow-y-auto overflow-x-hidden">
        <div className="flex justify-end items-center mb-4">
          <button onClick={onClose} className="text-gray-500 hover:text-black text-3xl">
            ✕
          </button>
        </div>

        {/* Nút chọn loại câu hỏi */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {["fill-in", "flashcard", "multiple-choice", "match"].map((type) => {
            let displayName = "";
            if (type === "fill-in") displayName = "Fill In";
            else if (type === "flashcard") displayName = "Flashcard";
            else if (type === "multiple-choice") displayName = "Multiple Choice";
            else if (type === "match") displayName = "Match";

            return (
              <button
                key={type}
                onClick={() => handleSelectType(type)}
                className={`px-3 py-1 rounded-full border ${
                  selectedType === type ? "bg-blue-500 text-white" : "bg-white"
                }`}
              >
                {displayName}
              </button>
            );
          })}
        </div>

        {/* Nút show/hide answer */}
        {selectedType && (
          <button
            onClick={() => setShowAnswer((prev) => !prev)}
            className="px-3 py-1 mb-4 rounded-full border bg-gray-100 hover:bg-gray-200"
          >
            {showAnswer ? "Hide Answer" : "Show Answer"}
          </button>
        )}

        {/* Nội dung câu hỏi */}
        {loading && <LoadingIcon setting={setting}/>}
        {!loading && selectedType && questions && questions.length > 0 && (
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-black bg-white hover:bg-green-100 transition-colors relative border"
              >
                {/* Header thẻ */}
                <div className="flex gap-x-5 items-center mb-2">
                  {/* Dropdown chọn lesson */}
                  <select
                    value={selectedLessonId}
                    onChange={(e) => setSelectedLessonId(e.target.value)}
                    className="border px-2 py-1 rounded"
                  >
                    {lessons.map((lesson) => (
                      <option key={lesson._id} value={lesson._id}>
                        {lesson.name}
                      </option>
                    ))}
                  </select>

                  {/* Nút Add */}
                  <button
                    onClick={() => handleAddQuestionToLesson(q)}
                    className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Add
                  </button>
                </div>

                {/* Nội dung câu hỏi */}
                <div
                  className={`${getFontSizeClass(setting.fontSize, "medium")} font-bold text-center`}
                >
                  {q.type !== "flashcard" && q.type !== "drag-drop" ? q.content : ""}
                </div>

                {selectedType === "fill-in" && <FillIn q={q} showAnswer={showAnswer} setting={setting} />}
                {selectedType === "flashcard" && <Flashcard q={q} showAnswer={showAnswer} setting={setting} />}
                {selectedType === "multiple-choice" && (
                  <MultipleChoice q={q} showAnswer={showAnswer} setting={setting} />
                )}
                {selectedType === "match" && <Match q={q} showAnswer={showAnswer} setting={setting} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizModal;
