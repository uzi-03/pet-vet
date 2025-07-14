import { useEffect, useState } from "react";

interface VetOffice {
  id: number;
  name: string;
  address: string;
  detail_link?: string;
}

export default function VetOfficeMemberships() {
  const [offices, setOffices] = useState<VetOffice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemberships();
  }, []);

  const fetchMemberships = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vet/office-memberships");
      const data = await res.json();
      setOffices(data.offices || []);
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async (id: number) => {
    if (!confirm("Leave this vet office?")) return;
    await fetch(`/api/vet/office-memberships?id=${id}`, { method: "DELETE" });
    fetchMemberships();
  };

  return (
    <div>
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : offices.length === 0 ? (
        <div className="text-gray-400">You are not a member of any vet office.</div>
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
                onClick={() => handleLeave(office.id)}
                className="mt-2 md:mt-0 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
              >
                Leave
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 