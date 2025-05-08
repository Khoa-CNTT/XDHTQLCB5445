import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Divider, Image } from "antd";
import { CreditCard, Truck, ArrowLeft, CheckCircle, Landmark, Building } from "lucide-react";
import { errorToast, successToast, toastContainer } from "../utils/toast";
import { placeOrder } from "../APIs/orderApi";
import { jwtDecode } from "jwt-decode";
import { getUser, updateUser } from "../APIs/userApi";
// import { redeemVoucher } from "../APIs/VoucherAPI"; // Bỏ qua redeem voucher ở frontend

// --- PaymentMethod Component ---
const PaymentMethod = ({ id, name, icon, selected, onSelect, disabled = false }) => {
  return (
    <div
      onClick={() => !disabled && onSelect(id)}
      className={`flex items-center p-4 border rounded-lg transition-all ${disabled
          ? "bg-gray-100 cursor-not-allowed opacity-60"
          : "cursor-pointer " +
          (selected === id
            ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
            : "border-gray-200 hover:border-blue-300")
        }`}
    >
      <div className={`flex items-center justify-center w-10 h-10 rounded-full ${selected === id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
        {icon}
      </div>
      <div className="ml-4">
        <p className="font-medium text-gray-800">{name}</p>
      </div>
      {!disabled && (
        <div className="ml-auto">
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected === id ? "border-blue-500 bg-blue-500" : "border-gray-300"
            }`}>
            {selected === id && <div className="w-2 h-2 bg-white rounded-full"></div>}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Payment Page Component ---
const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- States ---
  const [selectedPayment, setSelectedPayment] = useState("cod"); // State lưu phương thức thanh toán ĐÃ CHỌN
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", phoneNumber: "", address: "", note: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const {
    cartItems = {},
    products = [],
    selectedVoucher = null,
  } = location.state || {};

  // --- Fetch User Data ---
  const fetchUser = useCallback(async (id, userToken) => {
    setIsLoadingUser(true);
    try {
      const response = await getUser(id, userToken);
      if (response.success && response.data) {
        const userData = response.data;
        setUserId(userData._id);
        setFormData(prev => ({
          ...prev,
          firstName: userData.firstName || prev.firstName || "",
          lastName: userData.lastName || prev.lastName || "",
          phoneNumber: userData.phoneNumber || prev.phoneNumber || "",
          address: userData.address || prev.address || "",
        }));
      } else {
        console.error("Không thể tải dữ liệu người dùng:", response.message);
      }
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu người dùng:", err);
      errorToast("Lỗi kết nối hoặc lỗi hệ thống khi tải dữ liệu người dùng.");
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        setToken(null);
        navigate('/login', { state: { from: location } });
      }
    } finally {
      setIsLoadingUser(false);
    }
  }, [navigate, location]);

  // Effect lấy token và fetch user
  useEffect(() => {
    const currentToken = localStorage.getItem("token");
    if (!currentToken) {
      errorToast("Vui lòng đăng nhập để tiếp tục.");
      setIsLoadingUser(false);
      navigate('/login', { state: { from: location } });
      return;
    }
    setToken(currentToken);
    try {
      const decodedToken = jwtDecode(currentToken);
      const idFromToken = decodedToken.id;
      if (!idFromToken) throw new Error("Token không hợp lệ.");
      fetchUser(idFromToken, currentToken);
    } catch (error) {
      console.error("Lỗi giải mã token:", error);
      errorToast("Phiên đăng nhập hết hạn hoặc không hợp lệ.");
      localStorage.removeItem("token");
      setToken(null);
      setIsLoadingUser(false);
      navigate('/login', { state: { from: location } });
    }
  }, [fetchUser, navigate, location]); // fetchUser chỉ chạy 1 lần khi mount

  // --- Calculations ---
  const subtotal = products.reduce(
    (total, product) =>
      cartItems[product._id]
        ? total + (parseFloat(String(product.PricePD).replace(/\./g, '').replace(',', '.')) || 0) * (cartItems[product._id] || 0)
        : total,
    0
  );
  const calculateDiscount = () => {
    if (!selectedVoucher) return 0;
    const discountPercentage = Number(selectedVoucher.discount) || 0;
    let discountAmount = subtotal * (discountPercentage / 100);
    const maxDiscount = Number(selectedVoucher.maximumDiscount);
    if (maxDiscount && discountAmount > maxDiscount) discountAmount = maxDiscount;
    return Math.round(discountAmount);
  };
  const discount = calculateDiscount();
  const shippingFee = 30000;
  const total = Math.max(0, subtotal + shippingFee - discount);

  // Effect kiểm tra giỏ hàng rỗng
  useEffect(() => {
    if (!isSubmitting && Object.keys(cartItems).length === 0 && products.length === 0) {
      console.log("Giỏ hàng trống, quay lại trang giỏ hàng.");
      // errorToast("Giỏ hàng của bạn đang trống."); // Có thể bỏ toast này
      navigate("/cart");
    }
  }, [cartItems, products, isSubmitting, navigate]);

  // --- Form Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const { firstName, lastName, phoneNumber, address } = formData;
    if (!firstName.trim() || !lastName.trim() || !address.trim()) {
      errorToast("Vui lòng nhập đầy đủ Họ, Tên và Địa chỉ giao hàng.");
      return false;
    }
    if (!/^\d{10}$/.test(phoneNumber.trim())) {
      errorToast("Số điện thoại không hợp lệ (cần đúng 10 chữ số).");
      return false;
    }
    return true;
  };

  // --- Submit Handler ---
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;
    if (!validateForm()) return;
    if (!token) {
      errorToast("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
      navigate('/login', { state: { from: location } });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Chuẩn bị Order Items
      const orderItems = products
        .filter((p) => cartItems[p._id] && cartItems[p._id] > 0)
        .map((product) => ({
          _id: product._id,
          name: product.ProductName,
          price: parseFloat(String(product.PricePD).replace(/\./g, '').replace(',', '.')) || 0,
          quantity: cartItems[product._id],
          image: product.ImagePD,
        }));

      if (orderItems.length === 0) {
        errorToast("Giỏ hàng của bạn trống hoặc không hợp lệ.");
        setIsSubmitting(false);
        return;
      }

      // 2. Chuẩn bị Order Data
      const orderData = {
        items: orderItems,
        totalAmount: total, // Backend SẼ TÍNH LẠI
        shippingAddress: {
          fullName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          phone: formData.phoneNumber.trim(),
          address: formData.address.trim(),
        },
        paymentMethod: selectedPayment, // <<< Gửi đi phương thức đã chọn (từ state)
        note: formData.note.trim(),
        voucherCode: selectedVoucher ? selectedVoucher.code : null,
      };

      // 3. Gọi API đặt hàng
      console.log("Sending order data:", orderData);
      const response = await placeOrder(orderData, token);
      console.log("Place order response:", response);

      // 4. Xử lý kết quả
      if (response.success) {
        const orderId = response.orderId;
        localStorage.removeItem("cart"); // Xóa cart ở client (xem xét lại nếu cần độ chính xác cao hơn)

        if (response.session_url) { // Stripe
          successToast("Đang chuyển hướng đến cổng thanh toán Stripe...");
          window.location.href = response.session_url;
        } else if (response.vnpay_url) { // VNPAY
          successToast("Đang chuyển hướng đến cổng thanh toán VNPAY...");
          window.location.href = response.vnpay_url;
          // **** ĐẢM BẢO KIỂM TRA selectedPayment Ở ĐÂY ****
        } else if (selectedPayment === "cod") { // <<< Kiểm tra state đã chọn
          // **** ************************************ ****
          successToast("Đặt hàng thành công!");
          navigate("/order-confirmation", {
            replace: true,
            state: {
              orderId: orderId,
              orderDetails: {
                ...formData, // Thông tin giao hàng
                items: orderItems,
                totalAmount: total, // Dùng total frontend cho trang xác nhận
                discount: discount,
                shippingFee: shippingFee,
                subtotal: subtotal,
                paymentMethod: selectedPayment, // <<< Gửi đi phương thức đã chọn
                voucherCode: selectedVoucher?.code,
                orderDate: new Date().toISOString(),
              },
            }
          });
        } else {
          successToast("Đặt hàng thành công! Vui lòng kiểm tra đơn hàng.");
          navigate("/my-orders", { replace: true });
        }
        // Không setIsSubmitting(false) ở đây vì đã chuyển trang/redirect
      } else {
        errorToast(response.message || "Đặt hàng thất bại. Vui lòng thử lại.");
        setIsSubmitting(false); // Cho phép thử lại nếu lỗi từ API
      }
    } catch (error) {
      console.error("Lỗi nghiêm trọng khi đặt hàng:", error);
      errorToast("Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.");
      setIsSubmitting(false); // Cho phép thử lại nếu lỗi mạng/code
    }
    // Không set isSubmitting=false ở cuối vì nếu thành công sẽ chuyển trang
  };

  const handleBackToCart = () => navigate("/cart");

  // --- Render ---
  if (isLoadingUser) {
    return <div className="flex justify-center items-center min-h-[60vh]">Đang tải thông tin...</div>;
  }

  return (
    <div className=" bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 min-h-screen">
      {toastContainer()}
      <div className="max-w-6xl mx-auto">
        {/* --- Header & Progress Bar --- */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thanh Toán</h1>
          <p className="text-gray-600">Hoàn tất các bước để đặt hàng</p>
        </div>
        <div className="flex justify-center mb-12">
          {/* Progress Bar JSX */}
          <div className="w-full max-w-md">
            <div className="flex items-center">
              {/* Step 1: Cart */}
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-600 text-white ring-4 ring-blue-200">
                  <CheckCircle size={20} />
                </div>
                <span className="mt-2 text-xs sm:text-sm text-blue-600 font-medium">Giỏ hàng</span>
              </div>
              {/* Connector */}
              <div className="flex-1 h-1 mx-2 bg-blue-600"></div>
              {/* Step 2: Payment */}
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-600 text-white ring-4 ring-blue-200">
                  2
                </div>
                <span className="mt-2 text-xs sm:text-sm text-blue-600 font-medium">Thanh toán</span>
              </div>
              {/* Connector */}
              <div className="flex-1 h-1 mx-2 bg-gray-200"></div>
              {/* Step 3: Complete */}
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 text-gray-600">
                  3
                </div>
                <span className="mt-2 text-xs sm:text-sm text-gray-500">Hoàn tất</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- Main Content (Form & Summary) --- */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* --- Left Side: Form --- */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* -- Shipping Info -- */}
              <div className="p-6 border-b">
                <div className="flex items-center mb-4">
                  <Truck className="text-blue-600 mr-2" size={20} />
                  <h2 className="text-xl font-semibold text-gray-800">Thông tin giao hàng</h2>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Input Fields: firstName, lastName, phoneNumber, address, note */}
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">Họ <span className="text-red-500">*</span></label>
                    <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Tên <span className="text-red-500">*</span></label>
                    <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
                    <input type="tel" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} required pattern="\d{10}" title="Số điện thoại gồm 10 chữ số" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ <span className="text-red-500">*</span></label>
                    <textarea id="address" name="address" rows={2} value={formData.address} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"></textarea>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">Ghi chú (tùy chọn)</label>
                    <textarea id="note" name="note" rows={3} value={formData.note} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Ví dụ: Giao hàng giờ hành chính,..."></textarea>
                  </div>
                </div>
              </div>

              {/* -- Payment Method -- */}
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <CreditCard className="text-blue-600 mr-2" size={20} />
                  <h2 className="text-xl font-semibold text-gray-800">Phương thức thanh toán</h2>
                </div>
                <div className="space-y-3">
                  <PaymentMethod id="cod" name="Thanh toán khi nhận hàng (COD)" icon={<Truck size={20} />} selected={selectedPayment} onSelect={setSelectedPayment} />
                  <PaymentMethod id="card" name="Thanh toán bằng Thẻ quốc tế (Stripe)" icon={<CreditCard size={20} />} selected={selectedPayment} onSelect={setSelectedPayment} />
                  <PaymentMethod id="vnpay" name="Thanh toán qua VNPAY (ATM/QR Code)" icon={<Landmark size={20} />} selected={selectedPayment} onSelect={setSelectedPayment} />
                </div>
              </div>
            </div>
          </div>

          {/* --- Right Side: Order Summary & Actions --- */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden sticky top-4">
              {/* -- Summary Header -- */}
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-800">Tóm tắt đơn hàng</h2>
              </div>

              {/* -- Summary Details (Scrollable) -- */}
              <div className="p-6 max-h-[40vh] overflow-y-auto">
                <div className="space-y-4 mb-6">
                  {products
                    .filter((p) => cartItems[p._id] && cartItems[p._id] > 0)
                    .map((product) => (
                      <div key={product._id} className="flex items-start">
                        <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border border-gray-200">
                          <Image src={product.ImagePD} alt={product.ProductName} className="w-full h-full object-cover" preview={false} />
                        </div>
                        <div className="ml-4 flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">{product.ProductName}</h3>
                          <p className="text-sm text-gray-500">SL: {cartItems[product._id]}</p>
                          <p className="text-sm text-gray-700">{(parseFloat(String(product.PricePD).replace(/\./g, '').replace(',', '.')) || 0).toLocaleString("vi-VN")}₫</p>
                        </div>
                        <div className="ml-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                          {((parseFloat(String(product.PricePD).replace(/\./g, '').replace(',', '.')) || 0) * cartItems[product._id]).toLocaleString("vi-VN")}₫
                        </div>
                      </div>
                    ))}
                  {products.filter(p => cartItems[p._id] && cartItems[p._id] > 0).length === 0 && (
                    <p className="text-center text-gray-500 py-4">Chưa có sản phẩm nào.</p>
                  )}
                </div>
              </div>

              {/* -- Price Summary & Actions -- */}
              <div className="p-6 border-t">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm"><span className="text-gray-600">Tạm tính</span><span className="font-medium">{subtotal.toLocaleString("vi-VN")}₫</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-600">Phí vận chuyển</span><span className="font-medium">{shippingFee.toLocaleString("vi-VN")}₫</span></div>
                  {discount > 0 && (<div className="flex justify-between text-sm"><span className="text-gray-600">Giảm giá {selectedVoucher?.code ? `(${selectedVoucher.code})` : ''}</span><span className="font-medium text-red-500">-{discount.toLocaleString("vi-VN")}₫</span></div>)}
                  <Divider className="my-2" />
                  <div className="flex justify-between items-center"><span className="text-base font-semibold">Tổng cộng</span><span className="text-xl font-bold text-blue-600">{total.toLocaleString("vi-VN")}₫</span></div>
                </div>

                <div className="mt-6 space-y-3">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || Object.keys(cartItems).length === 0 || isLoadingUser}
                    className={`w-full px-4 py-3 rounded-lg font-semibold text-white transition-colors duration-200 ease-in-out flex items-center justify-center ${isSubmitting || Object.keys(cartItems).length === 0 || isLoadingUser ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"}`}
                  >
                    {isSubmitting ? (<><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Đang xử lý...</>) : `Hoàn tất đơn hàng`}
                  </button>
                  <button
                    type="button"
                    onClick={handleBackToCart}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center disabled:opacity-50"
                  >
                    <ArrowLeft size={18} className="mr-2" /> Quay lại giỏ hàng
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