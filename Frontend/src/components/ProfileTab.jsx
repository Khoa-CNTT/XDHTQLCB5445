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
