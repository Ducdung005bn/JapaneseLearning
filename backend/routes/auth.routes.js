import express from 'express';
const router = express.Router();

router.post('/register', (req, res) => {
  res.send('Đăng ký');
});

router.post('/login', (req, res) => {
  res.send('Đăng nhập');
});

router.post('/logout', (req, res) => {
  res.send('Đăng xuất');
});

export default router;
