import React from 'react';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Service from './pages/Service';
import Products from './pages/Products';
import Booknow from './pages/Booknow';
import Bookings from './pages/Bookings';
import Contacts from './pages/Contacts';
import About from './pages/About';
import Cart from './pages/Cart';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import { ForgotPassword } from './pages/ForgotPassword';
import Profile from './pages/Profile';
import Schedule from './components/Schedule';
import Admin from './pages/Admin';
import BlogViewer from './components/BlogViewer';

function App() {


  return (
    <>
 
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/service" element={<Service />} />
          <Route path="/product" element={<Products />} />
          <Route path="/booknow" element={<Booknow />} />
          <Route path="/booking" element={<Bookings />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contacts />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/schedule" element={<Schedule />} />
          
          <Route path="/blogview" element={<BlogViewer />} />
          {/* Router riêng dành cho admin và manager */}
          <Route path="/admin-sign" element={<SignInPage />} />
          <Route path="/admin" element={<PrivateRoute element={<Admin />} requiredRole={"admin"} />} />
          {/* Router riêng dành cho employee */}
        </Routes>
      </AuthProvider>
    </>
  );
}

export default App;
