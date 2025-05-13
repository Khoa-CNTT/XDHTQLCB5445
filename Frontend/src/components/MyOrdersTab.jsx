import React, { useState, useEffect } from 'react';
import { Table, Tag, Typography, message } from 'antd';
import { getOrders } from '../APIs/orderApi';
import { errorToast,  } from '../utils/toast';

const { Text } = Typography;

const MyOrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!token || !userId) {
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

        setOrders(formattedOrders);

        if (formattedOrders.length === 0) {
          message.info('Bạn chưa có đơn hàng nào.');
        }
      } catch (error) {
        errorToast(error.message || 'Lỗi khi tải đơn hàng');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token, userId]);

  const columns = [
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
    {
      title: 'Sản phẩm',
      dataIndex: 'products',
      key: 'products',
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
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={product.name || 'Sản phẩm'}
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
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-gray-400">Không có sản phẩm</div>
          )}
        </div>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      width: 180, // Increased width to ensure the total fits on one line
      render: (total) => (
        <Text className="text-pink-500 font-semibold whitespace-nowrap">
          {total ? total.toLocaleString('vi-VN') : '0'}đ
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const normalizedStatus = status ? status.toLowerCase() : 'unknown';
        let color, text;
        switch (normalizedStatus) {

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
          case 'chờ thanh toán':
            color = 'purple';
            text = 'Chờ thanh toán';
            break;
          case 'đã hoàn tiền':
            color = 'cyan';
            text = 'Đã hoàn tiền';
            break;
          case 'đã thanh toán':
            color = 'green';
            text = 'Đã thanh toán';
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
    </div>
  );
};

export default MyOrdersTab;