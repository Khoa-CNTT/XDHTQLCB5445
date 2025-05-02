import { Button, Tooltip } from "antd";
import React, { useMemo, useState } from "react";
import { FaCartPlus } from "react-icons/fa6";
import { IoEyeOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const OneProduct = ({
  title,
  price,
  description,
  image,
  productId,
  onAddToCart,
}) => {
  const [arrow, setArrow] = useState("Show");
  const mergedArrow = useMemo(() => {
    if (arrow === "Hide") {
      return false;
    }
    if (arrow === "Show") {
      return true;
    }
    return {
      pointAtCenter: true,
    };
  }, [arrow]);

  return (
    <div className="relative h-[500px] w-[320px] group  ">
      <div className="bg-white h-[320px] w-[320px] p-4 border  group overflow-hidden relative transition-all duration-300 ">
        <motion.img
          whileHover={{ scale: 1.2 }}
          src={image}
          alt={title}
          className="w-full h-56 object-cover rounded-lg transition-all duration-300 "
        />
        <div className="absolute top-3  right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <Tooltip
            placement="leftTop"
            title="Thêm sản phẩm"
            arrow={mergedArrow}
          >
            <FaCartPlus
              onClick={() => onAddToCart(productId)}
              className="h-[28px] mt-[10px] w-[28px] border border-black  opacity-60"
            />
          </Tooltip>
          <Tooltip
            placement="leftTop"
            title="Xem chi tiết sản phẩm"
            arrow={mergedArrow}
          >
            <Link to={`/product/${productId}`}>
              <IoEyeOutline className="h-[28px] mt-[10px] w-[28px]  border border-black opacity-60" />
            </Link>
          </Tooltip>
        </div>
        <div className="absolute opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="absolute left-[-20px] top-[30px] mt-2 bg-slate-500 h-[60px] w-[350px] m-auto text-center">
            <button
              onClick={() => onAddToCart(productId)}
              className="h-[40px] w-[350px] text-white "
            >
              Thêm vào giỏ hàng
            </button>
          </div>
        </div>
      </div>
      <div className="absolute text-black  bottom-0 left-0 right-0 top-[350px] bg-white  text-center transition-all duration-300 group-hover:bottom-0">
        <h3 className="text-xl font-semibold text-black mt-2 truncate max-w-xs">
          {title}
        </h3>
        <p className="text-black mt-2 truncate max-w-xs">{description}</p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-black font-bold">Giá: {price} VNĐ</span>
        </div>
      </div>
    </div>
  );
};

export default OneProduct;
