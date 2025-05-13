import React, { useCallback, useEffect, useState } from "react";
import { Row, Col, Card, Statistic, message } from "antd";
import { listOrder } from "../../APIs/orderApi";
import { listUser } from "../../APIs/userApi";
import { getAllBookings } from "../../APIs/booking";
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

      if (orderRes.success && Array.isArray(orderRes.data)) {
        const filteredOrders = orderRes.data || [];
        orderRevenue = filteredOrders.reduce(
          (sum, order) => sum + (order.totalAmount || 0),
          0
        );
        totalRevenue += orderRevenue;

        setStats((prev) => ({
          ...prev,
          totalOrders: filteredOrders.length,
        }));
      }

      if (userRes.success && Array.isArray(userRes.data)) {
        const totalUsers = userRes.data.filter(
          (user) => user.role === "user"
        ).length;
        setStats((prev) => ({ ...prev, totalUsers }));
      }

      if (Array.isArray(bookingRes)) {
        const filteredBookings = bookingRes || [];
        bookingRevenue = filteredBookings.reduce(
          (sum, booking) => sum + (booking.totalAmount || 0),
          0
        );
        totalRevenue += bookingRevenue;

        setStats((prev) => ({
          ...prev,
          totalBookings: filteredBookings.length,
          totalRevenue,
          orderRevenue,
          bookingRevenue,
        }));
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
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div>
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
            <Statistic title="Tổng doanh thu" value={stats.totalRevenue} suffix="₫" />
          </Card>
        </Col>
      </Row>

      <div style={{ textAlign: "center", marginTop: 40 }}>
        <h2 style={{ fontSize: 50, fontWeight: "bold", color: "#000" }}>
          Chào mừng đến với giao diện quản lý Winner Beauty Spa!
        </h2>
      </div>
    </div>
  );
};

export default Dashboard;
