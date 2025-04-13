import React, { useState } from 'react';

const eventsData = [
  { id: 1, title: 'Họp nhóm', date: '2025-03-10T09:00:00' },
  { id: 2, title: 'Gọi điện với khách hàng', date: '2025-03-11T11:00:00' },
  { id: 3, title: 'Làm việc dự án', date: '2025-03-12T14:00:00' },
  { id: 4, title: 'Kiểm tra email', date: '2025-03-16T16:00:00' },
  { id: 5, title: 'Báo cáo tiến độ', date: '2025-03-13T10:00:00' },
];
const hours = Array.from({ length: 10 }, (_, i) => i + 8);
const days = [ "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7","Chủ nhật"];

const Schedule = () => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [ShowSchedule, setShowSchedule] = useState(null);

  const filteredEvents = eventsData
    .filter(event => filter === "all" || new Date(event.date).getDay() === parseInt(filter))
    .filter(event => event.title.toLowerCase().includes(search.toLowerCase()))
    .filter(event => !dateFilter || event.date.startsWith(dateFilter));

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-6">Lịch làm việc</h1>
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-6 w-full max-w-4xl">
        <input
          type="text"
          placeholder="Tìm kiếm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-md p-3 flex-1 w-full sm:w-auto"
        />
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="border border-gray-300 rounded-md p-3"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 rounded-md p-3"
        >
          <option value="all">Tất cả</option>
          <option value="1">Thứ 2</option>
          <option value="2">Thứ 3</option>
          <option value="3">Thứ 4</option>
          <option value="4">Thứ 5</option>
          <option value="5">Thứ 6</option>
          <option value="6">Thứ 7</option>
          <option value="0">Chủ nhật</option>
        </select>
      </div>
      <div className="overflow-x-auto w-full max-w-5xl">
        <table className="w-full border-collapse border border-gray-300 text-center">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 w-[100px]">Giờ \ Ngày</th>
              {days.map((day, index) => (
                <th key={index} className="border px-4 py-2">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hours.map(hour => (
              <tr key={hour} className="hover:bg-gray-50">
                <td className="border px-4 py-2 font-semibold">{hour}:00</td>
                {days.map((_, dayIndex) => {
                  const event = filteredEvents.find(event => {
                    const eventDate = new Date(event.date);
                    return eventDate.getHours() === hour && eventDate.getDay() === dayIndex;
                  });
                  return (
                    <td 
                      key={dayIndex} 
                      className={`border px-4 py-2 w-[100px] h-[100px] ${event ? 'bg-green-300 cursor-pointer' : 'bg-white'}`}
                      onClick={() => event && setShowSchedule(event)}
                    >
                      {event ? event.title : "-"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 font-semibold">
        Tổng số sự kiện: {filteredEvents.length}
      </div>
      {ShowSchedule && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50" onClick={() => setShowSchedule(null)}>
          <div className="bg-white p-6 rounded-lg shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4">Chi tiết sự kiện</h2>
            <p><strong>ID:</strong> {ShowSchedule.id}</p>
            <p><strong>Tiêu đề:</strong> {ShowSchedule.title}</p>
            <p><strong>Thời gian:</strong> {new Date(ShowSchedule.date).toLocaleString()}</p>
            <button className="mt-4 bg-red-500 text-white px-4 py-2 rounded" onClick={() => setShowSchedule(null)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;