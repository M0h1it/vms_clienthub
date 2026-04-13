import { useEffect, useState } from "react";
import CreativeSidebar from "./CreativeSidebar";
import CalendarScheduler from "./CalendarScheduler";
import { getCreatives } from "../../services/creativeService";
import { getSchedulesByDevice,deleteSchedulesByDevice  } from "../../services/scheduleService";
import { FaArrowLeft, FaTv, FaLayerGroup, FaInfoCircle } from "react-icons/fa";

export default function SchedulePage({ device, mode, onBack }) {
  const [creatives, setCreatives] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const loadCreatives = async () => {
    const data = await getCreatives();
    const filtered = data.filter((c) => c.office_id === device.office_id);
    setCreatives(filtered);
  };

  const loadSchedules = async () => {
  setLoading(true);
  try {
    const data = await getSchedulesByDevice(device.id);

    const map = {};
    creatives.forEach(c => {
      map[c.id] = c.title;
    });

    const mapped = data.map((s) => ({
      id: String(s.id),
      title: map[s.creative_id] || "Creative",
      start: s.start_time,
      end: s.end_time,
      extendedProps: {
        creativeId: s.creative_id,
        duration: s.duration,
        mode: s.mode,
      },
    }));

    setEvents(mapped);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  const handleOverwriteEntry = async () => {
    if (mode === "overwrite") {
      try {
        await deleteSchedulesByDevice([device.id]);
        setEvents([]); // 🔥 instantly clear UI
      } catch (err) {
        console.error("Overwrite clear failed", err);
      }
    }
  };

  handleOverwriteEntry();
}, [mode, device.id]);
const creativeMap = creatives.reduce((acc, c) => {
  acc[c.id] = c.title;
  return acc;
}, {});
 useEffect(() => {
  loadCreatives();
}, [device.id]);

useEffect(() => {
  if (creatives.length) {
    loadSchedules();
  }
}, [creatives]);

  return (
    <div className="scheduler-wrapper animate-fade-in">
      {/* HEADER SECTION */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div className="d-flex align-items-center gap-3">
          <button 
            className="btn btn-white shadow-sm border rounded-circle p-0 d-flex align-items-center justify-content-center"
            onClick={onBack}
            style={{ width: "38px", height: "38px" }}
          >
            <FaArrowLeft className="text-secondary" />
          </button>
          <div>
            <h4 className="fw-bold text-dark mb-0">Device Scheduler</h4>
            <div className="d-flex align-items-center text-muted">
              <FaInfoCircle className="me-1 small" />
              <small>Assign creatives to the timeline</small>
            </div>
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <div className="info-pill">
            <FaTv className="text-primary" />
            <span>{device.device_name}</span>
          </div>
          <div className={`info-pill ${mode === "overwrite" ? "mode-overwrite" : "mode-playalong"}`}>
            <FaLayerGroup />
            <span>{mode === "overwrite" ? "Overwrite" : "Play Along"}</span>
          </div>
        </div>
      </div>

      {/* MAIN WORKSPACE */}
      <div className="row g-4">
        {/* LEFT COLUMN: CREATIVE LIBRARY */}
        <div className="col-xl-3 col-lg-4">
          <div className="card border-0 shadow-sm scheduler-card creative-library-bg">
            <div className="card-header bg-transparent border-0 pt-3 pb-2 px-3">
              <h6 className="fw-bold text-uppercase small text-muted mb-0">Creative Library</h6>
            </div>
            <div className="card-body p-2 scrollable-content">
              <CreativeSidebar creatives={creatives} />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CALENDAR */}
        <div className="col-xl-9 col-lg-8">
          <div className="card border-0 shadow-sm scheduler-card">
            <div className="card-body p-3 h-100">
              {loading ? (
                <div className="d-flex flex-column align-items-center justify-content-center h-100 min-vh-50">
                  <div className="spinner-border text-primary mb-3" role="status" />
                  <span className="text-muted fw-medium">Syncing schedules...</span>
                </div>
              ) : (
                <CalendarScheduler
                  device={device}
                  mode={mode}
                  events={events}
                  reload={loadSchedules}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .scheduler-wrapper {
          padding: 5px;
          animation: fadeIn 0.4s ease-out;
        }

        .info-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fff;
          padding: 6px 14px;
          border-radius: 8px;
          border: 1px solid #dee2e6;
          font-weight: 600;
          font-size: 0.85rem;
        }

        .mode-overwrite { background: #fff5f5; color: #dc3545; border-color: #feb2b2; }
        .mode-playalong { background: #f0fff4; color: #2f855a; border-color: #9ae6b4; }

        /* UNIFIED CARD STYLE */
        .scheduler-card {
          border-radius: 12px;
          height: calc(100vh - 180px);
          min-height: 550px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .creative-library-bg {
          background-color: #f8f9fa;
          border: 1px solid #e9ecef !important;
        }

        .scrollable-content {
          flex: 1;
          overflow-y: auto;
        }

        /* SCROLLBAR REFINEMENT */
        .scrollable-content::-webkit-scrollbar { width: 4px; }
        .scrollable-content::-webkit-scrollbar-track { background: transparent; }
        .scrollable-content::-webkit-scrollbar-thumb { 
          background: #cbd5e1; 
          border-radius: 10px; 
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 992px) {
          .scheduler-card { height: auto; min-height: 500px; }
        }
      `}</style>
    </div>
  );
}