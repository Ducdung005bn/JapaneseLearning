import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingIcon from "../components/Other/LoadingIcon.jsx";
import { getFontSizeClass } from "../components/Other/SettingMenu.jsx";

export default function Lesson({ setting }) {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newLessonName, setNewLessonName] = useState("");
  const [newLessonDesc, setNewLessonDesc] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const userId = token ? JSON.parse(atob(token.split(".")[1])).userId : null;


  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchLessons = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/lesson/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setLessons(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [userId, token]);

  const handleCreateLesson = async () => {
    if (!newLessonName.trim()) return;
    try {
      const res = await axios.post(
        `http://localhost:5000/lesson/${userId}`,
        { name: newLessonName.trim(), description: newLessonDesc.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLessons(prev => [...prev, res.data.lesson]);
      setShowCreateModal(false);
      setNewLessonName("");
      setNewLessonDesc("");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LoadingIcon setting={setting} />;
  if (!token)
    return (
  <>
  </>
    );

  return (
    <div className="max-w-5xl mx-auto p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow"
        >
          + Create Lesson
        </button>
      </div>

{/* Lessons list */}
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
  {lessons.map((lesson) => (
    <div
      key={lesson._id}
      onClick={() => navigate(`/lesson/${lesson._id}`)}
      className="cursor-pointer p-6 bg-white rounded-2xl shadow-md hover:shadow-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-white transition-all duration-300 flex flex-col justify-between"
    >
      <div className="flex justify-between items-start">
        <h2 className="font-semibold text-lg text-gray-800 truncate">{lesson.name}</h2>
        <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
          {lesson.questionCount || 0} Q
        </span>
      </div>
      {lesson.description && (
        <p className="text-gray-500 mt-2 text-sm line-clamp-3">{lesson.description}</p>
      )}
      <p className="mt-4 text-gray-400 text-xs">Click to view details</p>
    </div>
  ))}
</div>


      {/* Create Lesson Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="relative bg-white p-6 rounded-xl shadow-lg z-10 w-96">
            <h2 className="font-bold text-lg mb-4">Create New Lesson</h2>
            <input
              type="text"
              placeholder="Lesson Name"
              value={newLessonName}
              onChange={e => setNewLessonName(e.target.value)}
              className="w-full p-2 border rounded mb-3 focus:outline-blue-400"
            />
            <textarea
              placeholder="Description (optional)"
              value={newLessonDesc}
              onChange={e => setNewLessonDesc(e.target.value)}
              className="w-full p-2 border rounded mb-3 focus:outline-blue-400"
              rows={3}
            />
            <div className="flex justify-end gap-3 mt-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateLesson}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
