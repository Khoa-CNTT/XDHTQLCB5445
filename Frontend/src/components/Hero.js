import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllSlides } from '../APIs/bannerApi';

const Hero = () => {
  const [heroSlide, setHeroSlide] = useState(null);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await getAllSlides();
        if (res.success && res.data.length > 0) {
          const activeSlide = res.data.find(slide => slide.isActive) || res.data[0];
          setHeroSlide(activeSlide);
        }
      } catch (error) {
        console.error("Lỗi khi tải slide:", error);
      }
    };

    fetchSlides();
  }, []);

  return (
    <section className="flex items-center justify-between p-0 bg-gray-100">
      <div className="max-w-lg">
        <span className="text-sm text-gray-500 uppercase">
          {heroSlide?.title || "Luxury Spa Experience"}
        </span>
        <h1 className="text-5xl font-bold text-maincolor mt-2">
          Discover True Serenity for Body and Mind
        </h1>
        <p className="text-gray-600 mt-4">
          Experience the perfect blend of traditional techniques and modern AI-driven innovations for ultimate relaxation and rejuvenation.
        </p>
        <div className="mt-6 flex space-x-4">
          <Link to="booknow">
            <button className="bg-maincolor text-white px-6 py-3 rounded-md hover:bg-blue-800 flex items-center">
              Book Appointment <span className="ml-2 material-icons">arrow_forward</span>
            </button>
          </Link>
          <button className="text-maincolor hover:underline">AI Consultation</button>
        </div>
      </div>
      <div className="flex-1 top-0 flex justify-center">
        {heroSlide?.image ? (
          <img
            src={heroSlide.image}
            alt={heroSlide.title}
            className="rounded-lg "
          />
        ) : (
          <img
            src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=2070&auto=format&fit=crop"
            alt="Spa products"
            className="rounded-lg "
          />
        )}
      </div>
    </section>
  );
};

export default Hero;
