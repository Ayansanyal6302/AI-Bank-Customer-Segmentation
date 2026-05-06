import React, { useState } from 'react';
import { Upload, BarChart3, PieChart, Lightbulb, Download, Settings, Menu } from 'lucide-react';
import UploadSection from './components/UploadSection';
import DashboardSection from './components/DashboardSection';

function App() {
  const [activeTab, setActiveTab] = useState('upload');
  const [sessionData, setSessionData] = useState(null);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-900 text-slate-100 font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col hidden md:flex">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gradient flex items-center gap-2">
            <PieChart className="text-teal-400" />
            BankSeg AI
          </h1>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-2">
          <button 
            onClick={() => setActiveTab('upload')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'upload' ? 'bg-slate-700 text-teal-400' : 'hover:bg-slate-700/50 text-slate-400 hover:text-slate-200'}`}
          >
            <Upload size={20} />
            Data Upload
          </button>
          
          <button 
            onClick={() => setActiveTab('dashboard')}
            disabled={!sessionData}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${!sessionData ? 'opacity-50 cursor-not-allowed' : ''} ${activeTab === 'dashboard' ? 'bg-slate-700 text-teal-400' : 'hover:bg-slate-700/50 text-slate-400 hover:text-slate-200'}`}
          >
            <BarChart3 size={20} />
            Dashboard
          </button>

          <button 
            onClick={() => setActiveTab('insights')}
            disabled={!sessionData?.cluster_stats}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${!sessionData?.cluster_stats ? 'opacity-50 cursor-not-allowed' : ''} ${activeTab === 'insights' ? 'bg-slate-700 text-teal-400' : 'hover:bg-slate-700/50 text-slate-400 hover:text-slate-200'}`}
          >
            <Lightbulb size={20} />
            AI Insights
          </button>
        </nav>
        
        <div className="p-4 border-t border-slate-700">
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">
            <Settings size={16} />
            Settings
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-400 hover:text-white">
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-medium text-slate-200 capitalize">{activeTab.replace('-', ' ')}</h2>
          </div>
          
          {sessionData && sessionData.session_id && (
            <a 
              href={`http://localhost:8000/download/${sessionData.session_id}`}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
            >
              <Download size={16} />
              Export CSV
            </a>
          )}
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'upload' && (
            <UploadSection 
              sessionData={sessionData} 
              setSessionData={(data) => {
                setSessionData(data);
                if (data && data.elbow_data) {
                  setActiveTab('dashboard');
                }
              }} 
            />
          )}
          {activeTab === 'dashboard' && sessionData && (
            <DashboardSection sessionData={sessionData} setSessionData={setSessionData} />
          )}
          {activeTab === 'insights' && sessionData?.cluster_stats && (
            <div className="max-w-4xl mx-auto space-y-6">
              <h3 className="text-2xl font-semibold mb-6">AI Generated Business Insights</h3>
              <div className="grid gap-6">
                {sessionData.cluster_stats.map((stat, idx) => (
                  <div key={idx} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg shadow-slate-900/20 hover:border-slate-600 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-xl font-medium text-teal-400">{stat.name}</h4>
                        <p className="text-slate-400 mt-1">{stat.description}</p>
                      </div>
                      <div className="bg-slate-700 px-3 py-1 rounded-full text-xs font-medium text-slate-300">
                        {stat.percentage}% of Customers
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-700/50">
                      {Object.entries(stat.averages).slice(0, 4).map(([key, value]) => (
                        <div key={key}>
                          <div className="text-xs text-slate-500 uppercase tracking-wider">{key}</div>
                          <div className="text-lg font-semibold text-slate-200">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
