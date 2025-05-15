import React, { useEffect, useState } from "react";
import { getAllBlogs } from "../APIs/blogApi";
import { Button, message, Pagination } from "antd";
import { motion } from "framer-motion";
import { errorToast,  } from "../utils/toast";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const BlogViewer = () => {
  const { t } = useTranslation();
  const [blogs, setBlogs] = useState([]);
  const [publishedBlogs, setPublishedBlogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3;
  const navigate = useNavigate();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await getAllBlogs();
      if (response.success && Array.isArray(response.data)) {
        const allBlogs = response.data.map((item) => ({
          ...item,
          key: item._id,
        }));
        setBlogs(allBlogs);
        const filteredBlogs = allBlogs.filter((blog) => blog.isPublished);
        setPublishedBlogs(filteredBlogs);
      } else {
        errorToast(t("blog.noData")); 
      }
    } catch (error) {
      errorToast(t("blog.fetchError")); 
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const paginatedBlogs = publishedBlogs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const handleBlog = () => {
    navigate("/blogpage");
  };

  return (
    <motion.div
      className="container m-auto px-2 mt-7"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 1.2 }}
    >
      
      <h1
        className="text-2xl text-[40px] font-bold mb-6 text-center"
        style={{ fontFamily: "Dancing Script, serif" }}
      >
        {t("blog.featuredBlog")} 
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center ml-[25px] px-10">
        {paginatedBlogs.map((blog, index) => (
          <motion.div
            key={blog._id}
            className="border border-gray-300 w-[388px] rounded-lg bg-white p-4 shadow-md"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
          >
            <div className="flex items-center mb-4">
              <img
                src="https://randomuser.me/api/portraits/men/1.jpg"
                alt="User Profile"
                className="rounded-full w-12 h-12 mr-4"
              />
              <div className="text-sm">
                <h3 className="text-lg font-semibold">{blog.userId}</h3>
                <span>{new Date(blog.createdAt).toLocaleString()}</span>
              </div>
            </div>
            <div className="mt-2">
              <h2 className="text-xl font-semibold mb-2">{blog.title}</h2>
              <p className="text-base h-[80px] mb-4 overflow-hidden text-ellipsis">
                {blog.content}
              </p>
              {blog.image && (
                <img
                  onClick={handleBlog}
                  src={blog.image}
                  alt="Post"
                  className="w-full h-[192px] object-cover rounded-lg mt-4"
                  style={{ cursor: "pointer" }}
                />
              )}
            </div>
          </motion.div>
        ))}
      </div>
      <div className="flex justify-center mt-10">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={publishedBlogs.length}
          onChange={handlePageChange}
          showSizeChanger={false}
        />
      </div>
    </motion.div>
  );
};

export default BlogViewer;
