import React from 'react';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Service from './pages/Service';
import Products from './pages/Products';
import Booknow from './pages/Booknow';
import Contacts from './pages/Contacts';
import About from './pages/About';
<<<<<<< HEAD
//import Cart from './pages/';
=======
import Cart from './pages/Cart';
>>>>>>> c1949cc (Bao cao lan 3)
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import { ForgotPassword } from './pages/ForgotPassword';
import Profile from './pages/Profile';
import Schedule from './components/Schedule';
import Admin from './pages/Admin';
import BlogViewer from './components/BlogViewer';
import ProductDetailPage from './pages/ProductDetailsPage';
<<<<<<< HEAD
import MyVouchers from './pages/MyVouchers';
import ServiceDetailPage from './pages/ServiceDetailPage';

import SearchResultPage from './pages/SearchResult';
import { Page404 } from './pages/Page404';
import SearchPage from './pages/SearchResult';
=======
import SuperVouchers from './pages/SuperVouchers';
import MyVouchers from './pages/MyVouchers';
import ServiceDetailPage from './pages/ServiceDetailPage';
import Payment from './pages/Payment';
import OrderConfirmation from './pages/OrderConfirmation';
import SearchResultPage from './pages/SearchResult';
import { Page404 } from './pages/Page404';
import SearchPage from './pages/SearchResult';
import StripeCheckout from './pages/StripeCheckout';
import BookServicePage from './pages/BookServicePage';
import ServicePage from './pages/ServicePage';
import ProductsPage from './pages/ProductPage';
import BlogPage from './pages/BlogPage';
import Manager from './pages/Manager';
import VNPayReturn from './pages/VNPayReturn'; // Import component mới
import Verify from './pages/Verify'; // Trang verify của Stripe

>>>>>>> c1949cc (Bao cao lan 3)

function App() {
  return (
    <>
      {/* <Header /> */}
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/service" element={<Service />} />
<<<<<<< HEAD
          <Route path="/product" element={<Products />} />
          <Route path="/booknow" element={<Booknow />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contacts />} />
          <Route path="/cart" element={<Cart />} />
=======
          <Route path="/servicepage" element={<ServicePage />} />
          <Route path="/product" element={<Products />} />
          <Route path="/productpage" element={<ProductsPage />} />
          <Route path="/booknow" element={<Booknow />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contacts />} />
>>>>>>> c1949cc (Bao cao lan 3)
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/profile" element={<Profile />} />
<<<<<<< HEAD
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/blogview" element={<BlogViewer />} />
=======
          <Route path="/blogview" element={<BlogViewer />} />
          <Route path="/blogpage" element={<BlogPage />} />
>>>>>>> c1949cc (Bao cao lan 3)
          <Route path="/service/:id" element={<ServiceDetailPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/search" element={<SearchResultPage />} />
          <Route path="*" element={<Page404 />} />
          <Route path="/search" element={<SearchPage />} />
<<<<<<< HEAD

          {/* <Route path="/myvc" element={<MyVouchers />} /> */}
          <Route path="/myvc" element={<PrivateRoute element={<MyVouchers />} requiredRole="user" />} />
          {/* Router riêng dành cho admin và manager */}
          <Route path="/admin-sign" element={<SignInPage />} />
          <Route path="/admin" element={<PrivateRoute element={<Admin />} requiredRole={"admin"} />} />
=======
          {/* Router chỉ người dùng mới sử dụng được */}
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/verify/success" element={<StripeCheckout />} />
          <Route path="/vnpay_return" element={<VNPayReturn />} /> {/* Thêm route cho VNPay return */}
          <Route path="/verify" element={<Verify />} /> {/* Route cho Stripe verify */}

          <Route path="/spvc" element={<SuperVouchers />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/stripe-checkout" element={<StripeCheckout />} />
          <Route path="/book-service/:id" element={<PrivateRoute element={<BookServicePage />} requiredRole="user" />} />
          <Route path="/myvc" element={<PrivateRoute element={<MyVouchers />} requiredRole="user" />} />
          <Route path="/cart" element={<PrivateRoute element={<Cart />} requiredRole="user" />} />
          {/* Router riêng dành cho admin và manager */}
          <Route path="/admin-sign" element={<SignInPage />} />
          <Route path="/admin" element={<PrivateRoute element={<Admin />} requiredRole={"admin"} />} />
          <Route path="/manager" element={<PrivateRoute element={<Manager />} requiredRole={"manager"} />} />
          <Route path="/schedule" element={<PrivateRoute element={<Schedule />} requiredRole={"employee"} />} />
>>>>>>> c1949cc (Bao cao lan 3)
          {/* Router riêng dành cho employee */}
        </Routes>
      </AuthProvider>
    </>
  );
}

export default App;