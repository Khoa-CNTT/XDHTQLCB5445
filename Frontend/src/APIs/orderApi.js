import axios from 'axios';

// Lấy URL API từ biến môi trường, fallback về Render hoặc localhost
//const API_URL = process.env.REACT_APP_API_URL || 'https://backend-fu3h.onrender.com';
const API_URL = 'http://localhost:4000'; // Uncomment for local dev

// Helper để tạo headers với Authorization token
const getAuthHeaders = (token) => {
    if (!token) {
        console.warn("Token is missing for authenticated API call.");
        // Có thể throw error hoặc trả về {} tùy logic xử lý lỗi
    }
    return {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json', // Mặc định là JSON
        },
    };
};

// Lấy đơn hàng của người dùng hiện tại
export const getOrders = async (token) => {
    try {
        const response = await axios.get(`${API_URL}/api/order/userorders`, getAuthHeaders(token));
        // Trả về data nếu thành công, nếu không thì mảng rỗng hoặc throw lỗi
        return response.data.success ? response.data.data : [];
    } catch (error) {
        console.error("Error fetching user orders:", error.response?.data || error.message);
        throw error; // Ném lỗi để component gọi có thể xử lý
    }
};

// Lấy danh sách tất cả đơn hàng (Cho Admin)
export const listAllOrders = async (token) => { // Cần token nếu route admin yêu cầu
    try {
        // Giả sử route admin cũng cần token
        const response = await axios.get(`${API_URL}/api/order/list`, getAuthHeaders(token));
        return response.data; // Trả về toàn bộ response
    } catch (error) {
        console.error("Error listing all orders:", error.response?.data || error.message);
        throw error;
    }
};

// Lấy chi tiết một đơn hàng (Có thể cho user hoặc admin)
export const getOrderDetail = async (orderId, token) => {
    try {
        // Giả sử user và admin đều có thể gọi, cần token
        const response = await axios.get(`${API_URL}/api/order/${orderId}`, getAuthHeaders(token)); // Giả sử route là /api/order/:orderId
        return response.data;
    } catch (error) {
        console.error(`Error fetching order detail for ${orderId}:`, error.response?.data || error.message);
        throw error;
    }
};

// Đặt hàng mới
export const placeOrder = async (orderData, token) => {
    try {
        const response = await axios.post(
            `${API_URL}/api/order/place`,
            orderData, // Dữ liệu đơn hàng (items, address, paymentMethod,...)
            getAuthHeaders(token)
        );
        return response.data; // Trả về { success: true, orderId, session_url?, vnpay_url? }
    } catch (error) {
        console.error("Error placing order:", error.response?.data || error.message);
        // Trả về lỗi từ server nếu có, hoặc ném lỗi chung
        return error.response?.data || { success: false, message: error.message || "Lỗi không xác định khi đặt hàng." };
        // Hoặc throw error;
    }
};

// Cập nhật trạng thái đơn hàng (Cho Admin)
export const updateOrderStatus = async (orderId, status, token) => { // status là trạng thái mới
    try {
        const response = await axios.put( // Dùng PUT hoặc PATCH
            `${API_URL}/api/order/status`,
            { orderId, orderStatus: status }, // Body request theo backend yêu cầu
            getAuthHeaders(token)
        );
        console.log('Update Status Response:', response.data);
        return response.data;
    } catch (error) {
        console.error(`Error updating order status for ${orderId}:`, error.response?.data || error.message);
        throw error;
    }
};

// Xóa đơn hàng (Cho Admin)
export const deleteOrderById = async (orderId, token) => {
    try {
        // Dùng DELETE và truyền ID qua URL params
        const response = await axios.delete(`${API_URL}/api/order/delete-order/${orderId}`, getAuthHeaders(token));
        return response.data;
    } catch (error) {
        console.error(`Error deleting order ${orderId}:`, error.response?.data || error.message);
        throw error;
    }
};

//API này có vẻ không cần thiết nữa nếu dùng IPN/Webhook
export const verifyPayment = async (data) => {
    try {
        const response = await axios.post(`${API_URL}/api/order/verify`, data);
        return response.data;
    } catch (error) {
        console.error("Error verifying payment:", error.response?.data || error.message);
        throw error;
    }
};