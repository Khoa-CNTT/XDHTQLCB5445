import axios from 'axios';


const API_BASE_URL = "http://localhost:4000/api";
// const API_BASE_URL = 'https://backend-fu3h.onrender.com/api';

const service = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getAllServices = async () => {
  try {
    const response = await service.get('service/list');
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách dịch vụ: ', error);
    throw error; // ném lỗi để có thể xử lý ngoài component
  }
};

export const getServiceById = async (id) => {
  try {
    const response = await service.get(`service/${id}`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy dịch vụ theo ID: ', error);
    throw error;
  }
};

export const createService = async (serviceData) => {
  try {
    const response = await service.post('service/add', serviceData);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi thêm dịch vụ: ', error);
    throw error;
  }
};

export const updateService = async (id, serviceData) => {
    const response = await service.put('service/update', { id, ...serviceData });
    return response.data;
};

export const deleteService = async (id) => {
    const response = await service.delete(`service/delete/${id}`);
    return response.data;
};
