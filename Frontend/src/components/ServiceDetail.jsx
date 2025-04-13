import React, { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import { Link, useParams } from 'react-router-dom';
import { RightOutlined } from '@ant-design/icons';
import { getServiceById } from '../../APIs/ServiceAPI';

const ServiceDetail = () => {
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await getServiceById(id);
        if (res.success) {
          setService(res.data);
        }
        setLoading(false);
      } catch (error) {
        console.error('Lỗi khi lấy dịch vụ:', error);
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  if (loading) {
    return <div className="p-10 text-center">Đang tải thông tin dịch vụ...</div>;
  }

  if (!service) {
    return <div className="p-10 text-center">Không tìm thấy dịch vụ.</div>;
  }

  return (
    <div className="mt-2">
      <section className="p-10">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2">
            <img
              src={service.ImageDV}
              alt={service.ServiceName}
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>
          <div className="w-full md:w-1/2">
            <nav className="text-sm text-gray-500 mb-4">
              <Link to="/" className="hover:underline">Trang chủ</Link>
              {' '}<RightOutlined />{' '}
              <Link to="/service" className="hover:underline">Dịch vụ</Link>
              {' '}<RightOutlined />{' '}
              <span className="text-gray-700">{service.ServiceName}</span>
            </nav>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{service.ServiceName}</h1>
            <div className="flex items-center mb-4">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} />
                ))}
              </div>
              <span className="ml-2 text-gray-600">(Đánh giá sẽ hiển thị ở đây)</span>
            </div>
            <p className="text-2xl font-semibold text-gray-800 mb-4">{service.PriceDV} đ</p>
            <p className="text-gray-600 mb-4">
              <span className="flex items-center">
                <svg
                  className="w-4 h-4 mr-2 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12zm-1-9h2v4H9V7zm0 6h2v2H9v-2z" />
                </svg>
                Tư vấn miễn phí và hỗ trợ đặt lịch trải nghiệm
              </span>
            </p>
            <div className="mt-4 text-gray-600">
              <strong>Mô tả:</strong>
              <p className="mt-2">{service.DescriptionDV}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServiceDetail;
