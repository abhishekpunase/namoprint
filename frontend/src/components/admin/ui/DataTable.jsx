export function DataTable({ columns = [], rows = [], emptyMessage = 'No records found', className = '' }) {
  if (!rows.length) {
    return <p className="admin-v2-table-empty">{emptyMessage}</p>
  }

  return (
    <div className={`admin-v2-table-wrap ${className}`.trim()}>
      <table className="admin-v2-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id ?? index}>
              {columns.map((column) => (
                <td key={column.key}>
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
