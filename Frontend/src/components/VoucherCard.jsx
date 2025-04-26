import React from 'react';

const VoucherCard = ({ voucher, onSaveVoucher }) => {
  const isExpired = voucher.tags.includes('Hết hạn');

  return (
    <div className="min-h-[393px] bg-white rounded-lg shadow-md overflow-hidden relative">
      <img src={voucher.image} alt={voucher.title} className="w-full h-40 object-cover" />
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          {voucher.tags.map((tag, index) => (
            <span
              key={index}
              className={`text-xs px-2 py-1 rounded-full ${
                tag === 'Hết hạn' ? 'bg-gray-200 text-gray-600' : 'bg-blue-100 text-blue-600'
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
        <h3 className="text-lg font-semibold">{voucher.title}</h3>
        <p className="text-sm text-gray-600">{voucher.discount}</p>
        {voucher.minOrder && <p className="text-sm text-gray-600">{voucher.minOrder}</p>}
        <div className="flex items-center text-green-600 mt-2">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          {voucher.discountPercent}
        </div>
        <p className="text-sm text-gray-500">{voucher.expiry}</p>
        <div className="flex justify-between mt-4">
          {/* <button className="text-gray-600 border border-gray-300 px-3 py-1 rounded-full absolute bottom-5 left-5">
            Chi tiết
          </button> */}
          <button
            onClick={() => !isExpired && onSaveVoucher(voucher)} // Chỉ gọi onSaveVoucher nếu chưa hết hạn
            disabled={isExpired}
            className={`px-3 py-1 rounded-full absolute bottom-5 right-5 border ${
              isExpired
                ? 'text-gray-400 border-gray-300 cursor-not-allowed'
                : 'text-blue-600 border-blue-600 hover:bg-blue-100'
            }`}
          >
            Lưu voucher
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoucherCard;