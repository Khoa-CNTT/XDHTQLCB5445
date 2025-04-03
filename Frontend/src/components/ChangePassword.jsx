import React, { useState } from 'react';
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
}

export default ChangePasswordTab;