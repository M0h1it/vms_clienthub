import { FaBars } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { logout as doLogout } from "../../utils/auth";
export default function Header({ toggleSidebar }) {

  const navigate = useNavigate();

  const logout = () => {

  Swal.fire({
    title: "Logout?",
    text: "Are you sure you want to logout?",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#dc3545",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Yes, Logout",
  }).then((result) => {

    if (result.isConfirmed) {

      Swal.fire({
        icon: "success",
        title: "Logged Out",
        timer: 1200,
        showConfirmButton: false
      });

      setTimeout(() => {
        doLogout(); // ✅ clears EVERYTHING
      }, 1200);

    }

  });

};

  return (

    <div className="header d-flex justify-content-between align-items-center px-3 py-2 border-bottom bg-white">

      <div className="d-flex align-items-center gap-2">

        <button
          className="btn btn-light border"
          onClick={toggleSidebar}
        >
          <FaBars size={18}/>
        </button>

        <h6 className="mb-0 fw-semibold d-none d-md-block">
          Visitor Management System
        </h6>

      </div>

      <button
        className="btn btn-outline-danger btn-sm"
        onClick={logout}
      >
        Logout
      </button>

    </div>

  );

}