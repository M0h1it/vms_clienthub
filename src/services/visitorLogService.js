import api from "../api/api";

export const getLogs = () => api.get("/visitor-logs");

export const checkOut = (id) => api.put(`/visitor-logs/checkout/${id}`);