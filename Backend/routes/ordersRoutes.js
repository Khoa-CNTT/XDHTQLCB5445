import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
    placeOrder,
    userOrders,
    verifyOrder, // Stripe verification endpoint
    listOrders,
    updateStatus,
    deleteOrder,
    vnpayReturn, // Import VNPay handlers
    vnpayIPN
} from "../controllers/ordersController.js";

const orderRoute = express.Router();

// Đặt hàng (chung cho các phương thức)
orderRoute.post("/place", authMiddleware, placeOrder);

// Xác thực thanh toán (hiện tại dùng cho Stripe qua success_url/cancel_url)
// Client sẽ gọi endpoint này sau khi được redirect từ Stripe
orderRoute.post("/verify", verifyOrder); // Giữ lại cho Stripe

// VNPay Return URL (Client sẽ được redirect về đây, sau đó client gọi API xác thực)
// Backend không cần route này vì xử lý ở client (VNPayReturn component)
// Tuy nhiên, chúng ta cần một endpoint để client gọi xác thực *sau khi* được redirect về
orderRoute.get("/vnpay_return_verify", vnpayReturn); // Endpoint client gọi để xác nhận trạng thái từ query params

// VNPay IPN URL (VNPay server gọi trực tiếp) - Dùng GET theo tài liệu VNPay
orderRoute.get("/vnpay_ipn", vnpayIPN);

// Lấy đơn hàng của người dùng
orderRoute.get("/userorders", authMiddleware, userOrders);

// Lấy tất cả đơn hàng (Admin)
orderRoute.get("/list", listOrders); // Cần thêm middleware check admin sau

// Cập nhật trạng thái đơn hàng (Admin)
orderRoute.put("/status", updateStatus); // Cần thêm middleware check admin sau

// Xóa đơn hàng (Admin) - Nên dùng DELETE và lấy id từ params
orderRoute.delete("/delete-order/:id", deleteOrder); // Ví dụ: /api/order/delete-order/60c72b...

export default orderRoute;