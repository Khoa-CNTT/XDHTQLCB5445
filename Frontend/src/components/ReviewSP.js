import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getUser } from '../APIs/userApi';
import { getProductById } from '../APIs/ProductsApi';
import { addReviewSP } from "../APIs/ReviewSPAPI";
import { MdOutlineStarPurple500 } from "react-icons/md";
import { jwtDecode } from 'jwt-decode';
import { errorToast, successToast, toastContainer } from '../utils/toast';

export const ReviewSP = ({ onAddReview }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(null);
  const [comment, setComment] = useState('');
  const [userId, setUserId] = useState('');
  const [userFullName, setUserFullName] = useState('');
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productData = await getProductById(id);
        if (productData.success) {
          setProduct(productData.data);
        }
      } catch (error) {  
      }
    };
    fetchProduct();
  }, [id]);

  const getUserIdFromToken = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        return decodedToken.id;
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

 e.preventDefault();
     if (!rating) {
       return errorToast("Vui lòng đánh giá rating.");
     }
     if (!comment.trim()) {
       return errorToast("Vui lòng nhập bình luận.");
     }
     if(!rating || !comment.trim()) {
       return errorToast("Vui lòng nhập đầy đủ thông tin.");
     }
    if (!userId || !product) {
      return errorToast("Thiếu thông tin user hoặc sản phẩm.");
    }

    const reviewData = {
      userId,
      productId: product._id,
      rating,
      comment
    };

    try {
      setLoading(true);
      const res = await addReviewSP(reviewData);
      if (res.success) {
        successToast("Đánh giá thành công!");
        onAddReview();
        setRating(0);
        setComment('');
      } else {
        errorToast("Không thể gửi đánh giá.");
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 shadow-md rounded border mt-4">
      {toastContainer()}
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
          disabled={loading}
          className={`w-full px-4 py-2 rounded text-white ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? "Đang gửi..." : "Gửi đánh giá"}
        </button>
      </form>
    </div>
  );
};

