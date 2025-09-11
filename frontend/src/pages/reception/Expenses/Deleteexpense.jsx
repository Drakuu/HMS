import React from "react";
import { XIcon, Trash2Icon, AlertTriangleIcon } from "lucide-react";
import { useDispatch } from "react-redux";
import { deleteExpense } from "../../../features/expenses/expensesSlice";

const DeleteExpenseModal = ({ expense, onClose }) => {
  const dispatch = useDispatch();

  const handleDelete = () => {
    dispatch(deleteExpense(expense._id || expense.id));
    onClose();
  };

  if (!expense) return null;

  return (
    <div className="fixed inset-0 bg-black/10 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Delete Expense</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center mb-4 p-3 bg-red-50 rounded-md">
          <AlertTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-red-700">Are you sure you want to delete this expense?</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-md mb-4">
          <p className="font-medium">{expense.doctor || "Unassigned"}</p>
          <p className="text-sm text-gray-600">{expense.description || "No description"}</p>
          <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
            <p>Welfare: PKR {expense.doctorWelfare?.toFixed(2)}</p>
            <p>OT: PKR {expense.otExpenses?.toFixed(2)}</p>
            <p>Other: PKR {expense.otherExpenses?.toFixed(2)}</p>
          </div>
          <p className="font-semibold mt-2">Total: PKR {(expense.doctorWelfare + expense.otExpenses + expense.otherExpenses)?.toFixed(2)}</p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
          >
            <Trash2Icon className="h-4 w-4 mr-1" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteExpenseModal;