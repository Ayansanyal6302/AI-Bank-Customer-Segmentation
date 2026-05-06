import React, { useState } from 'react';
import axios from 'axios';
import { UploadCloud, FileSpreadsheet, AlertCircle, Loader2 } from 'lucide-react';

export default function UploadSection({ sessionData, setSessionData }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      // Pointing to FastAPI backend
      const response = await axios.post('http://localhost:8000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSessionData(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || "An error occurred during upload.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <div className="bg-slate-800 rounded-2xl p-8 shadow-xl shadow-slate-900/50 border border-slate-700">
        <h2 className="text-2xl font-semibold mb-2">Upload Dataset</h2>
        <p className="text-slate-400 mb-8">Upload your customer dataset (CSV) to begin segmentation.</p>
        
        <div 
          className="border-2 border-dashed border-slate-600 rounded-xl p-10 flex flex-col items-center justify-center bg-slate-800/50 hover:bg-slate-700/30 transition-colors relative"
        >
          <input 
            type="file" 
            accept=".csv" 
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="bg-slate-700 p-4 rounded-full mb-4">
            <UploadCloud size={32} className="text-teal-400" />
          </div>
          {file ? (
            <div className="text-center">
              <p className="text-lg font-medium text-slate-200">{file.name}</p>
              <p className="text-sm text-slate-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-lg font-medium text-slate-300">Click to browse or drag and drop</p>
              <p className="text-sm text-slate-500 mt-1">CSV files only</p>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-900/30 border border-red-800/50 rounded-xl flex items-center gap-3 text-red-400">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all
              ${!file ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 
                'bg-gradient-primary text-white hover:opacity-90 shadow-lg shadow-teal-500/20'}
            `}
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <FileSpreadsheet size={20} />}
            {loading ? 'Processing...' : 'Analyze Data'}
          </button>
        </div>
      </div>

      {sessionData && sessionData.preview && (
        <div className="mt-10 bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-700">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            Dataset Preview
            <span className="text-sm font-normal text-slate-400 bg-slate-700 px-3 py-1 rounded-full ml-2">
              {sessionData.row_count.toLocaleString()} rows
            </span>
          </h3>
          <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-900/50">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 uppercase bg-slate-800 border-b border-slate-700">
                <tr>
                  {Object.keys(sessionData.preview[0]).map(col => (
                    <th key={col} className="px-6 py-3 whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sessionData.preview.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/50">
                    {Object.values(row).map((val, colIdx) => (
                      <td key={colIdx} className="px-6 py-4 whitespace-nowrap text-slate-300">{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
