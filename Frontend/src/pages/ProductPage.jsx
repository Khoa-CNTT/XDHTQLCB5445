import React, { useContext, useEffect, useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import OneProduct from "../components/OneProduct";
import { getProducts } from "../APIs/ProductsApi";
import { addToCart } from "../APIs/cartApi";
import { errorToast, successToast } from "../utils/toast";
import { motion } from "framer-motion";
import { Button, Spin } from "antd";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CartContext } from "../context/CartContext";

const ProductsPage = () => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState("Tất cả");
  const [data, setData] = useState([]);
  const { fetchCartCount } = useContext(CartContext);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await getProducts();
        if (res.success) {
          setData(res.data);
          const uniqueCategories = [
            ...new Set(res.data.map((product) => product.Category)),
          ];
          setCategories(
            uniqueCategories.map((name, index) => ({ _id: index, name }))
          );
        } else {
        }
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProductsPage =
    filter === "Tất cả"
      ? data
      : data.filter((product) => product.Category === filter);

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

  return (
    <>
      <Header className="!bg-white !text-black !shadow-md" />
      <motion.div
        className="mt-[50px]"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1.2 }}
      >
        <section className="px-10 py-6">
          <nav className="text-sm text-gray-500 mt-4">
            <Link to="/" className="hover:underline">
              Trang chủ
            </Link>{" "}
            &gt;{" "}
            <Link to="/productpage" className="hover:underline">
              Sản phẩm
            </Link>{" "}
            &gt;{" "}
          </nav>
          <h2 className="text-3xl font-bold text-maincolor text-center mb-6">
            Danh sách sản phẩm
          </h2>
          {cartMessage && (
            <div className="text-center text-red-500 mb-4">{cartMessage}</div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Spin tip="Đang tải..." />
            </div>
          ) : (
            <div className="flex gap-10">
              {/* Category Filter - Left Sidebar */}
              <div className="w-46">
                <h3 className="text-lg font-semibold mb-4">Danh mục</h3>
                <ul className="space-y-3">
                  <li
                    onClick={() => setFilter("Tất cả")}
                    className={`cursor-pointer px-4 py-2 rounded-lg text-sm ${
                      filter === "Tất cả"
                        ? "bg-maincolor text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    Tất cả
                  </li>
                  {categories.map((item) => (
                    <li
                      key={item._id}
                      onClick={() => setFilter(item.name)}
                      className={`cursor-pointer px-4 py-2 rounded-lg text-sm ${
                        filter === item.name
                          ? "bg-maincolor text-white"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                    >
                      {item.name}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Product Grid - Right */}
              <div className="flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredProductsPage.length > 0 ? (
                    filteredProductsPage.map((product, index) => (
                      <OneProduct
                        key={index}
                        title={product.ProductName}
                        price={product.PricePD}
                        description={product.DescriptionPD}
                        image={product.ImagePD}
                        productId={product._id}
                        onAddToCart={() =>
                          handleAddToCart(product._id, quantity)
                        }
                        loading={loading}
                      />
                    ))
                  ) : (
                    <p className="text-center text-gray-600 col-span-4">
                      Không có sản phẩm nào trong danh mục này.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        <Footer />
      </motion.div>
    </>
  );
};

export default ProductsPage;
