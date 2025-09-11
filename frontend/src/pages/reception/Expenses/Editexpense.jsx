import React, { useState, useEffect } from "react";
import { XIcon, SaveIcon } from "lucide-react";
import { useDispatch } from "react-redux";
import { updateExpense } from "../../../features/expenses/expensesSlice";

const EditExpenseModal = ({ expense, onClose, doctors, onUpdateSuccess }) => {


  const [formData, setFormData] = useState({
    doctor: "",
    doctorWelfare: "",
    otExpenses: "",
    otherExpenses: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (expense) {
      setFormData({
        doctor: expense.doctor || "",
        doctorWelfare: expense.doctorWelfare || "",
        otExpenses: expense.otExpenses || "",
        otherExpenses: expense.otherExpenses || "",
        description: expense.description || "",
      });
    }
  }, [expense]);

  // Extract unique doctor names from the doctors array (which contains expense objects)
  const getUniqueDoctorNames = () => {
    if (!doctors || !Array.isArray(doctors)) return [];

    const doctorNames = new Set();

    doctors.forEach(doctorItem => {
      // If it's an expense object, extract the doctor name
      if (typeof doctorItem === 'object' && doctorItem !== null) {
        if (doctorItem.doctor) {
          doctorNames.add(doctorItem.doctor);
        }
      }
      // If it's already a string, add it directly
      else if (typeof doctorItem === 'string') {
        doctorNames.add(doctorItem);
      }
    });

    return Array.from(doctorNames).sort();
  };

  const validateForm = () => {
    const newErrors = {};

    const welfare = parseFloat(formData.doctorWelfare);
    const ot = parseFloat(formData.otExpenses);
    const other = parseFloat(formData.otherExpenses);

    if (isNaN(welfare) || welfare < 0) {
      newErrors.doctorWelfare = "Please enter a valid welfare amount";
    }

    if (isNaN(ot) || ot < 0) {
      newErrors.otExpenses = "Please enter a valid OT expenses amount";
    }

    if (isNaN(other) || other < 0) {
      newErrors.otherExpenses = "Please enter a valid other expenses amount";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsUpdating(true);
    try {
      const updatedExpenseData = {
        doctor: formData.doctor || "Unassigned",
        doctorWelfare: parseFloat(formData.doctorWelfare) || 0,
        otExpenses: parseFloat(formData.otExpenses) || 0,
        otherExpenses: parseFloat(formData.otherExpenses) || 0,
        description: formData.description,
      };

      await dispatch(updateExpense({
        id: expense._id,
        expenseData: updatedExpenseData
      })).unwrap();

      // Call the success callback if provided
      if (onUpdateSuccess) {
        onUpdateSuccess();
      }

      onClose();
    } catch (error) {
      console.error("Failed to update expense:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!expense) return null;

  const uniqueDoctorNames = getUniqueDoctorNames();

  return (
    <div className="fixed inset-0 bg-black/10 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Expense</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
            <select
              value={formData.doctor}
              onChange={(e) => handleInputChange("doctor", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select Doctor</option>
              {doctors.map((d) => (
                <option key={d._id} value={d?.user?.user_Name}>
                  {d?.user?.user_Name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Welfare</label>
            <input
              type="number"
              step="0.01"
              value={formData.doctorWelfare}
              onChange={(e) => handleInputChange("doctorWelfare", e.target.value)}
              className={`w-full p-2 border rounded-md ${errors.doctorWelfare ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.doctorWelfare && <p className="text-red-500 text-sm mt-1">{errors.doctorWelfare}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">OT Expenses</label>
            <input
              type="number"
              step="0.01"
              value={formData.otExpenses}
              onChange={(e) => handleInputChange("otExpenses", e.target.value)}
              className={`w-full p-2 border rounded-md ${errors.otExpenses ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.otExpenses && <p className="text-red-500 text-sm mt-1">{errors.otExpenses}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Other Expenses</label>
            <input
              type="number"
              step="0.01"
              value={formData.otherExpenses}
              onChange={(e) => handleInputChange("otherExpenses", e.target.value)}
              className={`w-full p-2 border rounded-md ${errors.otherExpenses ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.otherExpenses && <p className="text-red-500 text-sm mt-1">{errors.otherExpenses}</p>}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SaveIcon className="h-4 w-4 mr-1" />
              {isUpdating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditExpenseModal;