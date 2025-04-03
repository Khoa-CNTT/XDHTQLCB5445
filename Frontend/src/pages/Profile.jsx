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
        }
    };

    return (
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
    );
}

export default Profile;
