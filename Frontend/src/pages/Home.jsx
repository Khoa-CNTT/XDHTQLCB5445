import React from "react";
import Hero from "../components/Hero";
<<<<<<< HEAD
import FeaturedServices from "../components/FeaturedServices";
import Testimonials from "../components/Testimonials";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BlogViewer from "../components/BlogViewer";
import OneProduct  from "../components/OneProduct";
=======
import Header from "../components/Header";
import BlogViewer from "../components/BlogViewer";
import Products from "./Products";
import Service from "./Service";
>>>>>>> c1949cc (Bao cao lan 3)

const Home = () => {
  return (
     <>
<<<<<<< HEAD
      <div className="width-full position-relative z-index-1">
        <Header />
        <Hero />
      </div>

      <FeaturedServices />
      <BlogViewer />
      <OneProduct />
      <Footer />
=======
      <Header />
      <Hero />
      <BlogViewer />
      <Service />
      <Products />
>>>>>>> c1949cc (Bao cao lan 3)
    </>
  );
};

export default Home;
