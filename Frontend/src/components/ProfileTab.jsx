<<<<<<< HEAD
import React, { useState, useEffect, useCallback } from 'react';
import { getUser, updateUser } from '../APIs/userApi'; // Sử dụng API đã cấu hình
import { jwtDecode } from "jwt-decode"; // Import đúng
import { toast } from 'react-toastify'; // Sử dụng toast từ parent hoặc import riêng

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
=======
import React, { useState, useEffect } from 'react';
import { getUser, updateUser } from '../APIs/userApi';
import { jwtDecode } from 'jwt-decode';
import { CLOUDINARY_UPLOAD_URL, CLOUDINARY_UPLOAD_PRESET } from '../utils/cloudinaryConfig';
import { errorToast, successToast, toastContainer } from '../utils/toast';

const DEFAULT_AVATAR = 'https://placehold.co/150?text=No+Image';

const uploadToCloudinary = async (file) => {
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  const res = await fetch(CLOUDINARY_UPLOAD_URL, { method: 'POST', body: form });
  const data = await res.json();
  if (!data.secure_url) throw new Error('Upload ảnh thất bại');
  return data.secure_url;
};

const ProfileTab = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    email: '',
    dateOfBirth: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(DEFAULT_AVATAR);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token không tồn tại');
        const { id } = jwtDecode(token);
        const response = await getUser(id);
        if (response.success && response.data) {
          const userData = response.data;
          setUser(userData);
          setFormData({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            phoneNumber: userData.phoneNumber || '',
            address: userData.address || '',
            email: userData.email || '',
            dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : '',
          });
          setPreviewImage(userData.image || DEFAULT_AVATAR);
        }
      } catch (error) {
        errorToast(error.message || 'Lỗi khi tải thông tin');
      }
    };
    fetchUserData();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      errorToast('Kích thước ảnh tối đa 5MB');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      errorToast('Chỉ chấp nhận ảnh JPG, PNG hoặc GIF');
      return;
    }
    setImageFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleUpdate = async () => {
    if (!user?._id) return;

    const requiredFields = ['firstName', 'lastName', 'phoneNumber', 'address', 'dateOfBirth'];
    const isAnyFieldEmpty = requiredFields.some((field) => !formData[field].trim());
    if (isAnyFieldEmpty) {
      errorToast('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      if (formData.phoneNumber.length < 10) {
        errorToast('Số điện thoại phải đúng 10 chữ số');
        return;
      } else if (formData.phoneNumber.length > 10) {
        errorToast('Số điện thoại không được vượt quá 10 chữ số');
        return;
      }
    }

    setIsLoading(true);
    try {
      let imageUrl = user.image;
      if (imageFile) {
        imageUrl = await uploadToCloudinary(imageFile);
      }
      const updatedData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        dateOfBirth: formData.dateOfBirth,
        ...(imageUrl && { image: imageUrl }),
      };
      const response = await updateUser(user._id, updatedData);
      if (response.success) {
        setUser({ ...user, ...updatedData });
        successToast('Cập nhật thành công');
        setIsEditing(false);
        setImageFile(null);
      }
    } catch (error) {
      errorToast(error.message || 'API Error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-400"></div>
      </div>
    );

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 py-2">
      {toastContainer()}
      <div className="text-center mb-8">
        
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-100">Thông Tin Cá Nhân</h2>
          
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-1/3 flex flex-col items-center">
              <div className="relative mb-4">
                <img
                  src={previewImage}
                  alt="Avatar"
                  className="w-40 h-40 rounded-full object-cover border-4 border-pink-100 shadow-lg"
                  onError={() => setPreviewImage(DEFAULT_AVATAR)}
                />
                {isEditing && (
                  <label className="absolute bottom-2 right-2 bg-pink-500 text-white rounded-full p-2 cursor-pointer hover:bg-pink-600 transition shadow-md">
                    <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                  </label>
                )}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 text-center">{user.firstName} {user.lastName}</h3>
              <p className="text-gray-500 text-center">{user.email}</p>
            </div>

            <div className="w-full lg:w-2/3">
              {isEditing ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Họ</label>
                      <input
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tên</label>
                      <input
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                      <input
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                    <input
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition"
                    />
                  </div>
                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleUpdate}
                      disabled={isLoading}
                      className={`px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition font-medium ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Đang lưu...
                        </span>
                      ) : 'Lưu thay đổi'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Họ và tên</p>
                      <p className="text-lg font-semibold text-gray-800 mt-1">{user.firstName} {user.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Số điện thoại</p>
                      <p className="text-lg font-semibold text-gray-800 mt-1">{user.phoneNumber || 'Chưa cập nhật'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-lg font-semibold text-gray-800 mt-1">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Ngày sinh</p>
                      <p className="text-lg font-semibold text-gray-800 mt-1">
                        {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-gray-500">Địa chỉ</p>
                      <p className="text-lg font-semibold text-gray-800 mt-1">{user.address || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                  <div className="flex justify-center pt-6">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-8 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition font-medium text-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      Chỉnh sửa thông tin
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;
>>>>>>> c1949cc (Bao cao lan 3)
