import React, { useState } from "react";
import { useData } from "../../context/DataContext";

const AdminCandidates: React.FC = () => {
  const { candidates, addCandidate, deleteCandidate } = useData();
  const [formData, setFormData] = useState({
    name: "",
    level: "",
    position: "",
    regNumber: "",
    image: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const DEFAULT_AVATAR =
    "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.regNumber ||
      !formData.level ||
      !formData.position
    ) {
      alert("Please fill out all fields except for the image.");
      return;
    }
    setIsSubmitting(true);
    try {
      await addCandidate({
        ...formData,
        image: formData.image || DEFAULT_AVATAR,
      });
      // Only clear form on successful submission
      setFormData({
        name: "",
        level: "",
        position: "",
        regNumber: "",
        image: "",
      });
      const fileInput = document.getElementById(
        "image-upload"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error("Submission failed", error);
      // Error alert is handled in DataContext, but you could add more here.
    } finally {
      setIsSubmitting(false);
    }
  };

  // MODIFIED: handleDelete is now async
  const handleDelete = async (candidateId: string, candidateName: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${candidateName}? This action cannot be undone.`
      )
    ) {
      try {
        await deleteCandidate(candidateId);
      } catch (error) {
        console.error("Deletion failed", error);
      }
    }
  };

  const inputClasses =
    "w-full p-3 border border-gray-300 rounded-lg text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition";

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Manage Candidates
      </h1>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Add New Candidate
        </h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Full Name"
            className={inputClasses}
            required
          />
          <input
            name="regNumber"
            value={formData.regNumber}
            onChange={handleChange}
            placeholder="Registration Number"
            className={inputClasses}
            required
          />
          <input
            name="level"
            value={formData.level}
            onChange={handleChange}
            placeholder="Level (e.g., 500 Level)"
            className={inputClasses}
            required
          />
          <input
            name="position"
            value={formData.position}
            onChange={handleChange}
            placeholder="Position (e.g., President)"
            className={inputClasses}
            required
          />
          <div className="col-span-1 md:col-span-2">
            <label
              htmlFor="image-upload"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Candidate Image
            </label>
            <input
              id="image-upload"
              name="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-3 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition"
            >
              {isSubmitting ? "Adding..." : "Add Candidate"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Existing Candidates
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-gray-600">Image</th>
                <th className="p-3 text-gray-600">Name</th>
                <th className="p-3 text-gray-600">Position</th>
                <th className="p-3 text-gray-600">Reg. Number</th>
                <th className="p-3 text-gray-600">Level</th>
                <th className="p-3 text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c) => (
                <tr key={c.id} className="border-b">
                  <td className="p-3">
                    <img
                      src={c.image || DEFAULT_AVATAR}
                      alt={c.name}
                      className="w-12 h-12 rounded-full object-cover bg-gray-200"
                    />
                  </td>
                  <td className="p-3 font-semibold text-gray-800">{c.name}</td>
                  <td className="p-3 text-gray-700">{c.position}</td>
                  <td className="p-3 text-gray-700">{c.regNumber}</td>
                  <td className="p-3 text-gray-700">{c.level}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDelete(c.id, c.name)}
                      className="bg-red-500 text-white font-semibold py-1 px-3 rounded-md hover:bg-red-600 transition text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCandidates;
