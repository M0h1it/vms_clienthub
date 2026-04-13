import { useState } from "react";

export default function DataTable({ columns, rows }) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 5;

  /* SEARCH FILTER */

  const filteredRows = rows.filter((row) =>
    row.cells.some((cell) =>
      String(cell).toLowerCase().includes(search.toLowerCase())
    )
  );

  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;

  const currentRows = filteredRows.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);

  return (
    <div className="card p-3">

      {/* SEARCH */}

      <div className="d-flex justify-content-between mb-3">
        <input
          type="text"
          className="form-control w-25"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE */}

      <table className="table table-striped table-hover">
        <thead className="table-dark">
          <tr>
            {columns.map((col, i) => (
              <th key={i}>{col}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {currentRows.map((row) => (
            <tr key={row.key}>
              {row.cells.map((cell, index) => (
                <td key={index}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* PAGINATION */}

      <nav>
        <ul className="pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <li
              key={i}
              className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            </li>
          ))}
        </ul>
      </nav>

    </div>
  );
}