import express from "express";
import authMiddleware from "../middleware/auth.js"; // Middleware xác thực user
// TODO: Import admin middleware nếu có
// import adminMiddleware from "../middleware/admin.js";
import {
    placeOrder,
    verifyOrder, // Xem xét loại bỏ route này
    userOrders,
    listOrders,
    updateStatus,
    deleteOrder
} from "../controllers/ordersController.js";
import mongoose from "mongoose"; // Import mongoose


const orderRoute = express.Router();

// Đặt hàng (User đã đăng nhập)
orderRoute.post("/place", authMiddleware, placeOrder);

// Xác minh thanh toán (Route này không còn tin cậy, nên dùng Webhook/IPN)
// Giữ lại tạm thời nếu frontend cũ đang dùng, nhưng nên loại bỏ
orderRoute.post("/verify", verifyOrder);

// Lấy đơn hàng của người dùng hiện tại (User đã đăng nhập)
orderRoute.get("/userorders", authMiddleware, userOrders);

// --- Routes cho Admin ---
// TODO: Thêm adminMiddleware cho các route dưới đây

// Lấy tất cả đơn hàng (Admin)
orderRoute.get("/list", /* adminMiddleware, */ listOrders);

// Cập nhật trạng thái đơn hàng (Admin) - Dùng PUT hoặc PATCH
orderRoute.put("/status", /* adminMiddleware, */ updateStatus); // Hoặc PATCH

// Xóa đơn hàng (Admin) - Dùng DELETE và lấy id từ params
orderRoute.delete("/delete-order/:orderId", /* adminMiddleware, */ async (req, res) => {
    // Tách logic vào controller deleteOrder
    try {
        const { orderId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ success: false, message: "Order ID không hợp lệ." });
        }

        const deletedOrder = await orderModel.findByIdAndDelete(orderId);

        if (!deletedOrder) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng để xóa." });
        }

        console.log(`Admin đã xóa đơn hàng ${orderId}`);
        res.json({ success: true, message: "Xóa đơn hàng thành công." });
    } catch (error) {
        console.error('Lỗi khi xóa đơn hàng:', error);
        res.status(500).json({ success: false, message: "Lỗi server khi xóa đơn hàng.", error: error.message });
    }
});

export default orderRoute;