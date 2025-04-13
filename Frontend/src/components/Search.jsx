import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllServices, getServiceById } from '../APIs/ServiceAPI';
import { getProducts, getProductById } from '../APIs/ProductsApi';
import { IoMdClose } from 'react-icons/io';

const SearchComponent = ({ isVisible, onClose }) => {
  const [query, setQuery] = useState('');
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Hàm tìm kiếm
  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      // Gọi API tìm kiếm dịch vụ
      const serviceResponse = await getAllServices();
      const filteredServices = serviceResponse.data.filter(service =>
        service.name.toLowerCase().includes(query.toLowerCase())
      );
      setServices(filteredServices);

      // Gọi API tìm kiếm sản phẩm
      const productResponse = await getProducts();
      const filteredProducts = productResponse.data.filter(product =>
        product.ProductName.toLowerCase().includes(query.toLowerCase())
      );
      setProducts(filteredProducts);
    } catch (err) {
      setError('Không thể tải kết quả tìm kiếm.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi người dùng nhấn Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Xử lý khi query thay đổi
  useEffect(() => {
    if (query.length > 2) {
      const timer = setTimeout(() => {
        handleSearch();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setServices([]);
      setProducts([]);
    }
  }, [query]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start pt-20">
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg p-6 relative">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
        >
          <IoMdClose size={24} />
        </button>

        {/* Thanh tìm kiếm */}
        <div className="mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Tìm kiếm sản phẩm hoặc dịch vụ..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maincolor"
          />
        </div>

        {/* Trạng thái tải */}
        {loading && <p className="text-center text-gray-600">Đang tải...</p>}

        {/* Lỗi */}
        {error && <p className="text-center text-red-500">{error}</p>}

        {/* Kết quả tìm kiếm */}
        <div className="max-h-96 overflow-y-auto">
          {/* Dịch vụ */}
          {services.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Dịch vụ</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {services.map((service) => (
                  <Link
                    key={service._id}
                    to={`/service/${service._id}`}
                    onClick={onClose}
                    className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <img
                      src={service.image || 'https://via.placeholder.com/50'}
                      alt={service.name}
                      className="w-12 h-12 object-cover rounded-lg mr-3"
                    />
                    <div>
                      <p className="font-medium text-gray-800">{service.name}</p>
                      <p className="text-sm text-gray-600">{service.price} đ</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Sản phẩm */}
          {products.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Sản phẩm</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.map((product) => (
                  <Link
                    key={product._id}
                    to={`/product/${product._id}`}
                    onClick={onClose}
                    className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <img
                      src={product.ImagePD || 'https://via.placeholder.com/50'}
                      alt={product.ProductName}
                      className="w-12 h-12 object-cover rounded-lg mr-3"
                    />
                    <div>
                      <p className="font-medium text-gray-800">{product.ProductName}</p>
                      <p className="text-sm text-gray-600">{product.PricePD} đ</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Không có kết quả */}
          {query && !loading && services.length === 0 && products.length === 0 && (
            <p className="text-center text-gray-600">Không tìm thấy kết quả cho "{query}"</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchComponent;