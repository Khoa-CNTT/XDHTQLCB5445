import React, { useEffect, useState } from 'react';
import { getAllBookings } from '../APIs/booking';
import { getUser } from '../APIs/userApi';
import moment from 'moment';
import { errorToast } from '../utils/toast';
import { List, Tag } from 'antd';
import { jwtDecode } from 'jwt-decode';
import { Link } from 'react-router-dom';

const hours = Array.from({ length: 12 }, (_, i) => i + 8);
const daysName = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

const Schedule = ({ employeeViewId }) => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState(moment().format("YYYY-MM-DD"));
  const [showSchedule, setShowSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [employeeId, setEmployeeId] = useState('');
  const [data, setData] = useState([]);
  const [isEmployee, setIsEmployee] = useState(false);
  const [userRole, setUserRole] = useState('');
  const token = localStorage.getItem('token');

  const getStatusTag = (status) => {
    const statusMap = {
      pending: { color: 'orange', text: 'Đang xử lý' },
      confirmed: { color: 'green', text: 'Đã xác nhận' },
      completed: { color: 'blue', text: 'Hoàn thành' },
      cancelled: { color: 'red', text: 'Đã hủy' },
      'Đang xử lý': { color: 'orange', text: 'Đang xử lý' },
      'Đã xác nhận': { color: 'green', text: 'Đã xác nhận' },
      'Hoàn thành': { color: 'blue', text: 'Hoàn thành' },
      'Đã hủy': { color: 'red', text: 'Đã hủy' },
    };
    const statusInfo = statusMap[status] || { color: 'gray', text: status };
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  const formatPrice = (price) => {
    return price
      ? new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(price)
      : 'Liên hệ';
  };

  const getNext7DaysFromDate = (dateStr) => {
    return Array.from({ length: 7 }, (_, i) =>
      moment(dateStr).clone().add(i, 'days').format('YYYY-MM-DD')
    );
  };

  const fetchBookingsALL = async () => {
    try {
      const res = await getAllBookings();
      const bookingsData = res.map((booking) => ({
        ...booking,
        date: moment(booking.date).format('YYYY-MM-DD'),
        time: booking.time || 'N/A',
        status: booking.status || 'Đang xử lý',
      }));
      const transformed = bookingsData
        .filter(b => {
          if (employeeViewId) {
            return b.employee?.UserID?._id === employeeViewId;
          }
          if (isEmployee && employeeId) {
            return b.employee?.UserID?._id === employeeId;
          }
          return false;
        })
        .map(b => {
          const [hourStr] = b.time.split(':');
          return {
            ...b,
            title: b.service?.name || 'Dịch vụ',
            date: `${b.date}T${hourStr.padStart(2, '0')}:00:00`,
          };
        });

      setData(transformed);
    } catch (error) {
      errorToast('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    if (employeeViewId) return; 
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.id;
        const userData = await getUser(userId);
        if (userData.success) {
          setUserRole(userData.data.role);
          if (userData.data.role === 'employee') {
            setEmployeeId(userData.data._id); 
            setIsEmployee(true);
          } else {
            setIsEmployee(false);
          }
        }
      } catch (error) {
        errorToast('Lỗi khi tải thông tin người dùng');
      }
    }
  };

  useEffect(() => {
    if (employeeViewId) {
      setEmployeeId(employeeViewId);
    } else {
      fetchUserData();
    }
    fetchBookingsALL();
  }, [employeeId, employeeViewId, token]);

  const currentWeekDays = dateFilter ? getNext7DaysFromDate(dateFilter) : [];

  const filteredEvents = data
  .filter(event => {
    const eventDate = moment(event.date).format('YYYY-MM-DD');
    return currentWeekDays.includes(eventDate);
  })
  .filter(event => filter === "all" || moment(event.date).day() === parseInt(filter))
  .filter(event => event.title && event.title.toLowerCase().includes(search.toLowerCase()));

  const getEventByHourAndDay = (hour, dateStr) => {
    return filteredEvents.find(event => {
      const eventDate = moment(event.date);
      return eventDate.hour() === hour && eventDate.format('YYYY-MM-DD') === dateStr;
    });
  };

  return (
    <>
       <nav className="text-sm text-gray-500 mt-4">
                 <Link to="/" className="hover:underline">
                   Trang chủ
                 </Link>{" "}
                 &gt;{" "}
                 <Link  className="hover:underline">
                   Lịch làm việc
                 </Link>{" "}
                 &gt;{" "}
               </nav>
    <div className="w-full h-full flex flex-col items-center justify-center p-6">

      <h1 className="mt-14 text-3xl font-bold mb-6">Lịch làm việc</h1>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-6 w-full max-w-5xl">
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
          {daysName.map((d, i) => (
            <option key={i} value={i}>{d}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto w-full max-w-6xl">
        <table className="w-full border-collapse border border-gray-300 text-center">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 w-[100px]">Giờ \ Ngày</th>
              {currentWeekDays.map((dayStr, index) => (
                <th key={index} className="border px-4 py-2">
                  {daysName[moment(dayStr).day()]} <br /> {moment(dayStr).format("DD/MM")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hours.map(hour => (
              <tr key={hour} className="hover:bg-gray-50">
                <td className="border px-4 py-2 font-semibold">{hour}:00</td>
                {currentWeekDays.map((dayStr, dayIndex) => {
                  const event = getEventByHourAndDay(hour, dayStr);
                  return (
                    <td
                      key={dayIndex}
                      className={`border px-2 py-2 w-[100px] h-[100px] ${event ? 'bg-green-300 cursor-pointer' : 'bg-white'}`}
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

      {showSchedule && (
        <div
          className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setShowSchedule(null)}
        >
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-xl w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4">Chi tiết sự kiện</h2>
            <List
              itemLayout="vertical"
              dataSource={[showSchedule]}
              renderItem={(booking) => (
                <List.Item className="bg-white rounded-lg shadow-sm mb-4 p-4">
                  <List.Item.Meta
                    title={<span className="font-medium text-lg">{booking.service?.name || 'Dịch vụ không xác định'}</span>}
                    description={
                      <div className="space-y-1">
                        <div><strong>Ngày hẹn:</strong> {moment(booking.date).format('DD/MM/YYYY')} - {booking.time}</div>
                        <div><strong>Chi nhánh:</strong> {booking.branch?.BranchName || 'Không xác định'}</div>
                        <div><strong>Nhân viên:</strong> {booking.employee?.UserID?.firstName || 'Không xác định'}</div>
                        <div><strong>Trạng thái:</strong> {getStatusTag(booking.status)}</div>
                        <div><strong>Giá:</strong> {formatPrice(booking.service?.price)}</div>
                        <div><strong>Ngày đăng ký:</strong> {moment(booking.createdAt).format('DD/MM/YYYY HH:mm')}</div>
                      </div>
                    }
                  />
                  {booking.notes && (
                    <div className="mt-2">
                      <p className="font-medium">Ghi chú:</p>
                      <p className="text-gray-600">{booking.notes}</p>
                    </div>
                  )}
                </List.Item>
              )}
            />
            <button
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
              onClick={() => setShowSchedule(null)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default Schedule;
