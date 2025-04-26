<<<<<<< HEAD
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
=======

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllServices } from "../APIs/ServiceAPI";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await getAllServices();
        const uniqueCategories = [
          ...new Set(response.data.map((service) => service.category)),
        ];
        setCategories(uniqueCategories);
      } catch (error) {}
    };

    fetchServices();
  }, []);

  return (
    <footer className="bg-footcolor text-white p-10">
      <div className="text-center">
        <h2 className="text-3xl font-bold">{t("header.tagline")}</h2>
        <p className="mt-4">{t("header.description")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
        <div>
          <h3 className="text-xl font-bold">{t("header.aboutTitle")}</h3>
          <p className="mt-2">{t("header.aboutDescription")}</p>
          <div className="flex space-x-4 mt-4">
            <span className="material-icons">instagram</span>
            <span className="material-icons">facebook</span>
            <span className="material-icons">tiktok</span>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold">{t("header.exploreTitle")}</h3>
          <ul className="mt-2 space-y-2">
            <li>
              <Link to="/" className="hover:underline">
                {t("header.home")}
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:underline">
                {t("header.about")}
              </Link>
            </li>
            <li>
              <Link to="/services" className="hover:underline">
                {t("header.services")}
              </Link>
            </li>
            <li>
              <Link to="/booknow" className="hover:underline">
                {t("header.bookNow")}
              </Link>
            </li>
            <li>
              <Link to="/consult-ai" className="hover:underline">
                {t("header.consultAI")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-bold">{t("header.servicesTitle")}</h3>
          <ul className="mt-2 space-y-2">
            {categories.length > 0 ? (
              categories.slice(0, 6).map((cat, index) => (
                <li key={index}>
                  <Link to="/services" className="hover:underline">
                    {t(`scheduleTab.filters.${cat.toLowerCase()}`, cat)}
                  </Link>
                </li>
              ))
            ) : (
              <li>{t("header.loading")}</li>
            )}
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-bold">{t("header.connectTitle")}</h3>
          <ul className="mt-2 space-y-2">
            <li>{t("header.address")}</li>
            <li>{t("header.phone")}</li>
            <li>{t("header.email")}</li>
            <li>{t("header.hours")}</li>
          </ul>
        </div>
      </div>

      <p className="text-center mt-10 italic">{t("header.quote")}</p>
      <p className="text-center mt-2">{t("header.copyright")}</p>
>>>>>>> c1949cc (Bao cao lan 3)
    </footer>
  );
};

<<<<<<< HEAD
export default Footer;
=======
export default Footer;
>>>>>>> c1949cc (Bao cao lan 3)
