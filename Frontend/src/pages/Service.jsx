import React, { useEffect, useState } from "react";
import OneService from "../components/OneService";
import { getAllServices } from "../APIs/ServiceAPI";
import { motion } from "framer-motion";
import { Button, Pagination } from "antd";
import { useNavigate } from "react-router-dom";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const Service = () => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState(t("scheduleTab.filters.allServices"));
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [categoryScrollIndex, setCategoryScrollIndex] = useState(0);
  const visibleCategories = 6;
  const pageSize = 8;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getAllServices();
        setData(response.data);
        const uniqueCategories = [
          ...new Set(response.data.map((service) => service.category)),
        ];
        setCategories(
          uniqueCategories.map((name, index) => ({ _id: index, name }))
        );
      } catch (error) {}
    };
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    setFilter(t("scheduleTab.filters.allServices")); // Reset filter khi ngôn ngữ thay đổi
  }, [t]);

  const filteredProducts =
    filter === t("scheduleTab.filters.allServices")
      ? data
      : data.filter((product) => product.category === filter);

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleBookNow = (service) => {
    navigate("/book-service", { state: { service } });
  };

  const handleScrollLeft = () => {
    if (categoryScrollIndex > 0) {
      setCategoryScrollIndex(categoryScrollIndex - 1);
    }
  };

  const handleScrollRight = () => {
    if (categoryScrollIndex < categories.length - visibleCategories) {
      setCategoryScrollIndex(categoryScrollIndex + 1);
    }
  };

  return (
    <motion.div
      className="mt-5"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 1.2 }}
    >
      <section className="p-2">
        <motion.h2
          className="text-2xl text-[40px] font-bold mb-6 text-center"
          style={{ fontFamily: "Dancing Script, serif" }}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1.2 }}
        >
          {t("header.featured Services")}
        </motion.h2>

        <motion.div
          className="relative flex items-center justify-center py-4 mt-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {categories.length > visibleCategories && (
            <Button
              icon={<LeftOutlined />}
              onClick={handleScrollLeft}
              disabled={categoryScrollIndex === 0}
              className="absolute left-16 z-10"
            />
          )}
          <motion.div
            className="flex space-x-4 overflow-hidden"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1.2 }}
          >
            <motion.div
              whileTap={{ scale: 0.9 }}
              key="all"
              onClick={() => setFilter(t("scheduleTab.filters.allServices"))}
              className={`px-4 py-2 rounded-lg cursor-pointer ${
                filter === t("scheduleTab.filters.allServices")
                  ? "bg-maincolor text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              style={{
                display: categoryScrollIndex === 0 ? "block" : "none",
              }}
            >
              {t("scheduleTab.filters.allServices")} {/* Tất cả dịch vụ */}
            </motion.div>
            {categories
              .slice(
                categoryScrollIndex,
                categoryScrollIndex + visibleCategories
              )
              .map((item) => (
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  key={item._id}
                  onClick={() => setFilter(item.name)}
                  className={`px-4 py-2 rounded-lg cursor-pointer ${
                    filter === item.name
                      ? "bg-maincolor text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {t(`scheduleTab.filters.${item.name.toLowerCase()}`, item.name)} {/* Dịch danh mục */}
                </motion.div>
              ))}
          </motion.div>
          {categories.length > visibleCategories && (
            <Button
              icon={<RightOutlined />}
              onClick={handleScrollRight}
              disabled={
                categoryScrollIndex >= categories.length - visibleCategories
              }
              className="absolute right-16 z-10"
            />
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 mt-8 ml-[48px] gap-5">
          {paginatedProducts.length > 0 ? (
            paginatedProducts.map((db, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <OneService
                  name={db.name}
                  id={db._id}
                  title={db.title}
                  price={db.price}
                  duration={db.duration}
                  description={db.description}
                  image={db.image}
                  onBookNow={() => handleBookNow(db)}
                />
              </motion.div>
            ))
          ) : (
            <p className="text-center text-gray-600 col-span-3">
              {t("services.noServices")} {/* Không có dịch vụ */}
            </p>
          )}
        </div>

        {filteredProducts.length > pageSize && (
          <motion.div
            className="flex justify-center mt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredProducts.length}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={false}
            />
          </motion.div>
        )}
      </section>
    </motion.div>
  );
};

export default Service;
