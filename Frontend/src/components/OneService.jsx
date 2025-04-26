import React from 'react';
<<<<<<< HEAD
import { Link } from 'react-router-dom'; // Thêm import Link

const OneService = (props) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-md">
            <img src={props.image} alt={props.name} className="w-full h-56 object-cover rounded-lg" />
            <div className="flex justify-between items-center mt-4">
                <span className="text-gray-600">{props.duration} phút</span>
                <span className="text-maincolor font-bold">${props.price}</span>
            </div>
            <h3 className="text-xl font-semibold text-maincolor mt-2">{props.name}</h3>
            <p className="text-gray-600 mt-2">{props.description}</p>
            <Link to={`/service/${props.id}`} className="text-maincolor mt-4 flex items-center">
                View Details <span className="ml-2 material-icons">arrow_forward</span>
            </Link>
        </div>
    );
};

export default OneService;
=======
import { Link, useNavigate } from 'react-router-dom';
import { Button } from 'antd';

const OneService = ({ name, title, price, duration, description, image, id }) => {
  const navigate = useNavigate();

  const handleBooking = () => {
    navigate(`/book-service/${id}`);
  };

  return (
    <div className="bg-white m-au h-[354px] w-[310px] rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/service/${id}`}>
        <img src={image} alt={name} className="w-full h-48 object-cover" />
      </Link>
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{name}</h3>
        <p className="text-gray-600 mb-2">{title}</p>
        <p className="text-gray-700 mb-2 truncate max-w-xs">{description}</p>
        <div className="flex justify-between items-center mb-4">
          <span className="font-bold text-lg text-maincolor">{price.toLocaleString()} VNĐ</span>
          <span className="text-gray-500">{duration} phút</span>
        </div>
        <Link to={`/service/${id}`} className="text-maincolor mt-4 flex items-center">
          Xem chi tiết <span className="ml-2 material-icons">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
};

export default OneService;
>>>>>>> c1949cc (Bao cao lan 3)
