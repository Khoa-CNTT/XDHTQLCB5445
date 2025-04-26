import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getServiceById } from '../APIs/ServiceAPI';
import { listReviewDV } from '../APIs/ReviewDVAPI'; // Thêm API lấy danh sách đánh giá dịch vụ
import { FaStar } from 'react-icons/fa'; // Dùng để hiển thị sao
import { RightOutlined } from '@ant-design/icons';
import { errorToast, successToast, toastContainer } from '../utils/toast';
import Header from '../components/Header';
import ReviewsDeTailDV from '../components/ReviewsDeTailDV';

const ServiceDetailPage = () => {
    const { id } = useParams();
    const [service, setService] = useState(null);
    const [reviews, setReviews] = useState([]); // Lưu danh sách đánh giá
    const [averageRating, setAverageRating] = useState(0); // Điểm đánh giá trung bình
    const [reviewCount, setReviewCount] = useState(0); // Số lượng đánh giá
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchServiceAndReviews = async () => {
            try {
                // Lấy thông tin dịch vụ
                const response = await getServiceById(id);
                if (response.success) {
                    setService(response.data);
                }

                // Lấy danh sách đánh giá dịch vụ
                const reviewData = await listReviewDV(id);
                if (reviewData.success) {
                    setReviews(reviewData.data);
                    setReviewCount(reviewData.data.length);
                    const totalStars = reviewData.data.reduce((sum, r) => sum + r.rating, 0);
                    setAverageRating(totalStars / reviewData.data.length);
                }
                setLoading(false);
            } catch (error) {
                setError(error.message || 'Có lỗi xảy ra khi tải dữ liệu');
                setLoading(false);
            }
        };

        fetchServiceAndReviews();
    }, [id]);

    const handleBookNow = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            errorToast('Vui lòng đăng nhập để đặt lịch!');
            navigate('/sign-in');
        } else {
            navigate(`/book-service/${id}`, { state: { service } });
        }
    };

    if (loading) {
        return <div className="text-center pt-32">Đang tải dữ liệu...</div>;
    }

    if (error) {
        return <div className="text-center py-10 text-red-500">{error}</div>;
    }

    if (!service) {
        return <div className="text-center py-10">Không tìm thấy dịch vụ với ID: {id}</div>;
    }

    return (
        <div className="">
            <Header className="!bg-white !text-black !shadow-md" />
            <div className=" mt-[50px] p-8 pt-6">
                <nav className="text-sm text-gray-500 mb-4">
                    <Link to="/" className="hover:underline">Trang chủ</Link> &gt;{' '}
                    <Link to="/service" className="hover:underline">Dịch vụ</Link> &gt;{' '}
                    <span className="text-gray-800">{service.name || 'Chi tiết dịch vụ'}</span>
                </nav>
                <div
                    className="w-full h-96 bg-cover bg-center"
                    style={{ backgroundImage: `url(${service.image})` }}
                >
                    <div className="flex items-center justify-center h-full bg-black bg-opacity-50">
                        <h1 className="text-4xl font-bold text-white">
                            {service.name || 'Dịch Vụ Massage Thư Giãn'}
                        </h1>
                    </div>
                </div>
                <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
                    <div className="md:w-2/3">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Thông tin dịch vụ</h2>
                            <p className="text-gray-600 mb-4">
                                {service.description || 'Thư giãn và phục hồi cơ thể với liệu pháp massage truyền thống của chúng tôi.'}
                            </p>
                        </div>
                        <div className="mt-8">
                            <ReviewsDeTailDV />
                        </div>
                    </div>
                    <div className="md:w-1/3 lg:col-span-1">
                        <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Chi tiết dịch vụ</h2>
                            <p className="text-gray-600 mb-2">
                                <span className="font-semibold">Thời gian:</span> {service.duration || '60'} phút
                            </p>
                            <p className="text-gray-600 mb-2">
                                <span className="font-semibold">Giá:</span> {service.price || '850.000'} đ
                            </p>
                            <p className="text-gray-600 mb-4">
                                <span className="font-semibold">Loại dịch vụ:</span> {service.category || 'Massage'}
                            </p>
                            <button
                                onClick={handleBookNow}
                                className="w-full bg-blue-600 text-white py-2 rounded-lg"
                            >
                                Đặt lịch ngay
                            </button>
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                <p className="text-gray-600">
                                    <span className="font-semibold">Lưu ý:</span> Vui lòng đến trước 15 phút để hoàn thành thủ tục đăng ký và chuẩn bị trước buổi trị liệu của bạn.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceDetailPage;
