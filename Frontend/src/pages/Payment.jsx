import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Divider, Image } from "antd";
import { CreditCard, Truck, ArrowLeft, CheckCircle } from "lucide-react";
import { errorToast, successToast, toastContainer } from "../utils/toast";
import { placeOrder } from "../APIs/orderApi"; // Đã import placeOrder
import { jwtDecode } from "jwt-decode";
import { getUser, updateUser } from "../APIs/userApi";

// ... (Component PaymentMethod giữ nguyên) ...
const PaymentMethod = ({ id, name, icon, selected, onSelect, disabled = false }) => {
  return (
    <div
      onClick={() => !disabled && onSelect(id)}
      className={`flex items-center p-4 border rounded-lg transition-all
      ${selected === id ? "border-blue-500 bg-blue-50" : "border-gray-200"}
      ${disabled ? "opacity-50 cursor-not-allowed bg-gray-100" : "cursor-pointer hover:border-blue-300"}`}
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600">
        {icon}
      </div>
      <div className="ml-4">
        <p className={`font-medium ${disabled ? 'text-gray-500' : 'text-gray-800'}`}>{name}</p>
        {disabled && <p className="text-xs text-red-500">Tạm thời không khả dụng</p>}
      </div>
      {!disabled && (
        <div className="ml-auto">
          <div className={`w-5 h-5 rounded-full border
          ${selected === id ? "border-4 border-blue-500" : "border border-gray-300"}`}></div>
        </div>
      )}
    </div>
  );
};


const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedPayment, setSelectedPayment] = useState("cod"); // Mặc định COD
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null); // State lưu trữ user data
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    address: "",
    note: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    cartItems = {},
    products = [],
    selectedVoucher = null,
  } = location.state || {}; // Lấy dữ liệu từ Cart

  // --- Fetch User Data ---
  const fetchUser = useCallback(async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        errorToast("Vui lòng đăng nhập lại.");
        navigate('/login'); // Chuyển hướng về login nếu không có token
        return;
      }
      // Sử dụng getUser từ userApi đã import
      const response = await getUser(id, token); // getUser cần token
      console.log("User data response:", response);
      if (response.success && response.data) {
        const user = response.data;
        setUserData(user); // Lưu trữ user data
        setFormData({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          phoneNumber: user.phoneNumber || "",
          address: user.address || "",
          note: "", // Reset note
        });
      } else {
        errorToast(response.message || "Không thể tải dữ liệu người dùng.");
      }
    } catch (err) {
      console.error("Fetch user error:", err);
      errorToast("Lỗi kết nối hoặc lỗi hệ thống khi tải dữ liệu người dùng.");
      if (err.response && err.response.status === 401) {
        localStorage.removeItem("token");
        navigate('/login');
      }
    }
  }, [navigate]); // Thêm navigate vào dependency array

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      errorToast("Vui lòng đăng nhập để thanh toán.");
      navigate("/login"); // Chuyển hướng về login nếu chưa đăng nhập
      return;
    }
    try {
      const decodedToken = jwtDecode(token);
      const idFromToken = decodedToken.id;
      if (!idFromToken) {
        errorToast("Token không hợp lệ. Vui lòng đăng nhập lại.");
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      setUserId(idFromToken); // Set userId từ token
      fetchUser(idFromToken); // Fetch user data bằng id từ token
    } catch (error) {
      console.error("Token decode error:", error);
      errorToast("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [fetchUser, navigate]); // Thêm fetchUser và navigate

  // --- Calculations ---
  const subtotal = products.reduce(
    (total, product) =>
      cartItems[product._id]
        ? total + Number(String(product.PricePD).replace(/\./g, '').replace(',', '.')) * cartItems[product._id]
        : total,
    0
  );

  const calculateDiscount = () => {
    if (!selectedVoucher) return 0;

    let discountPercent = Number(selectedVoucher.discount) || 0;
    let maxDiscount = selectedVoucher.maximumDiscount ? Number(selectedVoucher.maximumDiscount) : Infinity;

    let discountAmount = subtotal * (discountPercent / 100);
    discountAmount = Math.min(discountAmount, maxDiscount);

    return discountAmount;
  };

  const discount = calculateDiscount();
  const shippingFee = 30000; // Phí ship cố định
  const total = subtotal + shippingFee - discount;

  // Redirect if cart is empty
  useEffect(() => {
    if (!location.state || Object.keys(cartItems).length === 0 || products.length === 0) {
      console.log("Cart is empty or invalid state, redirecting to /cart");
      errorToast("Giỏ hàng trống hoặc dữ liệu không hợp lệ.");
      navigate("/cart", { replace: true });
    }
  }, [cartItems, products, location.state, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- Form Validation ---
  const validateForm = () => {
    let isValid = true;
    if (!formData.lastName.trim() || !formData.firstName.trim()) { // Check cả first và last name
      errorToast("Vui lòng nhập đầy đủ họ và tên.");
      isValid = false;
    }
    // Regex kiểm tra số điện thoại Việt Nam (10 số, bắt đầu bằng 0)
    if (!formData.phoneNumber.match(/^(0[3|5|7|8|9])+([0-9]{8})$/)) {
      errorToast('Số điện thoại không hợp lệ (phải đủ 10 số và bắt đầu bằng 0).');
      isValid = false;
    }
    if (!formData.address.trim()) {
      errorToast("Vui lòng nhập địa chỉ giao hàng.");
      isValid = false;
    }
    return isValid;
  };

  // --- Handle Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return; // Stop nếu form không hợp lệ
    }
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token || !userId) {
        errorToast("Vui lòng đăng nhập lại để đặt hàng.");
        navigate('/login');
        setIsSubmitting(false);
        return;
      }

      // Cập nhật thông tin user nếu có thay đổi
      // So sánh formData với userData ban đầu
      if (
        formData.firstName !== userData.firstName ||
        formData.lastName !== userData.lastName ||
        formData.phoneNumber !== userData.phoneNumber ||
        formData.address !== userData.address
      ) {
        const updateData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          // Không gửi password hoặc các trường nhạy cảm khác
        };
        const updateRes = await updateUser(userId, updateData, token); // updateUser cần token
        if (!updateRes.success) {
          console.warn("Cập nhật thông tin người dùng thất bại:", updateRes.message);
          // Có thể không chặn đặt hàng nhưng nên log lại
        } else {
          console.log("Thông tin người dùng đã được cập nhật.");
          // Cập nhật lại userData state nếu cần
          setUserData(prev => ({ ...prev, ...updateData }));
        }
      }


      // Chuẩn bị dữ liệu đơn hàng
      const orderItems = products
        .filter((p) => cartItems[p._id])
        .map((product) => ({
          _id: product._id,
          name: product.ProductName,
          // Đảm bảo PricePD là number trước khi gửi
          price: Number(String(product.PricePD).replace(/\./g, '').replace(',', '.')),
          quantity: cartItems[product._id],
          image: product.ImagePD,
        }));

      const orderData = {
        items: orderItems,
        totalAmount: total,
        shippingAddress: {
          fullName: `${formData.firstName} ${formData.lastName}`, // Ghép họ tên
          phone: formData.phoneNumber,
          address: formData.address,
        },
        paymentMethod: selectedPayment === 'cod' ? 'Thanh toán khi nhận hàng' : selectedPayment, // Gửi đúng tên phương thức backend xử lý
        note: formData.note,
        voucher: selectedVoucher ? selectedVoucher._id : null, // Gửi ID voucher nếu có
        discount: discount, // Gửi số tiền giảm giá
      };

      // Gọi API placeOrder
      const response = await placeOrder(orderData, token);

      if (response.success) {
        // Xử lý dựa trên phương thức thanh toán và phản hồi từ backend
        if (selectedPayment === "card" && response.session_url) {
          successToast("Đang chuyển hướng đến trang thanh toán Stripe...");
          window.location.href = response.session_url;
        } else if (selectedPayment === "vnpay" && response.paymentUrl) {
          successToast("Đang chuyển hướng đến cổng thanh toán VNPay...");
          window.location.href = response.paymentUrl; // Chuyển hướng đến URL VNPay
        } else if (selectedPayment === "cod") { // Hoặc 'Thanh toán khi nhận hàng'
          successToast("Đặt hàng thành công! Chúng tôi sẽ liên hệ xác nhận.");
          // Chuyển hướng đến trang xác nhận đơn hàng COD
          navigate("/order-confirmation", {
            state: {
              orderDetails: {
                ...orderData, // Gửi thông tin đơn hàng
                orderId: response.orderId, // Lấy orderId từ response
              },
              isCod: true // Đánh dấu là COD
            },
            replace: true // Thay thế trang thanh toán trong history
          });
          // Cân nhắc xóa cart ở đây hoặc chờ xác nhận từ admin?
          // Hiện tại backend đang xóa cart cho COD ngay trong placeOrder
        } else {
          // Trường hợp thành công nhưng không có URL (lỗi logic?)
          errorToast("Đặt hàng thành công nhưng có lỗi xảy ra trong quá trình xử lý thanh toán.");
        }
        // Không xóa cart ở đây nữa, backend sẽ xóa sau khi thanh toán thành công (IPN hoặc Verify)
        // localStorage.removeItem("cart"); // Không xóa ở đây
      } else {
        // Xử lý lỗi từ backend
        errorToast(response.message || "Đặt hàng thất bại. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Submit order error:", error);
      errorToast(error.response?.data?.message || error.message || "Lỗi hệ thống khi đặt hàng. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToCart = () => navigate("/cart");

  // Nếu chưa có state từ Cart, hiển thị loading hoặc thông báo
  if (!location.state || products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Đang tải dữ liệu hoặc giỏ hàng trống...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {toastContainer()}
      <div className="max-w-6xl mx-auto">
        {/* --- Header và Stepper --- */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thanh Toán</h1>
          <p className="text-gray-600">Hoàn tất đơn hàng của bạn</p>
        </div>
        <div className="flex justify-center mb-12">
          {/* Stepper code giữ nguyên */}
          <div className="w-full max-w-md">
            <div className="flex items-center">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-600 text-white">
                  <CheckCircle size={20} />
                </div>
                <span className="mt-2 text-sm text-blue-600 font-medium">
                  Giỏ hàng
                </span>
              </div>

              <div className="flex-1 h-1 mx-2 bg-blue-600"></div>

              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-600 text-white">
                  2
                </div>
                <span className="mt-2 text-sm text-blue-600 font-medium">
                  Thanh toán
                </span>
              </div>

              <div className="flex-1 h-1 mx-2 bg-gray-200"></div>

              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 text-gray-600">
                  3
                </div>
                <span className="mt-2 text-sm text-gray-500">Hoàn tất</span>
              </div>
            </div>
          </div>
        </div>


        <div className="flex flex-col lg:flex-row gap-8">
          {/* --- Form Thông tin --- */}
          <div className="lg:w-2/3">
            <form
              onSubmit={handleSubmit} // Sử dụng form để submit
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              {/* Thông tin giao hàng */}
              <div className="p-6 border-b">
                <div className="flex items-center mb-4">
                  <Truck className="text-blue-600 mr-2" size={20} />
                  <h2 className="text-xl font-semibold text-gray-800">
                    Thông tin giao hàng
                  </h2>
                </div>
                {/* Inputs giữ nguyên */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                      pattern="^(0[3|5|7|8|9])+([0-9]{8})$" // Pattern validation
                      title="Số điện thoại gồm 10 số, bắt đầu bằng 0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Address và Note giữ nguyên */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Địa chỉ <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      rows={2} // Tăng số dòng cho địa chỉ
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    ></textarea>
                  </div>


                  <div className="sm:col-span-2">
                    <label
                      htmlFor="note"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Ghi chú (tùy chọn)
                    </label>
                    <textarea
                      id="note"
                      name="note"
                      rows={2}
                      value={formData.note}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    ></textarea>
                  </div>
                </div>

              </div>

              {/* Phương thức thanh toán */}
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <CreditCard className="text-blue-600 mr-2" size={20} />
                  <h2 className="text-xl font-semibold text-gray-800">
                    Phương thức thanh toán
                  </h2>
                </div>

                <div className="space-y-3">
                  {/* VNPay */}
                  <PaymentMethod
                    id="vnpay"
                    name="Thanh toán qua VNPay (Thẻ ATM/QR Code)"
                    icon={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"
                        />
                      </svg>
                    }
                    selected={selectedPayment}
                    onSelect={setSelectedPayment}
                  />

                  {/* Stripe */}
                  <PaymentMethod
                    id="card"
                    name="Thanh toán qua Stripe (Thẻ quốc tế Visa, Master,...)"
                    icon={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"
                        />
                      </svg>
                    } selected={selectedPayment}
                    onSelect={setSelectedPayment}
                  />

                  {/* COD */}
                  <PaymentMethod
                    id="cod"
                    name="Thanh toán khi nhận hàng (COD)"
                    icon={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"
                        />
                      </svg>
                    } selected={selectedPayment}
                    onSelect={setSelectedPayment}
                  />
                </div>
              </div>
              {/* Nút submit được chuyển xuống phần tổng kết */}
            </form>
          </div>

          {/* --- Order Summary --- */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden sticky top-4">
              {/* Order Summary Header */}
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-800">
                  Đơn hàng của bạn
                </h2>
              </div>

              {/* Order Items & Totals */}
              <div className="p-6">
                {/* Hiển thị sản phẩm */}
                <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2"> {/* Giới hạn chiều cao và thêm scroll */}
                  {products
                    .filter((p) => cartItems[p._id])
                    .map((product) => (
                      <div key={product._id} className="flex items-start">
                        <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border border-gray-200">
                          <Image
                            src={product.ImagePD}
                            alt={product.ProductName}
                            className="w-full h-full object-cover"
                            preview={false}
                          />
                        </div>
                        <div className="ml-4 flex-1 min-w-0"> {/* Thêm min-w-0 để text wrap */}
                          <h3 className="text-sm font-medium text-gray-900 truncate"> {/* truncate nếu quá dài */}
                            {product.ProductName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            SL: {cartItems[product._id]}
                          </p>
                        </div>
                        <div className="ml-4 text-sm font-medium text-gray-900 whitespace-nowrap"> {/* No wrap */}
                          {(
                            Number(String(product.PricePD).replace(/\./g, '').replace(',', '.')) * cartItems[product._id]
                          ).toLocaleString("vi-VN")}
                          ₫
                        </div>
                      </div>
                    ))}
                </div>


                {/* Tính toán tổng tiền */}
                <div className="space-y-3">
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
                        Giảm giá {selectedVoucher?.code ? `(${selectedVoucher.code})` : ''}
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        -{discount.toLocaleString("vi-VN")}₫
                      </span>
                    </div>
                  )}

                  <Divider className="my-2" />

                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold">Tổng cộng</span>
                    <span className="text-xl font-bold text-blue-600">
                      {total.toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-6 space-y-3">
                  <button
                    type="button" // Đổi thành button để không submit form mặc định
                    onClick={handleSubmit} // Gọi hàm handleSubmit khi click
                    disabled={isSubmitting || total <= 0} // Disable nếu đang xử lý hoặc tổng tiền <= 0
                    className={`w-full px-4 py-3 rounded-lg font-semibold text-white transition-colors duration-200 ease-in-out flex items-center justify-center
                      ${isSubmitting || total <= 0
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-red-500 hover:bg-red-600"
                      }`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Đang xử lý...
                      </>
                    ) : selectedPayment === 'cod' ? 'Xác nhận đặt hàng (COD)' : 'Tiến hành thanh toán'}
                  </button>


                  <button
                    type="button"
                    onClick={handleBackToCart}
                    className="w-full px-4 py-3 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
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