import React, { useState, useEffect, useContext } from "react";
import { FaStar } from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import { getProductById } from "../APIs/ProductsApi";
import { listReviewSP } from "../APIs/ReviewSPAPI";
import { RightOutlined } from "@ant-design/icons";
import { addToCart, decreaseToCart } from "../APIs/cartApi";
import { errorToast, successToast,  } from "../utils/toast";
import { useTranslation } from "react-i18next";
import { CartContext } from "../context/CartContext";

const ProductDetail = () => {
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewCount, setReviewCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const { id } = useParams();
  const { t } = useTranslation();
  const { fetchCartCount } = useContext(CartContext);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productData = await getProductById(id);
        if (productData.success) {
          setProduct(productData.data);

          // Lấy danh sách đánh giá
          const reviews = await listReviewSP(productData.data._id);
          if (reviews && Array.isArray(reviews)) {
            setReviewCount(reviews.length);
            const totalStars = reviews.reduce(
              (sum, r) => sum + (r.Rating || r.rating || 0),
              0
            );
            setAverageRating(
              reviews.length > 0 ? totalStars / reviews.length : 0
            );
          }
        }
        setLoading(false);
      } catch (error) {
        errorToast("Vui lòng đăng nhập để thêm vào giỏ hàng");
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async (productId, quantity) => {
      try {
        const role = localStorage.getItem("role");

    const token = localStorage.getItem("token");
    if (!token) {
      errorToast(t("products.pleaseLogin"));
      setTimeout(() => {
        window.location.href = "/sign-in";
      }, 2000);
      return;
    }
    if (role !== "user") {
      errorToast(t("products.onlyUsersCanOrder"));
      return;
    }
    const res = await addToCart(productId, quantity);
    if (res?.success) {
      successToast(t("products.addToCartSuccess"));
      fetchCartCount();
    }
  } catch (error) {
      errorToast(t("products.outOfStock"));
  }
  };
  const handleQuantityChange = (e) => {
    let value = parseInt(e.target.value);
    if (isNaN(value)) value = 1;
    if (value < 1) value = 1;
    if (value > product.StockQuantity) {
      errorToast("Vượt quá số lượng sản phẩm hiện có");
      value = product.StockQuantity;
    }
    setQuantity(value);
  };

  const handleDecrease = async (productId) => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
      try {
        await decreaseToCart(productId);
      } catch (error) {
        errorToast("Không thể giảm số lượng nhỏ hơn 1");
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
      
      <section className="p-10">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2">
            <img
              src={product.ImagePD}
              alt={product.ProductName}
              className="w-[300px] ml-[25%] h-96 object-cover rounded-lg"
            />
          </div>
          <div className="w-full md:w-1/2">
            <nav className="text-sm text-gray-500 mb-4">
              <Link to="/" className="hover:underline">
                Trang chủ
              </Link>{" "}
              <RightOutlined />{" "}
              <Link to="/product" className="hover:underline">
                Sản phẩm
              </Link>{" "}
              <RightOutlined />{" "}
              <span className="text-gray-700">{product.ProductName}</span>
            </nav>

            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {product.ProductName}
            </h1>

            {/* Hiển thị đánh giá */}
            <div className="flex items-center mb-4">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={
                      i < Math.round(averageRating)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>
              <span className="ml-2 text-gray-600">
                ({reviewCount} đánh giá)
              </span>
            </div>

            <p className="text-2xl font-semibold text-gray-800 mb-4">
              {product.PricePD} đ
            </p>
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
                    onClick={() => handleDecrease(product._id)}
                    className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={product.StockQuantity}
                    value={quantity}
                    onChange={(e) => handleQuantityChange(e)}
                    className="w-16 text-center border-l border-r outline-none no-spinner"
                  />

                  <button
                    onClick={handleIncrease}
                    className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
                <div className="ml-4 text-gray-600">
                  {product.StockQuantity - quantity} sản phẩm có sẵn
                </div>
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
