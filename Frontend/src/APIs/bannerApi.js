import axios from "axios";

// const API_URL = "https://backend-fu3h.onrender.com/api/slide";
const API_URL = "http://localhost:4000/api/slide";
export const getAllSlides = async () => {
    const res = await axios.get(API_URL);
    return res.data;
};

export const createSlide = async (formData) => {
    const res = await axios.post(`${API_URL}/add`, formData);
    return res.data;
};

export const deleteSlide = async (id) => {
    await axios.delete(`${API_URL}/delete/${id}`);
    return true;
};
export const updateSlide = async (id, data) => {
        const response = await axios.put(`${API_URL}/update/${id}`, data);
        return response.data;
};
