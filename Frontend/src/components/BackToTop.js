import React, { useEffect, useState } from "react";
import { IoArrowDownSharp, IoArrowUpSharp } from "react-icons/io5";

const BackToTop = () => {
  const [scrollingDown, setScrollingDown] = useState(true); 
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setVisible(true);
      } else {
        setVisible(false);
      }
      if (window.scrollY > 400) {
        setScrollingDown(false);
      } else {
        setScrollingDown(true); 
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.body.scrollHeight, 
      behavior: "smooth",
    });
  };

  return (
    <div
      className={`${visible ? "block" : "hidden"}`}
      style={{
        position: "fixed",
        bottom: "200px",
        right: "20px",
        zIndex: 1000,
        transition: "bottom 0.3s ease-in-out",
      }}
    >
      <button
        onClick={scrollingDown ? scrollToBottom : scrollToTop}
        className={`back-to-top-btn ${scrollingDown ? "slide-down" : "slide-up"} bg-black opacity-60`}
        aria-label="Back to top"
      >
        {scrollingDown ? (
            <IoArrowDownSharp className="w-6 h-6" />
        ) : (
            <IoArrowUpSharp className="w-6 h-6" />
        )}
      </button>
    </div>
  );
};

export default BackToTop;
