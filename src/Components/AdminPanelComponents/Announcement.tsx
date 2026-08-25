"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  Megaphone,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Calendar,
  Eye,
  EyeOff,
  Clock,
  FileText,
} from "lucide-react";

interface Announcement {
  _id: string;
  title: string;
  description: string;
  state?: string;
  scheduledAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://ctbackend.realdaddygame.com";

const Announcement = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    state: "published",
    scheduledAt: "",
    isActive: true,
  });

  // Add custom styles for animations
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes scaleIn {
        from { transform: scale(0.95); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      .animate-fade-in {
        animation: fadeIn 0.3s ease-out;
      }
      .animate-scale-in {
        animation: scaleIn 0.3s ease-out;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/api/admin/announcements`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();

      if (result.status === "success") {
        // Handle paginated response structure
        setAnnouncements(result.data?.items || result.data || []);
        setError(null);
      } else {
        setError(result.message || "Failed to fetch announcements");
      }
    } catch (err) {
      setError("An error occurred while fetching announcements");
      console.error("Error fetching announcements:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const url = editingId
        ? `${API_BASE_URL}/api/admin/announcements/${editingId}`
        : `${API_BASE_URL}/api/admin/announcements`;

      // Prepare body - only include fields that have values
      const body: any = {
        title: formData.title,
        description: formData.description,
        isActive: formData.isActive,
      };

      // Add optional fields only if they have values
      if (formData.state) {
        body.state = formData.state;
      }
      if (formData.scheduledAt) {
        body.scheduledAt = new Date(formData.scheduledAt).toISOString();
      }

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (result.status === "success") {
        setSuccessMessage(
          editingId
            ? "Announcement updated successfully!"
            : "Announcement created successfully!",
        );
        setTimeout(() => setSuccessMessage(null), 3000);

        // Update local state instead of refetching
        if (editingId) {
          // Update existing announcement
          setAnnouncements((prev) =>
            prev.map((ann) => (ann._id === editingId ? result.data : ann)),
          );
        } else {
          // Add new announcement to the list
          setAnnouncements((prev) => [result.data, ...prev]);
        }

        setShowForm(false);
        setEditingId(null);
        resetForm();
      } else {
        setError(result.message || "Failed to save announcement");
      }
    } catch (err) {
      setError("An error occurred while saving announcement");
      console.error("Error saving announcement:", err);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setFormData({
      title: announcement.title,
      description: announcement.description,
      state: announcement.state || "published",
      scheduledAt: announcement.scheduledAt
        ? new Date(announcement.scheduledAt).toISOString().slice(0, 16)
        : "",
      isActive: announcement.isActive,
    });
    setEditingId(announcement._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    // Store the announcement in case we need to revert
    const deletedAnnouncement = announcements.find((ann) => ann._id === id);

    // Optimistic update - remove immediately from UI
    setAnnouncements((prev) => prev.filter((ann) => ann._id !== id));

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/api/admin/announcements/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();

      if (result.status === "success") {
        setSuccessMessage("Announcement deleted successfully!");
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        // Revert optimistic update on error
        if (deletedAnnouncement) {
          setAnnouncements((prev) =>
            [...prev, deletedAnnouncement].sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            ),
          );
        }
        setError(result.message || "Failed to delete announcement");
      }
    } catch (err) {
      // Revert optimistic update on error
      if (deletedAnnouncement) {
        setAnnouncements((prev) =>
          [...prev, deletedAnnouncement].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          ),
        );
      }
      setError("An error occurred while deleting announcement");
      console.error("Error deleting announcement:", err);
    }
  };

  const toggleStatus = async (announcement: Announcement) => {
    // Optimistic update - update UI immediately
    setAnnouncements((prev) =>
      prev.map((ann) =>
        ann._id === announcement._id
          ? { ...ann, isActive: !ann.isActive }
          : ann,
      ),
    );

    try {
      const token = localStorage.getItem("token");
      const endpoint = announcement.isActive ? "deactivate" : "activate";

      const response = await fetch(
        `${API_BASE_URL}/api/admin/announcements/${announcement._id}/${endpoint}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();

      if (result.status === "success") {
        setSuccessMessage("Status updated successfully!");
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        // Revert optimistic update on error
        setAnnouncements((prev) =>
          prev.map((ann) =>
            ann._id === announcement._id
              ? { ...ann, isActive: announcement.isActive }
              : ann,
          ),
        );
        setError(result.message || "Failed to update status");
      }
    } catch (err) {
      // Revert optimistic update on error
      setAnnouncements((prev) =>
        prev.map((ann) =>
          ann._id === announcement._id
            ? { ...ann, isActive: announcement.isActive }
            : ann,
        ),
      );
      setError("An error occurred while updating status");
      console.error("Error updating status:", err);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      state: "published",
      scheduledAt: "",
      isActive: true,
    });
    setEditingId(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    resetForm();
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const getStateColor = (state?: string) => {
    switch (state) {
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "published":
        return "bg-green-100 text-green-800 border-green-200";
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "archived":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-purple-100 text-purple-800 border-purple-200";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Megaphone className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">
            Announcements Management
          </h2>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New Announcement
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 transition-all duration-300 ease-in-out">
          <p className="font-medium">Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 transition-all duration-300 ease-in-out">
          <p className="text-sm">{successMessage}</p>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out scale-100 animate-scale-in">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingId ? "Edit Announcement" : "Create New Announcement"}
              </h3>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter announcement title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter announcement description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scheduled At (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) =>
                      setFormData({ ...formData, scheduledAt: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Save className="w-4 h-4" />
                  {editingId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Announcements List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            All Announcements
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Manage and organize your announcements
          </p>
        </div>

        <div className="p-6">
          {announcements.length > 0 ? (
            <div className="space-y-4">
              {announcements
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime(),
                )
                .map((announcement) => (
                  <div
                    key={announcement._id}
                    className={`border rounded-lg p-4 transition-all duration-300 ease-in-out transform hover:shadow-md ${
                      announcement.isActive
                        ? "border-gray-200"
                        : "border-gray-100 bg-gray-50 opacity-60"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h4 className="font-semibold text-gray-900">
                            {announcement.title}
                          </h4>
                          {announcement.state && (
                            <span
                              className={`px-2 py-1 text-xs rounded-full border ${getStateColor(announcement.state)}`}
                            >
                              {announcement.state}
                            </span>
                          )}
                          {announcement.scheduledAt && (
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(
                                announcement.scheduledAt,
                              ).toLocaleString()}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {announcement.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Created:{" "}
                            {new Date(announcement.createdAt).toLocaleString()}
                          </span>
                          <span
                            className={`flex items-center gap-1 ${announcement.isActive ? "text-green-600" : "text-gray-500"}`}
                          >
                            {announcement.isActive ? (
                              <Eye className="w-3 h-3" />
                            ) : (
                              <EyeOff className="w-3 h-3" />
                            )}
                            {announcement.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleStatus(announcement)}
                          title={announcement.isActive ? "Deactivate" : "Activate"}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                            announcement.isActive
                              ? "bg-blue-500"
                              : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                              announcement.isActive
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                        <button
                          onClick={() => handleEdit(announcement)}
                          className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 hover:shadow-sm transition-all duration-200 transform hover:scale-105 active:scale-95"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(announcement._id)}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 hover:shadow-sm transition-all duration-200 transform hover:scale-105 active:scale-95"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Megaphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No announcements yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Create your first announcement to get started
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Announcement;
