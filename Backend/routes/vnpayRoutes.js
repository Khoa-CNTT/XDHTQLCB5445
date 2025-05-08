import express from 'express';
import { handleVnpayReturn, handleVnpayIPN } from '../controllers/vnpayController.js';

const vnpayRouter = express.Router();

// Route VNPAY redirect người dùng về (qua Backend trước)
vnpayRouter.get('/vnpay_return', handleVnpayReturn);

// Route VNPAY gọi server để xác nhận kết quả (IPN)
// Nên dùng GET vì VNPAY thường gọi bằng GET
vnpayRouter.get('/vnpay_ipn', handleVnpayIPN);

export default vnpayRouter;