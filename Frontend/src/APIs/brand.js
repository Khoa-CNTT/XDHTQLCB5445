import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_KEY || "http://localhost:4000/api";

const branch = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" }
});


export const createBranch = async (branchData) => {
    const response = await branch.post("branch/add", branchData);
    return response.data;
};

export const updateBranch = async (id, branchData) => {
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
};
export const listBranch = async () => {
    const response = await branch.get("branch/list");
    return response.data;
};

export const getBranchById = async (id) => {
  try {
    const response = await branch.get(`branch/${id}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy chi nhánh:", error);
    throw error;
  }
};

