<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import user from '../img/user.png';
import { IoMdSearch } from 'react-icons/io';
import { FaRegHeart } from 'react-icons/fa6';
import { IoBagHandleOutline } from 'react-icons/io5';
import { getUser } from '../APIs/userApi';
import { jwtDecode } from 'jwt-decode';
import { useTranslation } from 'react-i18next';

const BACKEND_URL = process.env.REACT_APP_API_KEY
  ? process.env.REACT_APP_API_KEY.replace('/api', '')
  : 'http://localhost:4000';

const DEFAULT_AVATAR = user;

const Header = () => {
  const { t, i18n } = useTranslation();
  const [isMenu, setIsMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userAvatar, setUserAvatar] = useState('');
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();

  const handleLanguageChange = () => {
    const newLang = i18n.language === 'vi' ? 'en' : 'vi';
    i18n.changeLanguage(newLang);
  };

  const fetchUserData = async () => {
    const token = localStorage.getItem('token');
=======
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import user from "../img/user.png";
import vi from "../img/vi.png";
import en from "../img/en.png";
import logo from "../img/logo.jpg";
import { IoIosReturnRight, IoMdSearch } from "react-icons/io";
import { IoBagHandleOutline } from "react-icons/io5";
import { getUser } from "../APIs/userApi";
import { jwtDecode } from "jwt-decode";
import { useTranslation } from "react-i18next";
import Mess from "./Mess";
import BackToTop from "./BackToTop";

const DEFAULT_AVATAR = user;

const Header = ({className=''}) => {
  const { t, i18n } = useTranslation();
  const [isMenu, setIsMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userAvatar, setUserAvatar] = useState("");
  const [userRole, setUserRole] = useState("");
  const navigate = useNavigate();
  const handleLanguageChange = () => {
    const newLang = i18n.language === "vi" ? "en" : "vi";
    i18n.changeLanguage(newLang);
  };
  const fetchUserData = async () => {
    const token = localStorage.getItem("token");
>>>>>>> c1949cc (Bao cao lan 3)
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.id;
        const userData = await getUser(userId);
        if (userData.success) {
          setUserRole(userData.data.role);
<<<<<<< HEAD
          const imageUrl = userData.data.image
            ? `${BACKEND_URL}/uploads/${userData.data.image}`
            : DEFAULT_AVATAR;
          setUserAvatar(imageUrl);
          localStorage.setItem('userAvatar', imageUrl);
        }
      } catch (error) {
        console.error('Error decoding token', error);
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
=======
          setUserAvatar(userData.data.image || DEFAULT_AVATAR);
          localStorage.setItem("userAvatar", userData.data.image);
        }
      } catch (error) {
        
      }
    }
  };
  
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
>>>>>>> c1949cc (Bao cao lan 3)
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
<<<<<<< HEAD
      setUserAvatar(localStorage.getItem('userAvatar') || DEFAULT_AVATAR);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
=======
      setUserAvatar(localStorage.getItem("userAvatar") || DEFAULT_AVATAR);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
>>>>>>> c1949cc (Bao cao lan 3)
    if (token) fetchUserData();
  }, []);

  const handleLogout = () => {
<<<<<<< HEAD
    setUserAvatar('');
    setUserRole('');
    setIsMenu(false);
    localStorage.removeItem('userAvatar');
    localStorage.removeItem('token');
    navigate('/sign-in');
  };

  const handleAvatar = () => {
    navigate('/sign-in');
=======
    setUserAvatar("");
    setUserRole("");
    setIsMenu(false);
    localStorage.removeItem("userAvatar");
    localStorage.removeItem("token");
    navigate("/sign-in");
  };


  const handleAvatar = () => {
    navigate("/sign-in");
>>>>>>> c1949cc (Bao cao lan 3)
    setIsMenu(false);
  };

  const handleProfile = () => {
<<<<<<< HEAD
    navigate('/profile');
=======
    navigate("/profile");
>>>>>>> c1949cc (Bao cao lan 3)
    setIsMenu(false);
  };

  const handleSchedule = () => {
<<<<<<< HEAD
    navigate('/schedule');
=======
    navigate("/schedule");
>>>>>>> c1949cc (Bao cao lan 3)
    setIsMenu(false);
  };

  const handleSearchClick = () => {
<<<<<<< HEAD
    navigate('/search');
=======
    navigate("/search");
>>>>>>> c1949cc (Bao cao lan 3)
  };

  return (
    <header
<<<<<<< HEAD
      className={`sticky z-50 top-0 left-0 w-full shadow-sm transition-all ${
        isScrolled ? 'text-black py-4 bg-white' : 'bg-transparent text-black p-3'
      }`}
    >
      <div className="container relative mx-auto flex justify-between items-center px-6">
        <div className="text-2xl font-bold text-maincolor">
          <Link to="/">SerenitySpa</Link>
        </div>
        <nav className="space-x-6 hidden md:flex">
          <Link to="/" className="text-gray-600 hover:text-maincolor">
            {t('header.home')}
          </Link>
          <Link to="/service" className="text-gray-600 hover:text-maincolor">
            {t('header.services')}
          </Link>
          <Link to="/product" className="text-gray-600 hover:text-maincolor">
            {t('header.products')}
          </Link>
          <Link to="/booknow" className="text-gray-600 hover:text-maincolor">
            {t('header.bookNow')}
          </Link>
          <Link to="/blogview" className="text-gray-600 hover:text-maincolor">
            {t('header.blogger')}
          </Link>
          <Link to="/spvc" className="text-gray-600 hover:text-maincolor">
            {t('header.voucher')}
          </Link>
          <Link to="/about" className="text-gray-600 hover:text-maincolor">
            {t('header.about')}
          </Link>
          <Link to="/contact" className="text-gray-600 hover:text-maincolor">
            {t('header.contact')}
          </Link>
        </nav>
        <div className="flex items-center space-x-4">
          <div
            className="cursor-pointer hover:text-maincolor transition"
            onClick={handleSearchClick}
          >
            <IoMdSearch size={22} />
          </div>
          <div
            className="cursor-pointer hover:text-maincolor transition"
            onClick={handleSchedule}
          >
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
          <div
            className="cursor-pointer hover:text-maincolor transition"
            onClick={handleLanguageChange}
          >
            <span className="text-lg">{i18n.language === 'vi' ? '🌍 Tiếng Việt' : '🌍 English'}</span>
=======
    className={`fixed z-30 top-0 left-0 h-[65px] w-full shadow-sm transition-all 
      ${isScrolled ? "bg-white text-black shadow-lg p-3" : "bg-transparent text-white p-3"}
      ${className}`}
    > 
    <Mess />
    <BackToTop/>

      <div className="container relative mx-auto flex justify-between items-center px-6">
        <div className="text-2xl font-bold text-maincolor">
          <Link className="flex" to="/">
            <img
              src={logo}
              width={60}
              className=" mt-[-10px] rounded-full"
              alt="Đây là logo"
            />{" "}
            <div
              className={`ml-2 text-[26]
              ${isScrolled ? "text-black" : "text-blue"}`}
              style={{ fontFamily: "Dancing Script, serif" }}
            >
              {" "}
              Spa Beauty
            </div>
          </Link>
        </div>
        <nav className="space-x-6 hidden md:flex">
            <Link to="/" className="mt-[-7px] text-[20px] hover:text-maincolor">
              {t("header.home")}
            </Link>
            <Link to="/servicepage" className="text-[20px] mt-[-7px] hover:text-maincolor">
              {t("header.services")}
            </Link>
            <Link to="/productpage" className="text-[20px] mt-[-7px] hover:text-maincolor">
              {t("header.products")}
            </Link>
            <Link to="/blogpage" className="mt-[-7px] text-[20px] hover:text-maincolor">
              {t("header.blogger")}
            </Link>
            <Link to="/spvc" className="mt-[-7px]  text-[20px] hover:text-maincolor">
              {t("header.voucher")}
            </Link>
            <Link to="/about" className="mt-[-7px] text-[20px] hover:text-maincolor">
              {t("header.about")}
            </Link>
            <Link to="/contact" className=" mt-[-7px] text-[20px] hover:text-maincolor">
              {t("header.owner")}
            </Link>
          {userRole === "admin" && (
            <Link to="/admin" className="flex justify-center mt-[-5px] items-center hover:text-maincolor">
              {t("header.admin")} <IoIosReturnRight className="text-[26px]" />
            </Link>
          )}
          {userRole === "manager" && (
            <Link to="/manager" className="flex justify-center mt-[-5px] items-center hover:text-maincolor">
              {t("header.admin")} <IoIosReturnRight className="text-[26px]" />
            </Link>
          )}
        </nav>
        <div className="flex items-center space-x-4">
          <div className="cursor-pointer hover:text-maincolor transition" onClick={handleSearchClick}>
            <IoMdSearch size={24} />
          </div>
          <div className="relative cursor-pointer hover:text-maincolor transition">
            <Link to="/cart">
              <IoBagHandleOutline size={24} />
            </Link>
          </div>
          <div className="cursor-pointer hover:text-maincolor transition" onClick={handleLanguageChange}>
            <img src={i18n.language === "vi" ? vi : en} alt="language" className="w-6 h-6 object-cover" />
>>>>>>> c1949cc (Bao cao lan 3)
          </div>
          <div className="relative">
            {userAvatar ? (
              <img
                onClick={() => setIsMenu(!isMenu)}
                src={userAvatar}
                alt="Avatar"
<<<<<<< HEAD
                className="w-8 h-8 rounded-full cursor-pointer object-cover"
=======
                className="w-9 h-9 rounded-full cursor-pointer object-cover"
>>>>>>> c1949cc (Bao cao lan 3)
                onError={(e) => (e.target.src = DEFAULT_AVATAR)}
              />
            ) : (
              <img
                onClick={handleAvatar}
                src={DEFAULT_AVATAR}
                alt="User"
<<<<<<< HEAD
                className="w-8 h-8 rounded-full cursor-pointer object-cover"
=======
                className="w-9 h-9 rounded-full cursor-pointer object-cover"
>>>>>>> c1949cc (Bao cao lan 3)
              />
            )}
            {isMenu && (
              <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-md w-40 py-2 border border-gray-200">
                <ul className="text-sm text-gray-700">
                  {userAvatar ? (
                    <>
                      <li
                        onClick={handleProfile}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        Thông tin cá nhân
                      </li>
<<<<<<< HEAD
                      {userRole === 'employee' && (
=======
                      {userRole === "employee" && (
>>>>>>> c1949cc (Bao cao lan 3)
                        <li
                          onClick={handleSchedule}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                          Lịch làm việc
                        </li>
                      )}
                      <hr />
                      <li
                        onClick={handleLogout}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
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

<<<<<<< HEAD
export default Header;
=======
export default Header;
>>>>>>> c1949cc (Bao cao lan 3)
