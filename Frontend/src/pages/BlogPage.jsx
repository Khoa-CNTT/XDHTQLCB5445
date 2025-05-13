import React, { useEffect, useState } from "react";
import { getAllBlogs } from "../APIs/blogApi";
import { message } from "antd";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { errorToast,  } from "../utils/toast";

const BlogPage = () => {
    const [publishedBlogs, setPublishedBlogs] = useState([]);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const response = await getAllBlogs();
            if (response.success && Array.isArray(response.data)) {
                const allBlogs = response.data.map((item) => ({ ...item, key: item._id }));
                const filteredBlogs = allBlogs.filter(blog => blog.isPublished);
                setPublishedBlogs(filteredBlogs);
            } else {
                errorToast("Không lấy được dữ liệu blog!");
            }
        } catch (error) {
            
            errorToast("Lỗi tải danh sách bài viết!");
        }
    };

    return (
       <>
       <Header className="!bg-white !text-black !shadow-md" />
       
         <motion.div
            className="container m-auto px-2 mt-[40px] py-4"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1.2 }}
        >
                 <nav className="text-sm text-gray-500 mt-[30px] ml-[50px]">
                                  <Link to="/" className="hover:underline">Trang chủ</Link> &gt;{' '}
                                  <Link to="/blogpage" className="hover:underline">Bài viết</Link> &gt;{' '}
                                  
                              </nav>
            <h1
                className="text-2xl text-[40px] font-bold mb-6 text-center"
                style={{ fontFamily: "Dancing Script, serif" }}
            >
                Bài viết nổi bật
            </h1>
            <div className="grid grid-row-1 sm:grid-row-2 lg:grid-row-3 gap-6 justify-center px-10">
                {publishedBlogs.map((blog) => (
                    <div
                        key={blog._id}
                        className="border border-gray-300 w-[700px] h-[500px] rounded-lg  bg-white p-4 shadow-md"
                    >
                        <div>
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
                            <div className="">
                                <h2 className="text-xl font-semibold ">{blog.title}</h2>
                                <p className="text-base h-[80px]  overflow-hidden text-ellipsis">{blog.content}</p>
                                {blog.image && (
                                    <img
                                        src={blog.image}
                                        alt="Post"
                                        className="w-full h-[320px] object-cover mt-[-15px] rounded-lg"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
        <Footer />
       </>
    );
};

export default BlogPage;
