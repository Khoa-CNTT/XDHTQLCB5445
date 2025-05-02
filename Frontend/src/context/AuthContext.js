import { createContext, useState, useEffect } from "react";
import { loginUser,getCurrentUser  } from "../APIs/userApi";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role"); 
        if (token && role ) {
            fetchUserInfo(token);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUserInfo = async (token) => {
        try {
          // Sử dụng endpoint mới thay vì endpoint cũ
          const res = await getCurrentUser();
          if (res.success) {
            setUser(res.data); // Lưu ý: response trả về data chứ không phải user như trước
          } else {
            throw new Error(res.message);
          }
        } catch (error) {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          setUser(null);
        } finally {
          setLoading(false);
        }
      };

    const login = async (credentials) => {
        try {
            const res = await loginUser(credentials);
            if (res.success) {
                localStorage.setItem("token", res.token);
                localStorage.setItem("role", res.user.role);
                setUser(res.user);
            }
            return res;
        } catch (error) {
            return({ success: false, message: "Đăng nhập thất bại!" });
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

