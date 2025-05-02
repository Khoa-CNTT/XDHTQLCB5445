import React from "react";
import Hero from "../components/Hero";
import Header from "../components/Header";
import BlogViewer from "../components/BlogViewer";
import Products from "./Products";
import Service from "./Service";

const Home = () => {
  return (
     <>
      <Header />
      <Hero />
      <BlogViewer />
      <Service />
      <Products />
    </>
  );
};

export default Home;
