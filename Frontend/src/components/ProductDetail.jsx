import React, { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import { Link, useParams } from 'react-router-dom';
import { getProductById } from '../APIs/ProductsApi';
import { RightOutlined } from '@ant-design/icons';
import { addToCart, decreaseToCart } from '../APIs/cartApi';
import { errorToast, successToast, toastContainer } from '../utils/toast';

const ProductDetail = () => {
  const [quantity, setQuantity] = useState(1); // Trạng thái chỉ lưu số lượng
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productData = await getProductById(id);
        if (productData.success) {
          setProduct(productData.data);
        }
        setLoading(false);
      } catch (error) {
        console.error('Lỗi khi lấy sản phẩm:', error);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async (productId, quantity) => {
    try {
      const res = await addToCart(productId, quantity); // Chỉ thêm sản phẩm vào giỏ hàng
      if (res.success) {
        successToast("Sản phẩm đã được thêm vào giỏ hàng!");
      }
    } catch (error) {
      errorToast("Lỗi khi thêm sản phẩm vào giỏ hàng:", error);
    }
  };

  const handleDecrease = async (productId) => {
    if (quantity > 1) {
      setQuantity(quantity - 1);  
      try {
        await decreaseToCart(productId);
      } catch (error) {
        console.error("Lỗi khi gọi API giảm số lượng:", error);
      }
    }
  };

  const handleIncrease = async () => {
    const newQuantity = quantity + 1; 
    if (newQuantity > product.StockQuantity) {
      errorToast("Số lượng sản phẩm đã hết!");
      return;
    }
    
    setQuantity(newQuantity);  
  };

  if (loading) {
    return <div className="p-10 text-center">Đang tải sản phẩm...</div>;
  }

  if (!product) {
    return <div className="p-10 text-center">Không tìm thấy sản phẩm.</div>;
  }

  return (
    <div className="mt-2">
    {toastContainer()}
      <section className="p-10">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2">
            <img
              src={product.ImagePD} 
              alt={product.ProductName}
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>
          <div className="w-full md:w-1/2">
            <nav className="text-sm text-gray-500 mb-4">
              <Link to="/" className="hover:underline">Trang chủ</Link>
              {' '}<RightOutlined />{' '} 
              <Link to="/product" className="hover:underline">Sản phẩm</Link> 
              {' '}<RightOutlined />{' '}            
              <span className="text-gray-700">{product.ProductName}</span>
            </nav>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.ProductName}</h1>
            <div className="flex items-center mb-4">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} />
                ))}
              </div>
              <span className="ml-2 text-gray-600">(12 đánh giá)</span>
            </div>
            <p className="text-2xl font-semibold text-gray-800 mb-4">{product.PricePD} đ</p>
            <p className="text-gray-600 mb-4">
              <span className="flex items-center">
                <svg
                  className="w-4 h-4 mr-2 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12zm-1-9h2v4H9V7zm0 6h2v2H9v-2z" />
                </svg>
                Giao hàng miễn phí cho đơn hàng trên 500.000đ
              </span>
            </p>
            <div className="flex items-center mb-4">
              <span className="mr-4 text-gray-600">Số lượng:</span>
              <div className="flex items-center">
                <div className="flex w-fit items-center border rounded">
                  <button
                    onClick={() => handleDecrease(product._id)} // Gọi API giảm số lượng
                    className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="px-4 py-1">{quantity}</span>
                  <button
                    onClick={() => handleIncrease(product._id)} // Tăng số lượng
                    className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
                <div className="ml-4 text-gray-600">{product.StockQuantity -quantity} sản phẩm có sẵn</div>
              </div>
            </div>
            <button 
              onClick={() => handleAddToCart(product._id, quantity)} 
              className="bg-maincolor mt-5 text-white px-6 py-2 rounded hover:bg-maincolorhover"
            >
              Thêm vào giỏ hàng
            </button>

            <div className="flex gap-4 mt-4 text-gray-600">
              <button className="hover:underline">Mô tả</button>
            </div>
            <p className="text-gray-600 mt-4">{product.DescriptionPD}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;
