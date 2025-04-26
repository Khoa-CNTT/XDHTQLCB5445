import React, { useState, useEffect } from 'react';
import { Button, Menu } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { TbLayoutDashboard } from 'react-icons/tb';
import { GrUserManager } from 'react-icons/gr';
import ServiceManagement from '../components/ComponentManagement/ServiceManagement';
import ProductManagement from '../components/ComponentManagement/ProductManagement';
import BlogManagement from '../components/ComponentManagement/BlogManagement';
import OrderManagement from '../components/ComponentManagement/OrderManagement';
import VoucherManagement from '../components/ComponentManagement/VoucherManagement';
import Dashboard from '../components/ComponentManagement/Dashboard';
import { IoHomeOutline } from 'react-icons/io5';
import { listmanager } from '../APIs/manager';
import EmployeeBrand from '../components/ComponentManagement/EmployeeBrand';
import BookingBrand from '../components/ComponentManagement/BookingBrand';

const Manager = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [stateOpenKeys, setStateOpenKeys] = useState('dashboard');
  const [position, setPosition] = useState(null);

  useEffect(() => {
    const fetchManager = async () => {
      try {
        const data = await listmanager(); 
        const currentUserId = localStorage.getItem("userId"); 
  
        if (data.success === true) {
          const currentManager = data.data.find(m => m.UserID === currentUserId || m.UserID?._id === currentUserId);
          if (currentManager) {
            setPosition(currentManager.Position);
          } else {
            console.warn("Không tìm thấy manager tương ứng với userId");
          }
        }
      } catch (error) {
        console.error('Error fetching manager info:', error);
      }
    };
  
    fetchManager();
  }, []);
  

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const renderPage = (key) => {
    switch (key) {
      case 'home':
        return navigate('/');
      case 'blog':
        return <BlogManagement />;
      case 'employee':
        return <EmployeeBrand />;
      case 'service':
        return <ServiceManagement />;
      case 'product':
        return <ProductManagement />;
      case 'order':
        return <OrderManagement />;
      case 'voucher':
        return <VoucherManagement />;
      case 'booking':
        return <BookingBrand />;
      default:
        return <Dashboard />;
    }
  };

  const handleOnClick = ({ key }) => {
    setStateOpenKeys(key);
    setCurrent(key);
  };

  const generateMenuItems = () => {
    const commonItems = [
      { key: 'dashboard', label: 'Dashboard', icon: <TbLayoutDashboard style={{ fontSize: '24px' }} /> },
      { key: 'home', label: 'Trang người dùng', icon: <IoHomeOutline style={{ fontSize: '24px' }} /> },
    ];

    if (position === 'Quản lý chi nhánh') {
      commonItems.push({
        key: 'manager',
        label: 'Manager',
        icon: <GrUserManager style={{ fontSize: '24px' }} />,
        children: [
          { key: 'employee', label: 'Quản lý nhân viên' },
          { key: 'booking', label: 'Quản lý đặt lịch' },
        ],
      });
    } else if (position === 'Quản lý dịch vụ') {
      commonItems.push({
        key: 'manager',
        label: 'Manager',
        icon: <GrUserManager style={{ fontSize: '24px' }} />,
        children: [
          { key: 'blog', label: 'Quản lý BLog' },
          { key: 'service', label: 'Quản lý dịch vụ' },
          { key: 'product', label: 'Quản lý sản phẩm' },
          { key: 'order', label: 'Quản lý đơn hàng' },
          { key: 'voucher', label: 'Quản lý voucher' },
        ],
      });
    }

    return commonItems;
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
          items={position ? generateMenuItems() : []}
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

export default Manager;
