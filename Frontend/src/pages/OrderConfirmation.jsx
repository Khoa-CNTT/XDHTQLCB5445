import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Button, Divider, Typography, Image, Steps } from 'antd';
import { CheckCircle, Home, ShoppingBag } from 'lucide-react';
import { toastContainer } from '../utils/toast';
import { getOrders } from '../APIs/orderApi';

const { Title, Text } = Typography;
const { Step } = Steps;

const OrderItem = ({ name, price, quantity, image }) => {
    return (
        <div className="flex justify-between items-center py-3">
            <div className="flex items-center">
                {image && (
                    <div className="w-12 h-12 rounded-md overflow-hidden border border-gray-200 mr-3">
                        <Image
                            src={image}
                            alt={name}
                            className="w-full h-full object-cover"
                            preview={false}
                        />
                    </div>
                )}
                <div>
                    <Text className="font-medium">{name}</Text>
                    <Text type="secondary" className="block text-sm">Số lượng: {quantity}</Text>
                </div>
            </div>
            <Text className="font-medium">{price.toLocaleString('vi-VN')}₫</Text>
        </div>
    );
};

const OrderConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { orderDetails } = location.state || {};
    const order = orderDetails;
    console.log('Order Details:', order);

    const subtotal = order.items.reduce((sum, item) => {
        const rawPrice = item.PricePD || item.price || '0';
        const parsedPrice = parseFloat(String(rawPrice).replace(/\./g, '').replace(',', '.')) || 0;
        return sum + parsedPrice * (item.quantity || 1);
      }, 0);
    const shippingFee = 30000;
    const discount = order.discount || 0;
    console.log('subtotal:', subtotal);
    console.log('shippingFee:', shippingFee);
    console.log('discount:', discount);
    const total = subtotal + shippingFee - discount;
    console.log('total:', total);

    const handleBackToHome = () => {
        navigate('/');
    };

    const handleViewOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/sign');
                return;
            }

            const orders = await getOrders(token);
                console.log('Orders:', orders);
            navigate('/profile', {
                state: {
                    activeTab: 'myorders',
                    refreshedOrders: orders
                },
            });
        } catch (error) {
            navigate('/profile', {
                state: {
                    activeTab: 'myorders',
                },
            });
        }
    };

    return (
        <div className=" bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            {toastContainer()}
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <CheckCircle className="mx-auto text-green-500" size={48} strokeWidth={1.5} />
                    <Title level={2} className="mt-4 text-green-600">Đặt Hàng Thành Công!</Title>
                    <Text className="text-lg text-gray-600">
                        Cảm ơn bạn đã đặt hàng. Mã đơn hàng của bạn là{' '}
                        <Text strong>#{order.orderId || Math.floor(Math.random() * 1000000)}</Text>
                    </Text>
                </div>

                <div className="mb-12">
                    <Steps current={2} className="px-8">
                        <Step title="Giỏ hàng" />
                        <Step title="Thanh toán" />
                        <Step title="Hoàn tất" />
                    </Steps>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-2/3 space-y-6">
                        <Card className="border-0 shadow-sm">
                            <Title level={4} className="mb-4">Thông tin đơn hàng</Title>
                            <div className="mb-6">
                                <Text strong className="block mb-2">Thông tin khách hàng</Text>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Text type="secondary" className="block text-sm">Họ và tên</Text>
                                        <Text>{order.firstName}{''}{order.lastName}</Text>
                                    </div>
                                    <div>
                                        <Text type="secondary" className="block text-sm">Số điện thoại</Text>
                                        <Text>{order.phoneNumber}</Text>
                                    </div>
                                    <div className="md:col-span-2">
                                        <Text type="secondary" className="block text-sm">Địa chỉ nhận hàng</Text>
                                        <Text>{order.address}</Text>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <Text strong className="block mb-2">Phương thức thanh toán</Text>
                                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                    {order.paymentMethod === 'cod' ? (
                                        <>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5 text-gray-600 mr-2"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            <Text>Thanh toán khi nhận hàng (COD)</Text>
                                        </>
                                    ) : order.paymentMethod === 'card' ? (
                                        <>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5 text-gray-600 mr-2"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                                                <path
                                                    fillRule="evenodd"
                                                    d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            <Text>Chuyển khoản ngân hàng</Text>
                                        </>
                                    ) : (
                                        <Text>Không xác định</Text>
                                    )}
                                </div>
                            </div>
                        </Card>
                        <Card className="border-0 shadow-sm">
                            <Title level={4} className="mb-4">Chi tiết đơn hàng</Title>
                            <div className="divide-y divide-gray-200">
                                {order.items.map((item) => (
                                    <OrderItem
                                        key={item._id}
                                        name={item.ProductName || item.name}
                                        price={(parseFloat(String(item.price).replace(/\./g, '').replace(',', '.')) * (item.quantity || 1))}
                                        quantity={item.quantity || 1}
                                        image={item.ImagePD || item.image}
                                    />
                                ))}
                            </div>
                        </Card>
                    </div>
                    <div className="lg:w-1/3">
                        <Card className="border-0 shadow-sm sticky top-4">
                            <Title level={4} className="mb-4">Tóm tắt đơn hàng</Title>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <Text type="secondary">Tạm tính</Text>
                                    <Text>{subtotal.toLocaleString('vi-VN')}₫</Text>
                                </div>
                                <div className="flex justify-between">
                                    <Text type="secondary">Phí vận chuyển</Text>
                                    <Text>{shippingFee.toLocaleString('vi-VN')}₫</Text>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between">
                                        <Text type="secondary">Giảm giá ({order.voucher?.code})</Text>
                                        <Text type="danger">-{discount.toLocaleString('vi-VN')}₫</Text>
                                    </div>
                                )}
                                <Divider className="my-2" />
                                <div className="flex justify-between">
                                    <Text strong className="text-base">Tổng cộng</Text>
                                    <Text strong className="text-lg text-blue-600">
                                        {total.toLocaleString('vi-VN')}₫
                                    </Text>
                                </div>
                            </div>
                            <div className="mt-6 space-y-3">
                                <Button
                                    className='bg-blue-600 text-white'
                                    block
                                    size="large"
                                    icon={<Home size={18} className="mr-2" />}
                                    onClick={handleBackToHome}
                                >
                                    Về trang chủ
                                </Button>
                                <Button
                                    block
                                    size="large"
                                    icon={<ShoppingBag size={18} className="mr-2" />}
                                    onClick={handleViewOrders}
                                >
                                    Xem đơn hàng
                                </Button>
                            </div>
                            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                <Text className="block text-sm font-medium text-blue-800 mb-2">
                                    Thông tin bổ sung
                                </Text>
                                <Text type="secondary" className="text-sm">
                                    Chúng tôi sẽ gửi email xác nhận đơn hàng đến bạn trong ít phút. Nếu có bất kỳ câu
                                    hỏi nào, vui lòng liên hệ hotline 1900 1234.
                                </Text>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;
