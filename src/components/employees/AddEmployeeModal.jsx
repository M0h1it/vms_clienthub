import { useState } from "react";

export default function AddEmployeeModal({ onSave }) {
  const initialState = {
    name: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
  };

  const [form, setForm] = useState(initialState);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSave(form);
    setForm(initialState); // Clear form after saving
  };

  return (
    <div className="modal fade" id="addEmployeeModal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow">
          {/* Header */}
          <div className="modal-header bg-light">
            <h5 className="modal-title fw-bold text-dark">Add New Employee</h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>

          {/* Body */}
          <div className="modal-body p-4">
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label small fw-bold text-muted">Full Name</label>
                <input
                  type="text"
                  className="form-control border-2"
                  placeholder="e.g. John Doe"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12">
                <label className="form-label small fw-bold text-muted">Email Address</label>
                <input
                  type="email"
                  className="form-control border-2"
                  placeholder="john@company.com"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12">
                <label className="form-label small fw-bold text-muted">Phone Number</label>
                <input
                  type="text"
                  className="form-control border-2"
                  placeholder="+1 (555) 000-0000"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Department</label>
                <input
                  type="text"
                  className="form-control border-2"
                  placeholder="Engineering"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Designation</label>
                <input
                  type="text"
                  className="form-control border-2"
                  placeholder="Senior Lead"
                  name="designation"
                  value={form.designation}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer border-0 bg-light-subtle">
            <button 
              className="btn btn-link text-muted text-decoration-none" 
              data-bs-dismiss="modal"
            >
              Cancel
            </button>
            <button
              className="btn btn-primary px-4 shadow-sm"
              onClick={handleSubmit}
              data-bs-dismiss="modal"
              disabled={!form.name || !form.email} // Basic validation
            >
              Save Employee
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}