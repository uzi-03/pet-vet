"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface PreferredVetOffice {
  id: number;
  name: string;
  address: string;
  detail_link?: string;
}

export default function OwnerDashboard() {
  const [offices, setOffices] = useState<PreferredVetOffice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPreferredOffices();
  }, []);

  const fetchPreferredOffices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/owner/preferred-vets");
      const data = await res.json();
      setOffices(data.offices || []);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: number) => {
    if (!confirm("Remove this vet office from your preferred list?")) return;
    await fetch(`/api/owner/preferred-vets?id=${id}`, { method: "DELETE" });
    fetchPreferredOffices();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome, Pet Owner!</h1>
        <p className="mb-6 text-gray-600">Manage your pets and view their veterinary records.</p>
        <Link
          href="/pets"
          className="block w-full py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors mb-4"
        >
          Go to My Pets
        </Link>
        <Link
          href="/vet/locator"
          className="block w-full py-3 px-6 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors mb-6"
        >
          Find & Select Preferred Vet Office
        </Link>
        <div className="text-left">
          <h2 className="text-xl font-semibold mb-2">My Preferred Vet Office(s)</h2>
          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : offices.length === 0 ? (
            <div className="text-gray-400">No preferred vet office selected.</div>
          ) : (
            <ul className="space-y-4">
              {offices.map(office => (
                <li key={office.id} className="border rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-semibold text-lg">{office.name}</div>
                    <div className="text-gray-600">{office.address}</div>
                    {office.detail_link && (
                      <a href={office.detail_link} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline text-sm">View Details</a>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemove(office.id)}
                    className="mt-2 md:mt-0 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
} 