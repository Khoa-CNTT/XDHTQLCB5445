import React, { useState } from 'react';
import { Row, Col, Card, Statistic, DatePicker, Select } from 'antd';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, AreaChart, Area, PieChart, Pie, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, ResponsiveContainer,
  ComposedChart
} from 'recharts';

const { RangePicker } = DatePicker;
const { Option } = Select;

const Dashboard = () => {
  const [dateRange, setDateRange] = useState([]);
  const [filterType, setFilterType] = useState('day'); // day, month, year, quarter

  const orderData = [
    { name: 'T2', orders: 10, revenue: 200000, cost: 150000 },
    { name: 'T3', orders: 14, revenue: 300000, cost: 200000 },
    { name: 'T4', orders: 18, revenue: 450000, cost: 250000 },
    { name: 'T5', orders: 8, revenue: 150000, cost: 100000 },
    { name: 'T6', orders: 16, revenue: 320000, cost: 220000 },
    { name: 'T7', orders: 20, revenue: 500000, cost: 350000 },
    { name: 'CN', orders: 12, revenue: 280000, cost: 200000 },
  ];

  const handleDateChange = (dates) => {
    setDateRange(dates);
  };

  const handleFilterTypeChange = (value) => {
    setFilterType(value);
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        <Col span={6}><Card><Statistic title="Đơn hàng hôm nay" value={15} /></Card></Col>
        <Col span={6}><Card><Statistic title="Khách hàng mới" value={8} /></Card></Col>
        <Col span={6}><Card><Statistic title="Dịch vụ đang hoạt động" value={12} /></Card></Col>
        <Col span={6}><Card><Statistic title="Tổng doanh thu" value={1250000} suffix="₫" /></Card></Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        <Col span={6}>
          <RangePicker
            style={{ width: '100%' }}
            onChange={handleDateChange}
            placeholder={['Start date', 'End date']}
          />
        </Col>
        <Col span={6}>
          <Select
            value={filterType}
            onChange={handleFilterTypeChange}
            style={{ width: '100%' }}
          >
            <Option value="day">Ngày</Option>
            <Option value="month">Tháng</Option>
            <Option value="year">Năm</Option>
            <Option value="quarter">Quý</Option>
          </Select>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
        <Col span={12}>
          <Card title="Biểu đồ cột đơn hàng">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={orderData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="orders" fill="#1890ff" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Biểu đồ đường doanh thu">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={orderData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>

        <Col span={12}>
          <Card title="Biểu đồ tròn tỷ lệ đơn hàng">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderData}
                  dataKey="orders"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#82ca9d"
                  label
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Biểu đồ kết hợp">
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={orderData}>
                <XAxis dataKey="name" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Legend />
                <Bar dataKey="orders" barSize={20} fill="#8884d8" />
                <Line type="monotone" dataKey="revenue" stroke="#82ca9d" />
                <Area type="monotone" dataKey="cost" stroke="#ff7300" fill="#ff7300" />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
