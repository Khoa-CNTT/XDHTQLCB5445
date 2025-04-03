import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import { errorToast, successToast, toastContainer } from "../utils/toast";

const SignInPage = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  
  const handleSignIn = async (e) => {
    e.preventDefault();
    const res = await login({ email, password });
    errorToast("Đăng nhập thất bại!");
    if (res.success) {
      successToast("Đăng nhập thành công!");
      navigate(res.user.role === "admin" ? "/admin" : "/");
    } else {
    }
  };
  const ForgotPassword = () => {
    navigate("/forgot-password");
  }

  return (
    <div className="flex justify-center items-center h-screen ">
        {toastContainer()}
      <div className="bg-white p-8 rounded-lg shadow-lg w-96 text-center">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Đăng nhập</h2>
        <form onSubmit={handleSignIn}>
          <div className="mb-4">
            <label className="block text-left mb-[10px] text-gray-600">Nhập email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div className="relative mb-4">
            <label className="block text-left mb-[10px] text-gray-600">Nhập mật khẩu:</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mật khẩu"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 bottom-[15px] text-gray-500 cursor-pointer"
            >
              {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
            </span>
          </div>

          <p onClick={ForgotPassword} className="text-right text-sm text-blue-500 cursor-pointer hover:underline">Quên mật khẩu?</p>

          <div className="flex items-center mt-4 mb-4">
            <input type="checkbox" id="checkPolicy" className="mr-2" required />
            <label htmlFor="checkPolicy" className="text-sm text-gray-600">
              Tôi đồng ý với các điều khoản và chính sách
            </label>
          </div>                                                  
          <button
            type="submit"
            disabled={!email || !password}
            className="w-full bg-blue-500 text-white p-3 rounded-md font-bold hover:bg-blue-600 transition disabled:bg-gray-300"
          >
            Đăng nhập
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600">
          Tạo tài khoản mới?{" "}
          <span onClick={() => navigate("/sign-up")} className="text-blue-500 font-semibold cursor-pointer hover:underline">
            Đăng ký
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignInPage;