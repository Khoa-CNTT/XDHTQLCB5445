import React, { useState } from 'react'
import { getProducts } from '../APIs/ProductsApi';

export const ProductView = () => {
    const [dataUserProduct, setDataUserProduct] = useState([]);
    const fetchProduct = async () => {
        try {
            const res = await getProducts();
            if (res && res.data) {
                setDataUserProduct(res.data.map(item => ({ ...item, key: item._id })));
            } else {
                setDataUserProduct([]);
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách sản phẩm:", error);
            setDataUserProduct([]);
        }
    }
  return (
    <div>
        <h1>Danh sách sản phẩm</h1>
        <button onClick={fetchProduct}>Lấy danh sách sản phẩm</button>
        <table>
            <thead>
                <tr>
                    <th>Tên sản phẩm</th>
                    <th>Giá</th>
                    <th>Mô tả</th>
                </tr>
            </thead>
            <tbody>
                {dataUserProduct.map(product => (
                    <tr key={product._id}>
                        <td>{product.name}</td>
                        <td>{product.price}</td>
                        <td>{product.description}</td>
                    </tr>
                ))}
            </tbody>
        </table>

    </div>
  )
}
