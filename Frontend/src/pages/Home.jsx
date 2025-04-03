import React from "react";
import Hero from "../components/Hero";
import FeaturedServices from "../components/FeaturedServices";
import Testimonials from "../components/Testimonials";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BlogViewer from "../components/BlogViewer";
import OneProduct  from "../components/OneProduct";

const Home = () => {
  return (
     <>
      <div className="width-full position-relative z-index-1">
        <Header />
        <Hero />
      </div>

      <FeaturedServices />
      <BlogViewer />
      <OneProduct />
      <Footer />
    </>
  );
};

export default Home;
