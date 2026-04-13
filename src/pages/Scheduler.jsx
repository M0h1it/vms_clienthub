import { useEffect, useState } from "react";
import { getDevices } from "../services/deviceService";
import SchedulePage from "../components/scheduler/SchedulePage";
import {
  FaTv,
  FaCalendarAlt,
  FaCheckCircle,
  FaCircle,
  FaHistory
} from "react-icons/fa";
import Swal from "sweetalert2";

export default function Scheduler() {

  const [devices, setDevices] = useState([]);
  const [device, setDevice] = useState(null);
  const [mode, setMode] = useState("playalong");
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState(null);

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
    loadDevices();
  }, []);

 const selectDevice = async (d) => {

  const res = await Swal.fire({

    title: "Scheduling Strategy",
    text: `How should schedules be applied to ${d.device_name}?`,
    icon: "question",

    showCancelButton: true,

    confirmButtonText: "Overwrite All",
    cancelButtonText: "Play Along",

    confirmButtonColor: "#4e73df",
    cancelButtonColor: "#e74a3b",

    reverseButtons: true

  });

  if (res.dismiss === Swal.DismissReason.backdrop ||
      res.dismiss === Swal.DismissReason.esc) {
    return;
  }

  // PLAY ALONG
  if (!res.isConfirmed) {

    setMode("playalong");
    setDevice(d);
    return;

  }

  // SECOND CONFIRMATION FOR OVERWRITE

  const confirmOverwrite = await Swal.fire({

    title: "Confirm Overwrite",
    text: "This will replace all existing schedules on this device.",
    icon: "warning",

    showCancelButton: true,

    confirmButtonText: "Yes, Overwrite",
    cancelButtonText: "Cancel",

    confirmButtonColor: "#dc3545"

  });

  if (!confirmOverwrite.isConfirmed) return;

  setMode("overwrite");
  setDevice(d);

};

  if (device) {

    return (
      <SchedulePage
        device={device}
        mode={mode}
        onBack={() => setDevice(null)}
      />
    );

  }

  return (

    <div className="scheduler-container p-4">

      {/* HEADER */}

      <div className="d-flex justify-content-between align-items-center mb-5">

        <div>

          <h2 className="fw-bold text-dark mb-1">
            Device Scheduler
          </h2>

          <p className="text-muted mb-0">
            Select a device to manage playback schedules
          </p>

        </div>

        <div className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill">

          {devices.length} Devices

        </div>

      </div>

      {/* DEVICE GRID */}

      <div className="row g-4">

        {loading ? (

          <div className="col-12 text-center py-5">

            <div className="spinner-border text-primary"></div>

            <p className="mt-2 text-muted">
              Loading devices...
            </p>

          </div>

        ) : devices.length === 0 ? (

          <div className="col-12 text-center py-5">

            <FaTv size={50} className="text-muted mb-3" />

            <h5>No Devices Found</h5>

            <p className="text-muted">
              Register devices first to start scheduling content.
            </p>

          </div>

        ) : (

          devices.map((d) => (

            <div key={d.id} className="col-xl-3 col-lg-4 col-md-6">

              <div
                className="card h-100 device-card border-0 shadow-sm"
                onClick={() => selectDevice(d)}
              >

                <div className="card-body p-4">

                  {/* ICON + STATUS */}

                  <div className="d-flex justify-content-between align-items-start mb-3">

                    <div className="device-icon">

                      <FaTv />

                    </div>

                    <div className="status-badge online">

                      <FaCircle size={8} className="me-1" />
                      Active

                    </div>

                  </div>

                  {/* DEVICE NAME */}

                  <h5 className="fw-bold text-dark mb-1 text-truncate">

                    {d.device_name}

                  </h5>

                  <div className="text-muted small d-flex align-items-center mb-3">

                    <FaCheckCircle className="text-success me-2" />

                    {d.office_name || "Office"}

                  </div>

                  {/* SYNC INFO */}

                  {/* <div className="sync-info pt-3 border-top small text-muted">

                    <FaHistory className="me-2" />
                    Last Sync: {lastSync ? lastSync.toLocaleString() : "Never"}

                  </div> */}

                </div>

                {/* FOOTER BUTTON */}

                <div className="card-footer bg-transparent border-0 p-4 pt-0">

                  <button className="btn btn-outline-primary w-100 btn-sm fw-bold">

                    <FaCalendarAlt className="me-2" />
                    Manage Schedule

                  </button>

                </div>

              </div>

            </div>

          ))

        )}

      </div>

      <style>{`

      .scheduler-container{
        max-width:1400px;
        margin:auto;
      }

      .device-card{
        border-radius:18px;
        cursor:pointer;
        transition:all .25s ease;
      }

      .device-card:hover{
        transform:translateY(-6px);
        box-shadow:0 18px 30px rgba(0,0,0,.08)!important;
        border:1px solid #4e73df;
      }

      .device-icon{
        width:46px;
        height:46px;
        background:#f1f4f9;
        color:#4e73df;
        border-radius:12px;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:1.4rem;
      }

      .status-badge{
        font-size:.65rem;
        font-weight:700;
        text-transform:uppercase;
        padding:4px 10px;
        border-radius:50px;
        display:flex;
        align-items:center;
      }

      .status-badge.online{
        background:#d1fae5;
        color:#059669;
      }

      `}</style>

    </div>

  );

}