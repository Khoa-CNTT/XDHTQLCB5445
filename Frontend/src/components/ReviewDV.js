import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getUser } from '../APIs/userApi';
import { addReviewDV } from "../APIs/ReviewDVAPI";
import { MdOutlineStarPurple500 } from "react-icons/md";
import { jwtDecode } from 'jwt-decode';
import { getServiceById } from '../APIs/ServiceAPI';
import { errorToast, successToast,  } from '../utils/toast';

export const ReviewDV = ({ setLoading, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(null);
  const [comment, setComment] = useState('');
  const [userId, setUserId] = useState('');
  const [userFullName, setUserFullName] = useState('');
  const [service, setService] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchservice = async () => {
      try {
        const serviceData = await getServiceById(id);
        if (serviceData.success) {
          setService(serviceData.data);
        }
      } catch (error) {
        
      }
    };
    fetchservice();
  }, [id]);

  const getUserIdFromToken = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.id;
        return userId;
      } catch (error) {
        
        return null;
      }
    }
    return null;
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = getUserIdFromToken();
      if (userId) {
        try {
          const userData = await getUser(userId);
          if (userData.success) {
            setUserId(userData.data._id);
            setUserFullName(`${userData.data.firstName} ${userData.data.lastName}`);
          } else {
            
          }
        } catch (error) {
          
        }
      }
    };
    fetchUserData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token) {
      errorToast("Bạn cần đăng nhập để gửi đánh giá.");
      setTimeout(() => {
        window.location.href = "/sign-in";
      }, 2000);
      return;
    }
    if (role !== "user") {
      errorToast("Chỉ người dùng mới có thể gửi đánh giá.");
      return;
    }
    if (!rating) {
      return errorToast("Vui lòng đánh giá rating.");
    }
    if (!comment.trim()) {
      return errorToast("Vui lòng nhập bình luận.");
    }
    if(!rating || !comment.trim()) {
      return errorToast("Vui lòng nhập đầy đủ thông tin.");
    }
    if (!service) {
      return errorToast("Thiếu thông tin dịch vụ.");
    }

    const reviewData = {
      userId,
      serviceId: service._id,
      rating,
      comment
    };

    setLoading(true);
    try {
      const res = await addReviewDV(reviewData);
      if (res.success) {
        successToast("Gửi đánh giá thành công!");
        setRating(0);
        setComment('');
        if (onReviewSubmitted) {
          onReviewSubmitted();
        }
      } else {
        errorToast("Không thể gửi đánh giá.");
      }
    } catch (err) {
      
      errorToast("Có lỗi xảy ra.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-4 shadow-md rounded border mt-4">
      
      <h1 className="text-2xl font-bold mb-4">Đánh giá sản phẩm</h1>

      {userFullName && (
        <p className="text-gray-700 mb-3">
          Xin chào, <strong>{userFullName}</strong>. Hãy để lại đánh giá của bạn!
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div className="flex mb-4">
          {[...Array(5)].map((_, i) => {
            const currentRating = i + 1;
            return (
              <label key={i}>
                <input
                  type="radio"
                  value={currentRating}
                  onClick={() => setRating(currentRating)}
                  className="hidden"
                />
                <MdOutlineStarPurple500
                  size={24}
                  className={`cursor-pointer transition-colors ${
                    currentRating <= (hover || rating)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                  onMouseEnter={() => setHover(currentRating)}
                  onMouseLeave={() => setHover(null)}
                />
              </label>
            );
          })}
        </div>

        <textarea
          className="w-full border rounded p-2 mb-4"
          rows="4"
          placeholder="Nhập bình luận của bạn..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        ></textarea>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Gửi đánh giá
        </button>
      </form>
    </div>
  );
};
