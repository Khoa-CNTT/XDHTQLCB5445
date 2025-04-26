import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { verifyStripePayment } from '../../../Frontend/src/APIs/orderApi'; // Import API xác thực Stripe
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const Verify = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // 'loading', 'success', 'failed', 'error'
    const [message, setMessage] = useState('Đang xác thực thanh toán...');
    const [orderId, setOrderId] = useState(null);

    useEffect(() => {
        const verifyPayment = async () => {
            const params = new URLSearchParams(location.search);
            const success = params.get('success');
            const orderIdParam = params.get('orderId');
            const paymentMethod = params.get('paymentMethod'); // Lấy phương thức thanh toán

            console.log("Verification Params:", { success, orderIdParam, paymentMethod });

            if (!orderIdParam || success === null || paymentMethod !== 'card') { // Chỉ xử lý nếu là Stripe
                setStatus('error');
                setMessage('Dữ liệu xác thực không hợp lệ hoặc không phải thanh toán Stripe.');
                // Có thể chuyển hướng về trang chủ hoặc trang lỗi
                // navigate('/');
                return;
            }

            setOrderId(orderIdParam);

            try {
                // Gọi API backend để xác thực và cập nhật DB
                const response = await verifyStripePayment({ orderId: orderIdParam, success: success === 'true' });

                console.log("Backend Stripe Verification Response:", response);

                if (response.success) {
                    setStatus('success');
                    setMessage(response.message || 'Thanh toán Stripe thành công!');
                    // Xóa cart nếu thanh toán thành công (backend đã làm, nhưng có thể thêm ở đây cho chắc)
                    // localStorage.removeItem('cart');
                } else {
                    setStatus('failed');
                    setMessage(response.message || 'Thanh toán Stripe thất bại hoặc đã bị hủy.');
                }
            } catch (error) {
                console.error("Error verifying Stripe payment:", error);
                setStatus('error');
                setMessage(error.response?.data?.message || 'Lỗi hệ thống khi xác thực thanh toán.');
            }
        };

        verifyPayment();
    }, [location.search, navigate]);

    // --- JSX tương tự VNPayReturn ---
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
                {status === 'loading' && (
                    <>
                        <Loader className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Đang xác thực...</h2>
                        <p className="text-gray-600">{message}</p>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-green-600 mb-2">Thanh toán thành công!</h2>
                        <p className="text-gray-700 mb-6">{message}</p>
                        {orderId && (
                            <p className="text-sm text-gray-500 mb-4">Mã đơn hàng: {orderId}</p>
                        )}
                        <Link
                            to="/myorders"
                            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded transition duration-200 inline-block mr-2"
                        >
                            Xem đơn hàng
                        </Link>
                        <Link
                            to="/"
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-6 rounded transition duration-200 inline-block"
                        >
                            Tiếp tục mua sắm
                        </Link>
                    </>
                )}
                {(status === 'failed' || status === 'error') && (
                    <>
                        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-red-500 mb-2">Thanh toán thất bại!</h2>
                        <p className="text-gray-700 mb-6">{message}</p>
                        {orderId && (
                            <p className="text-sm text-gray-500 mb-4">Mã đơn hàng liên quan: {orderId}</p>
                        )}
                        <Link
                            to="/cart"
                            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded transition duration-200 inline-block mr-2"
                        >
                            Thử lại thanh toán
                        </Link>
                        <Link
                            to="/"
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-6 rounded transition duration-200 inline-block"
                        >
                            Về trang chủ
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default Verify;