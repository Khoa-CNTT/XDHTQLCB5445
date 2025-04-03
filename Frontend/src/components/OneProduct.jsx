import React, { useEffect, useState } from 'react';
import { getProducts } from '../APIs/ProductsApi';

const OneProduct = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await getProducts();
                if (response.success && Array.isArray(response.data)) {
                    setProducts(response.data.map(item => ({ ...item, key: item._id })));
                } else {
                    throw new Error("Dữ liệu sản phẩm không hợp lệ!");
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        
        fetchProducts();
    }, []);

    if (loading) return <p>Đang tải sản phẩm...</p>;
    if (error) return <p>Lỗi: {error}</p>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4 text-center">Chi tiết sản phẩm</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((item) => (
                    <div key={item._id} className="border rounded-lg p-4 shadow-md bg-white">
                        <h2 className="text-lg font-semibold">{item.ProductName}</h2>
                        {item.ImagePD && <img src={item.ImagePD} alt={item.ProductName} className="w-[322px] h-[217px] rounded-lg mb-4" />}
                        <p className="mt-2"><strong>Giá:</strong> {item.PricePD} VND</p>
                        <p><strong>Mô tả:</strong> {item.DescriptionPD}</p>
                        <p><strong>Số lượng:</strong> {item.StockQuantity}</p>
                        <p><strong>Danh mục:</strong> {item.Category}</p>
                    </div>
                ))}
            </div>
            <button onClick={() => window.history.back()} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
                Quay lại
            </button>
        </div>
    );
};

export default OneProduct;