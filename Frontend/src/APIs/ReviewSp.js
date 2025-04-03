import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_KEY || "http://localhost:4000/api";

const reviewsp = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" }
});

// API add review
export const addReview = async (data) => {
    const response = await reviewsp.post("/reviewsp/add", data);
    return response.data;
};
// API list review
export const listReview = async () => {
    const response = await reviewsp.get("/reviewsp/list");
    return response.data;
};
// API remove review
export const removeReview = async (reviewId) => {
    const response = await reviewsp.delete(`/reviewsp/remove/${reviewId}`);
    return response.data;
};
