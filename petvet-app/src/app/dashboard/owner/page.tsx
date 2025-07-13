"use client";

import Link from "next/link";

export default function OwnerDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome, Pet Owner!</h1>
        <p className="mb-6 text-gray-600">Manage your pets and view their veterinary records.</p>
        <Link
          href="/pets"
          className="block w-full py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Go to My Pets
        </Link>
      </div>
    </div>
  );
} 