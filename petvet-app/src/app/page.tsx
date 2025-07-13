'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Pet } from '@/types';

export default function Dashboard() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      const response = await fetch('/api/pets');
      const data = await response.json();
      setPets(data);
    } catch (error) {
      console.error('Error fetching pets:', error);
    } finally {
      setLoading(false);
    }
  };

  const deletePet = async (id: number) => {
    if (!confirm('Are you sure you want to delete this pet?')) return;
    
    try {
      const response = await fetch(`/api/pets/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setPets(pets.filter(pet => pet.id !== id));
      }
    } catch (error) {
      console.error('Error deleting pet:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">🐾 PetVet</h1>
        <p className="text-gray-600 text-lg mb-6">Manage your pets' veterinary records</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/register"
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            Create Account
          </a>
          <a
            href="/login"
            className="px-6 py-3 bg-white border border-indigo-600 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            Login
          </a>
        </div>
      </div>
      {/* Existing dashboard or pet cards can go here if user is logged in */}
    </div>
  );
}
