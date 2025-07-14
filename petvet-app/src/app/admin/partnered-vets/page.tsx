"use client";
import React, { useEffect, useState } from "react";

interface PartneredVetOffice {
  id: number;
  name: string;
  address: string;
  detail_link?: string;
  external_id?: string;
  created_at?: string;
}

export default function PartneredVetsAdminPage() {
  const [offices, setOffices] = useState<PartneredVetOffice[]>([]);
  const [form, setForm] = useState({ name: "", address: "", detail_link: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOffices = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/partnered-vets");
      const data = await res.json();
      setOffices(data.offices || []);
    } catch (e: any) {
      setError(e.message || "Failed to fetch offices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffices();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/partnered-vets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to add office");
      setForm({ name: "", address: "", detail_link: "" });
      fetchOffices();
    } catch (e: any) {
      setError(e.message || "Failed to add office");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this office?")) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/partnered-vets?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete office");
      fetchOffices();
    } catch (e: any) {
      setError(e.message || "Failed to delete office");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Partnered Vet Offices</h1>
      <form onSubmit={handleAdd} className="mb-8 flex flex-col md:flex-row gap-4 items-end">
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          required
          className="border rounded px-3 py-2 flex-1"
        />
        <input
          type="text"
          placeholder="Address"
          value={form.address}
          onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
          required
          className="border rounded px-3 py-2 flex-1"
        />
        <input
          type="text"
          placeholder="Detail Link (optional)"
          value={form.detail_link}
          onChange={e => setForm(f => ({ ...f, detail_link: e.target.value }))}
          className="border rounded px-3 py-2 flex-1"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          disabled={loading}
        >
          Add
        </button>
      </form>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <table className="w-full border rounded">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Address</th>
            <th className="p-2 text-left">Detail Link</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {offices.map(office => (
            <tr key={office.id} className="border-t">
              <td className="p-2">{office.name}</td>
              <td className="p-2">{office.address}</td>
              <td className="p-2">
                {office.detail_link ? (
                  <a href={office.detail_link} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">View</a>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
              <td className="p-2 text-center">
                <button
                  onClick={() => handleDelete(office.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                  disabled={loading}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {offices.length === 0 && (
            <tr>
              <td colSpan={4} className="p-4 text-center text-gray-500">No partnered offices yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
} 