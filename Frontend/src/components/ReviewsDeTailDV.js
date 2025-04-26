import React, { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import { ReviewDV } from "./ReviewDV";
import { listReviewDV, removeReviewDV } from "../APIs/ReviewDVAPI";
import { getUser } from "../APIs/userApi";
import { useParams } from "react-router-dom";
import { RxDotsVertical } from "react-icons/rx";
import { errorToast, successToast, toastContainer } from "../utils/toast";
import { jwtDecode } from "jwt-decode";

const ReviewsDeTailDV = () => {
  const [showReview, setShowReview] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [userFullName, setUserFullName] = useState({});
  const { id } = useParams();
  const [openMenuId, setOpenMenuId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  const fetchUserAndReviews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const decodedToken = jwtDecode(token);
        const loggedInUserId = decodedToken.id;
        setUserId(loggedInUserId);

        const userData = await getUser(loggedInUserId);
        if (userData.success) {
          setUserFullName(prev => ({
            ...prev,
            [loggedInUserId]: `${userData.data.firstName} ${userData.data.lastName}`
          }));
        }
      }

      const data = await listReviewDV(id);
      const infoReviewUser = Array.isArray(data.reviews)
        ? data.reviewsInfoUser
        : Array.isArray(data)
        ? data
        : [];
      setReviews(infoReviewUser);

      const uniqueUserIds = [
        ...new Set(infoReviewUser.map((review) => review.userId)),
      ];
      const userInfoMap = {};
      await Promise.all(
        uniqueUserIds.map(async (userID) => {
          try {
            const res = await getUser(userID);
            if (res.success) {
              const { firstName, lastName } = res.data;
              userInfoMap[userID] = `${firstName} ${lastName}`;
            } else {
              userInfoMap[userID] = "Người dùng ẩn danh";
            }
          } catch {
            userInfoMap[userID] = "Người dùng ẩn danh";
          }
        })
      );
      setUserFullName((prev) => ({ ...prev, ...userInfoMap }));
    } catch (error) {
      
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUserAndReviews();
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".dropdown-review")) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRemoveReview = async (review) => {
    if (review.userId !== userId) {
      errorToast("Bạn không thể xoá đánh giá của người khác.");
      return;
    }
    setLoading(true);
    const res = await removeReviewDV(review._id);
    if (res.success) {
      setReviews((prev) => prev.filter((r) => r._id !== review._id));
      successToast("Xoá đánh giá thành công");
    }
    setLoading(false);
    setOpenMenuId(null);
  };

  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : "0.0";

  return (
    <div className="mt-8 pl-5">
      {toastContainer()}
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Đánh giá dịch vụ</h2>
      <div className="bg-white p-6 rounded-lg shadow-md mb-4">
        <div className="flex items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-800 mr-2">
              {avgRating}
            </span>
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className={i < Math.round(avgRating) ? "" : "text-gray-300"} />
              ))}
            </div>
            <span className="ml-2 text-gray-600">({reviews.length} đánh giá)</span>
          </div>
        </div>
        <div className="mb-4">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = reviews.filter((r) => r.rating === star).length;
            const percent = reviews.length
              ? `${(count / reviews.length) * 100}%`
              : "0%";

            return (
              <div key={star} className="flex items-center mb-2">
                <span className="w-8">
                  {star} <FaStar className="inline text-yellow-400" />
                </span>
                <div className="w-64 bg-gray-200 h-2 rounded">
                  <div
                    className="bg-yellow-400 h-2 rounded"
                    style={{ width: percent }}
                  ></div>
                </div>
                <span className="ml-2 text-gray-600">{count}</span>
              </div>
            );
          })}
        </div>
        <button
          onClick={() => setShowReview(true)}
          className="bg-maincolor text-white px-4 py-2 rounded hover:bg-maincolorhover mb-4"
        >
          Viết đánh giá
        </button>

        {showReview && (
          <ReviewDV setLoading={setLoading} onReviewSubmitted={fetchUserAndReviews} />
        )}
        <div className="space-y-4 flex-1">
          {loading ? (
            <p>Đang tải...</p>
          ) : reviews.length === 0 ? (
            <p className="text-gray-600">Không có đánh giá nào.</p>
          ) : (
            reviews.map((review) => (
              <div
                key={review._id}
                className="bg-white w-full p-4 rounded-lg shadow"
              >
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {userFullName[review.userId] || "Người dùng ẩn danh"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Ngày: {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={i < review.rating ? "" : "text-gray-300"}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mt-2">{review.comment}</p>

                <div className="relative dropdown-review">
                  <div
                    className="flex justify-end mt-2 cursor-pointer"
                    onClick={() =>
                      setOpenMenuId(openMenuId === review._id ? null : review._id)
                    }
                  >
                    <RxDotsVertical />
                  </div>
                  {openMenuId === review._id && (
                    <div className="absolute right-0 mt-2 w-36 bg-white border rounded shadow z-10">
                      <button
                        onClick={() => handleRemoveReview(review)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100"
                      >
                        Xoá đánh giá
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewsDeTailDV;
