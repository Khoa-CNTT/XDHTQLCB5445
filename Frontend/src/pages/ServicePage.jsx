import React, { useEffect, useState } from 'react';
import OneService from '../components/OneService';
import { getAllServices } from '../APIs/ServiceAPI';
import { Link, useNavigate } from 'react-router-dom';
import { Spin } from 'antd';
import Header from '../components/Header';
import Footer from '../components/Footer';
const ServicePage = () => {
  const [filter, setFilter] = useState('Tất cả dịch vụ');
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await getAllServices();
        setData(response.data);
        const uniqueCategories = [...new Set(response.data.map(service => service.category))];
        setCategories(uniqueCategories.map((name, index) => ({ _id: index, name })));
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredServices = filter === 'Tất cả dịch vụ'
    ? data
    : data.filter((service) => service.category === filter);

  const handleBookNow = (service) => {
    navigate('/book-service', { state: { service } });
  };

  return (
    <>
      <Header className="!bg-white !text-black !shadow-md" />
      <div className="mt-[100px] px-6 py-4">
         <nav className="text-sm text-gray-500">
                          <Link to="/" className="hover:underline">Trang chủ</Link> &gt;{' '}
                          <Link to="/servicepage" className="hover:underline">Dịch vụ</Link> &gt;{' '}
                          
                      </nav>
        <h2 className="text-3xl font-bold text-maincolor text-center mb-6">
          Danh sách dịch vụ
        </h2>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Spin tip="Đang tải..." />
          </div>
        ) : (
          <div className="flex gap-10">
            {/* Category Filter - Left */}
            <div className="w-46">
              <h3 className="text-lg font-semibold mb-4">Danh mục</h3>
              <ul className="space-y-3">
                <li
                  onClick={() => setFilter('Tất cả dịch vụ')}
                  className={`cursor-pointer px-4 py-2 rounded-lg text-sm ${
                    filter === 'Tất cả dịch vụ'
                      ? 'bg-maincolor text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Tất cả dịch vụ
                </li>
                {categories.map((item) => (
                  <li
                    key={item._id}
                    onClick={() => setFilter(item.name)}
                    className={`cursor-pointer px-4 py-2 rounded-lg text-sm ${
                      filter === item.name
                        ? 'bg-maincolor text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {item.name}
                  </li>
                ))}
              </ul>
            </div>

            {/* Service Grid - Right */}
            <div className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredServices.length > 0 ? (
                  filteredServices.map((db, index) => (
                    <OneService
                      key={index}
                      name={db.name}
                      id={db._id}
                      title={db.title}
                      price={db.price}
                      duration={db.duration}
                      description={db.description}
                      image={db.image}
                      onBookNow={() => handleBookNow(db)}
                    />
                  ))
                ) : (
                  <p className="text-center text-gray-600 col-span-4">
                    Không có dịch vụ nào trong danh mục này.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer/>
    </>
  );
};

export default ServicePage;
