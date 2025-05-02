import axios from "axios";
const employee = axios.create({
  baseURL: "https://backend-fu3h.onrender.com/api/",
    // baseURL: "http://localhost:4000/api/",
  headers: { "Content-Type": "application/json" }
});

export const createEmployee = async (data) => {
    const response = await employee.post("employee/add", data);
    return response.data;
};

export const updateEmployee = async (id, data) => {
    const response = await employee.put(`employee/update/${id}`, data);
    return response.data;
};

export const removeEmployee = async (id) => {
    const response = await employee.delete(`employee/delete/${id}`);
    return response.data;
};

export const listEmployee = async () => {
    const response = await employee.get("employee/list");
    return response.data;
};
export const getEmployeeBookings = async (employeeId, date) => {
    const response = await employee.get(`employee/${employeeId}/bookings`, {
      params: { date }
    });
    return response.data;
};

