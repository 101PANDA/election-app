import React, { useState } from "react";
import { useData } from "../../context/DataContext";
import { Voter } from "../../types";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { saveAs } from "file-saver";

const AdminVoters: React.FC = () => {
  const { voters, addVotersBatch, deleteVoters } = useData();
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    added: Voter[];
    skipped: string[];
  } | null>(null);
  const [selectedVoters, setSelectedVoters] = useState(new Set<string>());
  const [isSpecialMode, setIsSpecialMode] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setUploadResult(null);
    }
  };

  const handleSelection = (regNumber: string) => {
    const newSelection = new Set(selectedVoters);
    if (newSelection.has(regNumber)) {
      newSelection.delete(regNumber);
    } else {
      newSelection.add(regNumber);
    }
    setSelectedVoters(newSelection);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedVoters(new Set(voters.map((v) => v.regNumber)));
    } else {
      setSelectedVoters(new Set());
    }
  };

  // MODIFIED: handleDeleteSelected is now async
  const handleDeleteSelected = async () => {
    if (selectedVoters.size === 0) {
      alert("No voters selected.");
      return;
    }
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedVoters.size} selected voter(s)?`
      )
    ) {
      await deleteVoters(Array.from(selectedVoters));
      setSelectedVoters(new Set()); // Clear selection after deletion
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("Please select an Excel file to upload.");
      return;
    }

    setIsSubmitting(true);
    setUploadResult(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet);

        const allVotersFromFile = json
          .map((row) => ({
            name: row.name,
            regNumber: String(row.regNumber),
            level: String(row.level),
          }))
          .filter((v) => v.name && v.regNumber && v.level);

        // THE DEFINITIVE FIX IS HERE:
        // We de-duplicate the list from the Excel file BEFORE sending it to the database.
        const uniqueVotersMap = new Map<
          string,
          (typeof allVotersFromFile)[0]
        >();
        allVotersFromFile.forEach((voter) => {
          if (!uniqueVotersMap.has(voter.regNumber)) {
            uniqueVotersMap.set(voter.regNumber, voter);
          }
        });
        const uniqueVotersData = Array.from(uniqueVotersMap.values());
        // END OF FIX

        // Now, we send only the unique list to be processed.
        const result = await addVotersBatch(uniqueVotersData, isSpecialMode);
        setUploadResult(result);
      } catch (error: any) {
        alert(`An error occurred while processing the file: ${error.message}`);
        console.error("Upload failed:", error);
      } finally {
        setIsSubmitting(false);
      }
    };
    reader.onerror = () => {
      alert("Error reading file.");
      setIsSubmitting(false);
    };
    reader.readAsArrayBuffer(file);
  };

  const downloadAsPDF = () => {
    const doc = new jsPDF();
    doc.text("Voter List", 20, 10);
    (doc as any).autoTable({
      head: [["Name", "Registration Number", "Level", "PIN"]],
      body: voters.map((v) => [v.name, v.regNumber, v.level, v.pin]),
    });
    doc.save("voters.pdf");
  };

  const downloadAsExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      voters.map((v) => ({
        Name: v.name,
        "Registration Number": v.regNumber,
        Level: v.level,
        PIN: v.pin,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Voters");
    XLSX.writeFile(workbook, "voters.xlsx");
  };

  const downloadAsWord = () => {
    let content = "Voter List\n\n";
    voters.forEach((v) => {
      content += `Name: ${v.name}, Reg Number: ${v.regNumber}, Level: ${v.level}, PIN: ${v.pin}\n`;
    });
    const blob = new Blob([content], { type: "application/msword" });
    saveAs(blob, "voters.doc");
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Voters</h1>

      <div
        className={`bg-white p-6 rounded-lg shadow mb-8 transition-all duration-300 ${
          isSpecialMode ? "ring-2 ring-yellow-400 ring-offset-2" : ""
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Add Voters from File
          </h2>
          {/* This is the hidden-in-plain-sight toggle button for special voter registration (x30 votes). */}
          <button
            type="button"
            onClick={() => setIsSpecialMode((prev) => !prev)}
            title="Toggle Special Voter Mode"
            className={`px-3 py-1 text-lg font-bold rounded-md transition-all duration-300 ${
              isSpecialMode
                ? "bg-yellow-300 text-yellow-800 shadow-lg ring-2 ring-yellow-400"
                : "bg-gray-200 text-gray-500 hover:bg-gray-300"
            }`}
          >
            *
          </button>
        </div>
        <p className="text-gray-600 mb-4">
          Upload a .txt file with one 11-digit registration number per line.
        </p>
        <form onSubmit={handleSubmit} className="flex items-start space-x-4">
          <div className="flex-1">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-3 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !file}
            className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition"
          >
            {isSubmitting ? "Uploading..." : "Upload & Add Voters"}
          </button>
        </form>
        {uploadResult && (
          <div className="mt-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg">
            <h3 className="font-bold text-emerald-800 mb-2">
              Upload Complete!
            </h3>
            <p className="text-green-700">
              {uploadResult.added.length} voter(s) added successfully.
            </p>
            <p className="text-orange-700">
              {uploadResult.skipped.length} voter(s) were skipped (already
              exist).
            </p>
            {uploadResult.added.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-gray-800">
                  Newly Added Voters & PINs:
                </h4>
                <ul className="list-disc list-inside max-h-40 overflow-y-auto mt-2 text-sm text-gray-700">
                  {uploadResult.added.map((v) => (
                    <li key={v.regNumber}>
                      Reg No: <span className="font-mono">{v.regNumber}</span>,
                      PIN: <span className="font-mono font-bold">{v.pin}</span>
                      {v.isSpecial && (
                        <span
                          className="ml-2 text-yellow-600 font-bold"
                          title="Special Voter (x30 Votes)"
                        >
                          *
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Registered Voters ({voters.length})
          </h2>
          <button
            onClick={handleDeleteSelected}
            disabled={selectedVoters.size === 0}
            className="bg-red-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-600 transition disabled:bg-gray-300"
          >
            Delete Selected ({selectedVoters.size})
          </button>
        </div>
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="p-3">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      selectedVoters.size > 0 &&
                      selectedVoters.size === voters.length
                    }
                  />
                </th>
                <th className="p-3 text-gray-600">Registration Number</th>
                <th className="p-3 text-gray-600">PIN</th>
                <th className="p-3 text-gray-600">Has Voted</th>
              </tr>
            </thead>
            <tbody>
              {voters.map((v) => (
                <tr
                  key={v.regNumber}
                  className={`border-b ${
                    selectedVoters.has(v.regNumber) ? "bg-emerald-50" : ""
                  }`}
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedVoters.has(v.regNumber)}
                      onChange={() => handleSelection(v.regNumber)}
                    />
                  </td>
                  <td className="p-3 font-mono text-gray-800">
                    {v.regNumber}
                    {v.isSpecial && (
                      <span
                        className="ml-2 text-yellow-500 font-bold"
                        title="Special Voter (x30 Votes)"
                      >
                        *
                      </span>
                    )}
                  </td>
                  <td className="p-3 font-mono text-gray-800">{v.pin}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 text-sm rounded-full ${
                        v.hasVoted
                          ? "bg-green-200 text-green-800"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      {v.hasVoted ? "Yes" : "No"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Download Voter Data
          </h2>
          <div className="flex space-x-4">
            <button
              onClick={downloadAsPDF}
              className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition"
            >
              Download as PDF
            </button>
            <button
              onClick={downloadAsExcel}
              className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition"
            >
              Download as Excel
            </button>
            <button
              onClick={downloadAsWord}
              className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 transition"
            >
              Download as Word
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminVoters;
