import User from "../models/user.model.js";
import Lesson from "../models/lesson.model.js";
import { Question, ParentQuestion } from "../models/question.model.js";
import mongoose from "mongoose";

// Create a lesson for a specific user
export const createLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Lesson name cannot be empty." });
    }

    const lesson = await Lesson.create({ name: name.trim(), description: description?.trim() });

    await User.findByIdAndUpdate(id, {
      $push: { lessons: { lessonId: lesson._id, history: [] } }
    });

    res.status(201).json({ message: "Lesson created successfully", lesson });
  } catch (error) {
    console.error("createLesson error:", error);
    res.status(500).json({ message: "Failed to create lesson" });
  }
};

// Get all lessons for a user
export const getLessons = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).populate("lessons.lessonId");

    if (!user) return res.status(404).json({ message: "User not found" });

    const lessons = user.lessons.map(l => ({
      _id: l.lessonId._id,
      name: l.lessonId.name,
      description: l.lessonId.description,
      questionCount: l.lessonId.questions.length
    }));

    res.json(lessons);
  } catch (error) {
    console.error("getLessons error:", error);
    res.status(500).json({ message: "Failed to fetch lessons" });
  }
};

// Get single lesson with full data (questions, shuffleQuestions)
export const getLessonById = async (req, res) => {
  try {
    const { lessonId, id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const hasLesson = user.lessons.some(l => l.lessonId.toString() === lessonId);
    if (!hasLesson) return res.status(403).json({ message: "Lesson not owned by this user" });

    const lesson = await Lesson.findById(lessonId).populate("questions");
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    res.json(lesson);
  } catch (error) {
    console.error("getLessonById error:", error);
    res.status(500).json({ message: "Failed to fetch lesson" });
  }
};

// Create parentQuestion (có thể chứa nhiều questions)
export const createParentQuestion = async (req, res) => {
  try {
    const { lessonId, id } = req.params;
    const { text, questions } = req.body; //

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Parent question text is required." });
    }

    // Kiểm tra lesson có thuộc user không
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const hasLesson = user.lessons.some(l => l.lessonId.toString() === lessonId);
    if (!hasLesson)
      return res.status(403).json({ message: "Lesson not owned by this user" });

    // lưu text thành content dạng mảng
    const parentQuestion = new ParentQuestion({ 
      content: [{ text: text.trim(), version: Date.now() }], 
      questions: [] 
    });

    if (Array.isArray(questions) && questions.length > 0) {
      for (const q of questions) {
        const validationError = validateQuestion(q);
        if (validationError) {
            return res.status(400).json({ message: validationError.message });
        }

        const question = await Question.create({
          type: q.type,
          content: q.content.trim(),
          correctAnswers: q.correctAnswers,
          answers: q.answers,
          leftItems: q.leftItems,
          rightItems: q.rightItems,
          dragItems: q.dragItems,
          distractors: q.distractors,
          explanation: q.explanation,
          timeLimit: q.timeLimit,
          points: q.points
        });

        parentQuestion.questions.push(question._id);
      }
    }

    await parentQuestion.save();

    await Lesson.findByIdAndUpdate(lessonId, {
        $push: { parentQuestions: parentQuestion._id }
    });

    res.status(201).json({
      message: "Parent question created successfully",
      parentQuestion
    });
  } catch (error) {
    console.error("createParentQuestion error:", error);
    res.status(500).json({ message: "Failed to create parent question" });
  }
};


// Create single question
export const createQuestion = async (req, res) => {
  try {
    const { lessonId, id } = req.params;
    const {
      type,
      content,
      correctAnswers,
      answers,
      leftItems, rightItems,
      dragItems, distractors,
      explanation,
      timeLimit,
      points
    } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const hasLesson = user.lessons.some(l => l.lessonId.toString() === lessonId);
    if (!hasLesson)
      return res.status(403).json({ message: "Lesson not owned by this user" });

    const validationError = validateQuestion(req.body);
    if (validationError) {
        return res.status(400).json({ message: validationError.message });
    }

    const question = await Question.create({
      type,
      content: content.trim(),
      correctAnswers,
      answers,
      leftItems, rightItems,
      dragItems, distractors,
      explanation,
      timeLimit,
      points
    });

    await Lesson.findByIdAndUpdate(lessonId, {
      $push: { questions: question._id }
    });

    res.status(201).json({ message: "Question created successfully", question });
  } catch (error) {
    console.error("createQuestion error:", error);
    res.status(500).json({ message: "Failed to create question" });
  }
};

function validateQuestion({
  type,
  content,
  correctAnswers,
  answers,
  leftItems, rightItems,
  dragItems, distractors
}) {
  const validTypes = ["fill-in", "flashcard", "multiple-choice", "match", "drag-drop"];
  if (!type || !validTypes.includes(type)) {
    return { valid: false, message: `Question type must be one of: ${validTypes.join(", ")}` };
  }

  if (!content || !content.trim()) {
    return { valid: false, message: "Question content is required." };
  }

  if (type === "fill-in" || type === "flashcard") {
    if (!Array.isArray(correctAnswers) || correctAnswers.length === 0) {
      return { valid: false, message: "correctAnswers is required for fill-in/flashcard." };
    }
  }

  if (type === "multiple-choice") {
    if (!Array.isArray(answers) || answers.length === 0) {
      return { valid: false, message: "answers array is required for multiple-choice." };
    }
    const hasValidAnswer = answers.every(a => a.answer && typeof a.isCorrect === "boolean");
    if (!hasValidAnswer) {
      return { valid: false, message: "Each answer must have answer (string) and isCorrect (boolean)." };
    }

    const hasAtLeastOneCorrect = answers.some(a => a.isCorrect === true);
    if (!hasAtLeastOneCorrect) {
        return { valid: false, message: "At least one answer must be marked as correct for multiple-choice." };
    }
  }

  if (type === "match") {
    if (!Array.isArray(leftItems) || leftItems.length === 0 ||
        !Array.isArray(rightItems) || rightItems.length === 0) {
      return { valid: false, message: "leftItems and rightItems are required for match question." };
    }
    if (leftItems.length !== rightItems.length) {
      return { valid: false, message: "leftItems and rightItems must have the same number of elements." };
    }
  }

  if (type === "drag-drop") {
    if (!Array.isArray(dragItems) || dragItems.length === 0) {
      return { valid: false, message: "dragItems are required for drag-drop question." };
    }
    const placeholders = (content.match(/\[drag-item\]/g) || []).length;
    if (placeholders !== dragItems.length) {
      return { 
        valid: false, 
        message: `Number of dragItems (${dragItems.length}) must match number of [drag-item] placeholders in content (${placeholders}).`
      };
    }
  }

  return null; // hợp lệ
}

export const updateQuestion = async (req, res) => {
  try {
    const { id, lessonId, questionId } = req.params;
    const { type, content, correctAnswers, answers, leftItems, rightItems, dragItems, distractors, explanation, timeLimit, points } = req.body;

    // 1. Kiểm tra
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    const oldQuestion = await Question.findById(questionId);
    if (!oldQuestion) return res.status(404).json({ message: "Question not found" });


    const hasLesson = user.lessons.some(l => l.lessonId.toString() === lessonId);
    if (!hasLesson)
        return res.status(403).json({ message: "Lesson not owned by this user" });

    const isQuestionInLesson = lesson.questions.some(q => q.toString() === questionId);
    if (!isQuestionInLesson) 
        return res.status(403).json({ message: "Question does not belong to this lesson" });

    // 2. Validate dữ liệu mới 
    const validationError = validateQuestion(req.body);
    if (validationError) return res.status(400).json({ message: validationError.message });

    // 4. Tạo question mới (version mới)
    const newQuestion = await Question.create({
      type,
      content: content.trim(),
      correctAnswers,
      answers,
      leftItems,
      rightItems,
      dragItems,
      distractors,
      explanation,
      timeLimit,
      points,
      previousVersionId: oldQuestion._id // lưu version trước
    });

    // 5. Update lesson: thay id question cũ bằng id mới trong mảng questions
    await Lesson.findByIdAndUpdate(lessonId, {
      $set: { "questions.$[q]": newQuestion._id }
    }, {
      arrayFilters: [{ q: questionId }],
      new: true
    });

    res.status(200).json({
      message: "Question updated successfully (new version created)",
      newQuestion
    });

  } catch (error) {
    console.error("updateQuestion error:", error);
    res.status(500).json({ message: "Failed to update question" });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const { id, lessonId, questionId } = req.params;

    // 1. Kiểm tra user & lesson
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    const hasLesson = user.lessons.some(l => l.lessonId.toString() === lessonId);
    if (!hasLesson)
      return res.status(403).json({ message: "Lesson not owned by this user" });

    const isQuestionInLesson = lesson.questions.some(q => q.toString() === questionId);
    if (!isQuestionInLesson)
      return res.status(404).json({ message: "Question not found in this lesson" });

    // 2. Chỉ xóa khỏi mảng questions
    await Lesson.findByIdAndUpdate(lessonId, {
      $pull: { questions: questionId }
    });

    // KHÔNG xóa document Question trong DB để giữ version history
    res.status(200).json({ message: "Question removed from lesson (not deleted from DB)" });

  } catch (error) {
    console.error("deleteQuestion error:", error);
    res.status(500).json({ message: "Failed to delete question from lesson" });
  }
};

export const addQuestionToParentQuestion = async (req, res) => {
  try {
    const { id, lessonId, parentQuestionId } = req.params;
    const questionData = req.body;

// 1. Kiểm tra user & lesson
const user = await User.findById(id);
if (!user) return res.status(404).json({ message: "User not found" });

const lesson = await Lesson.findById(lessonId);
if (!lesson) return res.status(404).json({ message: "Lesson not found" });

const hasLesson = user.lessons.some(l => l.lessonId.toString() === lessonId);
if (!hasLesson)
  return res.status(403).json({ message: "Lesson not owned by this user" });

// 2. Kiểm tra parentQuestion
const parentQuestion = await ParentQuestion.findById(parentQuestionId);
if (!parentQuestion)
  return res.status(404).json({ message: "Parent question not found" });

if (!lesson.parentQuestions.some(pqId => pqId.toString() === parentQuestionId)) {
  return res.status(403).json({ message: "Parent question does not belong to this lesson" });
}


    // 3. Validate dữ liệu question
    const validationError = validateQuestion(questionData);
    if (validationError)
      return res.status(400).json({ message: validationError.message });

    // 4. Tạo question mới
    const question = await Question.create({
      type: questionData.type,
      content: questionData.content.trim(),
      correctAnswers: questionData.correctAnswers,
      answers: questionData.answers,
      leftItems: questionData.leftItems,
      rightItems: questionData.rightItems,
      dragItems: questionData.dragItems,
      distractors: questionData.distractors,
      explanation: questionData.explanation,
      timeLimit: questionData.timeLimit,
      points: questionData.points
    });

    // 5. Push vào parentQuestion
    parentQuestion.questions.push(question._id);
    await parentQuestion.save();

    res.status(201).json({
      message: "Question added to parent question successfully",
      question
    });
  } catch (error) {
    console.error("addQuestionToParentQuestion error:", error);
    res.status(500).json({ message: "Failed to add question to parent question" });
  }
};

export const removeQuestionFromParentQuestion = async (req, res) => {
  try {
    const { id, lessonId, parentQuestionId, questionId } = req.params;

    // 1. Kiểm tra user & lesson
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    const hasLesson = user.lessons.some(l => l.lessonId.toString() === lessonId);
    if (!hasLesson)
        return res.status(403).json({ message: "Lesson not owned by this user" });

    // 2. Kiểm tra parentQuestion
    const parentQuestion = await ParentQuestion.findById(parentQuestionId);
    if (!parentQuestion)
        return res.status(404).json({ message: "Parent question not found" });

    // Kiểm tra parentQuestion có thuộc về lesson hay không
    if (!lesson.parentQuestions.some(pqId => pqId.toString() === parentQuestionId)) {
        return res.status(403).json({ message: "Parent question does not belong to this lesson" });
    }

    // 3. Kiểm tra question tồn tại trong parentQuestion
    const exists = parentQuestion.questions.some(q => q.toString() === questionId);
    if (!exists)
      return res.status(404).json({ message: "Question not found in this parent question" });

    // 4. Xóa khỏi parentQuestion
    parentQuestion.questions = parentQuestion.questions.filter(q => q.toString() !== questionId);
    await parentQuestion.save();

    res.status(200).json({ message: "Question removed from parent question" });
  } catch (error) {
    console.error("removeQuestionFromParentQuestion error:", error);
    res.status(500).json({ message: "Failed to remove question from parent question" });
  }
};

export const updateQuestionInParentQuestion = async (req, res) => {
  try {
    const { id, lessonId, parentQuestionId, questionId } = req.params;
    const updatedData = req.body;

    // 1. Kiểm tra user & lesson
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    const hasLesson = user.lessons.some(l => l.lessonId.toString() === lessonId);
    if (!hasLesson)
        return res.status(403).json({ message: "Lesson not owned by this user" });

    // 2. Kiểm tra parentQuestion
    const parentQuestion = await ParentQuestion.findById(parentQuestionId);
    if (!parentQuestion)
        return res.status(404).json({ message: "Parent question not found" });

    // Kiểm tra parentQuestion có thuộc về lesson hay không
    if (!lesson.parentQuestions.some(pqId => pqId.toString() === parentQuestionId)) {
        return res.status(403).json({ message: "Parent question does not belong to this lesson" });
    }

    // 3. Kiểm tra question tồn tại trong parentQuestion
    const exists = parentQuestion.questions.some(q => q.toString() === questionId);
    if (!exists)
      return res.status(404).json({ message: "Question not found in this parent question" });

    // 4. Validate dữ liệu mới
    const validationError = validateQuestion(updatedData);
    if (validationError)
      return res.status(400).json({ message: validationError.message });

    // 5. Cập nhật question (tạo version mới)
    const oldQuestion = await Question.findById(questionId);
    if (!oldQuestion) return res.status(404).json({ message: "Question not found in database" });

    const newQuestion = await Question.create({
      ...updatedData,
      content: updatedData.content.trim(),
      previousVersionId: oldQuestion._id
    });

    // 6. Thay thế question trong parentQuestion
    parentQuestion.questions = parentQuestion.questions.map(q =>
      q.toString() === questionId ? newQuestion._id : q
    );
    await parentQuestion.save();

    res.status(200).json({
      message: "Question updated successfully (new version created)",
      newQuestion
    });
  } catch (error) {
    console.error("updateQuestionInParentQuestion error:", error);
    res.status(500).json({ message: "Failed to update question in parent question" });
  }
};

export const updateContentInParentQuestion = async (req, res) => {
  try {
    const { id, lessonId, parentQuestionId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim())
      return res.status(400).json({ message: "Text cannot be empty" });

        // 1. Kiểm tra user & lesson
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    const hasLesson = user.lessons.some(l => l.lessonId.toString() === lessonId);
    if (!hasLesson)
        return res.status(403).json({ message: "Lesson not owned by this user" });

    // 2. Kiểm tra parentQuestion
    const parentQuestion = await ParentQuestion.findById(parentQuestionId);
    if (!parentQuestion)
        return res.status(404).json({ message: "Parent question not found" });

    // Kiểm tra parentQuestion có thuộc về lesson hay không
    if (!lesson.parentQuestions.some(pqId => pqId.toString() === parentQuestionId)) {
        return res.status(403).json({ message: "Parent question does not belong to this lesson" });
    }

    // 3. Push version mới
    parentQuestion.content.push({ text: text.trim(), version: Date.now() });
    await parentQuestion.save();

    res.status(200).json({
      message: "Parent question content updated (new version added)",
      parentQuestion
    });
  } catch (error) {
    console.error("updateContentInParentQuestion error:", error);
    res.status(500).json({ message: "Failed to update parent question content" });
  }
};




