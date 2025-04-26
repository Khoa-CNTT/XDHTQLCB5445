import React, { useEffect, useState, useCallback } from "react";
import {Table,Button,Drawer,Spin,Select,Descriptions,Badge,message,Space,Empty} from "antd";
import { EditOutlined, ReloadOutlined } from "@ant-design/icons";
import { getAllBookings } from "../../APIs/booking";
import { updateBookingStatus } from "../../APIs/booking";
import moment from "moment";
const BookingManagement = () => {
  const [state, setState] = useState({
    bookings: [],
    selectedBooking: null,
    isDrawerOpen: false,
    loading: {
      table: true,
      status: false,
      detail: false,
    },
    error: null,
  });

  const fetchBookings = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      loading: { ...prev.loading, table: true },
      error: null,
    }));
    try {
      const response = await getAllBookings();
      if (Array.isArray(response)) {
        const processedBookings = response
        .filter((item) => item.branch?._id !== "680b4f376e58bda8dfa176e2")
        .map((item) => ({
          ...item,
          key: item._id,
          dateFormatted: moment(item.date).format("DD/MM/YYYY"),
          createdAtFormatted: moment(item.updatedAt).format("DD/MM/YYYY"),
        }));
      
        setState((prev) => ({
          ...prev,
          bookings: processedBookings,
          loading: { ...prev.loading, table: false },
        }));
      } else {
        throw new Error("Dữ liệu không hợp lệ");
      }
    } catch (error) {
    
      setState((prev) => ({
        ...prev,
        error: error.response?.data?.message || error.message,
        loading: { ...prev.loading, table: false },
      }));
      message.error(error.response?.data?.message || "Không thể tải lịch hẹn");
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleViewDetails = async (booking) => {
    setState((prev) => ({
      ...prev,
      selectedBooking: booking,
      isDrawerOpen: true,
      loading: { ...prev.loading, detail: false },
    }));
  };
  const handleStatusChange = async (bookingId, newStatus) => {
    setState((prev) => ({
      ...prev,
      loading: { ...prev.loading, status: true },
    }));

    try {
      const response = await updateBookingStatus(bookingId, {
        status: newStatus,
      });

      if (response?.success) {
        setState((prev) => ({
          ...prev,
          bookings: prev.bookings.map((booking) =>
            booking._id === bookingId
              ? { ...booking, status: newStatus }
              : booking
          ),
          selectedBooking:
            prev.selectedBooking && prev.selectedBooking._id === bookingId
              ? { ...prev.selectedBooking, status: newStatus }
              : prev.selectedBooking,
          loading: { ...prev.loading, status: false },
        }));

        message.success("Cập nhật trạng thái thành công");
      } else {
        throw new Error(response.message || "Không thể cập nhật");
      }
    } catch (error) {
      message.error(error?.response?.data?.message || "Cập nhật thất bại");
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, status: false },
      }));
    }
  };

  const bookingStatusOptions = [
    { value: "Đang xử lý", label: "Đang xử lý" },
    { value: "Đã xác nhận", label: "Đã xác nhận" },
    { value: "Đã hủy", label: "Đã hủy" },
    { value: "Đã hoàn thành", label: "Đã hoàn thành" },
  ];
  const columns = [
    {
      title: "Mã lịch hẹn",
      dataIndex: "_id",
      key: "_id",
      render: (id) => (id ? `${id.slice(0, 9)}` : "Không rõ"),
      filters: state.bookings.map((booking) => ({
        text: booking._id ? `${booking._id.slice(0, 9)}` : "Không rõ",
        value: booking._id,
      })),

      onFilter: (value, record) => record._id === value,
    },
    {
      title: "Ngày hẹn",
      dataIndex: "dateFormatted",
      key: "dateFormatted",
      render: (text, record) => (
        <div>
          <div>{record.dateFormatted}</div>
        </div>
      ),
    },
    {
      title: "Ngày đăng ký",
      dataIndex: "createdAtFormatted",
      key: "createdAtFormatted",
      render: (text, record) => (
        <div>
          <div>{record.createdAtFormatted}</div>
        </div>
      ),
    },
    {
      title: "Nhân viên",
      dataIndex: ["employee", "UserID"],
      key: "employee",
      render: (emp) => `${emp?.firstName} ${emp?.lastName}` || "Không xác định",
    },

    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status, record) => (
        <Select
          value={status}
          style={{ width: 140 }}
          onChange={(value) => handleStatusChange(record._id, value)}
          loading={state.loading.status}
          options={bookingStatusOptions}
          disabled={state.loading.status}
        />
      ),
      filters: bookingStatusOptions.map((opt) => ({
        text: opt.label,
        value: opt.value,
      })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Thao tác",
      key: "actions",
      fixed: "right",
      width: 100,
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleViewDetails(record)}
            disabled={state.loading.status}
          >
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="mt-3">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Quản lý lịch hẹn</h1>
        <Button
          icon={<ReloadOutlined />}
          onClick={fetchBookings}
          loading={state.loading.table}
        >
          Tải lại
        </Button>
      </div>

      <Spin tip="Đang tải lịch hẹn..." spinning={state.loading.table}>
        <Table
          style={{ marginTop: 20 }}
          dataSource={state.bookings}
          columns={columns}
          pagination={{ pageSize: 5, showSizeChanger: true }}
          bordered
          size="middle"
          locale={{
            emptyText: state.error ? (
              <Empty
                description={
                  <span>
                    Lỗi tải lịch hẹn: {state.error}
                    <br />
                    <Button onClick={fetchBookings}>Thử lại</Button>
                  </span>
                }
              />
            ) : (
              <Empty description="Không có lịch hẹn nào" />
            ),
          }}
        />
      </Spin>
      <Drawer
        title={
          state.selectedBooking
            ? `Chi tiết lịch hẹn - ${state.selectedBooking._id.substring(
                0,
                8
              )}...`
            : "Chi tiết lịch hẹn"
        }
        placement="right"
        width={700}
        closable
        onClose={() => setState((prev) => ({ ...prev, isDrawerOpen: false }))}
        open={state.isDrawerOpen}
        destroyOnClose
      >
        <Spin spinning={state.loading.detail}>
          {state.selectedBooking ? (
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Mã lịch hẹn">
                {state.selectedBooking._id}
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng">
                {state.selectedBooking.user.firstName}{" "}
                {state.selectedBooking.user.lastName}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày đặt lịch">
                {moment(state.selectedBooking.date).format("DD/MM/YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày đăng ký">
                {moment(state.selectedBooking.updatedAt).format(
                  "DD/MM/YYYY"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Tên nhân viên">
                {state.selectedBooking.employee?.UserID?.firstName}{" "}
                {state.selectedBooking.employee?.UserID?.lastName}
              </Descriptions.Item>

              <Descriptions.Item label="Trạng thái">
                <Badge
                  status={
                    state.selectedBooking.status === "Đang xử lý"
                      ? "processing"
                      : state.selectedBooking.status === "Đã xác nhận"
                      ? "warning"
                      : state.selectedBooking.status === "Đã hoàn thành"
                      ? "success"
                      : state.selectedBooking.status === "Đã hủy"
                      ? "error"
                      : "default"
                  }
                  text={state.selectedBooking.status}
                />
              </Descriptions.Item>
            </Descriptions>
          ) : (
            <Empty description="Chưa chọn lịch hẹn" />
          )}
        </Spin>
      </Drawer>
    </div>
  );
};

export default BookingManagement;
