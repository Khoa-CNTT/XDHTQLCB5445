import React, { useState } from "react";
import {Card, Select, DatePicker, Button, Form, Row, Col, Table, Progress, Avatar,Spin,  message,} from "antd";
import {Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Line, LineChart,} from "recharts";
import dayjs from "dayjs";
import { listOrder } from "../../APIs/orderApi";
import { getAllBookings } from "../../APIs/booking";
import anhSpa from "../../img/anhspa.png";
import ExportExcel from "./ExportExcel";

const { RangePicker } = DatePicker;
const { Option } = Select;
const ReportForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [topServices, setTopServices] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [reportData, setReportData] = useState({ quantity: 0, revenue: 0 });
  const [revenuePieData, setRevenuePieData] = useState([]);
  const [staffPerformance, setStaffPerformance] = useState([]);
  const [staffBookingCounts, setStaffBookingCounts] = useState([]);
  const [timeRangeType, setTimeRangeType] = useState("custom"); 

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
            price: service?.price || 0,
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

  const processStaffPerformance = async (bookings, dateRange) => {
    try {
      const staffMap = {};
      bookings.forEach((booking) => {
        console.log("Booking staff/employee info:", booking.employee);

        const staffInfo = booking.staff || booking.employee;
        if (!staffInfo) return;
        let staffId =
          staffInfo._id || (staffInfo.UserID && staffInfo.UserID._id);
        if (!staffId) return;
        let employeeName = "Không xác định";
        if (staffInfo.UserID?.firstName) {
          employeeName = `${staffInfo.UserID.firstName} ${
            staffInfo.UserID.lastName || ""
          }`.trim();
        } else if (staffInfo.name) {
          employeeName = staffInfo.name;
        }

        if (!staffMap[staffId]) {
          staffMap[staffId] = {
            id: staffId,
            name: employeeName,
            avatar: staffInfo.avatar || staffInfo.UserID?.avatar || "",
            position: staffInfo.position || "Nhân viên",
            totalBookings: 0,
            completedBookings: 0,
            cancelledBookings: 0,
            totalRevenue: 0,
            completionRate: 0,
            totalRatings: 0,
            ratingCount: 0,
            averageRating: 0,
          };
        }

        // Cập nhật thống kê
        staffMap[staffId].totalBookings += 1;

        const status = booking.status;
        if (status === "completed" || status === "Đã hoàn thành") {
          staffMap[staffId].completedBookings += 1;
          staffMap[staffId].totalRevenue += booking.totalAmount || 0;

          if (booking.rating) {
            staffMap[staffId].totalRatings += booking.rating;
            staffMap[staffId].ratingCount += 1;
          }
        } else if (status === "cancelled" || status === "Đã hủy") {
          staffMap[staffId].cancelledBookings += 1;
        }
      });

      const staffWithBookings = Object.values(staffMap).filter(
        (staff) => staff.totalBookings > 0
      );

      // Tính toán các chỉ số
      staffWithBookings.forEach((staff) => {
        staff.completionRate =
          staff.totalBookings > 0
            ? (staff.completedBookings / staff.totalBookings) * 100
            : 0;

        staff.averageRating =
          staff.ratingCount > 0 ? staff.totalRatings / staff.ratingCount : 0;

        staff.completionRate = Number(staff.completionRate.toFixed(2));
        staff.averageRating = Number(staff.averageRating.toFixed(1));
      });

      return staffWithBookings.sort(
        (a, b) => b.completedBookings - a.completedBookings
      );
    } catch (err) {
      console.error("Error processing staff data:", err);
      return [];
    }
  };

  const getStaffBookingCounts = (staffs) => {
    return staffs.map((staff) => ({
      name: staff.name,
      completed: staff.completedBookings,
      cancelled: staff.cancelledBookings,
      pending:
        staff.totalBookings - staff.completedBookings - staff.cancelledBookings,
    }));
  };
  const getDateRangeByType = (type, value) => {
    let startDate, endDate;

    switch (type) {
      case "month":
        startDate = dayjs(value).startOf("month");
        endDate = dayjs(value).endOf("month");
        break;
      case "quarter":
        const quarterStartMonth = Math.floor((value.month() - 1) / 3) * 3 + 1;
        startDate = dayjs(value)
          .month(quarterStartMonth - 1)
          .startOf("month");
        endDate = dayjs(value)
          .month(quarterStartMonth + 2)
          .endOf("month");
        break;
      case "year":
        startDate = dayjs(value).startOf("year");
        endDate = dayjs(value).endOf("year");
        break;
      default:
        return null;
    }

    return [startDate, endDate];
  };

  const handleTimeRangeTypeChange = (value) => {
    setTimeRangeType(value);
    if (value !== "custom") {
      form.setFieldsValue({ range: undefined });
    }
  };

  const handleSearch = async (values) => {
    const { type, range, month, quarter, year } = values;
    if (!type) return;

    let from, to;

    if (timeRangeType === "custom") {
      if (!range) return;
      [from, to] = [
        dayjs(range[0]).startOf("day"),
        dayjs(range[1]).endOf("day"),
      ];
    } else {
      let dateValue;
      if (timeRangeType === "month" && month) {
        dateValue = dayjs(month);
      } else if (timeRangeType === "quarter" && quarter) {
        dateValue = dayjs(quarter);
      } else if (timeRangeType === "year" && year) {
        dateValue = dayjs(year);
      } else {
        message.error("Vui lòng chọn thời gian");
        return;
      }

      const range = getDateRangeByType(timeRangeType, dateValue);
      [from, to] = [range[0], range[1]];
    }

    setLoading(true);
    try {
      if (type === "order") {
        const res = await listOrder();
        if (res.success) {
          const filtered = res.data.filter((order) => {
            const date = dayjs(order.orderDate);
            return date.isAfter(from) && date.isBefore(to);
          });

          const revenueByDate = {};
          filtered.forEach((order) => {
            const dateStr = dayjs(order.orderDate).format("DD/MM/YYYY");
            revenueByDate[dateStr] =
              (revenueByDate[dateStr] || 0) + (order.totalAmount || 0);
          });

          const pieData = Object.entries(revenueByDate).map(
            ([date, amount]) => ({
              name: date,
              value: amount,
            })
          );
          const totalRevenue = pieData.reduce(
            (sum, item) => sum + item.value,
            0
          );

          const top = getTopSellingProducts(filtered);

          setReportData({
            quantity: filtered.length,
            revenue: totalRevenue,
          });
          setRevenuePieData(pieData);
          setTopProducts(top);
          setTopServices([]);
          setStaffPerformance([]);
          setStaffBookingCounts([]);
        }
      } else if (type === "booking") {
        const bookingsRes = await getAllBookings();
        const filtered = bookingsRes.filter((booking) => {
          const date = dayjs(booking.updatedAt);
          return date.isAfter(from) && date.isBefore(to);
        });

        const revenueByDate = {};
        filtered.forEach((booking) => {
          const dateStr = dayjs(booking.updatedAt).format("DD/MM/YYYY");
          revenueByDate[dateStr] =
            (revenueByDate[dateStr] || 0) + (booking.totalAmount || 0);
        });

        const pieData = Object.entries(revenueByDate).map(([date, amount]) => ({
          name: date,
          value: amount,
        }));

        const totalRevenue = pieData.reduce((sum, item) => sum + item.value, 0);
        const top = getTopUsedServices(filtered);
        setReportData({
          quantity: filtered.length,
          revenue: totalRevenue,
        });
        setRevenuePieData(pieData);
        setTopServices(top);
        setTopProducts([]);
        setStaffPerformance([]);
        setStaffBookingCounts([]);
      } else if (type === "staff") {
        const bookingsRes = await getAllBookings();

        const filtered = bookingsRes.filter((booking) => {
          const date = dayjs(booking.createdAt);
          return date.isAfter(from) && date.isBefore(to);
        });

        const staffData = await processStaffPerformance(filtered, { from, to });
        const bookingCounts = getStaffBookingCounts(staffData);

        setStaffPerformance(staffData);
        setStaffBookingCounts(bookingCounts);

        const totalCompleted = staffData.reduce(
          (sum, staff) => sum + staff.completedBookings,
          0
        );
        const totalRevenue = staffData.reduce(
          (sum, staff) => sum + staff.totalRevenue,
          0
        );

        setReportData({
          quantity: totalCompleted,
          revenue: totalRevenue,
        });

        setRevenuePieData([]);
        setTopServices([]);
        setTopProducts([]);
      }
    } catch (err) {
      message.error(err.message || "Lỗi khi lấy báo cáo");
    } finally {
      setLoading(false);
    }
  };

  const staffColumns = [
    {
      title: "Nhân viên",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Avatar
            src={
              record.avatar ||
              "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
            }
            size={40}
          />
          <div>
            <div style={{ fontWeight: "bold" }}>{text}</div>
            <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
              {record.position}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Tổng lịch hẹn",
      dataIndex: "totalBookings",
      key: "totalBookings",
      sorter: (a, b) => a.totalBookings - b.totalBookings,
    },
    {
      title: "Đã hoàn thành",
      dataIndex: "completedBookings",
      key: "completedBookings",
      sorter: (a, b) => a.completedBookings - b.completedBookings,
    },
    {
      title: "Đã hủy",
      dataIndex: "cancelledBookings",
      key: "cancelledBookings",
    },
    {
      title: "Tỷ lệ hoàn thành",
      key: "completionRate",
      render: (text, record) => (
        <span>
          <Progress
            percent={Math.round(record.completionRate)}
            size="small"
            status={
              record.completionRate > 70
                ? "success"
                : record.completionRate > 50
                ? "normal"
                : "exception"
            }
          />
        </span>
      ),
      sorter: (a, b) => a.completionRate - b.completionRate,
    },
    {
      title: "Đánh giá TB",
      key: "rating",
      render: (text, record) => (
        <span>
          {record.averageRating > 0
            ? record.averageRating.toFixed(1) + "/5"
            : "Chưa có"}
        </span>
      ),
      sorter: (a, b) => a.averageRating - b.averageRating,
    },
    {
      title: "Doanh thu",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      render: (value) => `${value.toLocaleString()} ₫`,
      sorter: (a, b) => a.totalRevenue - b.totalRevenue,
    },
  ];

  const EmptyState = () => (
    <div style={{ textAlign: "center", padding: "30px 0" }}>
      <p>Chọn loại báo cáo và khoảng thời gian để xem dữ liệu</p>
    </div>
  );

  const renderTimeRangePicker = () => {
    switch (timeRangeType) {
      case "month":
        return (
          <Form.Item name="month" label="Tháng" rules={[{ required: true }]}>
            <DatePicker picker="month" style={{ width: "100%" }} />
          </Form.Item>
        );
      case "quarter":
        return (
          <Form.Item name="quarter" label="Quý" rules={[{ required: true }]}>
            <DatePicker picker="quarter" style={{ width: "100%" }} />
          </Form.Item>
        );
      case "year":
        return (
          <Form.Item name="year" label="Năm" rules={[{ required: true }]}>
            <DatePicker picker="year" style={{ width: "100%" }} />
          </Form.Item>
        );
      default:
        return (
          <Form.Item
            name="range"
            label="Khoảng thời gian"
            rules={[
              { required: true, message: "Vui lòng chọn khoảng thời gian" },
            ]}
          >
            <RangePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
          </Form.Item>
        );
    }
  };

  return (
    <Card title="Báo cáo theo thời gian">
      <Form
        layout="vertical"
        form={form}
        onFinish={handleSearch}
        initialValues={{ type: "order", timeRangeType: "custom" }}
      >
        <Row gutter={24}>
          <Col span={6}>
            <Form.Item
              name="type"
              label="Loại báo cáo"
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="order">Đơn hàng</Option>
                <Option value="booking">Lịch hẹn</Option>
                <Option value="staff">Nhân viên</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="timeRangeType"
              label="Kiểu thời gian"
              rules={[{ required: true }]}
            >
              <Select onChange={handleTimeRangeTypeChange}>
                <Option value="custom">Tùy chọn</Option>
                <Option value="month">Theo tháng</Option>
                <Option value="quarter">Theo quý</Option>
                <Option value="year">Theo năm</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>{renderTimeRangePicker()}</Col>
          <Col span={6} style={{marginTop: "30px"}}>
            <Button className="bg-blue-300" type="primary" htmlType="submit" loading={loading}>
              Xem báo cáo
            </Button>
          </Col>
        </Row>
        <Row>
          <Col
            span={4}
            style={{ display: "flex", justifyContent: "flex-end" }}
          >
            <ExportExcel
              reportType={form.getFieldValue("type")}
              dateRange={form.getFieldValue("range")}
              reportData={reportData}
              topProducts={topProducts}
              topServices={topServices}
              staffPerformance={staffPerformance}
              revenuePieData={revenuePieData}
            />
          </Col>
        </Row>
      </Form>

      {loading ? (
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <Spin size="large" tip="Đang tải dữ liệu..." />
        </div>
      ) : (
        <>
        
          {form.getFieldValue("type") === "order" &&
            revenuePieData.length > 0 && (
              <Card
                title="Biểu đồ doanh thu theo ngày"
                style={{ marginTop: 30 }}
              >
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart
                    data={revenuePieData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis
                      tickFormatter={(value) => `${value.toLocaleString()} ₫`}
                    />
                    <Tooltip
                      formatter={(value) => `${value.toLocaleString()} ₫`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r:10 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )}

          {form.getFieldValue("type") === "order" && topProducts.length > 0 && (
            <Card
              title="Top 10 sản phẩm bán chạy nhất"
              style={{ marginTop: 30 }}
            >
              <Row gutter={[16, 16]}>
                {topProducts.map((product) => (
                  <Col span={12} md={8} lg={6} key={product.productId}>
                    <Card
                      hoverable
                      cover={
                        <img
                          alt={product.name}
                          src={product.image}
                          style={{ height: 150, objectFit: "cover" }}
                        />
                      }
                    >
                      <Card.Meta
                        title={product.name}
                        description={<p>Số lượng bán: {product.quantity}</p>}
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          )}

          {form.getFieldValue("type") === "booking" &&
            revenuePieData.length > 0 && (
              <Card
                title="Biểu đồ doanh thu theo ngày"
                style={{ marginTop: 30 }}
              >
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart
                    data={revenuePieData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis
                      tickFormatter={(value) => `${value.toLocaleString()} ₫`}
                    />
                    <Tooltip
                      formatter={(value) => `${value.toLocaleString()} ₫`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#82ca9d"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )}

          {form.getFieldValue("type") === "booking" &&
            topServices.length > 0 && (
              <Card
                title="Top 10 dịch vụ được đặt nhiều nhất"
                style={{ marginTop: 30 }}
              >
                <Row gutter={[16, 16]}>
                  {topServices.map((service) => (
                    <Col span={12} md={8} lg={6} key={service.id}>
                      <Card
                        hoverable
                        cover={
                          <img
                            alt={service.name}
                            src={anhSpa}
                            style={{ height: 150, objectFit: "cover" }}
                          />
                        }
                      >
                        <Card.Meta
                          title={service.name}
                          description={
                            <>
                              <p>Lượt đặt: {service.count}</p>
                              <p>Giá: {service.price?.toLocaleString()} ₫</p>
                              <p>Thời gian: {service.duration} phút</p>
                            </>
                          }
                        />
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card>
            )}

          {form.getFieldValue("type") === "staff" &&
            staffPerformance.length > 0 && (
              <>
                <Card
                  title="Hiệu suất làm việc của nhân viên"
                  style={{ marginTop: 30 }}
                >
                  <Table
                    dataSource={staffPerformance}
                    columns={staffColumns}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                    scroll={{ x: "max-content" }}
                  />
                </Card>

                <Card
                  title="Biểu đồ số lượng lịch hẹn theo nhân viên"
                  style={{ marginTop: 30 }}
                >
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={staffBookingCounts}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="completed"
                        name="Hoàn thành"
                        fill="#00C49F"
                      />
                      <Bar dataKey="cancelled" name="Đã hủy" fill="#FF8042" />
                      <Bar dataKey="pending" name="Đang chờ" fill="#FFBB28" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                <Card
                  title="Top 5 nhân viên có doanh thu cao nhất"
                  style={{ marginTop: 30 }}
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={staffPerformance.slice(0, 5)}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" />
                      <Tooltip
                        formatter={(value) => `${value.toLocaleString()} ₫`}
                      />
                      <Bar
                        dataKey="totalRevenue"
                        name="Doanh thu"
                        fill="#8884d8"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </>
            )}

          {!loading &&
            reportData.quantity === 0 &&
            reportData.revenue === 0 && <EmptyState />}
        </>
      )}
    </Card>
  );
};

export default ReportForm;
