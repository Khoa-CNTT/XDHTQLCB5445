import axios from "axios";

const manager = axios.create({
  baseURL: "http://localhost:4000/api/",
  headers: { "Content-Type": "application/json" }
});

export const createManager = async (data) => {
  const response = await manager.post("manager/add", data);
  return response.data;
};

export const updateManager = async (id, data) => {
  const response = await manager.put(`manager/update/${id}`, data);
  return response.data;
};

export const removeManager = async (id) => {
  const response = await manager.delete(`manager/delete/${id}`);
  return response.data;
};

export const listmanager = async () => {
    const response = await manager.get("manager/list");
    return response.data; 
  };
  
