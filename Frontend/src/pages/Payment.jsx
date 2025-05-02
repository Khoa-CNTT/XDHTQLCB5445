import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Divider, Image } from "antd";
import { CreditCard, Truck, ArrowLeft, CheckCircle } from "lucide-react";
import { errorToast, successToast, toastContainer } from "../utils/toast";
import { placeOrder } from "../APIs/orderApi";
import { jwtDecode } from "jwt-decode";
import { getUser, updateUser } from "../APIs/userApi";
import { redeemVoucher } from "../APIs/VoucherAPI";

const PaymentMethod = ({ id, name, icon, selected, onSelect }) => {
  return (
    <div 
      onClick={() => onSelect(id)}
      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all 
      ${selected === id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600">
        {icon}
      </div>
      <div className="ml-4">
        <p className="font-medium text-gray-800">{name}</p>
      </div>
      <div className="ml-auto">
        <div className={`w-5 h-5 rounded-full border 
        ${selected === id ? "border-4 border-blue-500" : "border border-gray-300"}`}></div>
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
        setUserId(userData._id);
        setFormData({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          phoneNumber: userData.phoneNumber || "",
          address: userData.address || "",
        });
      } else {
        errorToast(response.message || "Không thể tải dữ liệu người dùng.");
      }
    } catch (err) {
      errorToast("Lỗi kết nối hoặc lỗi hệ thống khi tải dữ liệu.");
    }
  }, []);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }
    try {
      const decodedToken = jwtDecode(token);
      const idFromToken = decodedToken.id;
      if (!idFromToken) {
        errorToast("Token không hợp lệ.");
        localStorage.removeItem("token");
        return;
      }
      setUserId(idFromToken);
      fetchUser(idFromToken);
    } catch (error) {}
  }, [fetchUser]);
  const subtotal = products.reduce(
    (total, product) =>
      cartItems[product._id]
        ? total + (parseFloat(String(product.PricePD).replace(/\./g, '').replace(',', '.')) || 0) * (cartItems[product._id] || 0)
        : total,
    0
  );
  const calculateDiscount = () => {
    if (!selectedVoucher) return 0;
    let discountAmount =
      subtotal * ((Number(selectedVoucher.discount) || 0) / 100);
    if (
      selectedVoucher.maximumDiscount &&
      discountAmount > (Number(selectedVoucher.maximumDiscount) || 0)
    ) {
      discountAmount = Number(selectedVoucher.maximumDiscount) || 0;
    }
    return discountAmount;
  };
  const discount = calculateDiscount();
  const shippingFee = 30000;
  const total = subtotal + shippingFee - discount;
  useEffect(() => {
    if (Object.keys(cartItems).length === 0) {
      navigate("/cart");
    }
  }, [cartItems, navigate]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const validateForm = () => {
    const { firstName, lastName, phoneNumber, address } = formData;
    if (![firstName, lastName, address].every((val) => val.trim())) {
      errorToast("Vui lòng nhập đầy đủ thông tin");
      return false;
    }
    if (!phoneNumber.match(/^\d{10}$/)) {
      errorToast("Số điện thoại không hợp lệ");
      return false;
    }
    return true;
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      .filter((p) => cartItems[p._id])
      .map((product) => ({
          _id: product._id,
          name: product.ProductName,
          price: product.PricePD,
          quantity: cartItems[product._id],
          image: product.ImagePD,
        }));
        const orderData = {
        items: orderItems,
        totalAmount: total,
        shippingAddress: {
          fullName: formData.firstName + " " + formData.lastName,
          phone: formData.phoneNumber,
          address: formData.address,
        },
        paymentMethod: selectedPayment,
        note: formData.note,
        voucher: selectedVoucher ? selectedVoucher._id : null,
        discount: discount,
      };
      if (selectedVoucher) {
        await redeemVoucher(selectedVoucher.code);
      }
      const resData = await updateUser(userId, formData, token);
      if (resData.success) {
        setFormData(resData.data);
      }
      const response = await placeOrder(orderData, token);
      if (response.success) {
        successToast("Đặt hàng thành công");
        const { session_url } = response;
        if (selectedPayment === "card") {
          window.location.href = session_url;
        } else if (selectedPayment === "cod") {
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
        }

        localStorage.removeItem("cart");
      }
    } catch (error) {
      errorToast("Vui lòng đăng nhập.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToCart = () => navigate("/cart");

  return (
    <div className=" bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {toastContainer()}
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thanh Toán</h1>
          <p className="text-gray-600">Hoàn tất đơn hàng của bạn</p>
        </div>

        <div className="flex justify-center mb-12">
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
          <div className="lg:w-2/3">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b">
                <div className="flex items-center mb-4">
                  <Truck className="text-blue-600 mr-2" size={20} />
                  <h2 className="text-xl font-semibold text-gray-800">
                    Thông tin giao hàng
                  </h2>
                </div>

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
                    <textarea
                      id="address"
                      name="address"
                      rows={1}
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
                      Ghi chú
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

              <div className="p-6">
                <div className="flex items-center mb-4">
                  <CreditCard className="text-blue-600 mr-2" size={20} />
                  <h2 className="text-xl font-semibold text-gray-800">
                    Phương thức thanh toán
                  </h2>
                </div>

                <div className="space-y-3">
                  <PaymentMethod
                    id="card"
                    name="Chuyển khoản ngân hàng"
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
                        <path
                          fillRule="evenodd"
                          d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    }
                    selected={selectedPayment}
                    onSelect={setSelectedPayment}
                  />
                </div>
              </div>
            </form>
          </div>

          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden sticky top-4">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-800">
                  Đơn hàng của bạn
                </h2>
              </div>

              <div className="p-6">
                <div className="space-y-4 mb-6">
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
                        <div className="ml-4 flex-1">
                          <h3 className="text-sm font-medium text-gray-900">
                            {product.ProductName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Số lượng: {cartItems[product._id]}
                          </p>
                        </div>
                        <div className="ml-4 text-sm font-medium text-gray-900">
                          {(String(product.PricePD)*cartItems[product._id])}.000₫
                        </div>
                      </div>
                    ))}
                </div>

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
                      <span className="text-sm text-gray-600">
                        Giảm giá ({selectedVoucher?.code})
                      </span>
                      <span className="text-sm font-medium text-red-500">
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
                    disabled={isSubmitting}
                    className={`w-full px-4 py-3 rounded-lg font-medium text-white ${
                      isSubmitting
                        ? "bg-blue-400"
                        : "bg-blue-600 hover:bg-blue-700"
                    } transition-colors`}
                  >
                    {isSubmitting ? "Đang xử lý..." : "Xác nhận thanh toán"}
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

