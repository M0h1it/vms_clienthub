import api from "../api/api";

export const createSchedule = async (data) => {

  const res = await api.post("/schedules", {
    device_id: data.device_id,
    office_id: data.office_id,
    creative_id: data.creative_id,
    start_time: data.start_time,
    end_time: data.end_time,
    duration: data.duration,
    mode: data.mode
  });

  return res.data;
};

export const updateSchedule = async (id,data)=>{

  const res = await api.put(`/schedules/${id}`,data);

  return res.data;

};

export const deleteSchedule = async(id)=>{

  const res = await api.delete(`/schedules/${id}`);

  return res.data;

};

export const getSchedulesByDevice = async(deviceId)=>{

  const res = await api.get(`/schedules/device/${deviceId}`);

  return res.data.data;

};

export const createBulkSchedule = async (data) => {
  const res = await api.post("/schedules/bulk", data);
  return res.data;
};

export const deleteSchedulesByDevice = async (deviceIds) => {
  const res = await api.post("/schedules/delete-by-device", {
    device_ids: deviceIds,
  });
  return res.data;
};