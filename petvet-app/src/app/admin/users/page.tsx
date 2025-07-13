"use client";

import { useEffect, useState } from "react";

interface User {
  id: number;
  username: string;
  role: string;
  type: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState({ username: "", password: "", role: "user", type: "owner" });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data);
    } catch {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const openAddForm = () => {
    setEditUser(null);
    setForm({ username: "", password: "", role: "user", type: "owner" });
    setShowForm(true);
    setFormError("");
  };

  const openEditForm = (user: User) => {
    setEditUser(user);
    setForm({ username: user.username, password: "", role: user.role, type: user.type });
    setShowForm(true);
    setFormError("");
  };

  const closeForm = () => {
    setShowForm(false);
    setEditUser(null);
    setForm({ username: "", password: "", role: "user", type: "owner" });
    setFormError("");
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    try {
      if (editUser) {
        // Edit user
        const res = await fetch(`/api/admin/users/${editUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          closeForm();
          fetchUsers();
        } else {
          const data = await res.json();
          setFormError(data.error || "Failed to update user");
        }
      } else {
        // Add user
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          closeForm();
          fetchUsers();
        } else {
          const data = await res.json();
          setFormError(data.error || "Failed to add user");
        }
      }
    } catch {
      setFormError("Failed to save user");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Delete user '${user.username}'?`)) return;
    try {
      await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      fetchUsers();
    } catch {
      setError("Failed to delete user");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">User Management</h1>
        <div className="flex justify-end mb-4">
          <button
            onClick={openAddForm}
            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
          >
            Add User
          </button>
        </div>
        {loading ? (
          <div className="text-center text-gray-500">Loading users...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 text-left">Username</th>
                  <th className="py-2 px-4 text-left">Role</th>
                  <th className="py-2 px-4 text-left">Type</th>
                  <th className="py-2 px-4 text-left">Created</th>
                  <th className="py-2 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-t">
                    <td className="py-2 px-4">{user.username}</td>
                    <td className="py-2 px-4 capitalize">{user.role}</td>
                    <td className="py-2 px-4 capitalize">{user.type}</td>
                    <td className="py-2 px-4">{new Date(user.created_at).toLocaleString()}</td>
                    <td className="py-2 px-4">
                      <button
                        onClick={() => openEditForm(user)}
                        className="mr-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add/Edit User Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
              <button
                onClick={closeForm}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                ×
              </button>
              <h2 className="text-xl font-bold mb-4 text-center">{editUser ? "Edit User" : "Add User"}</h2>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <input
                    name="username"
                    type="text"
                    required
                    value={form.username}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400"
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password{editUser ? " (leave blank to keep current)" : ""}</label>
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400"
                    placeholder="Set or change password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="owner">Pet Owner</option>
                    <option value="vet">Vet</option>
                  </select>
                </div>
                {formError && <div className="text-red-600 text-sm text-center">{formError}</div>}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {formLoading ? (editUser ? "Saving..." : "Adding...") : (editUser ? "Save" : "Add")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 