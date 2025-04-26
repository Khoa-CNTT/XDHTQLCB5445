import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_KEY || "https://backend-fu3h.onrender.com/api";
// const API_BASE_URL = "http://localhost:4000/api"; // Replace with your local URL

const review = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" }
});


export const addReviewDV = async (data) => {
    const response = await review.post("/reviewdv/add", data);
    return response.data; 
  };
  
  export const listReviewDV = async (serviceId) => {
    const response = await review.get(`/reviewdv/${serviceId}`);
    return response.data.data; 
  };
  
export const removeReviewDV = async (reviewId) => {
    const response = await review.delete(`/reviewdv/remove/${reviewId}`);
    return response.data;
};
