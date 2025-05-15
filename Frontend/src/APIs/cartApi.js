import axios from 'axios';

// const API_URL = 'https://backend-fu3h.onrender.com/api'; 
const API_URL = 'http://localhost:4000/api'; 

export const getCart = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/cart/get`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
 
};

export const clearCart = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.post(`${API_URL}/cart/clear`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });  
    return response.data;
};

export const addToCart = async (itemId, quantity) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Người dùng chưa đăng nhập.");

    const response = await axios.post(
      `${API_URL}/cart/add`,
      { itemId, quantity },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data; // { success: true, message: "...", ... }
  } catch (error) {
    // Xử lý lỗi từ backend hoặc mạng
    const message =
      error.response?.data?.message || error.message || "Lỗi không xác định!";
    throw new Error(message);
  }
};


export const removeFromCart = async (itemId) => {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_URL}/cart/remove`,
      { itemId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
};

// Giảm số lượng sản phẩm trong giỏ hàng
export const decreaseToCart = async (itemId) => {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_URL}/cart/decrease`,
      { itemId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
};

