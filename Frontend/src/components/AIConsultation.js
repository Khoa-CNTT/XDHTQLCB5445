import React from 'react';

const AIConsultation = () => {
  return (
    <section className="flex items-center justify-between p-10 bg-gray-100">
      <div className="max-w-lg">
        <span className="text-sm text-gray-500 uppercase">AI-Powered Skincare</span>
        <h2 className="text-3xl font-bold text-maincolor mt-2">Personalized Consultations with Our AI Assistant</h2>
        <p className="text-gray-600 mt-4">
          Our advanced AI system analyzes your skin type and concerns to recommend personalized treatments tailored specifically to you. Get expert advice before booking your appointment.
        </p>
        <ul className="mt-4 space-y-2">
          <li className="flex items-center text-gray-600">
            <span className="material-icons text-maincolor mr-2">check_circle</span> AI-Powered Skin Analysis
          </li>
          <li className="flex items-center text-gray-600">
            <span className="material-icons text-maincolor mr-2">check_circle</span> Luxury Experience
          </li>
          <li className="flex items-center text-gray-600">
            <span className="material-icons text-maincolor mr-2">check_circle</span> Expert Therapists
          </li>
          <li className="flex items-center text-gray-600">
            <span className="material-icons text-maincolor mr-2">check_circle</span> Online Booking
          </li>
        </ul>
        <button className="bg-maincolor text-white px-6 py-3 rounded-md hover:bg-blue-800 mt-6">Start AI Consultation</button>
      </div>
      <div>
        <img src="https://via.placeholder.com/400x300" alt="AI Consultation" className="rounded-lg" />
      </div>
    </section>
  );
};

export default AIConsultation;