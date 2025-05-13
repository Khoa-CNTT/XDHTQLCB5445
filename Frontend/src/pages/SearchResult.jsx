import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { getAllServices } from '../APIs/ServiceAPI';
import { getProducts } from '../APIs/ProductsApi';

const SearchPage = ({onClose}) => {
  const [query, setQuery] = useState('');
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const q = searchParams.get('q') || '';
    setQuery(q);
  }, [location.search]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setServices([]);
        setProducts([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const serviceResponse = await getAllServices();
        const filteredServices = serviceResponse.data.filter(service =>
          service.name.toLowerCase().includes(query.toLowerCase())
        );
        setServices(filteredServices);

        const productResponse = await getProducts();
        const filteredProducts = productResponse.data.filter(product =>
          product.ProductName.toLowerCase().includes(query.toLowerCase())
        );
        setProducts(filteredProducts);
      } catch (err) {
        setError('Không thể tải kết quả tìm kiếm.');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    window.history.pushState({}, '', `/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-50 overflow-auto">
      <div className="container mx-auto px-4 py-6">
        <button
        className="absolute top-2 right-2 text-white hover:text-red-500 text-3xl font-bold"
        onClick={onClose}
      >
        &times;
      </button>
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex  items-center max-w-[45rem] mt-[-10px] mx-auto">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm sản phẩm hoặc dịch vụ..."
              className="flex-1 p-3 border text-black border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-maincolor"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-r-lg hover:bg-maincolorhover"
            >
              Tìm kiếm
            </button>
          </div>
        </form>

        {loading && <p className="text-center text-gray-600">Đang tải...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        <div className='w-full max-w-5xl mx-auto'>
          {services.length > 0 && (
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-4">Dịch vụ</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {services.map((service) => (
                  <Link
                    key={service._id}
                    to={`/service/${service._id}`}
                    className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition"
                  >
                    <img
                      src={service.image || 'https://via.placeholder.com/150'}
                      alt={service.name}
                      className="w-full h-40 object-cover rounded-lg mb-2"
                    />
                    <h3 className="text-lg font-semibold text-gray-800">{service.name}</h3>
                    <p className="text-gray-600">{service.price} đ</p>
                    <p className="text-sm text-gray-500 line-clamp-2">{service.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {products.length > 0 && (
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-4">Sản phẩm</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {products.map((product) => (
                  <Link
                    key={product._id}
                    to={`/product/${product._id}`}
                    className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition"
                  >
                    <img
                      src={product.ImagePD || 'https://via.placeholder.com/150'}
                      alt={product.ProductName}
                      className="w-full h-40 object-cover rounded-lg mb-2"
                    />
                    <h3 className="text-lg font-semibold text-gray-800">{product.ProductName}</h3>
                    <p className="text-gray-600">{product.PricePD} đ</p>
                    <p className="text-sm text-gray-500 line-clamp-2">{product.DescriptionPD}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {query && !loading && services.length === 0 && products.length === 0 && (
            <p className="text-center text-gray-600">
              Không tìm thấy kết quả cho "<strong>{query}</strong>"
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
