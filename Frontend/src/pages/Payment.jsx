// src/pages/Payment.jsx

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Divider, Image } from "antd";
import { CreditCard, Truck, ArrowLeft, CheckCircle } from "lucide-react"; // Sử dụng icon từ Lucide
import { errorToast, successToast } from "../utils/toast";
import { placeOrder } from "../APIs/orderApi";
import { jwtDecode } from "jwt-decode";
import { getUser, updateUser } from "../APIs/userApi";
import { redeemVoucher } from "../APIs/VoucherAPI";
import vnpay from "../img/images.png";
import axios from "axios"; // Import axios để gọi API VNPAY

const PaymentMethod = ({ id, name, icon, selected, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(id)}
      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all
      ${
        selected === id
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 hover:border-blue-300"
      }`}
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 mr-4">
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-medium text-gray-800">{name}</p>
      </div>
      <div className="ml-auto">
        <div
          className={`w-5 h-5 rounded-full border
        ${
          selected === id
            ? "border-4 border-blue-500"
            : "border border-gray-300"
        }`}
        ></div>
      </div>
    </div>
  );
};

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedPayment, setSelectedPayment] = useState("cod");
  const [userId, setUserId] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    address: "",
    note: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const {
    cartItems = {},
    products = [],
    selectedVoucher = null,
  } = location.state || {};
  const fetchUser = useCallback(async (id) => {
    try {
      const response = await getUser(id);
      if (response.success && response.data) {
        const userData = response.data;
        setFormData({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          phoneNumber: userData.phoneNumber || "",
          address: userData.address || "",
          note: "", // Note nên để trống ban đầu
        });
      } else {
        errorToast("Không thể lấy thông tin người dùng.");
        localStorage.removeItem("token");
        navigate("/sign-in");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      errorToast("Lỗi kết nối hoặc lỗi hệ thống khi tải dữ liệu người dùng.");
    }
  }, []);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      errorToast("Vui lòng đăng nhập để tiếp tục.");
      navigate("/login");
      return;
    }
    try {
      const decodedToken = jwtDecode(token);
      const idFromToken = decodedToken.id;
      if (!idFromToken) {
        errorToast("Token không hợp lệ.");
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      setUserId(idFromToken); // Set userId từ token
      fetchUser(idFromToken); // Fetch data cho user này
    } catch (error) {
      console.error("Token decoding error:", error);
      errorToast("Lỗi xác thực token.");
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [fetchUser, navigate]); // Phụ thuộc vào fetchUser và navigate

  // Tính toán giá tiền (Giữ nguyên)
  const subtotal = products.reduce(
    (total, product) =>
      cartItems[product._id]
        ? total +
          (parseFloat(
            String(product.PricePD).replace(/\./g, "").replace(",", ".")
          ) || 0) *
            (cartItems[product._id] || 0)
        : total,
    0
  );

  const calculateDiscount = () => {
    if (!selectedVoucher || subtotal === 0) return 0;

    const discountPercent = Number(selectedVoucher.discount) || 0;
    const maxDiscount = selectedVoucher.maximumDiscount
      ? Number(selectedVoucher.maximumDiscount)
      : Infinity;
    const minAmount = Number(selectedVoucher.minimumAmount) || 0;

    if (subtotal < minAmount) return 0;

    let discountAmount = subtotal * (discountPercent / 100);
    discountAmount = Math.min(discountAmount, maxDiscount);
    return Math.round(discountAmount);
  };

  const discount = calculateDiscount();
  const shippingFee = 30000;
  const total = Math.max(0, subtotal + shippingFee - discount);

  // useEffect kiểm tra giỏ hàng (Giữ nguyên)
  useEffect(() => {
    // Chỉ điều hướng nếu không có state hoặc cartItems rỗng
    if (!location.state || !cartItems || Object.keys(cartItems).length === 0) {
      console.log("Redirecting to cart due to empty cart or missing state.");
      // errorToast("Giỏ hàng trống hoặc có lỗi xảy ra."); // Có thể thêm toast
      navigate("/cart");
    }
  }, [cartItems, navigate, location.state]);

  // handleInputChange (Giữ nguyên)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // validateForm (Giữ nguyên)
  const validateForm = () => {
    const { firstName, lastName, phoneNumber, address } = formData;
    if (![firstName, lastName, address].every((val) => val.trim())) {
      errorToast("Vui lòng nhập đầy đủ thông tin giao hàng bắt buộc (*)");
      return false;
    }
    const nameRegex = /^[\p{L}\s]+$/u;
    if (!nameRegex.test(firstName.trim())) {
      errorToast("Họ chỉ được chứa chữ cái và khoảng trắng");
      return false;
    }
    if (!nameRegex.test(lastName.trim())) {
      errorToast("Tên chỉ được chứa chữ cái và khoảng trắng");
      return false;
    }
    if (!phoneNumber.match(/^\d{10}$/)) {
      errorToast("Số điện thoại không hợp lệ (phải đủ 10 chữ số)");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (!validateForm()) {
        setIsSubmitting(false);
        return;
      }
      const token = localStorage.getItem("token");
      if (!token) {
        errorToast("Vui lòng đăng nhập để đặt hàng");
        setIsSubmitting(false);
        return;
      }
      const orderItems = products
        .filter((p) => cartItems[p._id] && cartItems[p._id] > 0) // Lọc sp hợp lệ
        .map((product) => ({
          _id: product._id,
          name: product.ProductName,
          price: product.PricePD, // Giữ nguyên định dạng giá gốc
          quantity: cartItems[product._id],
          image: product.ImagePD,
        }));

      if (orderItems.length === 0) {
        errorToast("Giỏ hàng không có sản phẩm hợp lệ.");
        setIsSubmitting(false);
        return;
      }

      const orderData = {
        items: orderItems,
        totalAmount: total, // Bỏ qua, để backend tự tính toán lại cho chắc chắn
        shippingAddress: {
          fullName: formData.firstName.trim() + " " + formData.lastName.trim(),
          phone: formData.phoneNumber.trim(),
          address: formData.address.trim(),
        },
        paymentMethod: selectedPayment, // Gửi phương thức đã chọn
        note: formData.note.trim(),
        voucher: selectedVoucher ? selectedVoucher._id : null, // Gửi ID voucher
        discount: discount,
      };
      if (selectedVoucher) {
        await redeemVoucher(selectedVoucher.code);
      }

      // Cập nhật thông tin user (như code gốc)
      const resData = await updateUser(userId, formData, token);
      if (resData.success) {
        setFormData(resData.data);
      }
      const response = await placeOrder(orderData, token);
      if (response.success) {
        const orderId = response.orderId;
        const finalTotalAmount = response.totalAmount || total;
        if (selectedPayment === "card") {
          if (response.session_url) {
            successToast(
              "Đặt hàng thành công! Đang chuyển hướng đến Stripe..."
            );
            localStorage.removeItem("cart");
            window.location.href = response.session_url;
          } else {
            errorToast(
              "Đặt hàng thành công nhưng không nhận được link thanh toán Stripe."
            );
            navigate("/my-orders");
          }
        } else if (selectedPayment === "cod") {
          successToast("Đặt hàng COD thành công!");
          const cartFromStorage = JSON.parse(
            localStorage.getItem("cart") || "{}"
          );
          for (const productId of Object.keys(cartItems)) {
            if (selectedItems.includes(productId)) {
              delete cartFromStorage[productId];
            }
          }
          localStorage.setItem("cart", JSON.stringify(cartFromStorage));
          navigate("/order-confirmation", {
            state: {
              orderDetails: {
                ...formData,
                paymentMethod: selectedPayment,
                items: orderItems,
                total,
                orderId: response.orderId,
                discount: discount,
                voucher: selectedVoucher,
              },
            },
          });
        } else if (selectedPayment === "vnpay") {
          try {
            const vnpayApiUrl = `${
              process.env.REACT_APP_API_URL || "http://localhost:4000"
            }/api/vnpay/create_payment_url`;
            const vnpayPayload = {
              orderId: orderId,
              amount: finalTotalAmount, // Sử dụng tổng tiền cuối cùng
              orderDescription: `Thanh toan don hang ${orderId}`,
              language: "vn",
            };
            console.log("Requesting VNPAY URL with payload:", vnpayPayload);

            const vnpayResponse = await axios.post(vnpayApiUrl, vnpayPayload, {
              headers: { Authorization: `Bearer ${token}` },
            });

            console.log("VNPAY URL Response:", vnpayResponse.data);

            if (vnpayResponse.data.success && vnpayResponse.data.payment_url) {
              successToast(
                "Đặt hàng thành công! Đang chuyển hướng đến VNPAY..."
              );
              localStorage.removeItem("cart"); // Xóa cart trước khi chuyển hướng
              window.location.href = vnpayResponse.data.payment_url; // Chuyển hướng người dùng
            } else {
              errorToast(
                vnpayResponse.data.message ||
                  "Đặt hàng thành công nhưng không thể tạo link thanh toán VNPAY."
              );
              navigate("/my-orders");
            }
          } catch (vnpayError) {
            console.error(
              "Error creating VNPAY payment URL:",
              vnpayError.response?.data || vnpayError.message
            );
            const errorMsg =
              vnpayError.response?.data?.message ||
              "Lỗi kết nối khi tạo link VNPAY.";
            errorToast(
              `Đặt hàng thành công nhưng gặp lỗi khi tạo link VNPAY: ${errorMsg}`
            );
            navigate("/my-orders"); // Chuyển về trang đơn hàng
          }
        }
      } else {
        errorToast(response.message || "Đặt hàng thất bại. Vui lòng thử lại.");
      }
    } catch (error) {
      // Lỗi chung trong quá trình xử lý
      console.error("Order submission error:", error);
      // Phân tích lỗi cụ thể hơn nếu có thể
      if (error.response?.status === 401) {
        errorToast("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        localStorage.removeItem("token");
        navigate("/login");
      } else if (error.message.includes("Network Error")) {
        errorToast("Lỗi mạng. Vui lòng kiểm tra kết nối và thử lại.");
      } else {
        const errorMsg =
          error.response?.data?.message || "Lỗi không xác định khi đặt hàng.";
        errorToast(errorMsg);
      }
    } finally {
      setIsSubmitting(false); // Luôn cho phép submit lại sau khi kết thúc
    }
  };

  const handleBackToCart = () => navigate("/cart");

  // --- PHẦN RENDER UI ---
  return (
    <div className=" bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 min-h-screen mt-16">
      {" "}
      {/* Thêm mt-16 nếu header fixed */}
      <div className="max-w-6xl mx-auto">
        {/* Header và Progress bar (Giữ nguyên) */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thanh Toán</h1>
          <p className="text-gray-600">Hoàn tất đơn hàng của bạn</p>
        </div>
        <div className="flex justify-center mb-12">
          {/* Progress bar Steps */}
          <div className="w-full max-w-md">
            <div className="flex items-center">
              {/* Step 1 */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-600 text-white">
                  <CheckCircle size={20} />
                </div>
                <span className="mt-2 text-sm text-blue-600 font-medium">
                  Giỏ hàng
                </span>
              </div>
              <div className="flex-1 h-1 mx-2 bg-blue-600"></div>
              {/* Step 2 */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-600 text-white">
                  2
                </div>
                <span className="mt-2 text-sm text-blue-600 font-medium">
                  Thanh toán
                </span>
              </div>
              <div className="flex-1 h-1 mx-2 bg-gray-200"></div>
              {/* Step 3 */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 text-gray-600">
                  3
                </div>
                <span className="mt-2 text-sm text-gray-500">Hoàn tất</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form và Order Summary */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cột trái: Form */}
          <div className="lg:w-2/3">
            {/* Bỏ thẻ <form> hoặc giữ lại nhưng dùng button type="button" */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Thông tin giao hàng (Giữ nguyên) */}
              <div className="p-6 border-b">
                <div className="flex items-center mb-4">
                  <Truck className="text-blue-600 mr-2" size={20} />
                  <h2 className="text-xl font-semibold text-gray-800">
                    Thông tin giao hàng
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Các input fields giống code gốc */}
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Họ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="phoneNumber"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      required
                      maxLength={10}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Địa chỉ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="note"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Ghi chú
                    </label>
                    <textarea
                      id="note"
                      name="note"
                      rows={2}
                      value={formData.note}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ví dụ: Giao hàng giờ hành chính"
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center mb-4">
                  <CreditCard className="text-blue-600 mr-2" size={20} />
                  <h2 className="text-xl font-semibold text-gray-800">
                    Phương thức thanh toán
                  </h2>
                </div>
                <div className="space-y-3">
                  {/* Stripe (Card) */}
                  <PaymentMethod
                    id="card"
                    name="Thanh toán bằng Thẻ ngân hàng (Stripe)"
                    icon={<CreditCard size={20} />}
                    selected={selectedPayment}
                    onSelect={setSelectedPayment}
                  />
                  <PaymentMethod
                    id="cod"
                    name="Thanh toán khi nhận hàng (COD)"
                    icon={<Truck size={20} />}
                    selected={selectedPayment}
                    onSelect={setSelectedPayment}
                  />
                  <PaymentMethod
                    id="vnpay"
                    name="Thanh toán qua VNPAY"
                    icon={
                      <img
                        src={vnpay}
                        alt="VNPAY"
                        className="h-6 w-auto object-contain"
                      />
                    }
                    selected={selectedPayment}
                    onSelect={setSelectedPayment}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden sticky top-20">
              {" "}
              {/* Điều chỉnh top nếu header fixed */}
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-800">
                  Đơn hàng của bạn
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                  {products
                    .filter((p) => cartItems[p._id])
                    .map((product) => (
                      <div key={product._id} className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border border-gray-200">
                          <Image
                            src={product.ImagePD}
                            alt={product.ProductName}
                            className="w-full h-full object-cover"
                            preview={false}
                            fallback="/placeholder.png"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {product.ProductName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            SL: {cartItems[product._id]}
                          </p>
                        </div>
                        <div className="text-sm font-medium text-gray-900 text-right">
                          {(
                            (parseFloat(
                              String(product.PricePD)
                                .replace(/\./g, "")
                                .replace(",", ".")
                            ) || 0) * cartItems[product._id]
                          ).toLocaleString("vi-VN")}
                          ₫
                        </div>
                      </div>
                    ))}
                </div>
                <div className="space-y-3 border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tạm tính</span>
                    <span className="text-sm font-medium">
                      {subtotal.toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Phí vận chuyển
                    </span>
                    <span className="text-sm font-medium">
                      {shippingFee.toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-green-600">
                        Giảm giá ({selectedVoucher?.code})
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        -{discount.toLocaleString("vi-VN")}₫
                      </span>
                    </div>
                  )}
                  <Divider className="my-2" />
                  <div className="flex justify-between">
                    <span className="text-base font-semibold">Tổng cộng</span>
                    <span className="text-xl font-bold text-blue-600">
                      {total.toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={
                      isSubmitting ||
                      total <= 0 ||
                      Object.keys(cartItems).length === 0
                    }
                    className={`w-full px-4 py-3 rounded-lg font-semibold text-white transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      isSubmitting ||
                      total <= 0 ||
                      Object.keys(cartItems).length === 0
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {isSubmitting
                      ? "Đang xử lý..."
                      : `Xác nhận thanh toán (${selectedPayment.toUpperCase()})`}
                  </button>
                  <button
                    type="button"
                    onClick={handleBackToCart}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center disabled:opacity-50"
                  >
                    <ArrowLeft size={18} className="mr-2" />
                    Quay lại giỏ hàng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
