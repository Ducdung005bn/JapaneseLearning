import express from 'express';
const router = express.Router();

// Lấy thông tin của user
router.get('/:userId/information', (req, res) => {
  const userId = req.params.userId;
  res.send(`Thông tin của user ${userId}`);
});

// Lấy danh sách bài học của user
router.get('/:userId/lesson', (req, res) => {
  const userId = req.params.userId;
  res.send(`Danh sách bài học của user ${userId}`);
});

// Tra chi tiết 1 bài học
router.get('/:userId/lesson/:lessonId', (req, res) => {
  const { userId, lessonId } = req.params;
  res.send(`Chi tiết bài học ${lessonId} của user ${userId}`);
});

// Tìm kiếm theo keyword
router.get('/:userId/lesson/search', (req, res) => {
  const userId = req.params.userId;
  const keyword = req.query.q;
  res.send(`Kết quả tìm kiếm bài học '${keyword}' của user ${userId}`);
});

export default router;
