import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { InputField } from "../../../components/common/FormFields";
import { Button } from "../../../components/common/Buttons";
import { FormSection } from "../../../components/common/FormSection";

const AllLabPatientTests = () => {
  const [search, setSearch] = useState('');
  const [patientTests, setPatientTests] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1 });

  const limit = 10; // Number of records per page

  const fetchPatientTests = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/lab/patient-tests`, {
        params: {
          page,
          limit,
          search
        }
      });

      const { data } = response.data;
      setPatientTests(data.patientTests || []);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching patient tests:', err);
    }
  };

  useEffect(() => {
    fetchPatientTests();
  }, [page]); // Only refetch when page changes

  const handleSearch = () => {
    setPage(1); // Reset to page 1
    fetchPatientTests();
  };

  return (
    <div className="p-6 bg-white rounded shadow-md space-y-10">
      <div className="w-screen -ml-6 bg-teal-600 py-6 text-white text-3xl font-bold shadow">
        <h1 className="ml-4">All Lab Patient Tests</h1>
      </div>

      {/* Search Section */}
      <FormSection title="Search Patient Tests" bgColor="bg-green-700 text-white">
        <div className="grid grid-cols-3 gap-4 items-end">
          <InputField
            name="search"
            label="Search by MR No / Name / CNIC"
            icon="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button type="button" variant="primary" onClick={handleSearch}>Search</Button>
        </div>
      </FormSection>

      {/* Results Table */}
      <FormSection title="Test Records" bgColor="bg-green-700 text-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2">MR No</th>
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Gender</th>
                <th className="border px-4 py-2">Contact</th>
                <th className="border px-4 py-2">Total Tests</th>
                <th className="border px-4 py-2">Final Amount</th>
                <th className="border px-4 py-2">Token No</th>
                <th className="border px-4 py-2">Created At</th>
              </tr>
            </thead>
            <tbody>
              {patientTests.length > 0 ? (
                patientTests.map((p, idx) => (
                  <tr key={idx}>
                    <td className="border px-4 py-2">{p.patient_Detail.patient_MRNo}</td>
                    <td className="border px-4 py-2">{p.patient_Detail.patient_Name}</td>
                    <td className="border px-4 py-2">{p.patient_Detail.patient_Gender}</td>
                    <td className="border px-4 py-2">{p.patient_Detail.patient_ContactNo}</td>
                    <td className="border px-4 py-2">{p.selectedTests.length}</td>
                    <td className="border px-4 py-2">Rs. {p.finalAmount}</td>
                    <td className="border px-4 py-2">{p.tokenNumber}</td>
                    <td className="border px-4 py-2">{new Date(p.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-gray-500">No data found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-end gap-2 mt-4">
          <Button
            type="button"
            variant="secondary"
            disabled={page === 1}
            onClick={() => setPage(prev => prev - 1)}
          >
            Previous
          </Button>
          <span className="self-center text-sm text-gray-700">Page {page} of {pagination.totalPages}</span>
          <Button
            type="button"
            variant="secondary"
            disabled={page === pagination.totalPages}
            onClick={() => setPage(prev => prev + 1)}
          >
            Next
          </Button>
        </div>
      </FormSection>
    </div>
  );
};

export default AllLabPatientTests;
