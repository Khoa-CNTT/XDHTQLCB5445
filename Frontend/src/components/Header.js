import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import user from "../img/user.png";
import { IoMdSearch } from "react-icons/io";
import { FaRegHeart } from "react-icons/fa6";
import { IoBagHandleOutline } from "react-icons/io5";
import SearchComponent from "./Search";
import { getUser } from "../APIs/userApi";
import { jwtDecode } from "jwt-decode";

const BACKEND_URL = process.env.REACT_APP_API_KEY
  ? process.env.REACT_APP_API_KEY.replace("/api", "")
  : "http://localhost:4000";

const DEFAULT_AVATAR = user;

const Header = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [isMenu, setIsMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userAvatar, setUserAvatar] = useState("");
  const [userRole, setUserRole] = useState("");

  const navigate = useNavigate();

  // Fetch user data from API
  const fetchUserData = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.id;
        const userData = await getUser(userId);
        console.log("userData", userData);
        if (userData.success) {
          setUserRole(userData.data.role); // Cập nhật role người dùng
          // Sử dụng trường image từ userData.data
          const imageUrl = userData.data.image
            ? `${BACKEND_URL}/uploads/${userData.data.image}`
            : DEFAULT_AVATAR;
          setUserAvatar(imageUrl);
          localStorage.setItem("userAvatar", imageUrl); // Lưu avatar vào localStorage
        } else {
          console.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error decoding token", error);
      }
    }
  };

  // Scroll effect to change navbar style
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lắng nghe thay đổi localStorage để cập nhật avatar
  useEffect(() => {
    const handleStorageChange = () => {
      setUserAvatar(localStorage.getItem("userAvatar") || DEFAULT_AVATAR);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Handle logout action
  const handleLogout = () => {
    setUserAvatar("");
    setUserRole("");
    setIsMenu(false);
    localStorage.removeItem("userAvatar");
    localStorage.removeItem("token");
  };

  // Điều hướng đến trang sign-in khi bấm vào ảnh mặc định
  const handleAvatar = () => {
    navigate("/sign-in");
    setIsMenu(false);
  };

  const handleProfile = () => {
    navigate("/profile");
    setIsMenu(false);
  };

  const handleSchedule = () => {
    navigate("/schedule");
    setIsMenu(false);
  };

  const handleBlog = () => {
    navigate("/blogview");
    setIsMenu(false);
  };

  const handleProduct = () => {
    navigate("/product-page");
    setIsMenu(false);
  };

  // Fetch user data khi token tồn tại
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUserData();
    }
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full shadow-sm transition-all ${
        isScrolled ? "text-black py-4 bg-blue-400" : "bg-transparent text-black p-3"
      }`}
    >
      <div className="container relative mx-auto flex justify-between items-center px-6">
        <div className="text-2xl font-bold text-maincolor">
          <Link to="/">SerenitySpa</Link>
        </div>
        <nav className="space-x-6">
          <Link to="/" className="text-gray-600 hover:text-maincolor">
            Trang chủ
          </Link>
          <Link to="/service" className="text-gray-600 hover:text-maincolor">
            Dịch vụ
          </Link>
          <Link onClick={handleProduct} className="text-gray-600 hover:text-maincolor">
            Sản phẩm
          </Link>
          <Link to="/booknow" className="text-gray-600 hover:text-maincolor">
            Đặt hàng
          </Link>
          <Link onClick={handleBlog} to="/blogview" className="text-gray-600 hover:text-maincolor">
            Bài viết
          </Link>
          <Link to="/about" className="text-gray-600 hover:text-maincolor">
            Giới thiệu
          </Link>
          <Link to="/contact" className="text-gray-600 hover:text-maincolor">
            Liên hệ
          </Link>
        </nav>
        <div className="flex items-center space-x-4">
          {showSearch && (
            <div className="absolute left-1/2 transform -translate-x-1/2 w-full max-w-3xl z-50">
              <SearchComponent isVisible={showSearch} onClose={() => setShowSearch(false)} />
            </div>
          )}
          <div className="cursor-pointer hover:text-maincolor transition" onClick={() => setShowSearch(!showSearch)}>
            <IoMdSearch size={22} />
          </div>
          <div className="cursor-pointer hover:text-maincolor transition" onClick={handleSchedule}>
            <FaRegHeart size={22} />
          </div>
          <div className="relative cursor-pointer hover:text-maincolor transition">
            <Link to="/cart">
              <IoBagHandleOutline size={22} />
            </Link>
            <span className="absolute -top-2 -right-2 bg-maincolor text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              4
            </span>
          </div>
          <div className="relative">
            {userAvatar ? (
              <img
                onClick={() => setIsMenu(!isMenu)}
                src={userAvatar}
                alt="Avatar"
                className="w-8 h-8 rounded-full cursor-pointer object-cover"
                onError={(e) => (e.target.src = DEFAULT_AVATAR)}
              />
            ) : (
              <img
                onClick={handleAvatar}
                src={DEFAULT_AVATAR}
                alt="User"
                className="w-8 h-8 rounded-full cursor-pointer object-cover"
              />
            )}
            {isMenu && (
              <div className="absolute right-0 mt-[5px] bg-white shadow-lg rounded-md w-40 py-2 border border-gray-200">
                <ul className="text-sm text-gray-700">
                  {userAvatar ? (
                    <>
                      <li onClick={handleProfile} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                        Thông tin cá nhân
                      </li>
                      {userRole === "employee" && (
                        <li onClick={handleSchedule} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                          Lịch làm việc
                        </li>
                      )}
                      <hr />
                      <li onClick={handleLogout} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                        Đăng xuất
                      </li>
                    </>
                  ) : null}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
