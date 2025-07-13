'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { VetRecord, Pet } from '@/types';

export default function AddVetRecordPage() {
  const router = useRouter();
  const params = useParams();
  const petId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [pet, setPet] = useState<Pet | null>(null);
  const [formData, setFormData] = useState<Partial<VetRecord>>({
    visit_date: new Date().toISOString().split('T')[0],
    reason: '',
    diagnosis: '',
    treatment: '',
    medications: '',
    next_visit_date: '',
    vet_name: '',
    notes: ''
  });

  useEffect(() => {
    fetchPet();
  }, [petId]);

  const fetchPet = async () => {
    try {
      const response = await fetch(`/api/pets/${petId}`);
      if (response.ok) {
        const data = await response.json();
        setPet(data);
      }
    } catch (error) {
      console.error('Error fetching pet:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/pets/${petId}/records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push(`/pets/${petId}`);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create vet record');
      }
    } catch (error) {
      console.error('Error creating vet record:', error);
      alert('Failed to create vet record');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!pet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pet information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center mb-8">
            <Link 
              href={`/pets/${petId}`}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              ← Back to {pet.name}
            </Link>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Add Vet Record</h1>
            <p className="text-gray-600">Add a new veterinary record for {pet.name}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Visit Information */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Visit Information</h3>
              </div>

              <div>
                <label htmlFor="visit_date" className="block text-sm font-medium text-gray-700 mb-2">
                  Visit Date *
                </label>
                <input
                  type="date"
                  id="visit_date"
                  name="visit_date"
                  value={formData.visit_date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="vet_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Veterinarian Name
                </label>
                <input
                  type="text"
                  id="vet_name"
                  name="vet_name"
                  value={formData.vet_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400"
                  placeholder="Dr. Smith"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Visit *
                </label>
                <input
                  type="text"
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400"
                  placeholder="e.g., Annual checkup, Vaccination, Illness"
                />
              </div>

              {/* Medical Information */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 mt-6">Medical Information</h3>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 mb-2">
                  Diagnosis
                </label>
                <textarea
                  id="diagnosis"
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400"
                  placeholder="Enter diagnosis if any"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="treatment" className="block text-sm font-medium text-gray-700 mb-2">
                  Treatment
                </label>
                <textarea
                  id="treatment"
                  name="treatment"
                  value={formData.treatment}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400"
                  placeholder="Enter treatment provided"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="medications" className="block text-sm font-medium text-gray-700 mb-2">
                  Medications
                </label>
                <textarea
                  id="medications"
                  name="medications"
                  value={formData.medications}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400"
                  placeholder="Enter medications prescribed"
                />
              </div>

              <div>
                <label htmlFor="next_visit_date" className="block text-sm font-medium text-gray-700 mb-2">
                  Next Visit Date
                </label>
                <input
                  type="date"
                  id="next_visit_date"
                  name="next_visit_date"
                  value={formData.next_visit_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400"
                  placeholder="Enter any additional notes about the visit"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
              <Link
                href={`/pets/${petId}`}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium mr-4"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Record'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 