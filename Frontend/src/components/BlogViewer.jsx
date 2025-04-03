import React, { useEffect, useState } from "react";
import { getAllBlogs } from "../APIs/blogApi";
import { Button, message } from "antd";

const BlogViewer = () => {
    const [blogs, setBlogs] = useState([]);
    const [publishedBlogs, setPublishedBlogs] = useState([]);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const response = await getAllBlogs();
            if (response.success && Array.isArray(response.data)) {
                const allBlogs = response.data.map((item) => ({ ...item, key: item._id }));
                setBlogs(allBlogs);
                const filteredBlogs = allBlogs.filter(blog => blog.isPublished);
                setPublishedBlogs(filteredBlogs);
            } else {
                message.error("Không lấy được dữ liệu blog!");
            }
        } catch (error) {
            console.error("Error fetching blogs: ", error);
            message.error("Lỗi tải danh sách bài viết!");
        }
    };

    return (
        <div className="container mx-auto px-2 py-4 max-w-3xl">
            <h1 className="text-2xl font-bold mb-6">Danh sách Bài Viết</h1>
            <div className="all-blogs">
                <h2 className="text-xl font-semibold mb-4">Tất cả Bài Viết</h2>
                {blogs.map((blog) => (
                    <div key={blog._id} className="fbPost border border-gray-300 rounded-lg mb-4 bg-white p-4 shadow-md">
                        <div className="postHeader flex items-center mb-4">
                            <img 
                                src="https://randomuser.me/api/portraits/men/1.jpg" 
                                alt="User Profile" 
                                className="profilePic rounded-full w-12 h-12 mr-4"
                            />
                            <div className="userInfo text-sm">
                                <h3 className="userName text-lg font-semibold">{blog.userId}</h3>
                                <span>{new Date(blog.createdAt).toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="postContent mt-2">
                            <h2 className="postTitle text-xl font-semibold mb-2">{blog.title}</h2>
                            <p className="postText text-base mb-4">{blog.content}</p>
                            {blog.image && <img src={blog.image} alt="Post Image" className="postImage w-full max-w-xl h-auto rounded-lg mt-4" />}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BlogViewer;