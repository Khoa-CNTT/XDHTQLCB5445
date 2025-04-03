import axios from "axios";

const API_URL = "http://localhost:4000/api/blog";

export const getAllBlogs = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error("Lỗi tải danh sách bài viết:", error);
        return [];
    }
};

export const getBlogById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Lỗi tải bài viết:", error);
        return null;
    }
};

export const createBlog = async (blogData) => {
    try {
        const response = await axios.post(`${API_URL}/add`, blogData);
        return response.data;
    } catch (error) {
        console.error("Lỗi tạo bài viết:", error);
        return null;
    }
};

export const updateBlog = async (id, blogData) => {
    try {
        const response = await axios.put(`${API_URL}/update/${id}`, blogData);
        return response.data;
    } catch (error) {
        console.error("Lỗi cập nhật bài viết:", error);
        return null;
    }
};

export const deleteBlog = async (id) => {
    try {
        await axios.delete(`${API_URL}/delete/${id}`);
        return true;
    } catch (error) {
        console.error("Lỗi xóa bài viết:", error);
        return false;
    }
};
