import api from "../api/api";
import { getOfficeId } from "../utils/auth";

export const getCreatives = async () => {

  const officeId = getOfficeId();

  const res = await api.get(`/creatives/office/${officeId}`);

  return res.data.data || res.data.creatives || [];

};

export const uploadCreative = async (formData) => {

  const res = await api.post("/creatives", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

  return res.data;

};

export const deleteCreative = async (id) => {

  const res = await api.delete(`/creatives/${id}`);

  return res.data;

};