import React from 'react';

const Booking = () => {
  return (
    <section className="flex items-center justify-between p-10 bg-white">
      {/* Left Side: Booking Form */}
      <div className="max-w-md bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-blue-900">Book Your Appointment</h2>
        <p className="text-gray-600 mt-2">Schedule your spa experience in a few simple steps</p>

        {/* Progress Bar */}
        <div className="flex items-center mt-6">
          <div className="flex flex-col items-center">
            <div className="bg-blue-900 text-white rounded-full w-8 h-8 flex items-center justify-center">1</div>
            <span className="text-gray-600 mt-2">Select Service</span>
          </div>
          <div className="flex-1 h-1 bg-blue-900 mx-2"></div>
          <div className="flex flex-col items-center">
            <div className="bg-gray-300 text-gray-600 rounded-full w-8 h-8 flex items-center justify-center">2</div>
            <span className="text-gray-600 mt-2">Choose Date</span>
          </div>
          <div className="flex-1 h-1 bg-gray-300 mx-2"></div>
          <div className="flex flex-col items-center">
            <div className="bg-gray-300 text-gray-600 rounded-full w-8 h-8 flex items-center justify-center">3</div>
            <span className="text-gray-600 mt-2">Confirm</span>
          </div>
        </div>

        {/* Service Selection */}
        <div className="mt-6">
          <select className="w-full p-3 border rounded-md text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-900">
            <option>Choose a service</option>
            <option>Swedish Massage</option>
            <option>Hydrating Facial</option>
            <option>Hot Stone Therapy</option>
          </select>
        </div>

        {/* Continue Button */}
        <button className="bg-blue-900 text-white px-6 py-3 rounded-md hover:bg-blue-800 mt-6 flex items-center">
          Continue <span className="ml-2 material-icons">arrow_forward</span>
        </button>
      </div>

      {/* Right Side: Description */}
      <div className="max-w-lg">
        <h2 className="text-3xl font-bold text-blue-900">Book Your Appointment in Minutes</h2>
        <p className="text-gray-600 mt-4">
          Our streamlined booking system makes it easy to schedule your perfect spa day. Choose from our range of services, select your preferred date and time, and confirm your appointment instantly.
        </p>
        <p className="text-gray-600 mt-4">
          Need help deciding which treatment is right for you? Start an AI consultation to receive personalized recommendations before booking.
        </p>
        <button className="bg-blue-900 text-white px-6 py-3 rounded-md hover:bg-blue-800 mt-6 flex items-center">
          View All Available Slots <span className="ml-2 material-icons">arrow_forward</span>
        </button>
      </div>
    </section>
  );
};

export default Booking;