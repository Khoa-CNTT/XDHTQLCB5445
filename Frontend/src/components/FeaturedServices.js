import React from 'react';
import { Link } from 'react-router-dom';

const FeaturedServices = () => {
    const services = [
        { title: 'Swedish Massage', price: 85, duration: '60 min', description: 'Our signature massage uses gentle to firm pressure to release tension, ease muscle pain, a...', image: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?q=80&w=2070&auto=format&fit=crop' },
        { title: 'Hydrating Facial', price: 95, duration: '75 min', description: 'Restore moisture and radiance to dry, dehydrated skin with our nourishing facial treatment.', image: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?q=80&w=2070&auto=format&fit=crop' },
        { title: 'Hot Stone Therapy', price: 110, duration: '90 min', description: 'Smooth, heated basalt stones and aromatic oils relieve deep muscle tension and improve...', image: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?q=80&w=2070&auto=format&fit=crop' },
    ];

    return (
        <section className="p-10">
            <h2 className="text-3xl font-bold text-maincolor text-center">Our Featured Services</h2>
            <p className="text-gray-600 text-center mt-2">Indulge in our most popular treatments, designed to provide the ultimate spa experience tailored to your needs.</p>
            <div className="grid grid-cols-3 gap-6 mt-8">
                {services.map((service, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow-md">
                        <img src={service.image} alt={service.title} className="w-full h-40 object-cover rounded-lg" />
                        <div className="flex justify-between items-center mt-4">
                            <span className="text-gray-600">{service.duration}</span>
                            <span className="text-maincolor font-bold">${service.price}</span>
                        </div>
                        <h3 className="text-xl font-semibold text-maincolor mt-2">{service.title}</h3>
                        <p className="text-gray-600 mt-2">{service.description}</p>
                        <button className="text-maincolor hover:underline mt-4 flex items-center">
                            View Details <span className="ml-2 material-icons">arrow_forward</span>
                        </button>
                    </div>
                ))}
            </div>
            <div className="text-center mt-8">
                <Link to="/service">
                    <button className="bg-maincolor text-white px-6 py-3 rounded-md hover:bg-blue-800 flex items-center mx-auto">
                        View All Services <span className="ml-2 material-icons">arrow_forward</span>
                    </button>
                </Link>
            </div>
        </section>
    );
};

export default FeaturedServices;