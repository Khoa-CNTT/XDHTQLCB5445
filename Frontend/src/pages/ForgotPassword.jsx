import React, { useState } from "react";
import { forgotPassword, verifyCodeAndResetPassword } from "../APIs/userApi";
import { useNavigate } from "react-router-dom";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await forgotPassword(email);
      if (res.success) {
        console.log("Gửi mã xác thực thành công!");
        setShowNewPassword(true);
      } else {
        console.log("Gửi mã xác thực thất bại!");
      }
    } catch (error) {
      console.log("Gửi mã xác thực thất bại!");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const req = await verifyCodeAndResetPassword({
        email,
        verificationCode,
        newPassword,
      });
      if (req.success) {
        console.log("Đặt lại mật khẩu thành công!");
        navigate("/sign-in");
      } else {
        console.log("Đặt lại mật khẩu thất bại!");
      }
    } catch (error) {
      console.log("Lỗi trong quá trình đặt lại mật khẩu!");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-semibold text-center text-gray-700 mb-4">
          Lấy lại mật khẩu
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-gray-600">Nhập email:</label>
          <input
            type="email"
            placeholder="Nhập email của bạn"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={email}
            required
            onFocus={() => setShowNewPassword(false)}
            onBlur={() => setShowNewPassword(true)}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Gửi mã xác thực
          </button>
        </form>

        {showNewPassword && (
          <form
            className="space-y-4 mb-[10px] mt-[10px]"
            onSubmit={handleResetPassword}
          >
            <label className="block text-gray-600">Nhập mã xác thực:</label>
            <input
              type="text"
              placeholder="Nhập mã xác thực"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />

            <div className="relative">
              <label className="block mb-[10px] text-gray-600">
                Nhập mật khẩu mới:
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mật khẩu"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-11 text-gray-500 cursor-pointer"
              >
                {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
              </span>
            </div>

            <button
              type="submit"
              className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
            >
              Đặt lại mật khẩu
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
