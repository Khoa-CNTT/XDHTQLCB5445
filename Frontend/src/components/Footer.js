
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
    </footer>
  );
};

export default Footer;
