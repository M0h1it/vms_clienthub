import { useEffect, useState } from "react";
import { getLogs, checkOut } from "../services/visitorLogService";
import { ClipboardList, User, FileText, Calendar, Clock, LogOut, Search, RefreshCw, Briefcase } from "lucide-react";

const SERVER_BASE = import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, "");

const getPhotoUrl = (photoUrl) => {
  if (!photoUrl) return null;
  if (/^https?:\/\//i.test(photoUrl)) return photoUrl;
  return `${SERVER_BASE}/${photoUrl.replace(/^\/+/, "").replace(/\\/g, "/")}`;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDateTime = (val) => {
  if (!val) return "—";
  return new Date(val).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

// Safe formatter for "YYYY-MM-DD" — no UTC shift
const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const [y, m, d] = String(dateStr).split("T")[0].split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${d} ${months[parseInt(m) - 1]} ${y}`;
};

// Safe formatter for "HH:MM:SS"
const formatTime = (timeStr) => {
  if (!timeStr) return "—";
  const [h, min] = timeStr.split(":");
  const d = new Date();
  d.setHours(+h, +min, 0);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const getStatusClass = (status) => {
  if (status === "checked_in")  return "badge-status badge-checkedin";
  if (status === "checked_out") return "badge-status badge-checkedout";
  return "badge-status badge-scheduled";
};

const getStatusLabel = (status) => {
  if (status === "checked_in")  return "Checked In";
  if (status === "checked_out") return "Checked Out";
  if (status === "scheduled")   return "Scheduled";
  return status ?? "—";
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function VisitorLogs() {
  const [logs, setLogs]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected]     = useState(null);
  const [checkingOut, setCheckingOut] = useState(null);

  const loadLogs = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await getLogs();
      setLogs(res.data.data || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadLogs(); }, []);

  const handleCheckout = async (id) => {
    setCheckingOut(id);
    try {
      await checkOut(id);
      await loadLogs();
    } finally {
      setCheckingOut(null);
    }
  };

  const filtered = logs.filter((l) => {
    const q = search.toLowerCase();
    return (
      l.name?.toLowerCase().includes(q) ||
      l.email?.toLowerCase().includes(q) ||
      l.purpose?.toLowerCase().includes(q) ||
      l.employee_name?.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="card-header bg-white py-3 px-4 border-bottom d-flex flex-wrap gap-3 justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <ClipboardList className="text-primary" size={22} />
            <h5 className="mb-0 fw-bold">Visitor Logs</h5>
            <span className="badge bg-light text-dark border fw-medium rounded-pill px-3 ms-1">
              {logs.length}
            </span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <div className="input-group input-group-sm search-group">
              <span className="input-group-text bg-light border-end-0 border-secondary border-opacity-25">
                <Search size={14} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0 border-secondary border-opacity-25"
                placeholder="Search visitor, employee, purpose…"
                style={{ minWidth: 220 }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button
              className="btn btn-sm btn-outline-secondary rounded-3 d-flex align-items-center gap-1"
              onClick={() => loadLogs(true)}
              disabled={refreshing}
            >
              <RefreshCw size={14} className={refreshing ? "spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* ── Table ──────────────────────────────────────────────────────────── */}
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4 py-3 text-muted small fw-bold text-uppercase">Visitor</th>
                  <th className="py-3 text-muted small fw-bold text-uppercase">Employee</th>{/* ✅ NEW */}
                  <th className="py-3 text-muted small fw-bold text-uppercase">Purpose</th>
                  <th className="py-3 text-muted small fw-bold text-uppercase">Meeting Date</th>{/* ✅ NEW */}
                  <th className="py-3 text-muted small fw-bold text-uppercase">Check-in</th>
                  <th className="py-3 text-muted small fw-bold text-uppercase">Check-out</th>
                  <th className="py-3 text-muted small fw-bold text-uppercase">Status</th>
                  <th className="py-3 text-muted small fw-bold text-uppercase text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      <div className="spinner-border spinner-border-sm me-2" role="status" />
                      Loading visitor logs…
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      {search ? `No results for "${search}"` : "No visitor logs yet."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((l) => (
                    <tr key={l.id}>

                      {/* Visitor */}
                      <td className="ps-4 py-3">
                        <div className="d-flex align-items-center gap-3">
                          {getPhotoUrl(l.photo_url) ? (
                            <img
                              src={getPhotoUrl(l.photo_url)}
                              alt={l.name}
                              className="visitor-photo-thumb"
                            />
                          ) : (
                            <div
                              className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                              style={{ width: 38, height: 38 }}
                            >
                              <User size={18} />
                            </div>
                          )}
                          <div>
                            <span className="fw-semibold text-dark d-block">{l.name}</span>
                            <small className="text-muted">{l.email}</small>
                            {l.phone && <small className="text-muted d-block">{l.phone}</small>}
                          </div>
                        </div>
                      </td>

                      {/* ✅ NEW: Employee */}
                      <td className="py-3">
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="bg-warning bg-opacity-10 text-warning rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{ width: 30, height: 30 }}
                          >
                            <Briefcase size={13} />
                          </div>
                          <span style={{ fontSize: "0.875rem" }}>
                            {l.employee_name || <span className="text-muted">—</span>}
                          </span>
                        </div>
                      </td>

                      {/* Purpose */}
                      <td className="py-3 text-secondary">
                        <div className="d-flex align-items-center gap-2">
                          <FileText size={15} className="text-muted flex-shrink-0" />
                          {l.purpose}
                        </div>
                      </td>

                      {/* ✅ NEW: Meeting Date */}
                      <td className="py-3">
                        <div className="d-flex align-items-center gap-2">
                          <Calendar size={14} className="text-primary flex-shrink-0" />
                          <div>
                            <span className="fw-semibold text-dark d-block" style={{ fontSize: "0.875rem" }}>
                              {formatDate(l.meeting_date)}
                            </span>
                            <small className="text-muted">{formatTime(l.meeting_time)}</small>
                          </div>
                        </div>
                      </td>

                      {/* Check-in — kept as before */}
                      <td className="py-3">
                        <div className="d-flex align-items-center gap-2">
                          <Clock size={14} className="text-success flex-shrink-0" />
                          <span style={{ fontSize: "0.85rem" }}>{formatDateTime(l.check_in_time)}</span>
                        </div>
                      </td>

                      {/* Check-out — kept as before */}
                      <td className="py-3">
                        {l.check_out_time ? (
                          <div className="d-flex align-items-center gap-2">
                            <LogOut size={14} className="text-secondary flex-shrink-0" />
                            <span style={{ fontSize: "0.85rem" }}>{formatDateTime(l.check_out_time)}</span>
                          </div>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3">
                        <span className={getStatusClass(l.meeting_status)}>
                          {getStatusLabel(l.meeting_status)}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 text-center">
                        {l.meeting_status === "checked_in" ? (
                          <button
                            className="btn btn-sm btn-outline-danger rounded-3 px-3 d-inline-flex align-items-center gap-1"
                            onClick={() => handleCheckout(l.id)}
                            disabled={checkingOut === l.id}
                          >
                            <LogOut size={13} />
                            {checkingOut === l.id ? "…" : "Check Out"}
                          </button>
                        ) : (
                          <button
                            className="btn btn-sm btn-outline-primary rounded-3 px-3"
                            onClick={() => setSelected(l)}
                          >
                            Details
                          </button>
                        )}
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Detail Modal ─────────────────────────────────────────────────────── */}
      {selected && (
        <>
          <div className="modal-backdrop fade show" onClick={() => setSelected(null)} />
          <div className="modal fade show d-block" style={{ zIndex: 1055 }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-4">

                <div className="modal-header border-0 pb-0 px-4 pt-4">
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: 44, height: 44 }}
                    >
                      <User size={20} />
                    </div>
                    <div>
                      <h5 className="mb-0 fw-bold">{selected.name}</h5>
                      <small className="text-muted">Visitor Details</small>
                    </div>
                  </div>
                  <button className="btn-close ms-auto" onClick={() => setSelected(null)} />
                </div>

                <div className="modal-body px-4 py-3">
                  {getPhotoUrl(selected.photo_url) && (
                    <div className="mb-4 text-center">
                      <img
                        src={getPhotoUrl(selected.photo_url)}
                        alt={selected.name}
                        className="visitor-photo-preview"
                      />
                    </div>
                  )}
                  <div className="row g-3">
                    {[
                      { label: "Email",         value: selected.email },
                      { label: "Phone",         value: selected.phone },
                      { label: "Employee",      value: selected.employee_name },
                      { label: "Purpose",       value: selected.purpose },
                      { label: "Meeting Date",  value: formatDate(selected.meeting_date) },
                      { label: "Meeting Time",  value: formatTime(selected.meeting_time) },
                      { label: "Check-in",      value: formatDateTime(selected.check_in_time) },
                      { label: "Check-out",     value: formatDateTime(selected.check_out_time) },
                      { label: "Badge ID",      value: selected.badge_id },
                      { label: "Status",        value: getStatusLabel(selected.meeting_status) },
                    ].map(({ label, value }) => (
                      <div key={label} className="col-6">
                        <p className="text-muted mb-1 fw-semibold text-uppercase"
                           style={{ fontSize: "0.7rem", letterSpacing: "0.05em" }}>
                          {label}
                        </p>
                        <p className="mb-0 fw-medium text-dark" style={{ fontSize: "0.9rem" }}>
                          {value || "—"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="modal-footer border-0 px-4 pb-4 pt-2">
                  <button className="btn btn-secondary rounded-3 px-4" onClick={() => setSelected(null)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        th { font-size: 0.75rem; letter-spacing: 0.05rem; }

        .table-hover tbody tr:hover {
          background-color: rgba(13, 110, 253, 0.02);
        }

        .badge-status {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .badge-checkedin  { background: rgba(25,135,84,0.12);  color: #198754; }
        .badge-checkedout { background: rgba(108,117,125,0.12); color: #6c757d; }
        .badge-scheduled  { background: rgba(255,193,7,0.15);   color: #b07d00; }

        .search-group .form-control:focus {
          box-shadow: none;
          border-color: #0d6efd !important;
        }
        .search-group:focus-within .input-group-text {
          border-color: #0d6efd;
        }

        .visitor-photo-thumb {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(13, 110, 253, 0.15);
          flex-shrink: 0;
        }

        .visitor-photo-preview {
          width: 140px;
          height: 140px;
          border-radius: 18px;
          object-fit: cover;
          border: 1px solid #dee2e6;
          box-shadow: 0 10px 24px rgba(0,0,0,0.08);
        }

        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
