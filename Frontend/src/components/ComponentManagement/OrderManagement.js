import React, { useEffect, useState, useCallback } from "react";
import {
  Table, Button, Tag, Drawer, Spin, Select, Descriptions,
  Badge, message, Space, Empty
} from "antd";
import { EditOutlined, ReloadOutlined } from "@ant-design/icons";
import { listOrder, updateOrderStatus } from "../../APIs/orderApi";
import { getUser } from "../../APIs/userApi";

const OrderManagement = () => {
  // ===== State =====
  const [state, setState] = useState({
    orders: [],
    selectedOrder: null,
    isDrawerOpen: false,
    loading: {
      table: true,
      status: false,
      detail: false
    },
    error: null
  });
  const [userFullName, setUserFullName] = useState("Không rõ");

  // ===== Options =====
  const orderStatusOptions = [
    { value: "Đang xử lý", label: "Đang xử lý" },
    { value: "Đã xác nhận", label: "Đã xác nhận" },
    { value: "Đã giao", label: "Đã giao" },
    { value: "Đã hủy", label: "Đã hủy" },
  ];

  // ===== Helper: render tag trạng thái thanh toán =====
  const paymentStatusTag = (status) => {
    const colorMap = {
      "Đang xử lý": "orange",
      "Đã xác nhận": "green",
      "Đã giao": "blue",
      "Đã hủy": "red",
      "Hoàn tiền": "red",
    };
    const labelMap = {
      "Đang xử lý": "Chờ thanh toán",
      "Đã xác nhận": "Đã thanh toán",
      "Đã giao": "Đã giao",
      "Đã hủy": "Đã hủy",
      "Hoàn tiền": "Đã hoàn tiền",
    };
    return <Tag color={colorMap[status] || "default"}>{labelMap[status] || status}</Tag>;
  };

  // ===== Fetch Orders =====
  const fetchOrders = useCallback(async () => {
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, table: true },
      error: null
    }));

    try {
      const response = await listOrder();
      if (response.success && Array.isArray(response.data)) {
        const processedOrders = response.data.map(item => ({
          ...item,
          key: item._id,
          orderDate: item.orderDate ? new Date(item.orderDate).toLocaleString() : "Không rõ"
        }));

        setState(prev => ({
          ...prev,
          orders: processedOrders,
          loading: { ...prev.loading, table: false }
        }));

      } else {
        throw new Error("Dữ liệu không hợp lệ");
      }
    } catch (error) {
      
      setState(prev => ({
        ...prev,
        error: error.response?.data?.message || error.message,
        loading: { ...prev.loading, table: false }
      }));
      message.error(error.response?.data?.message || "Không thể tải đơn hàng");
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ===== Handle Update Status =====
  const handleStatusChange = async (orderId, newStatus) => {
    setState(prev => ({ ...prev, loading: { ...prev.loading, status: true } }));

    try {
      const response = await updateOrderStatus(orderId, { orderStatus: newStatus });
      if (response.success) {
        setState(prev => ({
          ...prev,
          orders: prev.orders.map(order =>
            order._id === orderId ? { ...order, orderStatus: newStatus } : order
          )
        }));
        message.success("Đã cập nhật trạng thái đơn hàng");
      } else {
        throw new Error(response.message || "Cập nhật thất bại");
      }
    } catch (error) {
     
      message.error(error.response?.data?.message || "Không thể cập nhật trạng thái");
      fetchOrders();
    } finally {
      setState(prev => ({ ...prev, loading: { ...prev.loading, status: false } }));
    }
  };
  const handleViewDetails = async (order) => {
    setState(prev => ({
      ...prev,
      selectedOrder: order,
      isDrawerOpen: true,
      loading: { ...prev.loading, detail: true }
    }));

    try {
      const userData = await getUser(order.userId);
      if (userData.success) {
        setUserFullName(`${userData.data.firstName} ${userData.data.lastName}`);
      } else {
        setUserFullName("Không rõ");
      }
    } catch (error) {
      setUserFullName("Không rõ");
    } finally {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, detail: false }
      }));
    }
  };

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "_id",
      key: "_id",
      render: (id) => id ? `${id.substring(0, 8)}...` : "Không rõ",
      filters: state.orders.map(order => ({
        text: order._id ? `${order._id.substring(0, 8)}...` : "Không rõ",
        value: order._id
      })),
      onFilter: (value, record) => record._id === value,
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
    },
    {
      title: "Ngày đặt hàng",
      dataIndex: "orderDate",
      key: "orderDate",
    },
    {
      title: "Trạng thái",
      dataIndex: "orderStatus",
      key: "orderStatus",
      width: 150,
      render: (status, record) => (
        <Select
          value={status}
          style={{ width: 140 }}
          onChange={(value) => handleStatusChange(record._id, value)}
          loading={state.loading.status}
          options={orderStatusOptions}
          disabled={state.loading.status}
        />
      ),
      filters: orderStatusOptions.map(opt => ({ text: opt.label, value: opt.value })),
      onFilter: (value, record) => record.orderStatus === value,
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      width: 150,
      render: paymentStatusTag,
      filters: [
        { text: "Chờ thanh toán", value: "Chờ thanh toán" },
        { text: "Đã thanh toán", value: "Đã thanh toán" },
        { text: "Đã hoàn tiền", value: "Đã hoàn tiền" },
      ],
      onFilter: (value, record) => record.paymentStatus === value,
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Quản lý đơn hàng</h1>
        <Button icon={<ReloadOutlined />} onClick={fetchOrders} loading={state.loading.table}>
          Tải lại
        </Button>
      </div>

      <Spin tip="Đang tải đơn hàng..." spinning={state.loading.table}>
        <Table
          style={{ marginTop: 20 }}
          dataSource={state.orders}
          columns={columns}
          pagination={{ pageSize: 5, showSizeChanger: true }}
          bordered
          size="middle"
          locale={{
            emptyText: state.error ? (
              <Empty
                description={
                  <span>
                    Lỗi tải đơn hàng: {state.error}
                    <br />
                    <Button onClick={fetchOrders}>Thử lại</Button>
                  </span>
                }
              />
            ) : (
              <Empty description="Không có đơn hàng nào" />
            ),
          }}
        />
      </Spin>

      <Drawer
        title={state.selectedOrder ? `Chi tiết đơn hàng - ${state.selectedOrder._id.substring(0, 8)}...` : "Chi tiết đơn hàng"}
        placement="right"
        width={700}
        closable
        onClose={() => setState(prev => ({ ...prev, isDrawerOpen: false }))}
        open={state.isDrawerOpen}
        destroyOnClose
      >
        <Spin spinning={state.loading.detail}>
          {state.selectedOrder ? (
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Mã đơn hàng">{state.selectedOrder._id}</Descriptions.Item>
              <Descriptions.Item label="Khách hàng">{userFullName}</Descriptions.Item>
              <Descriptions.Item label="Ngày đặt hàng">{state.selectedOrder.orderDate}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Badge status="processing" text={state.selectedOrder.orderStatus} />
              </Descriptions.Item>
              <Descriptions.Item label="Tình trạng thanh toán">
                {paymentStatusTag(state.selectedOrder.paymentStatus)}
              </Descriptions.Item>
              <Descriptions.Item label="Phương thức thanh toán">
                {state.selectedOrder.paymentMethod || "Không rõ"}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền">
                ${(state.selectedOrder.totalAmount || 0).toFixed(2)}
              </Descriptions.Item>
            </Descriptions>
          ) : (
            <Empty description="Chưa chọn đơn hàng" />
          )}
        </Spin>
      </Drawer>
    </div>
  );
};

export default OrderManagement;
