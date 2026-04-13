import api from "../api/api";

export const getEmployees = () => {
  return api.get("/employees");
};

export const createEmployee = (data) => {
  return api.post("/employees", data);
};

export const deleteEmployee = (id) => {
  return api.delete(`/employees/${id}`);
};

export const updateEmployee = (id, data) => {
  return api.put(`/employees/${id}`, data);
};