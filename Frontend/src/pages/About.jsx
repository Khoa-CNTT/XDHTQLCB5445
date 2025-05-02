import React, { useEffect, useState } from 'react';
import { listBranch } from '../APIs/brand';
import Header from '../components/Header';
import anhbrand from '../img/anhbrand.png'; 
import leftImage from '../img/nv1.webp.png';  // ảnh bên trái
import rightImage from '../img/nv2.webp.png'; // ảnh bên phải

const About = () => {
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const data = await listBranch();
        if (data.success) {
          setBranches(data.data);
        }
      } catch (error) {}
    };

    fetchBranches();
  }, []);

  return (
    <>
      <Header className="!bg-white !text-black !shadow-md" />
      <div className="flex justify-center relative py-10 mt-[40px] px-4">

        <div className="fixed lg:block  left-[20px] top-10 h-[100%] z-0">
          <img src={leftImage} alt="Decor left" className="w-[70%] h-full" />
        </div>

        <div className="container mx-auto z-10">
          <h2 className="text-3xl font-bold text-center text-maincolor mb-10">Hệ Thống Chi Nhánh SerenitySpa</h2>
          <div className="grid grid-row-1 sm:grid-row-2 lg:grid-row-3 gap-8">
            {branches.map((branch, index) => (
              <div
                key={index}
                className="bg-white w-[50%] m-auto rounded-2xl shadow-lg overflow-hidden transition-transform hover:-translate-y-1 duration-300"
              >
                <img
                  src={anhbrand}
                  alt={branch.BranchName}
                  className="w-[80%] h-[500px] object-cover m-auto"
                />
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{branch.BranchName}</h3>
                  <p className="text-gray-600 mb-1"><strong>Địa chỉ:</strong> {branch.Address}</p>
                  <p className="text-gray-600"><strong>Điện thoại:</strong> {branch.PhoneNumber}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:block fixed right-[-125px] top-10 z-0 h-[100%]">
          <img src={rightImage} alt="Decor right" className="w-[70%] h-full " />
        </div>
      </div>
    </>
  );
};

export default About;
