import React, { useState, useEffect } from 'react';
import { Menu } from 'antd';
import { useLocation } from 'react-router-dom';
import {
    EditOutlined,
    LockOutlined,
    ShoppingCartOutlined,
    ClockCircleOutlined,
} from '@ant-design/icons';
import ProfileTab from '../components/ProfileTab';
import MyOrdersTab from '../components/MyOrdersTab';
import ChangePasswordTab from '../components/ChangePassword';
import ScheduleTab from '../components/ScheduleTab';
import Header from '../components/Header';

function Profile() {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        if (location.state) {
            setActiveTab(location.state.activeTab || 'profile');
        }
    }, [location.state]);

    const items = [
        { key: 'profile', icon: <EditOutlined />, label: 'Hồ sơ' },
        { key: 'myorders', icon: <ShoppingCartOutlined />, label: 'Đơn hàng'},
        { key: 'changepassword', icon: <LockOutlined />, label: 'Đổi mật khẩu' },
        { key: 'schedule', icon: <ClockCircleOutlined />, label: 'Lịch hẹn' },
    ];

    const handleMenuClick = (e) => {
        setActiveTab(e.key);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return <ProfileTab />;
            case 'myorders':
                return <MyOrdersTab />;
            case 'changepassword':
                return <ChangePasswordTab />;
            case 'schedule':
                return <ScheduleTab />;
            default:
                return <div>Chọn một mục từ menu</div>;
        }
    };

    return (
        <>
         <Header className="!bg-white !text-black !shadow-md" />
            <div className="flex justify-center mt-[70px] items-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 ">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl w-full">
                    <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
                        <div className="mb-2 text-center">
                            <p className="text-2xl font-semibold text-pink-600">Quản lý thông tin</p>
                        </div>
                        <Menu
                            mode="inline"
                            selectedKeys={[activeTab]}
                            onClick={handleMenuClick}
                            items={items}
                            className="custom-menu border-0"
                        />
                    </div>
                    <div className="md:col-span-3 bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
                        {renderContent()}
                    </div>
                </div>
            </div>

            <style>
                {`
                    .custom-menu .ant-menu-item {
                        border-radius: 0.75rem;
                        margin-bottom: 0.5rem;
                        padding: 14px 16px;
                        display: flex;
                        align-items: center;
                        transition: all 0.3s ease;
                        font-size: 16px;
                        font-weight: 500;
                    }

                    .custom-menu .ant-menu-item:hover {
                        background: linear-gradient(135deg, #f9a8d4, #f3e8ff) !important;
                        color: #ec4899 !important;
                        transform: scale(1.02);
                        box-shadow: 0 4px 10px rgba(236, 72, 153, 0.2);
                    }

                    .custom-menu .ant-menu-item-selected {
                        background: linear-gradient(135deg, #f9a8d4, #f3e8ff) !important;
                        color: #ec4899 !important;
                        font-weight: 600;
                        box-shadow: 0 2px 8px rgba(236, 72, 153, 0.15);
                    }

                    .custom-menu .ant-menu-item .anticon {
                        font-size: 18px;
                        margin-right: 12px;
                    }
                `}
            </style>
        </>
    );
}

export default Profile;
