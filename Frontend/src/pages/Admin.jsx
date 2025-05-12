import React, { useState } from 'react';
import { Button, Menu } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { TbLayoutDashboard } from 'react-icons/tb';
import { GrUserManager } from 'react-icons/gr';
import { RiAdminLine } from 'react-icons/ri';
import { BrandManagement } from '../components/ComponentManagement/BrandManagement';
import { EmployeeManagement } from '../components/ComponentManagement/EmployeeManagement';
import ServiceManagement from '../components/ComponentManagement/ServiceManagement';
import ProductManagement from '../components/ComponentManagement/ProductManagement';
import BlogManagement from '../components/ComponentManagement/BlogManagement';
import SlideBannerManagement from '../components/ComponentManagement/SlideBannerManagement';
import OrderManagement from '../components/ComponentManagement/OrderManagement';
import VoucherManagement from '../components/ComponentManagement/VoucherManagement';
import AccountManagement from '../components/ComponentManagement/AccountManagement';
import Dashboard from '../components/ComponentManagement/Dashboard';
import { IoHomeOutline } from 'react-icons/io5';
import BookingManagement from '../components/ComponentManagement/BookingManagement';
import ReportForm from '../components/ComponentManagement/ReportForm';
import ManagerManagement from '../components/ComponentManagement/ManagerManagement';
import CategoryManagement from '../components/ComponentManagement/CategoryManagement';

const items = [
  { key: 'dashboard', label: 'Dashboard', icon: <TbLayoutDashboard style={{ fontSize: '24px' }} /> },
  {
    key: 'home',
    label: 'Trang người dùng',
    icon: <IoHomeOutline style={{ fontSize: '24px' }} />,

  },
  {
    key: 'manager',
    label: 'Manager',
    icon: <GrUserManager style={{ fontSize: '24px' }} />,
    children: [
      { key: 'blog', label: 'Quản lý BLog' },
      { key: 'employee', label: 'Quản lý nhân viên' },
      { key: 'service', label: 'Quản lý dịch vụ' },
      { key: 'product', label: 'Quản lý sản phẩm' },
      { key: 'order', label: 'Quản lý đơn hàng' },
      { key: 'booking', label: 'Quản lý đặt lịch' },
      { key: 'voucher', label: 'Quản lý voucher' },
      { key: 'category', label: 'Quản lý danh mục' },

    ],
  },
  {
    key: 'admin',
    label: 'Admin',
    icon: <RiAdminLine style={{ fontSize: '24px' }} />,
    children: [
      { key: 'banner', label: 'Banner trang chủ' },
      { key: 'account', label: 'Quản lý tài khoản' },
      { key: 'brand', label: 'Quản lý chi nhánh' },
      { key: 'manager', label: 'Quản lý Manager' },
      { key: 'report', label: 'Báo cáo, thống kê' },
    ],
  },
];
const Admin = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState('1');
  const [collapsed, setCollapsed] = useState(false);
  const [stateOpenKeys, setStateOpenKeys] = useState('dashboard');

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const renderPage = (key) => {
    switch (key) {
      case 'home':
        return navigate('/');
      case 'blog':
        return <BlogManagement />;
      case 'brand':
        return <BrandManagement />;
      case 'banner':
        return <SlideBannerManagement />;
      case 'account':
        return <AccountManagement />;
      case 'employee':
        return <EmployeeManagement />;
      case 'service':
        return <ServiceManagement />;
      case 'product':
        return <ProductManagement />;
      case 'order':
        return <OrderManagement />;
      case 'voucher':
        return <VoucherManagement />;
      case 'booking':
        return <BookingManagement />;
      case 'report':
        return <ReportForm />;
      case 'manager':
        return <ManagerManagement />;
      case 'category':
        return <CategoryManagement />;
      default:
        return <Dashboard />;
    }
  };

  const handleOnClick = ({ key }) => {
    setStateOpenKeys(key);
    setCurrent(key);
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div
        style={{
          width: collapsed ? 60 : 200,
          padding: '10px',
          transition: 'width 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
        }}
      >
        <Button
          type="primary"
          onClick={toggleCollapsed}
          style={{
            marginBottom: '15px',
            background: '#1890ff',
            borderColor: '#1890ff',
            position: 'fixed',
            top: 10,
            left: 4,
          }}
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </Button>
        <Menu
          onClick={handleOnClick}
          style={{ width: '100%', flex: 1, marginTop: 30, marginRight: 15 }}
          defaultSelectedKeys={['dashboard']}
          selectedKeys={[current]}
          mode="inline"
          inlineCollapsed={collapsed}
          items={[items[0], items[1], items[2], items[3]]}
        />
      </div>
      <div
        style={{
          flex: 1,
          padding: '20px',
          transition: 'margin-left 0.3s ease',
          overflowY: 'auto',
        }}
      >
        <div style={{ flex: 1, color: 'GrayText', paddingTop: '20px' }}>
          {renderPage(stateOpenKeys)}
        </div>
      </div>
    </div>
  );
};
export default Admin;