<<<<<<< HEAD
import React, { useState } from 'react';
import { Menu } from 'antd';
import {
    EditOutlined,         // Cho Hồ sơ
    HomeOutlined,         // Cho Đơn hàng (Bạn có thể đổi thành ShoppingCartOutlined nếu muốn)
    LockOutlined,         // Cho Đổi mật khẩu
    ShoppingCartOutlined, // Cho Bảng điều khiển (Bạn có thể đổi thành DashboardOutlined nếu có)
    ClockCircleOutlined,  // Cho Lịch hẹn
} from '@ant-design/icons';
import ProfileTab from '../components/ProfileTab';         // Ví dụ nội dung cho Hồ sơ
import MyOrdersTab from '../components/MyOrdersTab';      // Ví dụ nội dung cho Đơn hàng
import ChangePasswordTab from '../components/ChangePassword'; // Ví dụ nội dung cho Đổi mật khẩu
import DashboardTab from '../components/DashboardTab';       // Ví dụ nội dung cho Bảng điều khiển
import ScheduleTab from '../components/ScheduleTab';       // Ví dụ nội dung cho Lịch hẹn

function Profile() {
    // State để theo dõi tab nào đang được chọn
    const [activeTab, setActiveTab] = useState('profile'); // Mặc định là 'profile'

    // Định nghĩa các mục cho Ant Design Menu
    const items = [
        {
            key: 'profile', // key phải khớp với giá trị state bạn muốn đặt
            icon: <EditOutlined />,
            label: 'Hồ sơ',
        },
        {
            key: 'myorders',
            icon: <HomeOutlined />, // Hoặc <ShoppingCartOutlined /> tùy bạn chọn
            label: 'Đơn hàng',
        },
        {
            key: 'changepassword',
            icon: <LockOutlined />,
            label: 'Đổi mật khẩu',
        },
        {
            key: 'dashboard',
            icon: <ShoppingCartOutlined />, // Hoặc <DashboardOutlined /> nếu phù hợp hơn
            label: 'Bảng điều khiển',
        },
        {
            key: 'schedule',
            icon: <ClockCircleOutlined />,
            label: 'Lịch hẹn',
        },
    ];

    // Hàm xử lý khi nhấp vào một mục menu
    const handleMenuClick = (e) => {
        console.log('Menu item clicked:', e.key); // Để debug
        setActiveTab(e.key); // Cập nhật state activeTab
    };

    // Hàm render nội dung tương ứng với tab đang được chọn
    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return <ProfileTab />; // Hiển thị component ProfileTab
            case 'myorders':
                return <MyOrdersTab />; // Hiển thị component MyOrdersTab
            case 'changepassword':
                return <ChangePasswordTab />; // Hiển thị component ChangePasswordTab
            case 'dashboard':
                return <DashboardTab />; // Hiển thị component DashboardTab
            case 'schedule':
                return <ScheduleTab />; // Hiển thị component ScheduleTab
            default:
                return <div>Chọn một mục từ menu</div>; // Mặc định hoặc fallback
=======
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
>>>>>>> c1949cc (Bao cao lan 3)
        }
    };

    return (
<<<<<<< HEAD
        // Container bao ngoài, căn giữa nội dung
        <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
            {/* Khung chính chứa sidebar và content */}
            <div className="flex w-full max-w-screen-lg bg-white rounded-3xl shadow-xl overflow-hidden">

                {/* --- Cột Sidebar Menu (Bên trái) --- */}
                <div className="w-64 flex-shrink-0 bg-gradient-to-b from-pink-200 to-purple-300 rounded-l-3xl">
                    {/*
                      n trắng.
                    */}
                    <Menu
                        mode="inline" // Chế độ menu dọc
                        selectedKeys={[activeTab]} // Mục đang được chọn sẽ được tô sáng dựa trên state activeTab
                        onClick={handleMenuClick} // Hàm xử lý khi click
                        items={items} // Dữ liệu các mục menu
                        className="!border-e-0 h-full bg-transparent p-4 text-gray-700" // Loại bỏ border phải, full height, nền trong suốt, padding, màu chữ
                        // Tùy chỉnh thêm style cho các mục menu nếu muốn
                        // style={{ backgroundColor: 'transparent' }} // Cách khác để làm nền trong suốt
                    />
                </div>

                {/* --- Khu vực Nội dung chính (Bên phải) --- */}
                <div className="flex-1 p-8 bg-gray-50 rounded-r-3xl overflow-y-auto">
                    {/* Render nội dung dựa trên activeTab */}
                    {renderContent()}
                </div>

            </div>
        </div>
=======
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
>>>>>>> c1949cc (Bao cao lan 3)
    );
}

export default Profile;
