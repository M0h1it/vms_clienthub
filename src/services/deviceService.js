import api from "../api/api";
import { getOfficeId } from "../utils/auth";

export const getDevices = async () => {

  const officeId = getOfficeId();

  const res = await api.get(`/devices/office/${officeId}`);

  return res.data.devices || res.data.data || [];

};

export const createDevice = async (data) => {

  const res = await api.post("/devices", data);

  return res.data;

};

export const updateDevice = async (id, data) => {

  const res = await api.put(`/devices/${id}`, data);

  return res.data;

};

export const deleteDevice = async (id) => {

  const res = await api.delete(`/devices/${id}`);

  return res.data;

};