import React, { useState, useEffect, useCallback } from 'react';
import { getUser, updateUser } from '../APIs/userApi'; // Sử dụng API đã cấu hình
import { jwtDecode } from "jwt-decode"; // Import đúng
import { toast } from 'react-toastify'; // Sử dụng toast từ parent hoặc import riêng

// Lấy URL gốc của backend từ biến môi trường hoặc đặt cứng (ít linh hoạt hơn)
const BACKEND_URL = process.env.REACT_APP_API_KEY ? process.env.REACT_APP_API_KEY.replace("/api", "") : "http://localhost:4000";
const DEFAULT_AVATAR = 'https://placehold.co/150?text=No+Image';

const ProfileTab = () => {
    // State cho dữ liệu người dùng và trạng thái
    const [user, setUser] = useState(null); // Lưu trữ object user đầy đủ
    const [userId, setUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // Trạng thái loading
    const [error, setError] = useState(''); // Lỗi chung của component

    // State cho chế độ chỉnh sửa và form
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        email: '',
        dateOfBirth: '',
    });
    const [imageFile, setImageFile] = useState(null); // State cho file ảnh mới chọn
    const [previewImage, setPreviewImage] = useState(DEFAULT_AVATAR); // State cho URL ảnh hiển thị

    // State cho thông báo cập nhật
    const [updateError, setUpdateError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // --- Hàm Fetch User Data ---
    const fetchUser = useCallback(async (id) => {
        console.log("Bắt đầu fetch thông tin user với ID:", id);
        setIsLoading(true);
        setError('');
        try {
            const response = await getUser(id);
            console.log("Phản hồi từ API getUser:", response);
            if (response.success && response.data) {
                const userData = response.data;
                setUser(userData); // Lưu trữ user object
                // Cập nhật state form với dữ liệu mới nhất
                setFormData({
                    firstName: userData.firstName || '',
                    lastName: userData.lastName || '',
                    phone: userData.phone || '',
                    address: userData.address || '',
                    email: userData.email || '',
                    dateOfBirth: userData.dateOfBirth ? formatDateForInput(userData.dateOfBirth) : '',
                });
                // Xây dựng URL ảnh đại diện đầy đủ
                const imageUrl = userData.image
                    ? `${BACKEND_URL}/uploads/${userData.image}`
                    : DEFAULT_AVATAR;
                console.log("URL ảnh đại diện:", imageUrl);
                setPreviewImage(imageUrl);
            } else {
                setError(response.message || 'Không thể tải dữ liệu người dùng.');
                toast.error(response.message || 'Không thể tải dữ liệu người dùng.');
            }
        } catch (err) { // Bắt lỗi từ exception (ví dụ network error)
            console.error("Lỗi nghiêm trọng khi fetch user:", err);
            setError('Lỗi kết nối hoặc lỗi hệ thống khi tải dữ liệu.');
            toast.error('Lỗi kết nối hoặc lỗi hệ thống khi tải dữ liệu.');
        } finally {
            setIsLoading(false);
        }
    }, []); // useCallback vì nó không phụ thuộc state ngoài `id` được truyền vào

    // --- useEffect để lấy userId từ token và fetch data lần đầu ---
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            return;
        }

        try {
            const decodedToken = jwtDecode(token);
            const idFromToken = decodedToken.id; // <--- KIỂM TRA DÒNG NÀY

            // Thêm log để kiểm tra ID lấy được
            console.log("Decoded Token:", decodedToken);
            console.log("ID lấy từ Token:", idFromToken); // <-- XEM LOG NÀY

            if (!idFromToken) { // Kiểm tra xem id có tồn tại không
                setError('Token không hợp lệ - không tìm thấy ID người dùng.');
                toast.error('Token không hợp lệ.');
                setIsLoading(false);
                localStorage.removeItem('token');
                return;
            }

            setUserId(idFromToken); // Lưu ID hợp lệ
            fetchUser(idFromToken); // Gọi fetch với ID ĐÚNG

        } catch (error) {
            // ... xử lý lỗi giải mã ...
        }
    }, [fetchUser]); // Dependency fetchUser đã đúng

    // --- Hàm định dạng ngày tháng YYYY-MM-DD ---
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return ''; // Kiểm tra ngày hợp lệ
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        } catch (e) {
            console.error("Lỗi định dạng ngày:", e);
            return '';
        }
    };

    // --- Event Handlers ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Kiểm tra kích thước và loại file nếu cần
             if (file.size > 5 * 1024 * 1024) { // > 5MB
                toast.error("Kích thước ảnh quá lớn (tối đa 5MB).");
                return;
            }
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
             if (!allowedTypes.includes(file.type)) {
                 toast.error("Loại file ảnh không hợp lệ (chỉ chấp nhận jpeg, png, gif).");
                 return;
             }

            setImageFile(file); // Lưu File object vào state
            // Tạo URL tạm thời để xem trước ảnh mới
            const previewUrl = URL.createObjectURL(file);
            setPreviewImage(previewUrl);
             // Nhớ thu hồi URL cũ nếu có để tránh rò rỉ bộ nhớ
             // URL.revokeObjectURL(previousPreviewUrl); // Cần quản lý URL cũ
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
        setSuccessMessage(''); // Xóa thông báo cũ
        setUpdateError('');
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Reset form về dữ liệu user hiện tại (trong state 'user')
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phone: user.phone || '',
                address: user.address || '',
                email: user.email || '',
                dateOfBirth: user.dateOfBirth ? formatDateForInput(user.dateOfBirth) : '',
            });
            const imageUrl = user.image ? `${BACKEND_URL}/uploads/${user.image}` : DEFAULT_AVATAR;
            setPreviewImage(imageUrl);
            setImageFile(null); // Xóa file ảnh đã chọn nhưng chưa lưu
        }
        setUpdateError('');
    };

    const handleUpdate = async () => {
        if (!userId) {
            setUpdateError("Không thể cập nhật do thiếu ID người dùng.");
            toast.error("Lỗi: Không tìm thấy ID người dùng.");
            return;
        }

        setSuccessMessage('');
        setUpdateError('');
        setIsLoading(true); // Hiển thị loading khi đang cập nhật

        // Tạo FormData
        const dataToSend = new FormData();
        dataToSend.append('firstName', formData.firstName);
        dataToSend.append('lastName', formData.lastName);
        dataToSend.append('phone', formData.phone);
        dataToSend.append('address', formData.address);

        dataToSend.append('dateOfBirth', formData.dateOfBirth);

        if (imageFile) {
            dataToSend.append('avatar', imageFile);
        } 


        try {
            const response = await updateUser(userId, dataToSend);
            console.log("Phản hồi từ API updateUser:", response);

            if (response.success && response.data) {
                // Cập nhật thành công
                setUser(response.data); // Cập nhật state user với dữ liệu mới nhất
                 // Cập nhật lại form và preview sau khi thành công
                 setFormData({
                    firstName: response.data.firstName || '',
                    lastName: response.data.lastName || '',
                    phone: response.data.phone || '',
                    address: response.data.address || '',
                    email: response.data.email || '',
                    dateOfBirth: response.data.dateOfBirth ? formatDateForInput(response.data.dateOfBirth) : '',
                });
                 const newImageUrl = response.data.image ? `${BACKEND_URL}/uploads/${response.data.image}` : DEFAULT_AVATAR;
                 setPreviewImage(newImageUrl);

                setIsEditing(false); // Thoát chế độ chỉnh sửa
                setImageFile(null); // Reset file đã chọn
                setSuccessMessage('Cập nhật thông tin thành công!');
                toast.success('Cập nhật thông tin thành công!');
            } else {
                // Lỗi từ API (validation hoặc lỗi server khác)
                setUpdateError(response.message || 'Lỗi không xác định khi cập nhật.');
                 // Hiển thị lỗi validation chi tiết nếu có
                 if (response.errors) {
                    const errorMessages = Object.values(response.errors).map(err => err.message).join('. ');
                     toast.error(`Lỗi cập nhật: ${errorMessages}`);
                 } else {
                     toast.error(response.message || 'Lỗi không xác định khi cập nhật.');
                 }
            }
        } catch (err) { // Lỗi nghiêm trọng (network,...)
            console.error("Lỗi nghiêm trọng khi cập nhật:", err);
            setUpdateError('Lỗi kết nối hoặc hệ thống khi cập nhật.');
            toast.error('Lỗi kết nối hoặc hệ thống khi cập nhật.');
        } finally {
             setIsLoading(false); // Tắt loading
        }
    };

    // --- Render Logic ---
    if (isLoading && !user) { // Chỉ hiển thị loading toàn trang khi chưa có dữ liệu ban đầu
        return <div className="text-center py-10">Đang tải thông tin...</div>;
    }

    if (error) {
        return <div className="text-center py-10 text-red-600">{error}</div>;
    }

    if (!user) {
         // Trường hợp không loading, không lỗi nhưng vẫn không có user (ví dụ token lỗi sau khi mount)
         return <div className="text-center py-10 text-gray-500">Không thể hiển thị thông tin người dùng.</div>;
    }

    return (
        <div className="container mx-auto p-4 max-w-4xl"> {/* Tăng max-width */}
            <h2 className="text-3xl font-semibold mb-6 text-center text-gray-800">Thông tin cá nhân</h2>

             {/* Thông báo thành công/lỗi update */}
             {successMessage && <div className="mb-4 text-center py-2 px-4 bg-green-100 text-green-700 rounded">{successMessage}</div>}
             {updateError && <div className="mb-4 text-center py-2 px-4 bg-red-100 text-red-700 rounded">{updateError}</div>}
             {/* Hiển thị loading nhỏ khi đang update */}
             {isLoading && isEditing && <div className="text-center text-blue-600 mb-4">Đang lưu...</div>}


            <div className="flex flex-col md:flex-row md:gap-8"> {/* Thêm gap */}
                {/* Cột ảnh */}
                <div className="md:w-1/3 flex flex-col items-center mb-6 md:mb-0">
                    <img
                        key={previewImage} // Thêm key để re-render khi ảnh thay đổi
                        src={previewImage}
                        alt="Ảnh đại diện"
                        className="w-40 h-40 rounded-full object-cover mx-auto mb-4 border-2 border-gray-300 shadow-md" // Tăng kích thước, thêm border, shadow
                        // onError để xử lý nếu URL ảnh bị lỗi
                        onError={(e) => {
                            console.warn("Lỗi tải ảnh:", e.target.src);
                            e.target.onerror = null; // Ngăn lặp vô hạn nếu ảnh mặc định cũng lỗi
                            e.target.src = DEFAULT_AVATAR;
                        }}
                    />
                    {isEditing && (
                        <div className='text-center'>
                             <label htmlFor="avatar-upload" className={`cursor-pointer text-sm font-medium py-2 px-4 rounded transition duration-150 ease-in-out ${isLoading ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>
                                {isLoading ? 'Đang xử lý...' : 'Thay đổi ảnh'}
                            </label>
                            <input
                                id="avatar-upload"
                                type="file"
                                accept="image/jpeg, image/png, image/gif" // Chỉ chấp nhận các loại ảnh cụ thể
                                onChange={handleImageChange}
                                className="hidden" // Ẩn input gốc
                                disabled={isLoading} // Vô hiệu hóa khi đang lưu
                            />
                            <p className="text-xs text-gray-500 mt-2">Tối đa 5MB (JPG, PNG, GIF)</p>
                        </div>
                    )}
                </div>

                 {/* Cột thông tin */}
                <div className="md:w-2/3">
                    {isEditing ? (
                        // --- Form chỉnh sửa ---
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="firstName">Họ:</label>
                                    <input id="firstName" type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} disabled={isLoading} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100" />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="lastName">Tên:</label>
                                    <input id="lastName" type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} disabled={isLoading} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="phone">Số điện thoại:</label>
                                <input id="phone" type="tel" name="phone" value={formData.phone} onChange={handleInputChange} disabled={isLoading} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100" />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="address">Địa chỉ:</label>
                                <input id="address" type="text" name="address" value={formData.address} onChange={handleInputChange} disabled={isLoading} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100" />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="email">Email:</label>
                                <input id="email" type="email" name="email" value={formData.email} onChange={handleInputChange} disabled={true} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100 cursor-not-allowed" />
                                 <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi.</p>
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="dateOfBirth">Ngày sinh:</label>
                                <input id="dateOfBirth" type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} disabled={isLoading} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100" />
                            </div>
                            <div className='flex justify-end gap-3 mt-6'>
                                <button onClick={handleUpdate} disabled={isLoading} className={`font-bold py-2 px-5 rounded transition duration-150 ease-in-out ${isLoading ? 'bg-blue-300 text-white cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700 text-white'}`}>
                                    {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </button>
                                <button onClick={handleCancel} disabled={isLoading} className={`font-bold py-2 px-5 rounded transition duration-150 ease-in-out ${isLoading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gray-500 hover:bg-gray-700 text-white'}`}>
                                    Hủy
                                </button>
                            </div>
                        </div>
                    ) : (
                        // --- Chế độ hiển thị ---
                         <div className="space-y-3 text-gray-700 text-base"> {/* Tăng cỡ chữ */}
                            <p><strong className="font-semibold text-gray-800">Họ và tên:</strong> {user.firstName || ''} {user.lastName || '(Chưa cập nhật)'}</p>
                            <p><strong className="font-semibold text-gray-800">Số điện thoại:</strong> {user.phone || '(Chưa cập nhật)'}</p>
                            <p><strong className="font-semibold text-gray-800">Địa chỉ:</strong> {user.address || '(Chưa cập nhật)'}</p>
                            <p><strong className="font-semibold text-gray-800">Email:</strong> {user.email}</p>
                            <p><strong className="font-semibold text-gray-800">Ngày sinh:</strong> {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('vi-VN') : '(Chưa cập nhật)'}</p>
                            <div className="mt-6 text-right">
                                <button onClick={handleEdit} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded transition duration-150 ease-in-out shadow-md">
                                    Chỉnh sửa thông tin
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileTab;