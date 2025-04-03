import { createContext, useState, useEffect } from "react";
import { loginUser, getUser } from "../APIs/userApi";

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
            const res = await getUser(token);
            setUser(res.user);
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

