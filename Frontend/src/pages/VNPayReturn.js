import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { verifyVNPayPayment } from '../APIs/orderApi'; // Import API xác thực
import { CheckCircle, XCircle, Loader } from 'lucide-react'; // Icons

const VNPayReturn = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // 'loading', 'success', 'failed', 'error'
    const [message, setMessage] = useState('Đang xác thực giao dịch VNPay...');
    const [orderId, setOrderId] = useState(null);

    useEffect(() => {
        const verifyPayment = async () => {
            const params = Object.fromEntries(new URLSearchParams(location.search));
            console.log("VNPay Return URL Params:", params);

            // Kiểm tra các tham số cơ bản
            if (!params['vnp_TxnRef'] || !params['vnp_ResponseCode']) {
                setStatus('error');
                setMessage('Dữ liệu trả về từ VNPay không đầy đủ.');
                return;
            }

            setOrderId(params['vnp_TxnRef']?.split('_')[0]); // Lấy order ID

            try {
                // Gọi API backend để xác thực chữ ký và trạng thái
                // Backend sẽ trả về success: true/false và message
                const response = await verifyVNPayPayment(params);
                console.log("Backend Verification Response:", response);

                if (response.success) {
                    // Backend xác nhận thành công (dựa trên mã 00 và chữ ký hợp lệ)
                    setStatus('success');
                    setMessage(response.message || 'Thanh toán VNPay thành công!');
                    // Optionally clear cart here if backend doesn't do it via IPN reliably
                    // localStorage.removeItem('cart'); // Or use your context/redux action
                } else {
                    // Backend xác nhận thất bại (sai chữ ký, mã lỗi khác 00, hoặc lỗi khác)
                    setStatus('failed');
                    setMessage(response.message || 'Thanh toán VNPay thất bại hoặc đã bị hủy.');
                }
            } catch (error) {
                console.error("Error verifying VNPay payment:", error);
                setStatus('error');
                setMessage(error.response?.data?.message || 'Lỗi kết nối hoặc hệ thống khi xác thực thanh toán.');
            }
        };

        verifyPayment();
    }, [location.search]); // Chạy lại khi query params thay đổi

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
                {status === 'loading' && (
                    <>
                        <Loader className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Đang xử lý...</h2>
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
                            to="/myorders" // Hoặc trang chi tiết đơn hàng nếu có
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
                            to="/cart" // Quay lại giỏ hàng để thử lại
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

export default VNPayReturn;