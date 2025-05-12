// pages/PaymentStatus.js
import React, { useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from 'antd';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const PaymentStatus = () => {
    const query = useQuery();
    const navigate = useNavigate();
    const success = query.get('success') === 'true';
    const message = query.get('message') || (success ? 'Giao dịch thành công!' : 'Giao dịch thất bại.');
    const orderId = query.get('orderId');
    const rspCode = query.get('rspCode'); // Lấy mã lỗi VNPAY nếu có

    useEffect(() => {
        // Có thể thêm logic gọi API để xác nhận lại trạng thái đơn hàng nếu cần
        console.log("Payment Status Page:", { success, message, orderId, rspCode });
    }, [success, message, orderId, rspCode]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 text-center mt-[-60px]"> {/* Điều chỉnh margin top nếu cần */}
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                {success ? (
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                ) : (
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                )}
                <h1 className={`text-2xl font-bold mb-2 ${success ? 'text-green-600' : 'text-red-600'}`}>
                    {success ? 'Thanh toán thành công' : 'Thanh toán thất bại'}
                </h1>
                <p className="text-gray-600 mb-4">{decodeURIComponent(message)}</p>
                {orderId && (
                    <p className="text-sm text-gray-500 mb-2">Mã đơn hàng: {orderId}</p>
                )}
                {!success && rspCode && (
                    <p className="text-sm text-red-500 mb-4">Mã lỗi VNPAY: {rspCode}</p>
                )}
                <div className="space-y-3">
                    {orderId && (
                        <Button type="primary" onClick={() => navigate('/my-orders')}> {/* Hoặc '/profile/orders' tùy route của bạn */}
                            Xem đơn hàng
                        </Button>
                    )}
                    <Button onClick={() => navigate('/')}>
                        Về trang chủ
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PaymentStatus;