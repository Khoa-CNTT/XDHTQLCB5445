import React, { useEffect } from 'react';
// Thêm useLocation vào import
import { useSearchParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, XCircle, AlertTriangle, ShoppingBag, Home, RefreshCw } from 'lucide-react';

const PaymentResult = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation(); // <<< Sử dụng hook useLocation

    // --- Lấy các tham số từ URL ---
    const success = searchParams.get('success') === 'true';
    const orderId = searchParams.get('orderId');
    const message = searchParams.get('message');
    const errorCode = searchParams.get('errorCode');
    const paymentMethod = searchParams.get('paymentMethod');
    const amount = searchParams.get('amount');
    const transactionNo = searchParams.get('transactionNo');
    const sessionId = searchParams.get('session_id');

    // --- Tự động chuyển hướng nếu thành công ---
    useEffect(() => {
        let timer;
        if (success && orderId) {
            console.log("Thanh toán thành công, chuyển hướng sau 5 giây...");
            timer = setTimeout(() => {
                navigate(`/my-orders/${orderId}`, { replace: true });
            }, 5000);
        }
        return () => clearTimeout(timer);
    }, [success, orderId, navigate]);

    // --- Helper Functions để Render ---
    const renderIcon = () => {
        if (success) return <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />;
        if (errorCode && errorCode !== '00') return <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />;
        return <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />;
    };
    const renderTitle = () => success ? 'Giao dịch thành công' : 'Giao dịch thất bại';
    const renderMessage = () => {
        if (message) return decodeURIComponent(message.replace(/\+/g, ' '));
        if (success) return 'Cảm ơn bạn đã đặt hàng! Trạng thái đơn hàng sẽ được cập nhật sau ít phút khi hệ thống xác nhận thanh toán.';
        return 'Rất tiếc, đã có lỗi xảy ra trong quá trình xử lý thanh toán. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.';
    };

    // --- Render Component ---
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 font-sans">
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl text-center max-w-lg w-full border-t-4"
                style={{ borderColor: success ? '#22c55e' : '#ef4444' }}>

                {renderIcon()}
                <h1 className={`text-2xl md:text-3xl font-bold mb-3 ${success ? 'text-gray-800' : 'text-red-600'}`}>
                    {renderTitle()}
                </h1>
                <p className="text-gray-600 mb-6 text-base">{renderMessage()}</p>

                {/* --- Hiển thị chi tiết giao dịch nếu có --- */}
                {(orderId || paymentMethod || amount || transactionNo || sessionId || errorCode) && (
                    <div className="text-left text-sm text-gray-700 bg-gray-50 p-4 rounded-md border border-gray-200 space-y-1.5 mb-8">
                        {orderId && <p><strong className="font-medium w-28 inline-block">Mã đơn hàng:</strong> {orderId}</p>}
                        {paymentMethod && <p><strong className="font-medium w-28 inline-block">Phương thức:</strong> {paymentMethod.toUpperCase()}</p>}
                        {amount && (<p><strong className="font-medium w-28 inline-block">Số tiền:</strong> {parseInt(amount).toLocaleString('vi-VN')}₫</p>)}
                        {transactionNo && <p><strong className="font-medium w-28 inline-block">Mã GD VNPAY:</strong> {transactionNo}</p>}
                        {sessionId && <p><strong className="font-medium w-28 inline-block">Mã phiên Stripe:</strong> <span className="break-all">{sessionId}</span></p>}
                        {errorCode && !success && <p><strong className="font-medium w-28 inline-block text-red-600">Mã lỗi:</strong> {errorCode}</p>}
                    </div>
                )}

                {/* --- Nút hành động --- */}
                <div className="mt-8 space-y-3 md:space-y-0 md:space-x-3 flex flex-col md:flex-row justify-center">
                    {success && orderId && (
                        <Link
                            to={`/my-orders/${orderId}`}
                            className="inline-flex items-center justify-center w-full md:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 transition-colors duration-200 ease-in-out text-sm font-medium"
                        >
                            <ShoppingBag size={16} className="mr-2" /> Xem chi tiết đơn hàng
                        </Link>
                    )}
                    {!success && (
                        <Link
                            to="/checkout"
                            // Truyền lại state từ location hiện tại (nếu có) về trang checkout
                            state={location.state} // <<< Sử dụng location từ useLocation
                            className="inline-flex items-center justify-center w-full md:w-auto px-6 py-2.5 bg-orange-500 text-white rounded-md shadow-sm hover:bg-orange-600 transition-colors duration-200 ease-in-out text-sm font-medium"
                        >
                            <RefreshCw size={16} className="mr-2" /> Thử lại thanh toán
                        </Link>
                    )}
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center w-full md:w-auto px-6 py-2.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200 ease-in-out text-sm font-medium"
                    >
                        <Home size={16} className="mr-2" /> Về trang chủ
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentResult;