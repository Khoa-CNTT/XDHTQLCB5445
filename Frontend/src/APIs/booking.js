import axios from 'axios';
import moment from 'moment';  // Add this line at the top of the file


// Đặt base URL của API
// const API_URL = 'https://backend-fu3h.onrender.com/api/booking';
const API_URL = 'http://localhost:4000/api/booking'; 

export const bookService = async (bookingData) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/add`, bookingData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      timeout: 10000
    });   
    return response.data;
 
};

export const getAllBookings = async () => {
    const response = await axios.get(`${API_URL}/list`);
    return response.data.data; 
};

export const updateBookingStatus = async (bookingId, status) => {
      const response = await axios.put(
          `${API_URL}/status`, 
          { bookingId, ...status }
      );
      return response.data;

};
export const getBookingsByEmployeeId = async (employeeId) => {
  const res = await axios.get(`${API_URL}/employee/${employeeId}`);
  return res.data.data;
};
export const getBookingUser = async (token) => {
  const response = await axios.get(
      `${API_URL}/bookings/user`,
      {
          headers: {
              Authorization: `Bearer ${token}`,
          },
      }
  );
      return response.data.data;
};
// Hàm cập nhật booking
export const updateBooking = async (id, bookingData) => {
    const response = await axios.put(`${API_URL}/update/${id}`, bookingData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;

};

export const deleteBooking = async (id) => {
    const response = await axios.delete(`${API_URL}/delete/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
};

export const checkEmployeeAvailability = async (employeeId, date, time, duration) => {
    const response = await axios.get(`${API_URL}/check-availability`, {
      params: { 
        employeeId, 
        date: moment(date).format('YYYY-MM-DD'), 
        time: moment(time).format('HH:mm'),
        duration 
      }
    });
    return response.data;

};
