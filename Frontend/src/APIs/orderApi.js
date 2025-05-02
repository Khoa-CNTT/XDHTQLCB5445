import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://backend-fu3h.onrender.com';
// const API_URL = 'http://localhost:4000'; // Replace with your local URL

export const getOrders = async (token) => {
      const response = await axios.get(
          `${API_URL}/api/order/userorders`,
          {
              headers: {
                  Authorization: `Bearer ${token}`,
              },
          }
      );
          return response.data.data;
};
export const listOrder = async () => {
   
        const response = await axios.get(`${API_URL}/api/order/list`);
        return response.data;
   
};
export const getOrderDetail = async (orderId, token) => {
        const response = await axios.get(`${API_URL}/api/order/${orderId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
  
};
export const placeOrder = async (orderData, token) => {
      const response = await axios.post(
          `${API_URL}/api/order/place`,
          orderData,
          {
              headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json'
              }
          }
      );
      return response.data;
 
};


export const updateOrderStatus = async (orderId, statusData) => {
        const response = await axios.put(
            `${API_URL}/api/order/status`, 
            { orderId, ...statusData }
        );
        console.log('Update Status Response:', response.data); // Debug log
        return response.data;
  
};
export const deleteOrder = async (data) => {
      const response = await axios.delete(`${API_URL}/api/order/delete-order`, data);
      return response.data;
  };

  