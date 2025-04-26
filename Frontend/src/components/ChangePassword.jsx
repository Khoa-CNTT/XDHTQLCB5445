import React, { useState } from 'react';
<<<<<<< HEAD
import { Input, Button, Space } from 'antd';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { changePassword } from '../APIs/userApi'; // Import API call
import { useTranslation } from 'react-i18next'; // <-- Import

function ChangePasswordTab() { // Renamed component for clarity if needed
    const { t } = useTranslation(); // <-- Use hook
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handlePasswordChange = async () => {
        // Use translated error messages
        if (!oldPassword) {
            toast.error(t('changePassword.errors.oldPasswordRequired'));
            return;
        }
        if (!newPassword) {
            toast.error(t('changePassword.errors.newPasswordRequired'));
            return;
        }
        if (!confirmPassword) {
            toast.error(t('changePassword.errors.confirmPasswordRequired'));
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error(t('changePassword.errors.passwordsDoNotMatch'));
            return;
        }

        const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            toast.error(t('changePassword.errors.newPasswordInvalid'));
            return;
        }

        try {
            const response = await changePassword({ oldPassword, newPassword });

            if (response.success) {
                // Use translated success message
                toast.success(response.message || t('changePassword.success')); // Use backend message if available, else fallback
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                // Use translated specific error or generic backend message
                if (response.message === "Mật khẩu cũ không chính xác" || response.message === "Incorrect old password") { // Check both languages or use error code if backend provides one
                    toast.error(t('changePassword.errors.oldPasswordIncorrect'));
                } else {
                    toast.error(response.message || t('changePassword.errors.updateFailed'));
                }
            }
        } catch (error) {
            console.error('Lỗi khi đổi mật khẩu:', error);
            // Use translated specific error or generic frontend message
            if (error.response && error.response.data && (error.response.data.message === "Mật khẩu cũ không chính xác" || error.response.data.message === "Incorrect old password")) {
                toast.error(t('changePassword.errors.oldPasswordIncorrect'));
            } else {
                toast.error(t('changePassword.errors.updateFailed'));
            }
        }
    };

    return (
        <div className="p-4 rounded-md shadow-md bg-white">
            {/* Translate title */}
            <h2 className="text-xl font-semibold mb-4">{t('changePassword.title')}</h2>
            <Space direction="vertical" className="w-full"> {/* Ensure Space takes full width */}
                <Input.Password
                    // Translate placeholders
                    placeholder={t('changePassword.oldPasswordPlaceholder')}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full"
                />
                <Input.Password
                    placeholder={t('changePassword.newPasswordPlaceholder')}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full"
                />
                <Input.Password
                    placeholder={t('changePassword.confirmPasswordPlaceholder')}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full"
                />
                {/* Translate button text */}
                <Button type="primary" onClick={handlePasswordChange} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    {t('changePassword.updateButton')}
                </Button>
            </Space>
        </div>
    );
=======
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { changePassword } from '../APIs/userApi';
import { errorToast, successToast, toastContainer } from '../utils/toast';

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
      {toastContainer()}
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
            ${isLoading ? 'bg-pink-300 cursor-not-allowed' : 'bg-pink-500 hover:bg-pink-600'}
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
>>>>>>> c1949cc (Bao cao lan 3)
}

export default ChangePasswordTab;