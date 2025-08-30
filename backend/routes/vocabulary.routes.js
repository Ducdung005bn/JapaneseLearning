import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Danh sách tất cả từ vựng');
});

router.get('/:word', (req, res) => {
  const word = req.params.word;
  res.send(`Chi tiết từ: ${word}`);
});

// Tìm kiếm theo keyword
router.get('/search', (req, res) => {
  const keyword = req.query.q;
  res.send(`Kết quả tìm kiếm: ${keyword}`);
});

export default router;
