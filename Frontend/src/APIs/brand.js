import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_KEY || "https://backend-fu3h.onrender.com/api";
// const API_BASE_URL = "http://localhost:4000/api"; // Thay thế bằng URL của bạn

const branch = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" }
});


export const createBranch = async (branchData) => {
    const response = await branch.post("branch/add", branchData);
    return response.data;
};

export const updateBranch = async (id, branchData) => {
    const response = await branch.put(`branch/update/${id}`, branchData);
    return response.data;
 
};

export const removeBrand = async (id) => {
    const response = await branch.delete(`branch/delete/${id}`);
    return response.data;
};
export const listBranch = async () => {
    const response = await branch.get("branch/list");
    return response.data;
};

export const getBranchById = async (id) => {
    const response = await branch.get(`branch/${id}`);
    return response.data;
 
};

