// DashboardTab.js
import React from 'react';
import {
    ShoppingCartOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    TruckOutlined,
  } from '@ant-design/icons';

import { Card, Col, Row } from 'antd';

// Component Card tùy chỉnh
function CustomCard({ title, icon, count }) { // Loại bỏ style prop
  return (
    <div className="text-center p-7 rounded-xl bg-white shadow-md transition-all duration-300 border border-white hover:translate-y- -2 hover:border-gray-300"
>
      <div className="text-5xl text-teal-300 mb-4 shadow-sm">
      {React.cloneElement(icon, { style: { fontSize: 'inherit' } })}
      </div>
      <h2 className="text-xl text-blue-grey-500 font-semibold mb-2">{count}</h2>
      <p className="text-gray-600 text-sm leading-relaxed">{title}</p>
    </div>
  );
}

const DashboardTab = () => {
    const orderData = {
        totalOrders: 0,
        pendingOrders: 0,
        processingOrders: 0,
        completedOrders: 0,
      };
    return (
        <div className="p-4"> {/* Thay thế profile-section */}
            <h2 className="text-2xl font-semibold mb-4">MyOrder</h2>
            <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} md={6}>
                    <CustomCard
                    title="Total Order"
                    icon={<ShoppingCartOutlined />}
                    count={orderData.totalOrders}
                    />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <CustomCard
                    title="Pending Order"
                    icon={<ClockCircleOutlined />}
                    count={orderData.pendingOrders}
                    />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <CustomCard
                    title="Processing Order"
                    icon={<TruckOutlined />}
                    count={orderData.processingOrders}
                    />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <CustomCard
                    title="Complete Order"
                    icon={<CheckCircleOutlined />}
                    count={orderData.completedOrders}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default DashboardTab;