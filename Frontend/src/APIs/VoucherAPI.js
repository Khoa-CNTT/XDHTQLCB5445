import axios from 'axios';

// const API_BASE_URL = process.env.REACT_APP_API_KEY || 'https://backend-fu3h.onrender.com/api/';
const API_BASE_URL = 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const addVoucher = async (voucherData) => {
    const token = localStorage.getItem('token');
    const response = await api.post('/vouchers', voucherData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export const getVouchers = async ({ applicableTo = '', search = '' } = {}) => {
    const params = {};
    if (applicableTo) params.applicableTo = applicableTo;
    if (search) params.search = search;
    const response = await api.get('/vouchers', { params });
    return response.data;
};

export const getVoucherByCode = async (voucherCode) => {
    const response = await api.get(`/vouchers/code/${voucherCode}`);
    return response.data;
};

export const deleteVoucher = async (id) => {
    const token = localStorage.getItem('token');
    const response = await api.delete(`/vouchers/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export const redeemVoucher = async (voucherCode) => {
    const token = localStorage.getItem('token');
    const response = await api.post(`/vouchers/redeem/${voucherCode}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export const updateVoucher = async (id, voucherData) => {
    const token = localStorage.getItem('token');
    const response = await api.put(`/vouchers/${id}`, voucherData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};
