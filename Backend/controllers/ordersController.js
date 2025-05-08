import mongoose from "mongoose";
import orderModel from "../models/ordersModel.js";
import userModel from "../models/userModel.js";
import voucherModel from '../models/voucherModel.js';
import Stripe from "stripe";
import { createVnpayPaymentUrl } from "./vnpayController.js";

let stripe;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
} else {
  console.warn("STRIPE_SECRET_KEY is not defined. Stripe payments will not work.");
}

const placeOrder = async (req, res) => {
  const frontend_url = process.env.CLIENT_URL || "http://localhost:3000";

  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Người dùng chưa đăng nhập hoặc token không hợp lệ.",
      });
    }

    const { items, totalAmount: totalAmountFromFrontend, shippingAddress, paymentMethod, note, voucherCode } = req.body;

    // Input Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Giỏ hàng trống hoặc không hợp lệ." });
    }
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin giao hàng." });
    }
    const validPaymentMethods = ["cod", "card", "vnpay"];
    if (!paymentMethod || !validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: "Phương thức thanh toán không hợp lệ." });
    }
    if (paymentMethod === 'card' && !stripe) {
      return res.status(500).json({ success: false, message: "Hệ thống thanh toán thẻ chưa được cấu hình." });
    }

    // Format Items & Calculate Subtotal
    let calculatedSubtotal = 0;
    const formattedItems = items.map(item => {
      const price = Number(String(item.price).replace(/\./g, '').replace(',', '.')) || 0;
      const quantity = Number(item.quantity) || 0;
      if (price <= 0 || quantity <= 0) {
        throw new Error(`Sản phẩm "${item.name || item._id}" có giá hoặc số lượng không hợp lệ.`);
      }
      calculatedSubtotal += price * quantity;
      return {
        productId: item._id,
        name: item.name,
        price: price,
        quantity: quantity,
        image: item.image,
      };
    });

    // Calculate shipping fee and total before discount
    const shippingFee = 30000;
    const calculatedTotalAmount = calculatedSubtotal + shippingFee;

    // Voucher Logic
    let discountAmount = 0;
    let appliedVoucherCode = null;

    if (voucherCode) {
      console.log(`Backend: Applying voucher: ${voucherCode}`);
      try {
        const voucher = await voucherModel.findOne({ code: voucherCode, isActive: true });
        if (voucher) {
          if (voucher.minimumOrderValue && calculatedSubtotal < voucher.minimumOrderValue) {
            console.log(`Backend: Subtotal ${calculatedSubtotal} < min ${voucher.minimumOrderValue}. Voucher skipped.`);
          } else {
            let calculatedDiscount = (calculatedSubtotal * voucher.discount) / 100;
            if (voucher.maximumDiscount && calculatedDiscount > voucher.maximumDiscount) {
              calculatedDiscount = voucher.maximumDiscount;
            }
            discountAmount = Math.round(calculatedDiscount);
            appliedVoucherCode = voucher.code;
            console.log(`Backend: Voucher ${appliedVoucherCode} applied. Discount: ${discountAmount}`);
          }
        } else {
          console.log(`Backend: Voucher ${voucherCode} not found or invalid.`);
        }
      } catch (voucherError) {
        console.error("Backend: Error processing voucher:", voucherError);
      }
    }

    // Calculate Final Total Amount
    const finalTotalAmount = Math.max(0, calculatedTotalAmount - discountAmount);
    console.log(`Backend: Final Amount: ${finalTotalAmount} (Sub: ${calculatedSubtotal}, Ship: ${shippingFee}, Disc: ${discountAmount})`);

    if (Math.abs(Number(totalAmountFromFrontend) - finalTotalAmount) > 1) {
      console.warn(`Backend WARN: Amount mismatch! FE: ${totalAmountFromFrontend}, BE: ${finalTotalAmount}.`);
    }

    // Determine initial status
    let initialPaymentStatus;
    switch (paymentMethod) {
      case "cod":
        initialPaymentStatus = "Chưa thanh toán";
        break;
      case "card":
      case "vnpay":
        initialPaymentStatus = "Chờ thanh toán";
        break;
      default:
        return res.status(400).json({ success: false, message: "Lỗi logic phương thức thanh toán." });
    }

    // Create new order
    const newOrder = new orderModel({
      userId,
      items: formattedItems,
      totalAmount: finalTotalAmount,
      shippingAddress,
      paymentMethod,
      paymentStatus: initialPaymentStatus,
      note: note ? note.trim() : "",
      voucherCode: appliedVoucherCode,
      discountAmount: discountAmount,
    });

    const savedOrder = await newOrder.save();
    console.log(`Backend: Order ${savedOrder._id} saved.`);

    // Clear cart
    try {
      await userModel.findByIdAndUpdate(userId, { cartData: {} });
      console.log(`Backend: Cart cleared for user ${userId}.`);
    } catch (cartError) {
      console.error(`Backend: Error clearing cart for user ${userId}:`, cartError);
    }

    // Handle payment methods
    let responsePayload = { success: true, orderId: savedOrder._id };

    if (paymentMethod === "cod") {
      responsePayload.message = "Đặt hàng thành công (COD)";
      return res.status(201).json(responsePayload);
    }
    else if (paymentMethod === "card") {
      try {
        const line_items = formattedItems.map((item) => ({
          price_data: {
            currency: "vnd",
            product_data: { name: item.name },
            unit_amount: Math.round(item.price),
          },
          quantity: item.quantity,
        }));
        line_items.push({
          price_data: { currency: "vnd", product_data: { name: "Phí vận chuyển" }, unit_amount: Math.round(shippingFee) },
          quantity: 1,
        });

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: line_items,
          mode: "payment",
          metadata: {
            orderId: savedOrder._id.toString(),
            userId: userId.toString(),
            appliedVoucher: appliedVoucherCode || 'None',
            discount: discountAmount
          },
          success_url: `${frontend_url}/payment-result?success=true&orderId=${savedOrder._id}&paymentMethod=card&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${frontend_url}/payment-result?success=false&orderId=${savedOrder._id}&paymentMethod=card`,
        });

        responsePayload.session_url = session.url;
        console.log(`Backend: Stripe session created for order ${savedOrder._id}`);
        return res.status(200).json(responsePayload);
      } catch (stripeError) {
        console.error(`Backend: Stripe Session Error for order ${savedOrder._id}:`, stripeError);
        return res.status(500).json({ success: false, message: "Lỗi khi tạo phiên thanh toán Stripe.", orderId: savedOrder._id });
      }
    }
    else if (paymentMethod === "vnpay") {
      try {
        // Truyền thêm voucherCode và discountAmount vào createVnpayPaymentUrl
        const vnpayUrl = createVnpayPaymentUrl(req, savedOrder._id, finalTotalAmount, appliedVoucherCode, discountAmount);
        responsePayload.vnpay_url = vnpayUrl;
        console.log(`Backend: VNPAY URL created for order ${savedOrder._id}`);
        return res.status(200).json(responsePayload);
      } catch (vnpayError) {
        console.error(`Backend: VNPAY URL Error for order ${savedOrder._id}:`, vnpayError);
        return res.status(500).json({ success: false, message: "Lỗi khi tạo URL thanh toán VNPAY.", orderId: savedOrder._id });
      }
    }
  } catch (error) {
    console.error("Backend: Error during order placement process:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi hệ thống khi xử lý đơn hàng.",
    });
  }
};

const verifyOrder = async (req, res) => {
  console.warn("API /verify is deprecated and should not be relied upon for payment confirmation. Use Webhooks (Stripe) or IPN (VNPAY).");
  const { orderId, success } = req.body;
  const successBool = String(success).toLowerCase() === 'true';

  try {
    if (!orderId) {
      return res.status(400).json({ success: false, message: "Order ID is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "Order ID không hợp lệ." });
    }

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng." });
    }

    if (order.paymentMethod === 'card' && order.paymentStatus === 'Chờ thanh toán') {
      if (successBool) {
        console.log(`VerifyOrder: Received success redirect for card order ${orderId}. Waiting for webhook.`);
        return res.json({ success: true, message: "Received success redirect (status pending webhook)." });
      } else {
        await orderModel.findByIdAndUpdate(orderId, { paymentStatus: "Thất bại" });
        console.log(`VerifyOrder: Received cancel redirect for card order ${orderId}. Marked as Failed.`);
        return res.json({ success: false, message: "Received cancel redirect." });
      }
    } else {
      console.log(`VerifyOrder: Ignoring call for order ${orderId} (Status: ${order.paymentStatus}, Method: ${order.paymentMethod})`);
      return res.json({ success: true, message: "Order status not applicable or already updated." });
    }
  } catch (error) {
    console.error('Error in verifyOrder:', error);
    res.status(500).json({ success: false, message: "Server error during verifyOrder", error: error.message });
  }
};

const userOrders = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Yêu cầu xác thực người dùng." });
    }

    console.log('Fetching orders for userId:', userId.toString());
    const orders = await orderModel.find({ userId }).sort({ createdAt: -1 });
    console.log(`Orders found for user ${userId}:`, orders.length);

    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error in userOrders:', error);
    res.status(500).json({ success: false, message: "Lỗi server khi lấy đơn hàng.", error: error.message });
  }
};

const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({}).sort({ createdAt: -1 });
    console.log('All orders fetched (Admin)');
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error in listOrders (Admin):', error);
    res.status(500).json({ success: false, message: "Lỗi server khi lấy danh sách đơn hàng.", error: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { orderId, orderStatus } = req.body;

    if (!orderId || !orderStatus) {
      return res.status(400).json({ success: false, message: "Thiếu Order ID hoặc Trạng thái đơn hàng." });
    }
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "Order ID không hợp lệ." });
    }
    const allowedStatuses = orderModel.schema.path('orderStatus').enumValues;
    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({ success: false, message: `Trạng thái đơn hàng không hợp lệ. Chỉ chấp nhận: ${allowedStatuses.join(', ')}` });
    }

    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      { orderStatus: orderStatus },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng." });
    }

    console.log(`Admin updated order ${orderId} status to ${orderStatus}`);
    res.json({
      success: true,
      message: "Cập nhật trạng thái đơn hàng thành công.",
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order status (Admin):', error);
    res.status(500).json({ success: false, message: "Lỗi server khi cập nhật trạng thái.", error: error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "Order ID không hợp lệ." });
    }

    const deletedOrder = await orderModel.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng để xóa." });
    }

    console.log(`Admin deleted order ${orderId}`);
    res.json({ success: true, message: "Xóa đơn hàng thành công." });
  } catch (error) {
    console.error('Error deleting order (Admin):', error);
    res.status(500).json({ success: false, message: "Lỗi server khi xóa đơn hàng.", error: error.message });
  }
};

export {
  placeOrder,
  verifyOrder,
  userOrders,
  listOrders,
  updateStatus,
  deleteOrder
};