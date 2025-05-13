import React, { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { changePassword } from '../APIs/userApi';
import { errorToast, successToast,  } from '../utils/toast';

function ChangePasswordTab() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordChange = async () => {
    setIsLoading(true);

    if (!oldPassword) {
      errorToast('Vui lòng nhập mật khẩu cũ.');
      setIsLoading(false);
      return;
    }
    if (!newPassword) {
      errorToast('Vui lòng nhập mật khẩu mới.');
      setIsLoading(false);
      return;
    }
    if (!confirmPassword) {
      errorToast('Vui lòng nhập xác nhận mật khẩu.');
      setIsLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      errorToast('Mật khẩu mới và xác nhận mật khẩu không khớp.');
      setIsLoading(false);
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      errorToast('Mật khẩu mới phải có ít nhất 8 ký tự, gồm chữ hoa, số và ký tự đặc biệt.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await changePassword({ oldPassword, newPassword });

      if (response.success) {
        successToast(response.message || 'Đổi mật khẩu thành công!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        if (response.message === 'Mật khẩu cũ không chính xác' || response.message === 'Incorrect old password') {
          errorToast('Mật khẩu cũ không chính xác. Vui lòng nhập lại.');
        } else {
          errorToast(response.message || 'Đã xảy ra lỗi. Vui lòng thử lại sau.');
        }
      }
    } catch (error) {
      if (error.response && error.response.data && (error.response.data.message === 'Mật khẩu cũ không chính xác' || error.response.data.message === 'Incorrect old password')) {
        errorToast('Mật khẩu cũ không chính xác. Vui lòng nhập lại.');
      } else {
        toast.error('Đã xảy ra lỗi. Vui lòng thử lại sau.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-md border border-pink-100 space-y-6">
      
      <h2 className="text-2xl font-semibold text-gray-800">🔒 Đổi Mật Khẩu</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu cũ</label>
          <input
            type="password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
            placeholder="Mật khẩu cũ"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
          <input
            type="password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
            placeholder="Mật khẩu mới"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
          <input
            type="password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
            placeholder="Xác nhận mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button
          onClick={handlePasswordChange}
          disabled={isLoading}
          className={`w-full py-2 text-white rounded-lg transition 
            ${isLoading ? 'bg-pink-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}
          `}
        >
          {isLoading ? '🔄 Đang cập nhật...' : 'Cập Nhật'}
        </button>

        <div className="text-gray-600 text-sm bg-pink-50 p-3 rounded-lg">
          <p className="font-medium mb-1">🔒 Yêu cầu mật khẩu mới:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Ít nhất 8 ký tự</li>
            <li>Chứa 1 chữ in hoa</li>
            <li>Chứa 1 số</li>
            <li>Chứa 1 ký tự đặc biệt</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ChangePasswordTab;