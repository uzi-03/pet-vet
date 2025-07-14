"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { VetRecord } from "@/types";

interface RecordWithDetails extends VetRecord {
  pet_name: string;
  species: string;
  owner_username: string;
}

export default function VetRecordsPage() {
  const router = useRouter();
  const [records, setRecords] = useState<RecordWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
  const [filters, setFilters] = useState({
    pet_id: "",
    date_from: "",
    date_to: ""
  });

  useEffect(() => {
    checkAuthAndLoadRecords();
  }, [filters]);

  const checkAuthAndLoadRecords = async () => {
    try {
      // Check authentication
      const authRes = await fetch("/api/auth/me");
      if (!authRes.ok) {
        router.push("/login");
        return;
      }
      const userData = await authRes.json();
      if (userData.type !== "vet") {
        router.push("/dashboard");
        return;
      }
      setUser(userData);

      // Load records with filters
      const queryParams = new URLSearchParams();
      if (filters.pet_id) queryParams.append('pet_id', filters.pet_id);
      if (filters.date_from) queryParams.append('date_from', filters.date_from);
      if (filters.date_to) queryParams.append('date_to', filters.date_to);

      const recordsRes = await fetch(`/api/vet/records?${queryParams}`);
      if (recordsRes.ok) {
        const recordsData = await recordsRes.json();
        setRecords(recordsData);
      } else {
        setError("Failed to load records");
      }
    } catch (error) {
      setError("Failed to load records");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Medical Records</h1>
            <p className="text-gray-600">View and manage veterinary records for your patients</p>
          </div>
          <div className="flex space-x-4">
            <Link
              href="/vet/records/new"
              className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
            >
              Add Record
            </Link>
            <button
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                router.push('/login');
              }}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Patient</label>
              <select
                value={filters.pet_id}
                onChange={(e) => setFilters({ ...filters, pet_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Patients</option>
                {/* Add patient options here */}
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Records List */}
        {records.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No records found</h3>
            <p className="text-gray-500">Add your first medical record to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <div key={record.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{record.pet_name}</h3>
                    <p className="text-gray-600 capitalize">{record.species}</p>
                    <p className="text-sm text-gray-500">Owner: {record.owner_username}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{new Date(record.visit_date).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-500">{record.office_location || 'No location'}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p><span className="font-medium">Reason:</span> {record.reason}</p>
                  {record.diagnosis && <p><span className="font-medium">Diagnosis:</span> {record.diagnosis}</p>}
                  {record.treatment && <p><span className="font-medium">Treatment:</span> {record.treatment}</p>}
                  {record.medications && <p><span className="font-medium">Medications:</span> {record.medications}</p>}
                  {record.next_visit_date && (
                    <p><span className="font-medium">Next Visit:</span> {new Date(record.next_visit_date).toLocaleDateString()}</p>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Link
                    href={`/vet/records/${record.id}/edit`}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => {/* Handle delete */}}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 