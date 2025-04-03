import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-footcolor text-white p-10">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Ready to Experience True Relaxation?</h2>
        <p className="mt-4">
          Book your appointment today and discover why our clients keep coming back. Whether you’re looking for relaxation, rejuvenation, or a little self-care, we have the perfect treatment for you.
        </p>
        <Link to="/booknow">
            <button className="bg-white text-maincolor px-6 py-3 rounded-md hover:bg-gray-200 mt-6 flex items-center mx-auto">
            Book Now <span className="ml-2 material-icons">arrow_forward</span>
            </button>
        </Link>
      </div>
      <div className="grid grid-cols-4 gap-6 mt-10">
        <div>
          <h3 className="text-xl font-bold">SerenitySpa</h3>
          <p className="mt-2">Experience the perfect blend of traditional techniques and modern innovations for ultimate relaxation and rejuvenation.</p>
          <div className="flex space-x-4 mt-4">
            <span className="material-icons">instagram</span>
            <span className="material-icons">facebook</span>
            <span className="material-icons">twitter</span>
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold">Quick Links</h3>
          <ul className="mt-2 space-y-2">
            <li><a href="#" className="hover:underline">Home</a></li>
            <li><a href="#" className="hover:underline">About Us</a></li>
            <li><a href="#" className="hover:underline">Services</a></li>
            <li><a href="#" className="hover:underline">Book Appointment</a></li>
            <li><a href="#" className="hover:underline">AI Consultation</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-bold">Services</h3>
          <ul className="mt-2 space-y-2">
            <li><a href="#" className="hover:underline">Massage Therapy</a></li>
            <li><a href="#" className="hover:underline">Facial Treatments</a></li>
            <li><a href="#" className="hover:underline">Body Treatments</a></li>
            <li><a href="#" className="hover:underline">Spa Packages</a></li>
            <li><a href="#" className="hover:underline">Seasonal Specials</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-bold">Contact Us</h3>
          <ul className="mt-2 space-y-2">
            <li>123 Tranquility Lane, Serenity City, SC 12345</li>
            <li>+1 (555) 123-4567</li>
            <li>contact@serenityspa.com</li>
          </ul>
        </div>
      </div>
      <p className="text-center mt-10">© 2025 SerenitySpa. All rights reserved.</p>
    </footer>
  );
};

export default Footer;