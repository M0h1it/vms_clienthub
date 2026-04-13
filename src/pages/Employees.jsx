import { useEffect, useState, useRef } from "react";
import api from "../api/api";
import Swal from "sweetalert2";
import AddEmployeeModal from "../components/employees/AddEmployeeModal";
import EditEmployeeModal from "../components/employees/EditEmployeeModal";
import Papa from "papaparse";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../services/employeeService";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef();

  const loadEmployees = async () => {
    try {
      const res = await getEmployees();
      const data = res?.data?.data || res?.data || [];
      setEmployees(data);
    } catch (error) {
      console.error("Failed to load employees:", error);
      setEmployees([]);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleAddEmployee = async (data) => {
    try {
      await createEmployee(data);
      loadEmployees();
    } catch (error) {
      console.error("Failed to add employee:", error);
    }
  };

  const handleEdit = (emp) => setSelectedEmployee(emp);

  const handleUpdateEmployee = async (id, data) => {
    try {
      await updateEmployee(id, data);
      loadEmployees();
    } catch (err) {
      console.error("Update failed");
    }
  };

  const handleDownloadSample = () => {
    const sampleData = [
      {
        name: "John Doe",
        email: "john@example.com",
        phone: "9876543210",
        department: "Engineering",
        designation: "Software Engineer",
      },
    ];

    const csv = Papa.unparse(sampleData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "employee_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file); // ✅ store original file

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvData(results.data);
        setShowPreview(true);
      },
    });
  };

  const handleImportCSV = async () => {
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await api.post("/employees/upload-csv", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire({
        icon: "info",
        title: "Import Result",
        text: res.data.message,
      });

      setShowPreview(false);
      setCsvData([]);
      fileInputRef.current.value = "";
      loadEmployees();
    } catch (err) {
      console.error("Import failed", err);
      alert("Import failed");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await deleteEmployee(id);
        loadEmployees();
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  };

  return (
    <div className="container-fluid py-4 px-md-4">
      {/* CSV Preview Section */}
      {showPreview && csvData.length > 0 && (
        <div className="card mb-4 border-0 shadow-sm overflow-hidden">
          <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center py-3">
            <div>
              <h6 className="mb-0 fw-bold">CSV Import Preview</h6>
              <small className="opacity-75">
                {csvData.length} entries detected
              </small>
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-light btn-sm fw-bold px-3"
                onClick={handleImportCSV}
              >
                Upload Now
              </button>
              <button
                className="btn btn-link text-white btn-sm text-decoration-none"
                onClick={() => {
                  setShowPreview(false);
                  setCsvData([]);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive" style={{ maxHeight: "300px" }}>
              <table className="table table-sm table-hover mb-0">
                <thead className="table-light sticky-top">
                  <tr>
                    {Object.keys(csvData[0]).map((key) => (
                      <th key={key} className="px-3 py-2 small text-muted">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvData.slice(0, 5).map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).map((val, j) => (
                        <td
                          key={j}
                          className="px-3 py-2 small text-truncate"
                          style={{ maxWidth: "150px" }}
                        >
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Main Table Card */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-header bg-white py-4 border-bottom-0">
          <div className="row align-items-center g-3">
            <div className="col-12 col-md-6 text-center text-md-start">
              <h4 className="mb-1 fw-bold text-dark">Employee Directory</h4>
              <p className="text-muted small mb-0">
                Manage your organization's talent and departments
              </p>
            </div>
            <div className="col-12 col-md-6">
              <div className="d-flex flex-wrap justify-content-center justify-content-md-end gap-2">
                {/* ✅ NEW: Download Sample CSV */}
                <button
                  className="btn btn-outline-secondary px-4 fw-semibold rounded-pill"
                  onClick={handleDownloadSample}
                >
                  Sample CSV
                </button>
                <div className="position-relative">
                  <button className="btn btn-outline-primary px-4 fw-semibold rounded-pill">
                    Import CSV
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleCSVUpload}
                    className="position-absolute opacity-0 top-0 start-0 w-100 h-100 cursor-pointer"
                  />
                </div>
                <button
                  className="btn btn-primary px-4 fw-semibold rounded-pill shadow-sm"
                  data-bs-toggle="modal"
                  data-bs-target="#addEmployeeModal"
                >
                  + Add Employee
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card-body p-0">
          {/* CRITICAL FIX: table-responsive ensures the table can be scrolled horizontally */}
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4 py-3 border-0 text-muted small fw-bold text-nowrap">
                    NAME
                  </th>
                  <th className="py-3 border-0 text-muted small fw-bold text-nowrap">
                    CONTACT INFO
                  </th>
                  <th className="py-3 border-0 text-muted small fw-bold text-nowrap">
                    DEPARTMENT
                  </th>
                  <th className="py-3 border-0 text-muted small fw-bold text-nowrap">
                    DESIGNATION
                  </th>
                  <th className="pe-4 py-3 border-0 text-muted small fw-bold text-end text-nowrap">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {employees.length > 0 ? (
                  employees.map((emp) => (
                    <tr key={emp.id} className="transition-all">
                      <td className="ps-4 py-3">
                        <div className="d-flex align-items-center">
                          <div
                            className="avatar me-3 bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold"
                            style={{
                              width: "40px",
                              height: "40px",
                              flexShrink: 0,
                            }}
                          >
                            {emp.name?.charAt(0).toUpperCase() || "E"}
                          </div>
                          <div className="fw-bold text-dark text-nowrap">
                            {emp.name || "Unnamed"}
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="small text-dark mb-1 text-nowrap">
                          {emp.email}
                        </div>
                        <div className="small text-muted text-nowrap">
                          {emp.phone || "No phone"}
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="badge rounded-pill bg-light text-dark border px-3 py-2 fw-medium text-nowrap">
                          {emp.department || "General"}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="text-secondary small fw-medium text-nowrap">
                          {emp.designation || "Staff"}
                        </span>
                      </td>
                      <td className="pe-4 py-3 text-end">
                        {/* Flex-nowrap ensures buttons stay side-by-side */}
                        <div className="d-flex gap-2 justify-content-end flex-nowrap">
                          <button
                            className="btn btn-sm btn-outline-primary px-3 rounded-pill"
                            data-bs-toggle="modal"
                            data-bs-target="#editEmployeeModal"
                            onClick={() => handleEdit(emp)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger px-3 rounded-pill"
                            onClick={() => handleDelete(emp.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-5">
                      <h5 className="text-muted fw-light">
                        No employees found
                      </h5>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card-footer bg-white border-top-0 py-3 px-4">
          <span className="small text-muted">
            Showing {employees.length} entries
          </span>
        </div>
      </div>

      <AddEmployeeModal onSave={handleAddEmployee} />
      <EditEmployeeModal
        employee={selectedEmployee}
        onUpdate={handleUpdateEmployee}
      />

      <style>{`
        .transition-all { transition: background-color 0.2s ease; }
        .table-hover tbody tr:hover { background-color: #f8fbff; }
        .rounded-4 { border-radius: 1rem !important; }
        
        /* Ensures the container itself doesn't overflow the screen */
        .table-responsive {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        /* Styling for the custom scrollbar */
        .table-responsive::-webkit-scrollbar {
          height: 6px;
        }
        .table-responsive::-webkit-scrollbar-thumb {
          background: #dee2e6;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
