import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Danh sách tất cả kanji');
});

router.get('/:character', (req, res) => {
  const kanji = req.params.character;
  res.send(`Chi tiết kanji: ${kanji}`);
});

// Tìm kiếm theo keyword
router.get('/search', (req, res) => {
  const keyword = req.query.q;
  res.send(`Kết quả tìm kiếm kanji: ${keyword}`);
});

export default router;
