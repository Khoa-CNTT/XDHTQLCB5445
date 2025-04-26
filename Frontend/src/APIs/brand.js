import axios from "axios";

<<<<<<< HEAD
const API_BASE_URL = process.env.REACT_APP_API_KEY || "http://localhost:4000/api";
=======
const API_BASE_URL = process.env.REACT_APP_API_KEY || "https://backend-fu3h.onrender.com/api";
// const API_BASE_URL = "http://localhost:4000/api"; // Thay thế bằng URL của bạn
>>>>>>> c1949cc (Bao cao lan 3)

const branch = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" }
});


export const createBranch = async (branchData) => {
    const response = await branch.post("branch/add", branchData);
    return response.data;
};

export const updateBranch = async (id, branchData) => {
<<<<<<< HEAD
  try {
    const response = await branch.put(`branch/update/${id}`, branchData);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật chi nhánh:", error);
    throw error;
  }
};

export const removeBrand = async (id) => {
  try {
    const response = await branch.delete(`branch/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa chi nhánh:", error);
    throw error;
  }
=======
    const response = await branch.put(`branch/update/${id}`, branchData);
    return response.data;
 
};

export const removeBrand = async (id) => {
    const response = await branch.delete(`branch/delete/${id}`);
    return response.data;
>>>>>>> c1949cc (Bao cao lan 3)
};
export const listBranch = async () => {
    const response = await branch.get("branch/list");
    return response.data;
};

export const getBranchById = async (id) => {
<<<<<<< HEAD
  try {
    const response = await branch.get(`branch/${id}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy chi nhánh:", error);
    throw error;
  }
=======
    const response = await branch.get(`branch/${id}`);
    return response.data;
 
>>>>>>> c1949cc (Bao cao lan 3)
};

