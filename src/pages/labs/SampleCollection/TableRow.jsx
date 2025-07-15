const TableRow = ({ item }) => (
  <tr className="border-b">
    <td className="px-4 py-2">{item.id}</td>
    <td className="px-4 py-2">{item.patient}</td>
    <td className="px-4 py-2">{item.doctor}</td>
    <td className="px-4 py-2">{item.department}</td>
    <td className="px-4 py-2">{item.testType}</td>
    <td className="px-4 py-2">
      <span
        className={`px-2 py-1 rounded text-xs font-semibold ${
          item.urgency === 'Critical'
            ? 'bg-red-100 text-red-600'
            : item.urgency === 'Moderate'
            ? 'bg-yellow-100 text-yellow-600'
            : 'bg-green-100 text-green-600'
        }`}
      >
        {item.urgency}
      </span>
    </td>
    <td className="px-4 py-2">{item.date}</td>
    <td className="px-4 py-2 text-green-600">{item.status}</td>
    <td className="px-4 py-2">
      <button className="text-red-500 hover:underline">Delete</button>
    </td>
  </tr>
);

export default TableRow;
