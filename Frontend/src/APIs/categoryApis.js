import axios from "axios";

const API_URL = "http://localhost:4000/api/categories"; // Hoặc API từ server online

// === Lấy tất cả danh mục ===
export const getAllCategories = async () => {
    try {
        const response = await axios.get(`${API_URL}/list`);
        return response.data;
    } catch (error) {
        console.error("Error fetching all categories:", error.response?.data || error.message);
        return {
            success: false,
            data: [],
            message: error.response?.data?.message || "Không thể lấy danh sách danh mục."
        };
    }
};

// === Lấy danh mục theo ID ===
export const getCategoryById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/get/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching category by id ${id}:`, error.response?.data || error.message);
        return {
            success: false,
            data: null,
            message: error.response?.data?.message || "Không thể lấy thông tin danh mục."
        };
    }
};

// === Thêm danh mục mới ===
export const createCategory = async (categoryData) => {
    try {
        const response = await axios.post(`${API_URL}/add`, categoryData);
        return response.data;
    } catch (error) {
        console.error("Error creating category:", error.response?.data || error.message);
        return {
            success: false,
            data: null,
            message: error.response?.data?.message || "Lỗi khi thêm danh mục."
        };
    }
};

// === Cập nhật danh mục ===
export const updateCategory = async (id, data) => {
    try {
        const response = await axios.put(`${API_URL}/update`, { id, ...data });
        return response.data;
    } catch (error) {
        console.error(`Error updating category ${id}:`, error.response?.data || error.message);
        return {
            success: false,
            data: null,
            message: error.response?.data?.message || "Lỗi khi cập nhật danh mục."
        };
    }
};

// === Xoá danh mục ===
export const deleteCategory = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/remove`, { data: { id } });
        return response.data;
    } catch (error) {
        console.error(`Error deleting category ${id}:`, error.response?.data || error.message);
        return {
            success: false,
            message: error.response?.data?.message || "Lỗi khi xóa danh mục."
        };
    }
};

// === Tìm kiếm danh mục theo keyword hoặc điều kiện khác ===
export const searchCategories = async (searchParams) => {
    try {
        const response = await axios.get(`${API_URL}/search`, { params: searchParams });
        return response.data;
    } catch (error) {
        console.error("Error searching categories:", error.response?.data || error.message);
        return {
            success: false,
            data: [],
            total: 0,
            page: 1,
            pages: 0,
            message: error.response?.data?.message || "Lỗi khi tìm kiếm danh mục."
        };
    }
};
