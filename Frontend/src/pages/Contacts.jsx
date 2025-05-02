import React from 'react';

const Contacts = () => {
  const contactData = [
    { id: 1, name: 'Đỗ Cao Thắng', image: 'https://via.placeholder.com/150', job: 'Trưởng nhóm' },
    { id: 2, name: 'Lê Ngọc Thanh Nam', image: 'https://via.placeholder.com/150', job: 'Thành viên' },
    { id: 3, name: 'Huỳnh Hồng Sơn', image: 'https://via.placeholder.com/150', job: 'Thành viên' },
    { id: 4, name: 'Võ Duy Thuyết', image: 'https://via.placeholder.com/150', job: 'Thành viên' },
    { id: 5, name: 'Trần Văn Tín', image: 'https://via.placeholder.com/150', job: 'Thành viên' },
  ];

  return (
    <div className="p-6 m-auto">
      <nav>
        <ul className="flex">
          <li><a href="/" className="text-blue-500 hover:underline">Trang chủ</a> &gt;</li>
          <li><a href="/contact" className="text-blue-500 hover:underline">Sở hữu</a>&gt;</li>
        </ul>
      </nav>
      <h1 className="text-center font-bold text-3xl mb-8 text-gray-900">Đây là những thành viên tham gia phát triển dự án</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {contactData.map((contact) => (
          <div
            key={contact.id}
            className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <img
              src={contact.image}
              alt={contact.name}
              className="w-full h-40 object-cover rounded-md mb-4"
            />
            <h2 className="text-center font-semibold text-lg text-gray-800">{contact.name}</h2>
            <p className="text-center text-gray-500">{contact.job}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 p-6 bg-gray-100 rounded-lg shadow-md">
        <p className="text-center text-lg font-medium text-gray-700">
          Đây là nhóm 5 thành viên của chúng tôi, những người đã làm việc chăm chỉ để phát triển dự án này. Chúng tôi rất vui được giới thiệu với bạn và hy vọng bạn sẽ thích dự án này!
        </p>
      </div>
    </div>
  );
};

export default Contacts;
