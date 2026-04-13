import { useEffect, useState } from "react";

export default function EditEmployeeModal({ employee, onUpdate }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
  });

  useEffect(() => {
    if (employee) {
      setForm({
        name: employee.name || "",
        email: employee.email || "",
        phone: employee.phone || "",
        department: employee.department || "",
        designation: employee.designation || "",
      });
    }
  }, [employee]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onUpdate(employee.id, form);
  };

  return (
    <div className="modal fade" id="editEmployeeModal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow">
          <div className="modal-header bg-light">
            <h5 className="modal-title fw-bold">Edit Employee</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div className="modal-body p-4">
            <div className="row g-3">
              {Object.keys(form).map((key) => (
                <div className={key === 'department' || key === 'designation' ? "col-md-6" : "col-12"} key={key}>
                  <label className="form-label small fw-bold text-muted text-capitalize">{key}</label>
                  <input
                    type={key === 'email' ? 'email' : 'text'}
                    className="form-control border-2"
                    name={key}
                    value={form[key]}
                    onChange={handleChange}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="modal-footer border-0 bg-light-subtle">
            <button className="btn btn-link text-muted text-decoration-none" data-bs-dismiss="modal">Cancel</button>
            <button className="btn btn-primary px-4 shadow-sm" onClick={handleSubmit} data-bs-dismiss="modal">
              Update Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}