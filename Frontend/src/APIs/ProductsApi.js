import axios from "axios";

const API_BASE_URL = 'http://localhost:4000/api/'; 
const product = axios.create({
    baseURL: API_BASE_URL,
    headers:{
        'Content-Type': 'application/json',
    }
})
export const getProducts = async () => {
    const res = await product.get('product/list')
    return res.data
}
// Thêm sản phẩm mới
export const addProduct = async (productData) => {
    const res = await product.post('product/add', productData)
    return res.data;
  };
export const getProductById = async (id) => {
    const res = await product.get(`product/${id}`)
    return res.data
}
// Cập nhật sản phẩm
export const updateProduct = async (id, productData) => {
    const res = await product.put('product/update', { id, ...productData });
    return res.data;
};

