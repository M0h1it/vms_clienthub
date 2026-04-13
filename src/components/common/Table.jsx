export default function Table({ columns, data }) {
  return (
    <table className="table table-striped table-hover">
      <thead className="table-dark">
        <tr>
          {columns.map((col, index) => (
            <th key={index}>{col}</th>
          ))}
        </tr>
      </thead>

      <tbody>
        {data.map((row, index) => (
          <tr key={index}>{row}</tr>
        ))}
      </tbody>
    </table>
  );
}
