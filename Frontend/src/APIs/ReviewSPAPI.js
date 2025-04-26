import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_KEY || "https://backend-fu3h.onrender.com/api";
// const API_BASE_URL = "http://localhost:4000/api"; // Replace with your local URL

const review = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" }
});

export const addReviewSP = async (data) => {
    const response = await review.post("/reviewsp/add", data);
    return response.data;
};

export const listReviewSP = async (productId) => {
    const response = await review.get(`/reviewsp/${productId}`);
    return response.data.data;
};

export const removeReviewSP = async (reviewId) => {
    const token = localStorage.getItem("token");
  
    try {
      const response = await review.delete(`/reviewsp/remove/${reviewId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (err) {
      
      return { success: false, message: err.response?.data?.message || "Xoá không thành công" };
    }
  };
  
