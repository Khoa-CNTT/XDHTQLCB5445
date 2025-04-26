import React, { useState, useEffect } from 'react';
import { Table, Tag, Typography, message } from 'antd';
import { getOrders } from '../APIs/orderApi';
<<<<<<< HEAD
=======
import { errorToast, toastContainer } from '../utils/toast';
>>>>>>> c1949cc (Bao cao lan 3)

const { Text } = Typography;

const MyOrdersTab = () => {
  const [orders, setOrders] = useState([]);
<<<<<<< HEAD
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const orderStatusOptions = [
    { value: "Processing", label: "Đang xử lý", color: "orange" },
    { value: "Shipped", label: "Đã gửi", color: "blue" },
    { value: "Delivered", label: "Đã giao", color: "green" },
    { value: "Cancelled", label: "Đã hủy", color: "red" },
  ];
  
=======
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

>>>>>>> c1949cc (Bao cao lan 3)
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!token || !userId) {
<<<<<<< HEAD
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
=======
          errorToast('Vui lòng đăng nhập để xem đơn hàng');
          return;
        }
        const rawOrders = await getOrders(token);
        const formattedOrders = rawOrders.map((order) => {
          let formattedDate = 'N/A';
          if (order.orderDate) {
            const [day, month, year] = order.orderDate.split('/');
            if (day && month && year) {
              formattedDate = new Date(`${year}-${month}-${day}`).toLocaleDateString('vi-VN');
            }
          }
          return {
            orderId: order.orderId || 'N/A',
            orderDate: formattedDate,
            products: order.products || [],
            total: order.total || 0,
            status: order.status ? order.status.toLowerCase() : 'unknown',
          };
        });
>>>>>>> c1949cc (Bao cao lan 3)

        setOrders(formattedOrders);

        if (formattedOrders.length === 0) {
          message.info('Bạn chưa có đơn hàng nào.');
        }
      } catch (error) {
<<<<<<< HEAD
        console.error('Error fetching orders in MyOrdersTab:', error);
        message.error(error.message || 'Lỗi khi tải đơn hàng');
=======
        errorToast(error.message || 'Lỗi khi tải đơn hàng');
      } finally {
        setLoading(false);
>>>>>>> c1949cc (Bao cao lan 3)
      }
    };

    fetchOrders();
  }, [token, userId]);

  const columns = [
<<<<<<< HEAD
    { title: 'Mã đơn hàng', dataIndex: 'orderId', key: 'orderId' },
    { title: 'Ngày đặt', dataIndex: 'orderDate', key: 'orderDate' },
=======
    {
      title: 'Mã đơn hàng',
      dataIndex: 'orderId',
      key: 'orderId',
      render: (text) => <span className="text-gray-600">{text}</span>,
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: (text) => <span className="text-gray-600">{text}</span>,
    },
>>>>>>> c1949cc (Bao cao lan 3)
    {
      title: 'Sản phẩm',
      dataIndex: 'products',
      key: 'products',
<<<<<<< HEAD
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
=======
      width: 250, // Set a specific width for the product column
      render: (products) => (
        <div className="space-y-2">
          {products && products.length > 0 ? (
            products.map((product, index) => {
              const imageSrc = product.image && product.image.startsWith('data:application/octet-stream')
                ? product.image.replace('data:application/octet-stream', 'data:image/jpeg')
                : product.image;
              return (
                <div key={product.productId || index} className="flex items-center space-x-2">
>>>>>>> c1949cc (Bao cao lan 3)
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={product.name || 'Sản phẩm'}
<<<<<<< HEAD
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
=======
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                      className="w-12 h-12 object-contain rounded-lg"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">N/A</div>
                  )}
                  <div className="flex-1 max-w-[150px]"> {/* Limit the width to wrap after ~3 words */}
                    <p className="text-gray-700 break-words">{product.name || 'N/A'}</p>
                    <p className="text-sm text-gray-500">x{product.quantity || 0}</p>
>>>>>>> c1949cc (Bao cao lan 3)
                  </div>
                </div>
              );
            })
          ) : (
<<<<<<< HEAD
            <div>Không có sản phẩm</div>
=======
            <div className="text-gray-400">Không có sản phẩm</div>
>>>>>>> c1949cc (Bao cao lan 3)
          )}
        </div>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
<<<<<<< HEAD
      render: (total) => (
        <Text strong>{total ? total.toLocaleString('vi-VN') : '0'}₫</Text>
=======
      width: 180, // Increased width to ensure the total fits on one line
      render: (total) => (
        <Text className="text-pink-500 font-semibold whitespace-nowrap">
          {total ? total.toLocaleString('vi-VN') : '0'}đ
        </Text>
>>>>>>> c1949cc (Bao cao lan 3)
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
<<<<<<< HEAD
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
=======
      width: 120,
      render: (status) => {
        const normalizedStatus = status ? status.toLowerCase() : 'unknown';
        let color, text;
        switch (normalizedStatus) {
          case 'đã giao':
            color = 'green';
            text = 'Hoàn thành';
            break;
          case 'đang giao':
            color = 'blue';
            text = 'Đang giao';
            break;
          case 'đang xử lý':
            color = 'orange';
            text = 'Chờ xử lý';
            break;
          case 'đã hủy':
            color = 'red';
            text = 'Đã hủy';
            break;
          default:
            color = 'gray';
            text = 'Không xác định';
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-[-7px]">
      {toastContainer()}
      <h2 className="text-2xl font-semibold text-gray-800">Đơn Hàng Của Tôi</h2>
      <div className="bg-white border border-gray-100 rounded-2xl shadow-md p-6">
        <Table
          columns={columns}
          dataSource={orders}
          loading={loading}
          pagination={{ pageSize: 3 }}
          scroll={{ x: true }}
          className="custom-ant-table"
        />
      </div>
>>>>>>> c1949cc (Bao cao lan 3)
    </div>
  );
};

<<<<<<< HEAD
export default MyOrdersTab;
=======
export default MyOrdersTab;
>>>>>>> c1949cc (Bao cao lan 3)
