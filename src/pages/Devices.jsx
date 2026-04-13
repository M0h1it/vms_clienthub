import { useEffect, useState } from "react";
import {
  getDevices,
  createDevice,
  deleteDevice,
  updateDevice,
} from "../services/deviceService";

import { getOfficeId } from "../utils/auth";
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaSearch,
  FaTv,
  FaMicrochip,
  FaBuilding,
} from "react-icons/fa";
import Swal from "sweetalert2";

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  // Added state for office name (adjust logic if you have a helper to get the name directly)
  const officeId = getOfficeId();

  const [form, setForm] = useState({
    id: null,
    device_name: "",
    office_name: "",
  });

  const loadDevices = async () => {
    try {
      setLoading(true);
      const data = await getDevices();
      setDevices(data || []);
    } catch {
      Swal.fire("Error", "Failed to load devices", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (officeId) loadDevices();
  }, []);

  const openCreateModal = () => {
  setIsEdit(false);

  const officeName = devices.length > 0 ? devices[0].office_name : "Office";

  setForm({
    id: null,
    device_name: "",
    office_name: officeName,
  });

  setShowModal(true);
};

  const openEditModal = (device) => {
    setIsEdit(true);
    setForm({
      id: device.id,
      device_name: device.device_name,
      office_name: device.office_name,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.device_name) {
      Swal.fire("Validation", "Device name required", "warning");
      return;
    }
    try {
      if (isEdit) {
        await updateDevice(form.id, { device_name: form.device_name });
        Swal.fire("Updated", "Device updated", "success");
      } else {
        await createDevice({
          office_id: officeId,
          device_name: form.device_name,
        });
        Swal.fire("Created", "Device registered", "success");
      }
      setShowModal(false);
      loadDevices();
    } catch {
      Swal.fire("Error", "Operation failed", "error");
    }
  };

  const handleDelete = async (id) => {
    const res = await Swal.fire({
      title: "Delete device?",
      text: "This device will be disconnected.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      borderRadius: "15px",
    });
    if (res.isConfirmed) {
      await deleteDevice(id);
      Swal.fire("Deleted", "Device removed", "success");
      loadDevices();
    }
  };

  const filtered = devices.filter((d) =>
    d.device_name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-3 p-md-4 bg-white min-vh-100">
      {/* HEADER SECTION */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold d-flex align-items-center gap-2 m-0">
            <FaMicrochip className="text-primary" /> Devices
          </h3>
          <p className="text-muted small mb-0">
            {devices.length} registered hardware units
          </p>
        </div>

        <button
          className="btn btn-primary shadow-sm px-4 py-2 d-flex align-items-center gap-2"
          onClick={openCreateModal}
          style={{ borderRadius: "12px" }}
        >
          <FaPlus /> <span>Register Device</span>
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="row mb-4">
        <div className="col-12 col-md-5 col-lg-4">
          <div
            className="input-group shadow-sm"
            style={{ borderRadius: "12px", overflow: "hidden" }}
          >
            <span className="input-group-text border-0 bg-light px-3">
              <FaSearch className="text-muted" />
            </span>
            <input
              className="form-control border-0 bg-light py-2"
              placeholder="Search by device name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* GRID SECTION */}
      <div className="row g-3 g-md-4">
        {loading ? (
          <div className="text-center py-5 w-100">
            <div className="spinner-border text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-5 rounded-4 bg-light border-2 border-dashed">
            <FaTv size={50} className="text-muted opacity-25 mb-3" />
            <h5 className="fw-bold">No Devices Found</h5>
            <p className="text-muted">Register a new screen to get started.</p>
          </div>
        ) : (
          filtered.map((d) => (
            <div className="col-12 col-sm-6 col-lg-4" key={d.id}>
              <div
                className="card border-0 shadow-sm h-100"
                style={{ borderRadius: "20px" }}
              >
                <div className="card-body p-4">
                  <div className="d-flex align-items-start justify-content-between mb-3">
                    <div className="bg-primary bg-opacity-10 p-3 rounded-3">
                      <FaTv className="text-primary fs-4" />
                    </div>
                    <span className="badge bg-light text-muted border">
                      ID: {d.id}
                    </span>
                  </div>

                  <h6 className="fw-bold text-dark mb-1">{d.device_name}</h6>
                  <div className="d-flex align-items-center gap-2 text-muted small mb-4">
                    <FaBuilding size={12} /> <span>{d.office_name}</span>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-light flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                      onClick={() => openEditModal(d)}
                      style={{ borderRadius: "10px" }}
                    >
                      <FaEdit className="text-warning" /> Edit
                    </button>
                    <button
                      className="btn btn-light d-flex align-items-center justify-content-center px-3"
                      onClick={() => handleDelete(d.id)}
                      style={{ borderRadius: "10px" }}
                    >
                      <FaTrash className="text-danger" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div
                className="modal-content border-0 shadow-lg"
                style={{ borderRadius: "24px" }}
              >
                <div className="modal-header border-0 px-4 pt-4">
                  <h5 className="fw-bold m-0">
                    {isEdit ? "Update Device" : "Register New Device"}
                  </h5>
                  <button
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  />
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="modal-body px-4">
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-muted text-uppercase">
                        Device Display Name
                      </label>
                      <input
                        className="form-control p-3 border-2 shadow-none"
                        placeholder="e.g. Lobby Entrance Screen"
                        value={form.device_name}
                        onChange={(e) =>
                          setForm({ ...form, device_name: e.target.value })
                        }
                        style={{ borderRadius: "12px" }}
                        required
                      />
                    </div>

                    {/* Read Only Office Field */}
                    <div className="mb-4">
                      <label className="form-label small fw-bold text-muted text-uppercase">
                        Assigned Office
                      </label>
                      <div className="d-flex align-items-center gap-2 text-muted small mb-4">
                        <FaBuilding size={12} />
                        <span>{form.office_name || "Office"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer border-0 px-4 pb-4 mt-2">
                    <button
                      type="button"
                      className="btn btn-light px-4 py-2"
                      onClick={() => setShowModal(false)}
                      style={{ borderRadius: "10px" }}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-primary px-4 py-2 fw-bold"
                      style={{ borderRadius: "10px" }}
                    >
                      {isEdit ? "Update Device" : "Save Device"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
}
