import React from 'react';
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