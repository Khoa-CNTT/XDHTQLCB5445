import React, { useState, useEffect } from 'react';
import { Table, Tag, Typography, message } from 'antd';
import { getOrders } from '../APIs/orderApi';

const { Text } = Typography;

const MyOrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const orderStatusOptions = [
    { value: "Processing", label: "Đang xử lý", color: "orange" },
    { value: "Shipped", label: "Đã gửi", color: "blue" },
    { value: "Delivered", label: "Đã giao", color: "green" },
    { value: "Cancelled", label: "Đã hủy", color: "red" },
  ];
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!token || !userId) {
          message.error('Vui lòng đăng nhập để xem đơn hàng');
          return;
        }

        console.log('Fetching orders with token:', token, 'userId:', userId);
        const rawOrders = await getOrders(token);
        console.log('Raw orders from API:', rawOrders);
        console.log('Orders received:', rawOrders);

        // Định dạng dữ liệu từ API để khớp với bảng
        const formattedOrders = rawOrders.map(order => ({
          orderId: order.orderId || 'N/A',
          orderDate: order.orderDate ? new Date(order.orderDate).toLocaleDateString('vi-VN') : 'N/A',
          products: order.products || [],
          total: order.total || 0,
          status: order.status ? order.status.toLowerCase() : 'unknown'
        }));

        setOrders(formattedOrders);

        if (formattedOrders.length === 0) {
          message.info('Bạn chưa có đơn hàng nào.');
        }
      } catch (error) {
        console.error('Error fetching orders in MyOrdersTab:', error);
        message.error(error.message || 'Lỗi khi tải đơn hàng');
      }
    };

    fetchOrders();
  }, [token, userId]);

  const columns = [
    { title: 'Mã đơn hàng', dataIndex: 'orderId', key: 'orderId' },
    { title: 'Ngày đặt', dataIndex: 'orderDate', key: 'orderDate' },
    {
      title: 'Sản phẩm',
      dataIndex: 'products',
      key: 'products',
      render: (products) => (
        <div>
          {products && products.length > 0 ? (
            products.map((product, index) => {
              // Sửa định dạng image nếu cần
              const imageSrc = product.image && product.image.startsWith('data:application/octet-stream')
                ? product.image.replace('data:application/octet-stream', 'data:image/jpeg')
                : product.image;

              return (
                <div key={product.productId || index} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  {/* Hiển thị hình ảnh */}
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={product.name || 'Sản phẩm'}
                      style={{ width: 40, height: 40, objectFit: 'cover', marginRight: 8 }}
                      onError={(e) => {
                        e.target.style.display = 'none'; // Ẩn hình ảnh nếu lỗi
                      }}
                    />
                  ) : (
                    <div style={{ width: 40, height: 40, marginRight: 8, backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      N/A
                    </div>
                  )}
                  {/* Hiển thị tên và số lượng */}
                  <div>
                    {product.name || 'N/A'} (x{product.quantity || 0})
                  </div>
                </div>
              );
            })
          ) : (
            <div>Không có sản phẩm</div>
          )}
        </div>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      render: (total) => (
        <Text strong>{total ? total.toLocaleString('vi-VN') : '0'}₫</Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const found = orderStatusOptions.find(opt => opt.value.toLowerCase() === status?.toLowerCase());
        if (found) {
          return <Tag color={found.color}>{found.label}</Tag>;
        }
        return <Tag color="gray">Không xác định</Tag>;
      },
    }
    
  ];

  return (
    <div className="my-order-tab">
      <Table
        columns={columns}
        dataSource={orders}
        pagination={{ pageSize: 5 }}
        scroll={{ x: true }}
      />
    </div>
  );
};

export default MyOrdersTab;