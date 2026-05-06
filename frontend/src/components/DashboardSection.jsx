import React, { useState } from 'react';
import axios from 'axios';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, Cell,
  BarChart, Bar, PieChart as RePieChart, Pie, Legend
} from 'recharts';
import { Users, Layers, TrendingUp, CreditCard, Loader2, Play } from 'lucide-react';

const COLORS = ['#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

export default function DashboardSection({ sessionData, setSessionData }) {
  const [k, setK] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCluster = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`http://localhost:8000/cluster/${sessionData.session_id}`, {
        k: k,
        features: sessionData.numeric_columns
      });
      
      setSessionData({
        ...sessionData,
        ...response.data
      });
    } catch (err) {
      setError(err.response?.data?.detail || "Error during clustering.");
    } finally {
      setLoading(false);
    }
  };

  const hasResults = !!sessionData.cluster_stats;

  return (
    <div className="space-y-6">
      
      {/* Top Config Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Elbow Method Chart */}
        <div className="lg:col-span-2 bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-700">
          <h3 className="text-lg font-semibold mb-4 text-slate-200">Elbow Method (Optimal K)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sessionData.elbow_data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="k" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                />
                <Line type="monotone" dataKey="wcss" stroke="#14b8a6" strokeWidth={3} dot={{ r: 5, fill: '#0f172a', stroke: '#14b8a6', strokeWidth: 2 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Configuration Card */}
        <div className="bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-700 flex flex-col">
          <h3 className="text-lg font-semibold mb-4 text-slate-200">Clustering Configuration</h3>
          
          <div className="flex-1 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Number of Clusters (K)</label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="2" 
                  max="10" 
                  value={k} 
                  onChange={(e) => setK(parseInt(e.target.value))}
                  className="w-full accent-teal-500"
                />
                <span className="text-2xl font-bold text-teal-400 w-8 text-center">{k}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Features Used</label>
              <div className="flex flex-wrap gap-2">
                {sessionData.numeric_columns?.slice(0, 5).map(col => (
                  <span key={col} className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">
                    {col}
                  </span>
                ))}
                {sessionData.numeric_columns?.length > 5 && (
                  <span className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">
                    +{sessionData.numeric_columns.length - 5} more
                  </span>
                )}
              </div>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

          <button
            onClick={handleCluster}
            disabled={loading}
            className="w-full mt-6 bg-gradient-primary text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-teal-500/20"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Play size={20} />}
            {loading ? 'Running...' : 'Run Clustering'}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {hasResults && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg flex items-center gap-4">
              <div className="p-3 bg-teal-500/20 rounded-xl text-teal-400">
                <Users size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Customers</p>
                <p className="text-2xl font-bold text-slate-100">{sessionData.row_count.toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                <Layers size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-400">Clusters</p>
                <p className="text-2xl font-bold text-slate-100">{sessionData.k_value}</p>
              </div>
            </div>
            {/* Find average of the first two numeric columns generically for the last two KPIs */}
            {sessionData.numeric_columns?.slice(0, 2).map((col, idx) => {
              const avg = sessionData.cluster_stats.reduce((acc, stat) => acc + (stat.averages[col] * (stat.count / sessionData.row_count)), 0);
              const icons = [<TrendingUp size={24}/>, <CreditCard size={24}/>];
              const colors = ['bg-purple-500/20 text-purple-400', 'bg-pink-500/20 text-pink-400'];
              
              return (
                <div key={col} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${colors[idx % 2]}`}>
                    {icons[idx % 2]}
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 truncate w-32" title={`Avg ${col}`}>Avg {col}</p>
                    <p className="text-2xl font-bold text-slate-100">{avg.toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Visualizations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Cluster Distribution */}
            <div className="bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-700">
              <h3 className="text-lg font-semibold mb-6 text-slate-200">Segment Distribution</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sessionData.cluster_stats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{fill: '#94a3b8', fontSize: 12}} />
                    <YAxis stroke="#94a3b8" />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                      cursor={{fill: '#334155', opacity: 0.4}}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {sessionData.cluster_stats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Scatter Plot */}
            <div className="bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-700">
              <h3 className="text-lg font-semibold mb-6 text-slate-200">
                Cluster Scatter Plot <span className="text-sm font-normal text-slate-500">(Sampled)</span>
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    {/* Using the first two numeric columns for scatter axes generically */}
                    <XAxis type="number" dataKey={sessionData.numeric_columns[0]} name={sessionData.numeric_columns[0]} stroke="#94a3b8" />
                    <YAxis type="number" dataKey={sessionData.numeric_columns[1]} name={sessionData.numeric_columns[1]} stroke="#94a3b8" />
                    <ZAxis type="number" range={[60, 60]} />
                    <RechartsTooltip 
                      cursor={{ strokeDasharray: '3 3' }} 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                    />
                    {sessionData.cluster_stats.map((stat, idx) => (
                      <Scatter 
                        key={`cluster-${idx}`} 
                        name={stat.name} 
                        data={sessionData.scatter_data.filter(d => d.Cluster === stat.cluster)} 
                        fill={COLORS[idx % COLORS.length]} 
                      />
                    ))}
                    <Legend wrapperStyle={{ fontSize: '12px' }}/>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
