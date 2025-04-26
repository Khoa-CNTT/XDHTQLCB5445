<<<<<<< HEAD
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
=======
import React, { useCallback, useEffect, useState } from "react";
import { Row, Col, Card, Statistic, message, List, Avatar, DatePicker, Select } from "antd";
import {
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { listOrder } from "../../APIs/orderApi";
import { listUser } from "../../APIs/userApi";
import { getAllBookings } from "../../APIs/booking";
import anhSpa from "../../img/anhspa.png";
import dayjs from "dayjs";


const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    orderRevenue: 0,
    bookingRevenue: 0,
    totalUsers: 0,
    totalBookings: 0,
    loading: false,
    error: null,
  });

  const [chartData, setChartData] = useState({
    orderData: [],
    revenueData: [],
    costData: [],
  });

  const [topProducts, setTopProducts] = useState([]);
  const [topServices, setTopServices] = useState([]);
  const [dateRange, setDateRange] = useState(null);
  const [filterType, setFilterType] = useState('all'); // 'all', 'orders', 'bookings'

  const groupOrdersByDate = (orders) => {
    const grouped = {};
    orders.forEach((order) => {
      const date = new Date(order.orderDate);
      const formattedDate = new Intl.DateTimeFormat("vi-VN").format(date);
      if (!grouped[formattedDate]) {
        grouped[formattedDate] = {
          date: formattedDate,
          quantity: 0,
          revenue: 0,
        };
      }
      grouped[formattedDate].quantity += 1;
      grouped[formattedDate].revenue += order.totalAmount;
    });
    return Object.values(grouped);
  };

  const filterByDateRange = (data, dateField) => {
    if (!dateRange) return data;
    
    const [start, end] = dateRange;
    return data.filter(item => {
      const itemDate = dayjs(item[dateField]);
      return itemDate.isAfter(start) && itemDate.isBefore(end.add(1, 'day'));
    });
  };

  const getTopSellingProducts = (orders) => {
    const productMap = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (productMap[item.productId]) {
          productMap[item.productId].quantity += item.quantity;
        } else {
          productMap[item.productId] = {
            productId: item.productId,
            name: item.name,
            image: item.image,
            quantity: item.quantity,
          };
        }
      });
    });

    const sorted = Object.values(productMap).sort(
      (a, b) => b.quantity - a.quantity
    );
    return sorted.slice(0, 10);
  };

  const getTopUsedServices = (bookings) => {
    const serviceMap = {};

    bookings.forEach((booking) => {
      const service = booking.service;
      const serviceId = service?._id;

      if (serviceId) {
        if (!serviceMap[serviceId]) {
          serviceMap[serviceId] = {
            id: serviceId,
            name: service?.name || "Unknown",
            image: service?.image || "",
            price: service?.price || "",
            duration: service?.duration || "",
            category: service?.category || "",
            count: 0,
          };
        }

        serviceMap[serviceId].count += 1;
      }
    });

    const sorted = Object.values(serviceMap).sort((a, b) => b.count - a.count);
    return sorted.slice(0, 10);
  };

  const fetchStats = useCallback(async () => {
    setStats((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const [orderRes, userRes, bookingRes] = await Promise.all([
        listOrder(),
        listUser(),
        getAllBookings(),
      ]);

      let totalRevenue = 0;
      let orderRevenue = 0;
      let bookingRevenue = 0;
      let filteredOrders = [];
      let filteredBookings = [];

      if (orderRes.success && Array.isArray(orderRes.data)) {
        filteredOrders = orderRes.data.map((item) => ({
          ...item,
          key: item._id,
          orderDate: item.orderDate
            ? new Date(item.orderDate).toISOString()
            : "Không rõ",
        }));

        // Áp dụng bộ lọc ngày nếu có
        if (dateRange && filterType !== 'bookings') {
          filteredOrders = filterByDateRange(filteredOrders, 'orderDate');
        }

        const totalOrders = filteredOrders.length;
        orderRevenue = filteredOrders.reduce(
          (sum, order) => sum + (order.totalAmount || 0),
          0
        );
        
        if (filterType !== 'bookings') {
          totalRevenue += orderRevenue;
        }

        const groupedData = groupOrdersByDate(filteredOrders);
        const topSelling = getTopSellingProducts(filteredOrders);

        setStats((prev) => ({ ...prev, totalOrders }));

        setChartData({
          orderData: groupedData.map((item) => ({
            name: item.date,
            quantity: item.quantity,
          })),
          revenueData: groupedData.map((item) => ({
            name: item.date,
            revenue: item.revenue,
          })),
          costData: groupedData.map((item) => ({
            name: item.date,
            cost: item.revenue,
          })),
        });

        setTopProducts(topSelling);
      } 
      
      if (userRes.success && Array.isArray(userRes.data)) {
        const totalUsers = userRes.data.filter(
          (user) => user.role === "user"
        ).length;
        setStats((prev) => ({ ...prev, totalUsers }));
      } 
      
      if (Array.isArray(bookingRes)) {
        filteredBookings = bookingRes.map(item => ({
          ...item,
          bookingDate: item.bookingDate || item.createdAt
        }));

        if (dateRange && filterType !== 'orders') {
          filteredBookings = filterByDateRange(filteredBookings, 'bookingDate');
        }

        bookingRevenue = filteredBookings.reduce(
          (sum, booking) => sum + (booking.totalAmount || 0),
          0
        );
        
        if (filterType !== 'orders') {
          totalRevenue += bookingRevenue;
        }

        setStats((prev) => ({
          ...prev,
          totalBookings: filteredBookings.length,
          totalRevenue,
          orderRevenue,
          bookingRevenue,
        }));

        const topUsed = getTopUsedServices(filteredBookings);
        setTopServices(topUsed);
      } 
      
      setStats((prev) => ({ ...prev, loading: false }));
    } catch (error) {
      setStats((prev) => ({
        ...prev,
        error: error.response?.data?.message || error.message,
        loading: false,
      }));
      message.error(error.response?.data?.message || "Không thể tải thống kê");
    }
  }, [dateRange, filterType]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const COLORSORDER = [ '#FF6F91'];
  const COLORSBOOKING = ['#FF8042'];
  
  const orderPieData = [
    { name: "Doanh thu đơn hàng", value: stats.orderRevenue },
  ];
  
  const bookingPieData = [
    { name: "Doanh thu đặt lịch", value: stats.bookingRevenue },
  ];
  return (
    <div>
      <h2>Dashboard</h2>
      <Row gutter={[16, 16]} style={{ marginBottom: "20px" }}>
        <Col span={6}>
          <Card>
            <Statistic title="Tổng đơn hàng" value={stats.totalOrders} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Khách hàng mới" value={stats.totalUsers} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Tổng đặt lịch" value={stats.totalBookings} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={stats.totalRevenue}
              suffix="₫"
            />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginTop: "30px" }}>
        <Col span={12}>
          <Card title="Biểu đồ tròn: Doanh thu từ đơn hàng">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderPieData}
                  dataKey="value"
>>>>>>> c1949cc (Bao cao lan 3)
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
<<<<<<< HEAD
                  fill="#82ca9d"
                  label
                />
                <Tooltip />
=======
                  fill="#8884d8"
                  label
                >
                  {orderPieData.map((entry, index) => (
                    <Cell
                      key={`cell-order-${index}`}
                      fill={COLORSORDER[index % COLORSORDER.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value.toLocaleString()} ₫`, 'Doanh thu']}
                />
>>>>>>> c1949cc (Bao cao lan 3)
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={12}>
<<<<<<< HEAD
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
=======
          <Card title="Biểu đồ tròn: Doanh thu từ đặt lịch">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={bookingPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {bookingPieData.map((entry, index) => (
                    <Cell
                      key={`cell-booking-${index}`}
                      fill={COLORSBOOKING[index % COLORSBOOKING.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value.toLocaleString()} ₫`, 'Doanh thu']}
                />
              </PieChart>
            </ResponsiveContainer>
         
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: "30px" }} gutter={[16, 16]}>
        <Col span={12}>
          <Card title="Top 10 sản phẩm bán chạy nhất">
            <List
              itemLayout="horizontal"
              dataSource={topProducts}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar shape="square" size={64} src={item.image} />
                    }
                    title={item.name}
                    description={`Đã bán: ${item.quantity} sản phẩm`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Top 10 dịch vụ được đặt nhiều nhất">
            <List
              itemLayout="horizontal"
              dataSource={topServices}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar shape="square" size={64} src={anhSpa} />}
                    title={item.name}
                    description={
                      <>
                        <div>Giá: {item.price} ₫</div>
                        <div>Thời lượng: {item.duration} phút</div>
                        <div>Danh mục: {item.category}</div>
                        <div>Số lượt đặt: {item.count} lần</div>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
>>>>>>> c1949cc (Bao cao lan 3)
          </Card>
        </Col>
      </Row>
    </div>
  );
};

<<<<<<< HEAD
export default Dashboard;
=======
export default Dashboard;
>>>>>>> c1949cc (Bao cao lan 3)
