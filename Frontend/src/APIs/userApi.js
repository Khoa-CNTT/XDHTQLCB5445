import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_KEY || "http://localhost:4000/api";
console.log("API Base URL:", API_BASE_URL); // Kiểm tra URL


const userApi = axios.create({
    baseURL: API_BASE_URL,
});


export const registerUser = async (data) => {
        const response = await userApi.post("/user/register", data);
        return response.data; 
};
export const loginUser = async (data) => {
        const response = await userApi.post("/user/login", data);
        return response.data; 
};

export const getUser = async (id) => {
        const response = await userApi.get(`/user/${id}`);
        return response.data;
};

export const updateUser = async (id, data) => {
        try {
            // Lấy token trực tiếp trong hàm này
            const token = localStorage.getItem('token');
            if (!token) {
                return { success: false, message: "Không có token, vui lòng đăng nhập lại" };
            }
    
            const response = await axios.put(
                `${API_BASE_URL}/user/update/${id}`, 
                data, 
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        // Không cần thiết lập Content-Type cho FormData, browser sẽ tự thêm boundary
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error("Lỗi cập nhật:", error);
            return { 
                success: false, 
                message: error.response?.data?.message || "Lỗi kết nối server" 
            };
        }
    };

export const updateUserRole = async (id, data) => {
        const response = await userApi.post(`/user/${id}/role`, data);
        return response.data;
};

export const listUser = async () => {
        const response = await userApi.get("/user/list");
        return response.data; 
};

export const removeUser = async (id) => {
        const response = await userApi.post("/user/remove", { id: id });
        return response.data; // { success: boolean, message: string }
};

export const forgotPassword = async (email) => {  
        const response = await userApi.post("/user/quenmk", { email });
        return response.data;
};

export const verifyCodeAndResetPassword = async (data) => {
        const response = await userApi.post("/user/verify-code-and-reset-password", data);
        return response.data;
  
};

// API đổi mật khẩu (yêu cầu đã đăng nhập)
export const changePassword = async (data) => {
  try {
      const token = localStorage.getItem('token');  // Lấy token từ localStorage hoặc state
      if (!token) {
          throw new Error('Không có token, vui lòng đăng nhập lại');
      }

      const response = await userApi.post(
          '/user/changepassword', 
          data,
          { headers: { Authorization: `Bearer ${token}` } }  // Gửi token trong header
      );
      return response.data;
  } catch (error) {
      console.error("Lỗi API đổi mật khẩu:", error.response?.data || error.message);
      return error.response?.data || { success: false, message: "Lỗi kết nối hoặc máy chủ khi đổi mật khẩu." };
  }
};

export const logoutUser = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role'); // Xóa cả role nếu có lưu
    console.log("Token đã được xóa khỏi localStorage.");
    return { success: true, message: "Đã đăng xuất (phía client)." };
};