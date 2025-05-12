import React, { useState, useEffect } from 'react';
import VoucherCard from '../components/VoucherCard';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toastContainer, errorToast, successToast } from '../utils/toast';
import Header from '../components/Header';

// const API_BASE_URL = 'https://backend-fu3h.onrender.com/api/';
const API_BASE_URL = 'http://localhost:4000/api'; 

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const MyVouchers = () => {
  const [filter] = useState(['Tất cả', 'Còn hiệu lực', 'Đã hết hạn']);
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Vui lòng đăng nhập để xem voucher.');
      }
      const response = await api.get('/vouchers/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Format dữ liệu voucher để đồng bộ với VoucherCard
      const formattedVouchers = response.data.map((voucher) => ({
        ...voucher,
        image: 'https://t3.ftcdn.net/jpg/03/24/14/88/360_F_324148849_jZw2PUBaeKGZWahhJ6aS4ajBdrdCoZ5N.jpg',
        title: `Ưu đãi ${voucher.applicableTo === 'products' ? 'sản phẩm' : voucher.applicableTo === 'services' ? 'dịch vụ' : 'tất cả'}`,
        discount: `Giảm ${voucher.discount}% cho ${voucher.applicableTo === 'products' ? 'sản phẩm' : voucher.applicableTo === 'services' ? 'dịch vụ' : 'tất cả'}`,
        discountPercent: `Giảm ${voucher.discount}%`,
        expiry: `HSD: ${new Date(voucher.endDate).toLocaleDateString('vi-VN')}`,
        tags: [
          voucher.applicableTo === 'products' ? 'Sản phẩm' : voucher.applicableTo === 'services' ? 'Dịch vụ' : 'Tất cả',
          new Date() > new Date(voucher.endDate) ? 'Hết hạn' : 'Còn hiệu lực',
        ],
        minOrder: voucher.minimumAmount > 0 ? `Đơn hàng từ ${voucher.minimumAmount.toLocaleString()} đ` : null,
      }));
      setVouchers(formattedVouchers);
    } catch (error) {
      errorToast(error.message || 'Lỗi khi tải danh sách voucher');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVoucher = async (voucherId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Vui lòng đăng nhập để xóa voucher.');
      }
      await api.delete(`/vouchers/user/${voucherId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVouchers(vouchers.filter((voucher) => voucher._id !== voucherId));
      successToast('Xóa voucher thành công');
    } catch (error) {
      errorToast('Lỗi khi xóa voucher');
    }
  };

  const filteredVouchers = vouchers.filter((voucher) => {
    const currentDate = new Date();
    const isExpired = currentDate > new Date(voucher.endDate);
    if (activeFilter === 'Tất cả') return true;
    if (activeFilter === 'Còn hiệu lực') return !isExpired;
    if (activeFilter === 'Đã hết hạn') return isExpired;
    return true;
  });

  return (
    <>
    <Header className="!bg-white !text-black !shadow-md" />
      <div className="mt-16 p-10  bg-gray-100">
      {toastContainer()}
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-blue-900">Vouchers của tôi</h1>
            <p className="text-gray-600">Quản lý tất cả vouchers ưu đãi của bạn tại đây</p>
          </div>
          <Link to="/spvc">
            <button className="bg-blue-900 text-white px-4 py-2 rounded-full flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              Khám phá thêm vouchers
            </button>
          </Link>
        </div>

        <div className="flex space-x-4 mb-6">
          {filter.map((item) => (
            <button
              key={item}
              onClick={() => setActiveFilter(item)}
              className={`px-4 py-2 rounded-lg cursor-pointer ${
                activeFilter === item ? 'bg-blue-900 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center">Đang tải...</div>
        ) : filteredVouchers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredVouchers.map((voucher) => (
              <div key={voucher._id} className="relative">
                <VoucherCard voucher={voucher} />
                <button
                  onClick={() => handleRemoveVoucher(voucher._id)}
                  className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full"
                >
                  Xóa
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-10 text-center">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <h2 className="text-lg font-semibold text-gray-600">Chưa có voucher nào</h2>
            <p className="text-gray-500">
              Bạn chưa lưu voucher nào. Hãy khám phá các ưu đãi đặc biệt để tiết kiệm cho lần mua hàng tiếp theo.
            </p>
            <Link to="/spvc">
              <button className="mt-4 bg-blue-900 text-white px-4 py-2 rounded-full flex items-center mx-auto">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                Khám phá vouchers
              </button>
            </Link>
          </div>
        )}

        <div className="text-center mt-8">
          <Link to="/">
            <button className="text-blue-600 flex items-center mx-auto">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Quay lại trang chủ
            </button>
          </Link>
        </div>
      </div>
    </div>
    </>
  );
};

export default MyVouchers;