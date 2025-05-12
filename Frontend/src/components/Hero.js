import React, { useEffect, useState } from 'react';
import { getAllSlides } from '../APIs/bannerApi';

const Hero = () => {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await getAllSlides();
        if (res.success && res.data.length > 0) {
          const activeSlides = res.data.filter(slide => slide.isActive === true);
          setSlides(activeSlides.length > 0 ? activeSlides : res.data);
        }
      } catch (error) {
        
      }
    };
    fetchSlides();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % slides.length);
    }, 3000);

    return () => clearInterval(interval); 
  }, [slides]);

  const currentSlide = slides[currentIndex];

  return (
    <section className="relative w-full h-screen bg-gray-100 overflow-hidden z-10">
      <div className="absolute inset-0 z-0 transition-all duration-1000">
        {currentSlide?.image ? (
          <img
            src={currentSlide.image}
            alt={currentSlide.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={require('../img/banner.jpg')}
            alt="Spa products"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="container mx-auto h-full flex items-center justify-between px-6 relative z-10">
        <div className="max-w-lg text-white">
          <h1 className="text-4xl font-bold mt-2 mb-2">
            {currentSlide?.title}
          </h1>
          <p className="mt-4 leading-relaxed text-justify">
            {currentSlide?.link}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
