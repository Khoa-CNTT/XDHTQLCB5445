import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: Array, required: true }, // { productId, name, price, quantity, image }
    totalAmount: { type: Number, required: true },
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
    },
    orderStatus: {
      type: String,
      default: "Đang xử lý", // Default status
      enum: ["Đang xử lý", "Đã xác nhận", "Đang giao hàng", "Đã giao hàng", "Đã hủy"], // Các trạng thái đơn hàng
    },
    orderDate: { type: Date, default: Date.now }, // Giữ lại hoặc bỏ nếu dùng timestamps
    paymentMethod: {
      type: String,
      required: true,
      enum: ["cod", "card", "vnpay"] // Các phương thức thanh toán
    },
    paymentStatus: {
      type: String,
      default: "Chờ thanh toán", // Default status for online payments
      enum: [
        "Chờ thanh toán",     // Pending online payment
        "Đã thanh toán",       // Paid (Stripe/VNPAY success)
        "Thất bại",          // Failed (Stripe/VNPAY fail/cancel)
        "Chưa thanh toán",     // Unpaid (COD initial state)
        "Đã hủy",            // Cancelled order
        "Đang chờ xác nhận", // Optional: After redirect, before IPN/Webhook
        "Đã hoàn tiền"         // Refunded
      ]
    },
    note: { type: String },
    // Thêm các trường nếu cần (ví dụ: mã giao dịch từ VNPAY/Stripe)
    transactionId: { type: String }, // Lưu mã giao dịch từ cổng thanh toán
    paymentInfo: { type: Object },   // Lưu thông tin chi tiết trả về từ cổng thanh toán (tùy chọn)
  },
  { timestamps: true } // Tự động thêm createdAt và updatedAt
);

// Đảm bảo index cho userId để query nhanh hơn
orderSchema.index({ userId: 1 });

const orderModel = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default orderModel;