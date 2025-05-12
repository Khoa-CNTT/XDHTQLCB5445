import axios from 'axios';

// const API_BASE_URL = 'https://backend-fu3h.onrender.com/api';
const API_BASE_URL = 'http://localhost:4000/api';

const vnpayApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Tạo URL thanh toán VNPay
export const createVNPayPaymentUrl = async (data) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            return { success: false, message: 'Vui lòng đăng nhập để thanh toán.' };
        }

        const response = await vnpayApi.post('/vnpay/create_payment_url', data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data;
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Lỗi khi tạo URL thanh toán VNPay',
        };
    }
};

// Xử lý callback khi VNPay redirect về (frontend chỉ đọc kết quả)
export const handleVNPayReturn = async (query) => {
    try {
        const response = await vnpayApi.get('/vnpay/vnpay_return', {
            params: query,
        });

        return response.data;
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Lỗi khi xử lý callback VNPay',
        };
    }
};

export default {
    createVNPayPaymentUrl,
    handleVNPayReturn,
};
