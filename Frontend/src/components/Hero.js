import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="flex items-center justify-between p-10 bg-gray-100">
      <div className="max-w-lg">
        <span className="text-sm text-gray-500 uppercase">Luxury Spa Experience</span>
        <h1 className="text-5xl font-bold text-maincolor mt-2">Discover True Serenity for Body and Mind</h1>
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
      <div>
        <img src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=2070&auto=format&fit=crop" alt="Spa products" className="rounded-lg" />
      </div>
    </section>
  );
};

export default Hero;