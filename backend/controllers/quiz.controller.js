import User from '../models/user.model.js';
import Lesson from '../models/lesson.model.js';
import { Question, ParentQuestion } from "../models/question.model.js";
import mongoose from 'mongoose';

export const startQuiz = async (req, res) => {
  try {
    const { id, lessonId } = req.params;

    // 1. Kiểm tra user có tồn tại
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 2. Kiểm tra lesson có tồn tại và thuộc quyền sở hữu user
    const lesson = await Lesson.findById(lessonId)
      .populate('questions')
      .populate({
        path: 'parentQuestions',
        populate: { path: 'questions' }
      });

    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    // Nếu user không có lesson này trong selfStudyLessons thì từ chối
    const userLesson = user.lessons.find(l => l.lessonId.toString() === lessonId);
    if (!userLesson) {
      return res.status(403).json({ message: 'The user does not own this lesson' });
    }



    const hasActiveQuiz = userLesson.history.some(h => !h.completedAt);
    if (hasActiveQuiz) {
      return res.status(400).json({ message: 'You already have an ongoing quiz for this lesson' });
    }

    // 3. Tạo history mới
    const newHistory = {
      startedAt: new Date(),
      completedAt: null,
      assignment: [
        {
          questions: lesson.questions.map(q => ({ questionId: q._id, answer: null })),
          parentQuestions: lesson.parentQuestions.map(pq => ({
            parentQuestionId: pq._id,
            questions: pq.questions.map(q => ({ questionId: q._id, answer: null }))
          })),
          score: 0
        }
      ]
    };

    console.log(newHistory);

    // 4. Thêm history vào user
    const lessonIndex = user.lessons.findIndex(l => l.lessonId.toString() === lessonId);
    if (lessonIndex >= 0) {
      user.lessons[lessonIndex].history.push(newHistory);
    } else {
      user.lessons.push({ lessonId: lesson._id, history: [newHistory] });
    }

    await user.save();

    res.status(200).json({ message: 'Quiz started', history: newHistory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getNextQuestion = async (req, res) => {
  try {
    const { id, lessonId } = req.params;

    const { questionObj, pqObjText, completed } = await getNextUnansweredQuestion(id, lessonId);

    if (completed) {
        return res.status(200).json({ message: 'Quiz completed', completed: true });
    }

    const shuffledQuestion = shuffleQuestion(questionObj.toObject ? questionObj.toObject() : questionObj);
    const safeQuestion = sanitizeQuestion(shuffledQuestion);

    res.status(200).json({
        question: safeQuestion,
        text: pqObjText || null,
        completed: false
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const submitAnswer = async (req, res) => {
  try {
    const { id, lessonId } = req.params;
    const { answer } = req.body;

    // Lấy question chưa trả lời tiếp theo
    const { questionObj, pqObjText, completed, activeHistory, assignment, isParent } =
      await getNextUnansweredQuestion(id, lessonId);

    if (completed) {
      return res.status(200).json({ message: 'Quiz completed', completed: true });
    }

    // Kiểm tra đúng/sai
    let isCorrect = false;

    if (!validateAnswer(answer, questionObj)) {
        return res.status(400).json({ message: 'Invalid answer format' });
    }

    switch (questionObj.type) {
  case 'multiple-choice':
    const correctAnswers = questionObj.answers
      .filter(a => a.isCorrect)
      .map(a => a.value);

    const userAnswer = Array.isArray(answer) ? answer : [answer];

    isCorrect = userAnswer.slice().sort().toString() === correctAnswers.slice().sort().toString();

    console.log('Type: multiple-choice');
    console.log('Correct answers:', correctAnswers);
    console.log('User answer:', userAnswer);
    console.log('Sorted comparison:', userAnswer.slice().sort(), correctAnswers.slice().sort());
    console.log('isCorrect:', isCorrect);
    break;

  case 'fill-in':
  case 'flashcard':
    isCorrect = questionObj.correctAnswers.includes(answer);
    console.log('Type:', questionObj.type);
    console.log('Correct answers:', questionObj.correctAnswers);
    console.log('User answer:', answer);
    console.log('isCorrect:', isCorrect);
    break;

  case 'match':
    isCorrect = Array.isArray(answer) &&
                questionObj.rightItems &&
                answer.length === questionObj.rightItems.length &&
                answer.every((a, idx) => a === questionObj.rightItems[idx]);

    console.log('Type: match');
    console.log('Correct answers:', questionObj.correctAnswers);
    console.log('Right items count:', questionObj.rightItems.length);
    console.log('User answer:', answer);
    console.log('isCorrect:', isCorrect);
    break;

  case 'drag-drop':
    isCorrect = Array.isArray(answer) &&
                questionObj.dragItems &&
                answer.length === questionObj.dragItems.length &&
                answer.every((a, idx) => a === questionObj.dragItems[idx]);

    console.log('Type: drag-drop');
    console.log('Correct answers:', questionObj.correctAnswers);
    console.log('Drag items count:', questionObj.dragItems.length);
    console.log('User answer:', answer);
    console.log('isCorrect:', isCorrect);
    break;

  default:
    isCorrect = false;
    console.log('Type: unknown', 'isCorrect:', isCorrect);
}


    // Lưu answer vào assignment
    let updated = false;

    if (!isParent) {
      const q = assignment.questions.find(q => q.answer === null && q.questionId.toString() === questionObj._id.toString());
      if (q) {
        q.answer = answer;
        q.isCorrect = isCorrect;
        updated = true;
      }
    } else {
      for (const pq of assignment.parentQuestions) {
        const subQ = pq.questions.find(q => q.answer === null && q.questionId.toString() === questionObj._id.toString());
        if (subQ) {
          subQ.answer = answer;
          subQ.isCorrect = isCorrect;
          updated = true;
          break;
        }
      }
    }

    if (!updated) {
      return res.status(400).json({ message: 'Question not found in active quiz' });
    }

    // Kiểm tra quiz hoàn tất
    const allAnswered = assignment.questions.every(q => q.answer !== null) &&
                        assignment.parentQuestions.every(pq => pq.questions.every(q => q.answer !== null));
    if (allAnswered) {
      activeHistory.completedAt = new Date();
    }

    // Lưu vào DB
    const user = await User.findById(id);
    const userLesson = user.lessons.find(l => l.lessonId.toString() === lessonId.toString());
    const historyIndex = userLesson.history.findIndex(h => h._id.toString() === activeHistory._id.toString());
    userLesson.history[historyIndex] = activeHistory;
    await user.save();

    res.status(200).json({
      message: 'Answer submitted',
      isCorrect,
      completed: allAnswered
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const validateAnswer = (answer, questionObj) => {
  if (!answer) return false;

  switch (questionObj.type) {
    case 'fill-in':
    case 'flashcard':
      return typeof answer === 'string' && answer.trim() !== '';

    case 'multiple-choice':
      return Array.isArray(answer) &&
             answer.length > 0 &&
             answer.every(a => typeof a === 'string' && a.trim() !== '');

    case 'match':
      // answer là array, số phần tử bằng rightItems, từng phần tử không rỗng
      return Array.isArray(answer) &&
             questionObj.rightItems &&
             answer.length === questionObj.rightItems.length &&
             answer.every(a => typeof a === 'string' && a.trim() !== '');

    case 'drag-drop':
      return Array.isArray(answer) &&
             questionObj.dragItems &&
             answer.length === questionObj.dragItems.length &&
             answer.every(a => typeof a === 'string' && a.trim() !== '');

    default:
      return false;
  }
};



export const getNextUnansweredQuestion = async (userId, lessonId) => {
  // 1. Kiểm tra user
  const user = await User.findById(userId).select('-password');
  if (!user) throw { status: 404, message: 'User not found' };

  // 2. Kiểm tra lesson
  const lesson = await Lesson.findById(lessonId)
    .populate('questions')
    .populate({ path: 'parentQuestions', populate: { path: 'questions' } });
  if (!lesson) throw { status: 404, message: 'Lesson not found' };

  // 3. Kiểm tra user có lesson
  const userLesson = user.lessons.find(l => l.lessonId.toString() === lessonId.toString());
  if (!userLesson) throw { status: 403, message: 'The user does not own this lesson' };

  // 4. Lấy history gần nhất chưa completed
  const activeHistory = [...userLesson.history].reverse().find(h => !h.completedAt);
  if (!activeHistory) return { completed: true };

  const assignment = activeHistory.assignment[0]; // giả sử 1 assignment

  // 5. Tìm questionId đầu tiên chưa trả lời
  let nextQuestionId = null;
  let isParent = false;
  let parentQuestionId = null;

  // Kiểm tra questions
  const q = assignment.questions.find(q => q.answer === null);
  if (q) nextQuestionId = q.questionId;

  // Kiểm tra parentQuestions nếu không tìm được
  if (!nextQuestionId) {
    for (const pq of assignment.parentQuestions) {
      const subQ = pq.questions.find(q => q.answer === null);
      if (subQ) {
        nextQuestionId = subQ.questionId;
        isParent = true;
        parentQuestionId = pq.parentQuestionId || pq._id;
        break;
      }
    }
  }

  if (!nextQuestionId) {
    return { completed: true };
  }

  // 6. Lấy question object từ DB
  let questionObj = null;
  let pqObjText = null;

  if (!isParent) {
    questionObj = await Question.findById(nextQuestionId);
  } else {
    const pqObj = await ParentQuestion.findById(parentQuestionId).populate('questions');
    if (pqObj) {
      questionObj = pqObj.questions.find(q => q._id.toString() === nextQuestionId.toString());
      pqObjText = getContentTextByStartedAt(pqObj.content, activeHistory.startedAt);
    }
  }

  if (!questionObj) throw { status: 404, message: 'Question not found in lesson' };

  return { questionObj, pqObjText, completed: false, activeHistory, assignment, isParent };
};


const sanitizeQuestion = (shuffledQuestion) => {
  const q = { ...shuffledQuestion }; // clone để không mutate gốc

  switch (q.type) {
    case "multiple-choice":
      // giữ text, shuffle answers nhưng loại bỏ isCorrect
      if (q.answers) {
        q.answers = q.answers.map(a => {
          const { isCorrect, ...rest } = a;
          return rest;
        });
      }
      break;

    case "fill-in":
    case "flashcard":
      // không trả về correctAnswers
      delete q.correctAnswers;
      break;

    case "match":
      // không trả về rightItems
      delete q.rightItems;
      break;

    case "drag-drop":
      // không trả về dragItems và distractors
      delete q.dragItems;
      delete q.distractors;
      break;
  }

  return q;
};


const getContentTextByStartedAt = (content, startedAt) => {
  if (!content || content.length === 0) return '';

  // Sort content theo version tăng dần (cũ → mới)
  const sortedContent = [...content].sort((a, b) => new Date(a.version) - new Date(b.version));

  // Duyệt từ cuối mảng (phiên bản mới nhất) trở về trước
  for (let i = sortedContent.length - 1; i >= 0; i--) {
    const versionDate = new Date(sortedContent[i].version);
    if (versionDate <= startedAt) {
      return sortedContent[i].text;
    }
  }

  // Nếu tất cả version > startedAt, trả về version cũ nhất
  return sortedContent[0].text;
};


export const shuffleQuestion = (question) => {
  // Clone để không mutate dữ liệu gốc
  const q = { ...question };

  if (q.type === "multiple-choice") {
    // shuffle answers
    q.answers = shuffleArray([...q.answers]);
  }

  if (q.type === "match") {
    // giữ leftItems nguyên gốc, shuffle rightItems
    const pairs = q.leftItems.map((left, i) => ({ left, right: q.rightItems[i] }));
    q.shuffledRightItems = shuffleArray(pairs.map(p => p.right));
  }

  if (q.type === "drag-drop") {
    const options = [...q.dragItems, ...q.distractors];
    q.shuffledDragOptions = shuffleArray(options);
  }

  return q;
};

export const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

