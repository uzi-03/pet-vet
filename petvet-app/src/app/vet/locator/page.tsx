'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface VetOffice {
  name: string;
  address: string;
  detailLink: string;
  partnered: boolean;
  id?: number;
}

type UserType = 'owner' | 'vet' | 'other';

export default function VetLocatorPage() {
  const [zip, setZip] = useState('');
  const [results, setResults] = useState<VetOffice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userType, setUserType] = useState<UserType>('other');
  const [myOffices, setMyOffices] = useState<{ name: string; address: string }[]>([]);
  const router = useRouter();

  // Restore cached search on mount
  useEffect(() => {
    const cachedZip = sessionStorage.getItem('vetLocatorZip');
    const cachedResults = sessionStorage.getItem('vetLocatorResults');
    if (cachedZip) setZip(cachedZip);
    if (cachedResults) setResults(JSON.parse(cachedResults));
    fetchUserTypeAndOffices();
  }, []);

  const fetchUserTypeAndOffices = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) return;
      const user = await res.json();
      if (user.type === 'owner') {
        setUserType('owner');
        const pref = await fetch('/api/owner/preferred-vets');
        const data = await pref.json();
        setMyOffices((data.offices || []).map((o: any) => ({ name: o.name, address: o.address })));
      } else if (user.type === 'vet') {
        setUserType('vet');
        const mem = await fetch('/api/vet/office-memberships');
        const data = await mem.json();
        setMyOffices((data.offices || []).map((o: any) => ({ name: o.name, address: o.address })));
      } else {
        setUserType('other');
      }
    } catch {
      setUserType('other');
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults([]);
    const searchZip = zip.trim() || '20002';
    try {
      const res = await fetch(`/api/vet/locator?zip=${searchZip}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResults(data.vets);
      // Cache results and zip
      sessionStorage.setItem('vetLocatorZip', searchZip);
      sessionStorage.setItem('vetLocatorResults', JSON.stringify(data.vets));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  // Helper to check if office is already saved/joined
  const isMine = (office: VetOffice) => {
    return myOffices.some(
      o => o.name.trim().toLowerCase() === office.name.trim().toLowerCase() &&
           o.address.trim().toLowerCase() === office.address.trim().toLowerCase()
    );
  };

  // Save/join handlers
  const handleSave = async (office: VetOffice) => {
    if (userType !== 'owner' || !office.partnered) return;
    const id = await getPartneredOfficeId(office);
    if (!id) return alert('Could not find office in system.');
    await fetch('/api/owner/preferred-vets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vet_office_id: id })
    });
    fetchUserTypeAndOffices();
  };
  const handleJoin = async (office: VetOffice) => {
    if (userType !== 'vet' || !office.partnered) return;
    const id = await getPartneredOfficeId(office);
    if (!id) return alert('Could not find office in system.');
    await fetch('/api/vet/office-memberships', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vet_office_id: id })
    });
    fetchUserTypeAndOffices();
  };
  const getPartneredOfficeId = async (office: VetOffice): Promise<number | null> => {
    const res = await fetch('/api/admin/partnered-vets');
    const data = await res.json();
    const match = (data.offices || []).find((o: any) =>
      o.name.trim().toLowerCase() === office.name.trim().toLowerCase() &&
      o.address.trim().toLowerCase() === office.address.trim().toLowerCase()
    );
    return match ? match.id : null;
  };

  const handleZipFocus = () => {
    if (zip === '20002') setZip('');
  };

  // Route to internal vet details page
  const handleViewDetails = (vet: VetOffice) => {
    // Cache results and zip before navigating
    sessionStorage.setItem('vetLocatorZip', zip);
    sessionStorage.setItem('vetLocatorResults', JSON.stringify(results));
    router.push(`/vet/locator/details?name=${encodeURIComponent(vet.name)}&address=${encodeURIComponent(vet.address)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center py-8 px-2">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 text-center">Find a Nearby Vet</h1>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 mb-8 justify-center items-center">
          <input
            type="text"
            value={zip}
            onChange={e => setZip(e.target.value)}
            onFocus={handleZipFocus}
            maxLength={5}
            pattern="\d{5}"
            required
            className="w-full sm:w-64 text-lg border-2 border-gray-300 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900 bg-white"
            placeholder="Enter Zipcode"
            inputMode="numeric"
            autoComplete="postal-code"
          />
          <button
            type="submit"
            className="w-full sm:w-auto bg-blue-600 text-white text-lg px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
        {error && <div className="text-red-600 mb-4 text-center">{error}</div>}
        <ul className="space-y-6">
          {results.map((vet, idx) => (
            <li key={idx} className="border border-gray-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center md:justify-between bg-gray-50 shadow-sm">
              <div>
                <div className="font-semibold text-xl text-gray-900">{vet.name}</div>
                <div className="text-gray-600 mb-1">{vet.address}</div>
                <button
                  onClick={() => handleViewDetails(vet)}
                  className="text-blue-500 underline text-sm hover:text-blue-700 focus:outline-none"
                >
                  View Details
                </button>
              </div>
              <div className="mt-4 md:mt-0">
                {vet.partnered ? (
                  userType === 'owner' ? (
                    isMine(vet) ? (
                      <button className="bg-gray-300 text-gray-600 px-5 py-2 rounded-xl cursor-not-allowed font-semibold" disabled>Saved</button>
                    ) : (
                      <button
                        className="bg-green-600 text-white px-5 py-2 rounded-xl font-semibold hover:bg-green-700 transition"
                        onClick={() => handleSave(vet)}
                      >
                        Save as My Vet
                      </button>
                    )
                  ) : userType === 'vet' ? (
                    isMine(vet) ? (
                      <button className="bg-gray-300 text-gray-600 px-5 py-2 rounded-xl cursor-not-allowed font-semibold" disabled>Joined</button>
                    ) : (
                      <button
                        className="bg-green-600 text-white px-5 py-2 rounded-xl font-semibold hover:bg-green-700 transition"
                        onClick={() => handleJoin(vet)}
                      >
                        Join This Office
                      </button>
                    )
                  ) : (
                    <span className="text-gray-400">Sign in to save or join</span>
                  )
                ) : (
                  <button
                    className="bg-gray-300 text-gray-600 px-5 py-2 rounded-xl cursor-not-allowed font-semibold"
                    disabled
                    title="Online scheduling only available for partnered offices"
                  >
                    Not Available
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 