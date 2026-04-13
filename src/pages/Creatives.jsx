import { useEffect, useState } from "react";
import {
  getCreatives,
  uploadCreative,
  deleteCreative,
} from "../services/creativeService";

import { getOfficeId } from "../utils/auth";

import {
  FaPlus,
  FaTrash,
  FaDownload,
  FaEye,
  FaImages,
  FaSearch,
  FaVideo,
  FaRegFileImage,
} from "react-icons/fa";

import Swal from "sweetalert2";

const SERVER_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace("/api", "");


export default function Creatives() {
  const [creatives, setCreatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const officeId = getOfficeId();
  const getCreativeUrl = (path) => {
  if (!path) return "";

  let cleanPath = path
    .replace(/^\/+/, "")
    .replace(/\\/g, "/");

  // 🔥 FIX OLD DATA
  if (!cleanPath.startsWith("uploads/")) {
    cleanPath = `uploads/creatives/${cleanPath}`;
  }

  return `${SERVER_BASE}/${cleanPath}`;
};

  const [form, setForm] = useState({
    title: "",
    type: "",
    file: null,
  });

  const loadCreatives = async () => {
    try {
      setLoading(true);
      const data = await getCreatives();
      setCreatives(data || []);
    } catch {
      Swal.fire("Error", "Failed to load creatives", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCreatives();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) {
      Swal.fire("Validation", "Title is required", "warning");
      return;
    }

    // if (!form.type) {
    //   Swal.fire("Validation", "Select format", "warning");
    //   return;
    // }

    if (!form.file) {
      Swal.fire("Validation", "Select a file", "warning");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("office_id", officeId);
      formData.append("title", form.title);
      // formData.append("type", form.type);
      formData.append("file", form.file);

      await uploadCreative(formData);
      Swal.fire("Uploaded", "Creative uploaded successfully", "success");
      setShowModal(false);
      setForm({ title: "", type: "", file: null });
      loadCreatives();
    } catch {
      Swal.fire("Error", "Upload failed", "error");
    }
  };

  const handleDelete = async (id) => {
    const res = await Swal.fire({
      title: "Delete creative?",
      text: "This cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      confirmButtonText: "Yes, delete it!",
      borderRadius: "15px",
    });

    if (res.isConfirmed) {
      await deleteCreative(id);
      Swal.fire("Deleted", "Creative removed", "success");
      loadCreatives();
    }
  };

  const handlePreview = (creative) => {
const url = getCreativeUrl(creative.media_url);

    Swal.fire({
      title: `<span style="font-size: 1.1rem; font-weight: 700;">${creative.title}</span>`,
      html: `
        <div style="position: relative; overflow: hidden; display: flex; justify-content: center; align-items: center;">
          ${
            creative.type === "video"
              ? `<video src="${url}" controls autoplay muted style="max-width:100%; max-height:60vh; border-radius:12px; display: block;"></video>`
              : `<img src="${url}" style="max-width:100%; max-height:60vh; border-radius:12px; object-fit: contain; display: block;"/>`
          }
        </div>
      `,
      showCloseButton: true, // This adds the 'X' button in the top right
      showConfirmButton: false,
      width: "auto",
      maxWidth: "800px",
      padding: "20px",
      background: "#fff",
      borderRadius: "20px",
      customClass: {
        closeButton: "custom-swal-close-btn", // We will style this below
      },
    });
  };

  const handleDownload = async (creative) => {
    try {
      // const cleanPath = creative.media_url || "";
const url = getCreativeUrl(creative.media_url);

      const response = await fetch(url);
      const blob = await response.blob();

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);

      // ✅ Better filename
      link.download = `${creative.title}.${cleanPath.split(".").pop()}`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(link.href);
    } catch (err) {
      Swal.fire("Error", "Download failed", "error");
    }
  };

  const filtered = creatives.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === "all" || c.type === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="p-3 p-md-4 bg-white min-vh-100">
      {/* HEADER SECTION */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold d-flex align-items-center gap-2 m-0">
            <FaImages className="text-primary" /> Library
          </h3>
          <p className="text-muted small mb-0">
            {creatives.length} assets available
          </p>
        </div>

        <button
          className="btn btn-primary shadow-sm px-4 py-2 d-flex align-items-center justify-content-center gap-2 w-10 w-sm-auto"
          onClick={() => setShowModal(true)}
          style={{ borderRadius: "12px" }}
        >
          <FaPlus /> <span>Upload Creative</span>
        </button>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="row g-3 mb-4 mb-md-5">
        {/* Search */}
        <div className="col-12 col-md-5 col-lg-4">
          <div className="input-group search-container shadow-sm">
            <span className="input-group-text border-end-0 bg-white py-2 ps-3">
              <FaSearch className="text-muted" />
            </span>
            <input
              className="form-control border-start-0 py-2 ps-1"
              placeholder="Search assets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ borderRadius: "0 12px 12px 0" }}
            />
          </div>
        </div>

        {/* Responsive Tabs */}
        <div className="col-12 col-md-7 col-lg-8">
          <div className="filter-tabs-container shadow-sm">
            <div className="filter-tabs p-1 bg-light">
              {["all", "image", "video", "gif"].map((tab) => (
                <button
                  key={tab}
                  className={`btn btn-sm px-4 py-2 text-capitalize transition-all border-0 ${
                    activeTab === tab
                      ? "bg-white shadow-sm fw-bold text-primary active-tab"
                      : "text-muted"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* GRID SECTION */}
      <div className="row g-3 g-md-4">
        {loading ? (
          <div className="text-center py-5 w-100">
            <div className="spinner-border text-primary" />
            <p className="mt-3 text-muted">Fetching your library...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-12">
            <div className="text-center py-5 rounded-4 bg-light border-2 border-dashed mx-0 mx-md-3">
              <FaImages size={50} className="text-muted opacity-25 mb-3" />
              <h5 className="text-dark fw-bold">No assets found</h5>
              <p className="text-muted px-3">
                Try adjusting your search or category filter.
              </p>
              {activeTab !== "all" && (
                <button
                  className="btn btn-link text-primary text-decoration-none fw-bold"
                  onClick={() => setActiveTab("all")}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          filtered.map((c) => {
            const url = getCreativeUrl(c.media_url);
            return (
              <div className="col-12 col-sm-6 col-lg-4" key={c.id}>
                <div className="card shadow-sm h-100 border-0 creative-card overflow-hidden">
                  <div className="creative-preview">
                    <div className="type-badge">
                      {c.type === "video" ? <FaVideo /> : <FaRegFileImage />}
                      <span>{c.type}</span>
                    </div>
                    {c.is_scheduled && (
                      <div
                        className="schedule-badge"
                        style={{ background: "#16a34a" }}
                      >
                        Scheduled
                      </div>
                    )}
                    {c.type === "video" ? (
                      <video
                        src={url}
                        muted
                        playsInline
                        onMouseOver={(e) => e.target.play()}
                        onMouseOut={(e) => {
                          e.target.pause();
                          e.target.currentTime = 0;
                        }}
                      />
                    ) : (
                      <img src={url} alt={c.title} loading="lazy" />
                    )}
                  </div>

                  <div className="card-body p-3">
                    <h6 className="fw-bold text-truncate text-dark mb-1">
                      {c.title}
                    </h6>

                    <p className="small text-muted mb-2">⏱ {c.duration}s</p>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-action"
                          onClick={() => handlePreview(c)}
                        >
                          <FaEye />
                        </button>
                        <button
                          className="btn btn-action"
                          onClick={() => handleDownload(c)}
                        >
                          <FaDownload />
                        </button>
                      </div>
                      <button
                        className="btn btn-action-danger"
                        onClick={() => handleDelete(c.id)}
                        disabled={c.is_scheduled}
                        title={
                          c.is_scheduled
                            ? "Cannot delete scheduled creative"
                            : ""
                        }
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* UPLOAD MODAL */}
      {showModal && (
        <>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-fullscreen-sm-down">
              <div
                className="modal-content border-0 shadow-lg mx-2 mx-sm-0"
                style={{ borderRadius: "24px" }}
              >
                <div className="modal-header border-0 px-4 pt-4 pb-0">
                  <h5 className="fw-bold text-dark m-0">Add New Creative</h5>
                  <button
                    className="btn-close shadow-none"
                    onClick={() => setShowModal(false)}
                  />
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="modal-body px-4 pt-4">
                    <div className="mb-4">
                      <label className="form-label small fw-bold text-muted text-uppercase ls-1">
                        Title
                      </label>
                      <input
                        className="form-control custom-input shadow-none"
                        placeholder="Welcome Screen 2024"
                        value={form.title}
                        onChange={(e) =>
                          setForm({ ...form, title: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label small fw-bold text-muted text-uppercase ls-1">
                        Format
                      </label>
                      <div className="d-flex gap-1 p-1 bg-light rounded-3 overflow-auto">
                        {["image", "video", "gif"].map((type) => (
                          <button
                            key={type}
                            type="button"
                            className={`btn flex-grow-1 py-2 text-capitalize transition-all border-0 ${
                              form.type === type
                                ? "bg-primary text-white shadow-sm fw-bold"
                                : "text-muted"
                            }`}
                            onClick={() => setForm({ ...form, type })}
                            style={{ borderRadius: "10px", minWidth: "70px" }}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-bold text-muted text-uppercase ls-1">
                        Upload File
                      </label>
                      <div
                        className={`file-drop-zone ${form.file ? "has-file" : ""}`}
                        onClick={() =>
                          document.getElementById("fileInput").click()
                        }
                      >
                        <input
                          type="file"
                          id="fileInput"
                          className="d-none"
                          onChange={(e) => {
                            const file = e.target.files[0];

                            if (!file) return;

                            // ✅ Size check (50MB)
                            if (file.size > 50 * 1024 * 1024) {
                              Swal.fire(
                                "Error",
                                "File must be less than 50MB",
                                "error",
                              );
                              return;
                            }

                            setForm({ ...form, file });
                          }}
                          accept={form.type === "video" ? "video/*" : "image/*"}
                        />
                        {form.file ? (
                          <div className="text-center">
                            <div className="file-icon-circle bg-soft-success mb-2">
                              {form.type === "video" ? (
                                <FaVideo className="text-success" />
                              ) : (
                                <FaRegFileImage className="text-success" />
                              )}
                            </div>
                            <p className="text-dark fw-bold mb-0 text-truncate px-3 small">
                              {form.file.name}
                            </p>
                          </div>
                        ) : (
                          <div className="text-center text-muted">
                            <div className="file-icon-circle bg-white mb-2 shadow-sm">
                              <FaPlus />
                            </div>
                            <p className="fw-medium mb-0 text-dark small">
                              Select File
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer border-0 px-4 pb-4">
                    <button
                      type="button"
                      className="btn btn-light px-4 w-100 w-sm-auto mb-2 mb-sm-0"
                      onClick={() => setShowModal(false)}
                      style={{ borderRadius: "12px" }}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-primary px-5 fw-bold w-100 w-sm-auto"
                      style={{ borderRadius: "12px" }}
                      disabled={!form.file || !form.title || !form.type}
                    >
                      Upload Asset
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {/* STYLES */}
      <style>{`
        .ls-1 { letter-spacing: 0.5px; }
        .bg-light { background-color: #f1f5f9 !important; }
        
        /* Search Bar */
        .search-container input:focus { border-color: #dee2e6; }
        .search-container span { border-radius: 12px 0 0 12px; }

        /* Scrollable Tabs on Mobile */
        .filter-tabs-container {
          background: #f1f5f9;
          border-radius: 14px;
          overflow: hidden;
        }

        .filter-tabs {
          display: flex;
          overflow-x: auto;
          white-space: nowrap;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none;  /* IE/Edge */
        }

        .filter-tabs::-webkit-scrollbar {
          display: none; /* Chrome/Safari */
        }

        .filter-tabs button {
          flex: 0 0 auto;
          min-width: 80px;
          border-radius: 10px;
        }

        .active-tab { color: #2563eb !important; }

        /* Creative Cards */
        .creative-card {
          transition: all 0.3s ease;
          border-radius: 18px;
        }

        @media (min-width: 992px) {
          .creative-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1) !important;
          }
        }

        .creative-preview {
          height: 180px;
          position: relative;
          background: #000;
        }

        .creative-preview img, .creative-preview video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .type-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          color: white;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          z-index: 2;
          text-transform: uppercase;
        }

        /* Buttons */
        .btn-action, .btn-action-danger {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          border: 1px solid transparent;
          transition: 0.2s;
          padding: 0;
        }

        .btn-action { background: #f8fafc; border-color: #e2e8f0; color: #64748b; }
        .btn-action:hover { color: #2563eb; border-color: #2563eb; background: white; }

        .btn-action-danger { background: #fff1f2; border-color: #fecdd3; color: #e11d48; }
        .btn-action-danger:hover { background: #e11d48; color: #fff; }

        /* Modal & Form */
        .custom-input {
          background: #f8fafc !important;
          border: 1.5px solid #e2e8f0 !important;
          border-radius: 12px;
          padding: 12px 16px;
        }

        .file-drop-zone {
          border: 2px dashed #cbd5e1;
          border-radius: 20px;
          padding: 25px;
          background: #f8fafc;
          cursor: pointer;
        }

        .file-icon-circle {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
        }

        .bg-soft-success { background: #dcfce7; }
        .transition-all { transition: all 0.2s ease; }

        @media (max-width: 576px) {
          .modal-fullscreen-sm-down {
            margin: 0;
            max-width: 100%;
          }
          .modal-fullscreen-sm-down .modal-content {
            height: 100vh;
            border-radius: 0 !important;
          }
        }
          /* Add this inside your existing <style> tag */

.custom-swal-close-btn {
  outline: none !important;
  box-shadow: none !important;
  color: #64748b !important; /* Muted slate color */
  transition: color 0.2s ease;
}

.custom-swal-close-btn:hover {
  color: #e11d48 !important; /* Red on hover */
}

/* Ensure the SwAl container doesn't force scrolling on the body */
.swal2-html-container {
  margin: 1rem 0 0 0 !important;
  overflow: hidden !important;
}

/* Mobile optimization for preview */
@media (max-width: 576px) {
  .swal2-popup {
    width: 95% !important;
    padding: 15px !important;
  }
}
  .schedule-badge {
  position: absolute;
  bottom: 12px;
  left: 12px;
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
}


.schedule-badge::before {
  content: "";
}
      `}</style>
    </div>
  );
}
