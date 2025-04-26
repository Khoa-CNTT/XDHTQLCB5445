import orderModel from "../models/ordersModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
import dotenv from 'dotenv';
import { createVNPayPaymentURL, verifyVNPaySignature } from '../services/vnpayHelper.js'; // Import helper

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const placeOrder = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy thông tin người dùng",
      });
    }
    const { items, totalAmount, shippingAddress, paymentMethod, note } = req.body;

    // --- Validate input ---
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Giỏ hàng trống." });
    }
    if (!totalAmount || isNaN(Number(totalAmount)) || Number(totalAmount) <= 0) {
      return res.status(400).json({ success: false, message: "Tổng tiền không hợp lệ." });
    }
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address) {
      return res.status(400).json({ success: false, message: "Thông tin giao hàng không đầy đủ." });
    }
    if (!paymentMethod) {
      return res.status(400).json({ success: false, message: "Vui lòng chọn phương thức thanh toán." });
    }
    // --- End Validation ---


    const formattedItems = items.map(item => {
      // Validate item structure
      if (!item._id || !item.name || isNaN(Number(item.price)) || isNaN(Number(item.quantity))) {
        throw new Error("Dữ liệu sản phẩm trong giỏ hàng không hợp lệ.");
      }
      return {
        productId: item._id,
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
        image: item.image || null, // Handle potentially missing image
      };
    });

    // Tạo đơn hàng mới với trạng thái chờ xử lý
    const newOrder = new orderModel({
      userId,
      items: formattedItems,
      totalAmount: Number(totalAmount),
      shippingAddress,
      paymentMethod,
      // Payment status dựa trên phương thức, VNPay sẽ là Pending ban đầu
      paymentStatus: (paymentMethod === "vnpay" || paymentMethod === "card") ? "Pending" : "Chưa thanh toán", // Hoặc 'Unpaid' for COD
      note,
      orderStatus: "Đang xử lý", // Initial order status
    });

    // Lưu đơn hàng vào database
    const savedOrder = await newOrder.save();

    // Xóa giỏ hàng (chỉ nên xóa sau khi thanh toán thành công, xem xét lại logic này)
    // Tạm thời comment out, sẽ xử lý xóa cart sau khi verify thành công
    // await userModel.findByIdAndUpdate(userId, { cartData: {} });

    // --- Xử lý theo phương thức thanh toán ---
    if (paymentMethod === "Thanh toán khi nhận hàng") { // Hoặc giá trị 'cod' bạn dùng ở frontend
      // Cập nhật paymentStatus cho COD nếu cần
      savedOrder.paymentStatus = "Chưa thanh toán";
      await savedOrder.save();
      // Xóa giỏ hàng cho COD ở đây vì không có bước xác nhận online
      await userModel.findByIdAndUpdate(userId, { cartData: {} });
      return res.json({
        success: true,
        message: "Đặt hàng thành công với COD",
        orderId: savedOrder._id,
      });
    } else if (paymentMethod === "card") { // Stripe
      // Tính lại line_items để đảm bảo giá chính xác
      const line_items_stripe = [
        ...formattedItems.map(item => ({
          price_data: {
            currency: "vnd",
            product_data: {
              name: item.name,
              // images: item.image ? [item.image] : [], // Thêm ảnh nếu có
            },
            unit_amount: Math.round(item.price), // Stripe dùng đơn vị nhỏ nhất (xu), nhưng VNĐ ko có xu, nên để nguyên? Kiểm tra lại docs Stripe
          },
          quantity: item.quantity,
        })),
        // Chỉ thêm phí vận chuyển nếu có
        // {
        //     price_data: {
        //         currency: "vnd",
        //         product_data: { name: "Phí vận chuyển" },
        //         unit_amount: 30000,
        //     },
        //     quantity: 1,
        // },
      ];

      // Tính tổng tiền bao gồm phí ship cho Stripe metadata hoặc description
      const totalAmountForStripe = totalAmount; // totalAmount đã bao gồm ship từ frontend

      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: line_items_stripe,
          mode: "payment",
          success_url: `${process.env.ClIENT_URL || "http://localhost:3000"}/verify?success=true&orderId=${savedOrder._id}&paymentMethod=card`, // Thêm orderId và method để dễ xử lý
          cancel_url: `${process.env.ClIENT_URL || "http://localhost:3000"}/verify?success=false&orderId=${savedOrder._id}&paymentMethod=card`,
          metadata: { // Gửi orderId qua metadata là cách tốt nhất
            orderId: savedOrder._id.toString(),
            userId: userId.toString(),
          },
          // Có thể thêm thông tin khách hàng nếu cần
          // customer_email: user.email,
        });

        // Cập nhật trạng thái đơn hàng là Pending (chờ thanh toán)
        savedOrder.paymentStatus = "Pending";
        await savedOrder.save();

        res.json({
          success: true,
          session_url: session.url // Đổi tên để nhất quán
        });
      } catch (stripeError) {
        console.error("Stripe Session Creation Error:", stripeError);
        // Nếu lỗi Stripe, cân nhắc xóa đơn hàng vừa tạo hoặc đánh dấu là failed
        await orderModel.findByIdAndDelete(savedOrder._id);
        return res.status(500).json({
          success: false,
          message: "Lỗi khi tạo phiên thanh toán Stripe: " + stripeError.message,
        });
      }

    } else if (paymentMethod === "vnpay") {
      // Tạo URL thanh toán VNPay
      const paymentUrl = createVNPayPaymentURL(req, savedOrder._id, totalAmount, `Thanh toán đơn hàng ${savedOrder._id}`);

      // Cập nhật trạng thái đơn hàng là Pending (chờ thanh toán)
      savedOrder.paymentStatus = "Pending";
      await savedOrder.save();

      return res.json({
        success: true,
        paymentUrl: paymentUrl // Trả về URL VNPay
      });
    } else {
      // Xóa đơn hàng nếu phương thức thanh toán không hợp lệ
      await orderModel.findByIdAndDelete(savedOrder._id);
      return res.status(400).json({
        success: false,
        message: "Phương thức thanh toán không được hỗ trợ."
      });
    }

  } catch (error) {
    console.error("Lỗi khi xử lý đơn hàng:", error);
    // Cân nhắc xóa đơn hàng nếu có lỗi xảy ra trước khi gửi response
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi hệ thống khi xử lý đơn hàng",
    });
  }
};

// Hàm xử lý khi VNPay redirect về (Return URL) - Chủ yếu để thông báo cho client
// Việc cập nhật DB chính nên dựa vào IPN
const vnpayReturn = async (req, res) => {
  let vnp_Params = req.query;
  const secureHash = vnp_Params['vnp_SecureHash'];

  // Sao chép params để xác thực mà không làm thay đổi object gốc
  let paramsToVerify = { ...vnp_Params };

  // Loại bỏ các tham số không cần thiết hoặc không dùng để tạo hash
  delete paramsToVerify['vnp_SecureHash'];
  delete paramsToVerify['vnp_SecureHashType'];

  // Sắp xếp lại keys theo alphabet
  paramsToVerify = Object.keys(paramsToVerify).sort().reduce(
    (obj, key) => {
      obj[key] = paramsToVerify[key];
      return obj;
    },
    {}
  );

  // Tạo chuỗi dữ liệu để hash
  const signData = qs.stringify(paramsToVerify, { encode: false });
  const secretKey = process.env.VNPAY_HASH_SECRET;
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

  console.log("VNPay Return Params:", vnp_Params);
  console.log("Generated Hash for Return:", signed);
  console.log("Received Hash:", secureHash);

  if (secureHash === signed) {
    const orderId = vnp_Params['vnp_TxnRef']?.split('_')[0]; // Lấy orderId gốc
    const responseCode = vnp_Params['vnp_ResponseCode'];

    console.log(`VNPay Return: Order ID ${orderId}, Response Code ${responseCode}`);

    // Chỉ trả về trạng thái thành công/thất bại cho frontend
    // Việc cập nhật DB nên dựa vào IPN để đảm bảo an toàn
    if (responseCode === '00') {
      // Không cập nhật DB ở đây, chỉ gửi trạng thái về client
      res.json({ success: true, message: "Giao dịch VNPay thành công (chờ xác nhận IPN).", code: responseCode, orderId: orderId });
    } else {
      res.json({ success: false, message: `Giao dịch VNPay thất bại. Mã lỗi: ${responseCode}`, code: responseCode, orderId: orderId });
    }
  } else {
    console.error("VNPay Return: Invalid Signature");
    res.status(400).json({ success: false, message: "Chữ ký không hợp lệ." });
  }
};


// Hàm xử lý IPN từ VNPay (Server-to-Server) - Quan trọng nhất
const vnpayIPN = async (req, res) => {
  let vnp_Params = req.query;
  let secureHash = vnp_Params['vnp_SecureHash'];

  console.log("Received IPN Params:", vnp_Params);

  // Sao chép params để xác thực
  let paramsToVerify = { ...vnp_Params };
  delete paramsToVerify['vnp_SecureHash'];
  delete paramsToVerify['vnp_SecureHashType'];

  // Sắp xếp lại keys theo alphabet
  paramsToVerify = Object.keys(paramsToVerify).sort().reduce(
    (obj, key) => {
      obj[key] = paramsToVerify[key];
      return obj;
    },
    {}
  );

  const secretKey = process.env.VNPAY_HASH_SECRET;
  const signData = qs.stringify(paramsToVerify, { encode: false });
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

  console.log("Generated Hash for IPN:", signed);
  console.log("Received Hash:", secureHash);


  // Lấy thông tin từ params
  const orderId = vnp_Params['vnp_TxnRef']?.split('_')[0]; // Lấy orderId gốc
  const vnpAmount = vnp_Params['vnp_Amount']; // Số tiền VNPay trả về (đã * 100)
  const vnpResponseCode = vnp_Params['vnp_ResponseCode'];
  const vnpTransactionStatus = vnp_Params['vnp_TransactionStatus']; // Trạng thái giao dịch chi tiết
  const vnpTransactionNo = vnp_Params['vnp_TransactionNo']; // Mã giao dịch VNPay

  try {
    // Kiểm tra chữ ký
    if (secureHash === signed) {
      console.log(`IPN: Signature verified for Order ID ${orderId}`);
      const order = await orderModel.findById(orderId);

      // Kiểm tra đơn hàng tồn tại
      if (!order) {
        console.error(`IPN Error: Order ${orderId} not found.`);
        return res.json({ RspCode: '01', Message: 'Order not found' });
      }

      // Kiểm tra số tiền (chia 100 để so sánh với DB)
      if (order.totalAmount !== Number(vnpAmount) / 100) {
        console.error(`IPN Error: Amount mismatch for Order ${orderId}. DB: ${order.totalAmount}, VNPay: ${Number(vnpAmount) / 100}`);
        return res.json({ RspCode: '04', Message: 'Invalid amount' });
      }

      // Kiểm tra trạng thái thanh toán đã hoàn thành chưa (tránh xử lý lại)
      if (order.paymentStatus === "Paid") {
        console.log(`IPN Info: Order ${orderId} already paid.`);
        return res.json({ RspCode: '02', Message: 'Order already confirmed' });
      }

      // Xử lý dựa trên mã phản hồi và trạng thái giao dịch
      if (vnpResponseCode === '00' && vnpTransactionStatus === '00') {
        // Giao dịch thành công
        order.paymentStatus = "Paid";
        order.orderStatus = "Đã xác nhận"; // Hoặc trạng thái phù hợp tiếp theo
        order.paymentInfo = { // Lưu thêm thông tin giao dịch nếu cần
          transactionNo: vnpTransactionNo,
          payDate: vnp_Params['vnp_PayDate'] // Thời gian thanh toán từ VNPay
        };
        await order.save();
        console.log(`IPN Success: Order ${orderId} updated to Paid.`);

        // Xóa giỏ hàng của người dùng sau khi thanh toán thành công
        await userModel.findByIdAndUpdate(order.userId, { cartData: {} });
        console.log(`IPN Success: Cart cleared for user ${order.userId}.`);

        // Phản hồi thành công cho VNPay
        return res.json({ RspCode: '00', Message: 'Confirm Success' });
      } else {
        // Giao dịch thất bại hoặc bị hủy
        order.paymentStatus = "Failed";
        // Giữ nguyên orderStatus là 'Đang xử lý' hoặc chuyển thành 'Đã hủy' tùy logic
        await order.save();
        console.log(`IPN Failed: Order ${orderId} updated to Failed. ResponseCode: ${vnpResponseCode}, TransactionStatus: ${vnpTransactionStatus}`);
        // Phản hồi thành công cho VNPay (vì đã nhận và xử lý IPN)
        return res.json({ RspCode: '00', Message: 'Confirm Success' }); // Vẫn trả về 00 để VNPay biết đã nhận
      }
    } else {
      console.error(`IPN Error: Invalid Signature for Order ID attempt: ${orderId}`);
      return res.json({ RspCode: '97', Message: 'Invalid Checksum' }); // Chữ ký không hợp lệ
    }
  } catch (error) {
    console.error(`IPN Error: Processing Order ${orderId} failed:`, error);
    // Lỗi không xác định, trả mã lỗi cho VNPay
    return res.json({ RspCode: '99', Message: 'Unknown error' });
  }
};


// --- Các hàm khác giữ nguyên ---
// Kiểm tra thanh toán Stripe (Có thể gộp chung logic verify nếu cần)
const verifyOrder = async (req, res) => {
  // Phân biệt giữa Stripe và các phương thức khác nếu cần
  // Hiện tại logic này chỉ dành cho Stripe dựa vào success_url/cancel_url
  const { orderId, success } = req.body; // Hoặc lấy từ query params nếu là GET
  try {
    if (!orderId) {
      return res.status(400).json({ success: false, message: "Order ID is required" });
    }
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Chỉ cập nhật nếu trạng thái đang là Pending để tránh ghi đè IPN
    if (order.paymentStatus === 'Pending') {
      if (success === 'true' || success === true) { // Kiểm tra cả string và boolean
        order.paymentStatus = "Paid";
        order.orderStatus = "Đã xác nhận"; // Cập nhật trạng thái đơn hàng
        await order.save();
        // Xóa giỏ hàng sau khi xác nhận thanh toán thành công
        await userModel.findByIdAndUpdate(order.userId, { cartData: {} });
        console.log(`Stripe Verify: Order ${orderId} updated to Paid. Cart cleared.`);
        return res.json({ success: true, message: "Thanh toán Stripe thành công." });
      } else {
        order.paymentStatus = "Failed";
        await order.save();
        console.log(`Stripe Verify: Order ${orderId} updated to Failed.`);
        return res.json({ success: false, message: "Thanh toán Stripe thất bại hoặc đã hủy." });
      }
    } else if (order.paymentStatus === 'Paid') {
      console.log(`Stripe Verify: Order ${orderId} was already Paid.`);
      return res.json({ success: true, message: "Đơn hàng đã được thanh toán trước đó." });
    } else {
      console.log(`Stripe Verify: Order ${orderId} has status ${order.paymentStatus}, no action taken.`);
      // Trả về trạng thái hiện tại nếu không phải Pending
      return res.json({ success: order.paymentStatus === 'Paid', message: `Trạng thái đơn hàng: ${order.paymentStatus}` });
    }

  } catch (error) {
    console.error('Error in verifyOrder (Stripe):', error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const userOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is missing from req.user" });
    }

    const orders = await orderModel.find({ userId }).sort({ orderDate: -1 }); // Sắp xếp mới nhất trước

    // Định dạng lại dữ liệu cho frontend
    const formattedOrders = orders.map(order => ({
      orderId: order._id.toString(),
      // Đảm bảo orderDate tồn tại trước khi định dạng
      orderDate: order.orderDate ? new Date(order.orderDate).toLocaleDateString('vi-VN') : 'N/A',
      products: order.items,
      total: order.totalAmount,
      status: order.orderStatus, // Gửi trạng thái đơn hàng
      paymentStatus: order.paymentStatus, // Gửi trạng thái thanh toán
      paymentMethod: order.paymentMethod, // Gửi phương thức thanh toán
    }));
    res.json({ success: true, data: formattedOrders });
  } catch (error) {
    console.error('Error in userOrders:', error);
    res.json({ success: false, message: "Error fetching orders", error: error.message });
  }
};

const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({}).sort({ orderDate: -1 }); // Sắp xếp mới nhất trước
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error in listOrders:', error);
    res.json({ success: false, message: "Error fetching orders", error: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { orderId, orderStatus } = req.body;

    if (!orderId || !orderStatus) {
      return res.status(400).json({
        success: false,
        message: "Order ID and status are required"
      });
    }

    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      { orderStatus }, // Chỉ cập nhật orderStatus
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    console.log('Successfully updated order status:', updatedOrder);
    res.json({
      success: true,
      message: "Order status updated successfully",
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message
    });
  }
};
const deleteOrder = async (req, res) => {
  try {
    // Nên lấy orderId từ params thay vì body cho DELETE request
    const orderId = req.params.id; // Giả sử route là /delete-order/:id

    if (!orderId) {
      return res.status(400).json({ success: false, message: "Order ID is required" });
    }

    const deletedOrder = await orderModel.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export {
  placeOrder,
  verifyOrder, // Dùng cho Stripe verify
  userOrders,
  listOrders,
  updateStatus,
  deleteOrder,
  vnpayReturn, // Export hàm xử lý VNPay Return URL
  vnpayIPN     // Export hàm xử lý VNPay IPN
};