'use client';
import { useSearchParams } from 'next/navigation';

export default function VetDetailsPage() {
  const params = useSearchParams();
  const name = params.get('name');
  const address = params.get('address');
  // Optionally, you could add phone extraction if you scrape it in the future

  if (!name && !address) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Vet Not Found</h1>
          <p className="text-gray-600">No vet information was provided. Please return to the locator and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{name}</h1>
        {address && <div className="text-gray-700 mb-2">{address}</div>}
        {/* Add phone number here if available in the future */}
        <button
          onClick={() => window.history.back()}
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Back to Search
        </button>
      </div>
    </div>
  );
} 