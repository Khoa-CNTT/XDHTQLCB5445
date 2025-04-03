import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FaSearch } from "react-icons/fa";

const items = [
  "ReactJS",
  "TailwindCSS",
  "JavaScript",
  "TypeScript",
  "Next.js",
  "Node.js",
  "MongoDB",
  "Express.js",
  "Firebase",
  "GraphQL",
];

const SearchComponent = ({ isVisible, onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const searchRef = useRef(null);
  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value) {
      setResults(
        items.filter((item) => item.toLowerCase().includes(value.toLowerCase()))
      );
    } else {
      setResults([]);
    }
  };
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);
  return (
    <div className={`flex inset-0 w-[1534px] ml-[-380px]  items-center justify-center h-[64px] bg-black bg-opacity-30 p-6 transition-opacity ${
      isVisible ? "block opacity-100" : "hidden opacity-0"
    }`} ref={searchRef}>
      <div className="relative w-[1534px] ml-[-40px] mr-[-40px] bg-black bg-opacity-30 h-[64px]">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="relative flex top-2 items-center w-[620px] h-[50px] m-auto"
        >
            <select className="ml-[1px] text-center w-[100px] h-[50px] rounded-l outline-none" name="" id="">
              <option className="" value="">Sản phẩm</option>
              <option value="">Dịch vụ</option>
              <option value="">Tin tức</option>
            </select>
          <input
            type="text"
            value={query}
            onChange={handleSearch}
            placeholder="Tìm kiếm..."
            className="w-[620px] h-[50px] m-auto pl-10 text-lg border border-gray-300 rounded-s focus:outline-none  shadow-sm transition-all"
          />
          <button className="w-[80px] h-[50px] flex items-center justify-center bg-red-800 rounded-r right-0 top-0">
          <FaSearch className=" right-4 text-gray-400" />
          </button>
        </motion.div>
        {results.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg"
          >
            {results.map((item, index) => (
              <li
                key={index}
                className="p-3 cursor-pointer hover:bg-blue-100 transition-all"
              >
                {item}
              </li>
            ))}
          </motion.ul>
        )}
      </div>
    </div>
  );
};

export default SearchComponent;
