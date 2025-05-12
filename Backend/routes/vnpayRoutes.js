// routes/vnpayRoutes.js
import express from 'express';
import { createPaymentUrl, vnpayReturn, vnpayIpn } from '../controllers/vnpayController.js'; // Sẽ tạo controller này ở bước sau
import authMiddleware from '../middleware/auth.js'; // Đảm bảo bạn có middleware xác thực

const vnpayRouter = express.Router();

vnpayRouter.post('/create_payment_url', authMiddleware, createPaymentUrl); // Cần xác thực người dùng
vnpayRouter.get('/vnpay_return', vnpayReturn); // VNPAY gọi về không cần token
vnpayRouter.get('/vnpay_ipn', vnpayIpn);       // VNPAY gọi về không cần token

export default vnpayRouter;