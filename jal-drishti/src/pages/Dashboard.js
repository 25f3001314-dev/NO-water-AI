import React, { useState, useEffect } from 'react';
import { ArrowRight, Plus, Trash2, Activity } from 'lucide-react';

const Dashboard = () => {
  // ✅ 4 STATIC INDIAN DATA CENTERS
  const locations = [
    { id: 1, name: 'Mumbai', temp: 28, water: 78, env: 'Humid', power: '850kW' },
    { id: 2, name: 'Hyderabad', temp: 24, water: 65, env: 'Moderate', power: '720kW' },
    { id: 3, name: 'Chennai', temp: 30, water: 82, env: 'Very Humid', power: '910kW' },
    { id: 4, name: 'Delhi NCR', temp: 35, water: 91, env: 'Dry', power: '980kW' }
  ];

  // ✅ 100 TASKS DISTRIBUTED
  const generateInitialTasks = () => {
    const taskNames = ['Data Processing', 'Analytics', 'ML Training', 'API Server', 'Cache Sync', 'Backup Job', 'Queue Worker', 'Indexing', 'Reporting', 'Monitoring'];
    const tasks = [];
    for (let i = 0; i < 100; i++) {
      tasks.push({
        id: i + 1,
        name: `${taskNames[i % taskNames.length]} #${Math.floor(i / taskNames.length) + 1}`,
        source: locations[Math.floor(Math.random() * locations.length)].name,
        status: i % 3 === 0 ? 'transferring' : 'running',
        progress: i % 3 === 0 ? Math.floor(Math.random() * 100) : 100
      });
    }
    return tasks;
  };

  const [tasks, setTasks] = useState(generateInitialTasks());
  const [newTask, setNewTask] = useState('');
  const [selectedSource, setSelectedSource] = useState('Mumbai');
  const [geminiLogs, setGeminiLogs] = useState([]);

  // ✅ SIMULATE TASK TRANSFERS
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(prev => prev.map(task => {
        if (task.status === 'transferring') {
          const newProgress = task.progress + Math.random() * 15;
          if (newProgress >= 100) {
            // Transfer complete - move to new location
            const newLocation = locations[Math.floor(Math.random() * locations.length)].name;
            
            // Add Gemini log
            const analysis = `✅ Task "${task.name}" successfully transferred from ${task.source} to ${newLocation}. Temperature optimized: -${Math.floor(Math.random() * 8 + 2)}°C. Environment: Balanced`;
            setGeminiLogs(prev => [
              {
                task: task.name,
                from: task.source,
                to: newLocation,
                analysis: analysis,
                timestamp: new Date().toLocaleTimeString()
              },
              ...prev.slice(0, 4)
            ]);

            return {
              ...task,
              source: newLocation,
              status: 'running',
              progress: 100
            };
          }
          return { ...task, progress: newProgress };
        }
        return task;
      }));
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, []);

  // ✅ ADD NEW TASK
  const addTask = () => {
    if (newTask.trim()) {
      const newId = Math.max(...tasks.map(t => t.id), 0) + 1;
      setTasks(prev => [...prev, {
        id: newId,
        name: newTask,
        source: selectedSource,
        status: 'running',
        progress: 100
      }]);
      setNewTask('');
    }
  };

  // ✅ DELETE TASK
  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // ✅ TRANSFER TASK
  const startTransfer = (taskId) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: 'transferring', progress: 0 } : t
    ));
  };

  const transferringCount = tasks.filter(t => t.status === 'transferring').length;
  const runningCount = tasks.filter(t => t.status === 'running').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-cyan-950/20 to-slate-950 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              🌊 Jal-Drishti Task Management
            </h1>
            <p className="text-slate-400 mt-2">Distributed Task Transfer & Environmental Optimization</p>
          </div>
          <div className="flex items-center gap-4 text-sm bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-700">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>{runningCount} Running | {transferringCount} Transferring</span>
          </div>
        </div>

        {/* Data Centers Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {locations.map((loc) => {
            const locTasks = tasks.filter(t => t.source === loc.name);
            return (
              <div key={loc.id} className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-200 text-lg">{loc.name}</h3>
                    <p className="text-xs text-slate-400">{loc.env}</p>
                  </div>
                  <div className="text-2xl font-bold text-red-400">{loc.temp}°C</div>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tasks:</span>
                    <span className="text-cyan-400 font-semibold">{locTasks.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Water:</span>
                    <span className="text-cyan-400">{loc.water}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Power:</span>
                    <span className="text-emerald-400">{loc.power}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content - Tasks + Gemini */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Tasks List (Left - 2 cols) */}
          <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-cyan-400">
              📋 Active Tasks ({tasks.length})
            </h3>

            {/* Add Task Form */}
            <div className="mb-6 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Task name..."
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTask()}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                />
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                >
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.name}>{loc.name}</option>
                  ))}
                </select>
                <button
                  onClick={addTask}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2 flex items-center gap-2 text-sm transition"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
            </div>

            {/* Tasks Grid */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {tasks.map((task) => (
                <div key={task.id} className={`p-3 rounded-lg border flex items-center gap-3 transition-all ${
                  task.status === 'transferring'
                    ? 'bg-gradient-to-r from-orange-500/20 to-emerald-500/20 border-orange-400/30' 
                    : 'bg-slate-800/30 border-slate-700/50'
                }`}>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    task.status === 'transferring' ? 'bg-orange-400 animate-ping' : 'bg-emerald-400'
                  }`} />
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-200 text-sm truncate">{task.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-400">{task.source}</span>
                      {task.status === 'transferring' && (
                        <>
                          <ArrowRight className="w-3 h-3 text-orange-400" />
                          <div className="flex-1 bg-slate-800 rounded-full h-1.5">
                            <div className="bg-gradient-to-r from-orange-400 to-emerald-400 h-1.5 rounded-full" style={{width: `${task.progress}%`}} />
                          </div>
                          <span className="text-xs text-orange-400 font-semibold">{Math.floor(task.progress)}%</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1">
                    {task.status === 'running' && (
                      <button
                        onClick={() => startTransfer(task.id)}
                        className="p-1 hover:bg-orange-500/30 rounded transition"
                        title="Start transfer"
                      >
                        <ArrowRight className="w-4 h-4 text-orange-400" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1 hover:bg-red-500/30 rounded transition"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gemini AI Summary (Right - 1 col) */}
          <div className="bg-gradient-to-b from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-emerald-400">
              🧠 Gemini Analysis
            </h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {geminiLogs.length > 0 ? (
                geminiLogs.map((log, idx) => (
                  <div key={idx} className="p-4 bg-slate-900/40 border border-emerald-500/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="text-xs text-emerald-300">{log.timestamp}</span>
                    </div>
                    <p className="text-xs font-semibold text-cyan-300 mb-2">
                      {log.from} → {log.to}
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed">{log.analysis}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <p className="text-sm">Monitoring task transfers...</p>
                  <p className="text-xs mt-2">Real-time analysis will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 backdrop-blur-sm">
            <h4 className="text-slate-400 text-sm mb-2">Total Tasks</h4>
            <p className="text-3xl font-bold text-cyan-400">{tasks.length}</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 backdrop-blur-sm">
            <h4 className="text-slate-400 text-sm mb-2">Running Tasks</h4>
            <p className="text-3xl font-bold text-emerald-400">{runningCount}</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 backdrop-blur-sm">
            <h4 className="text-slate-400 text-sm mb-2">Transferring</h4>
            <p className="text-3xl font-bold text-orange-400 animate-pulse">{transferringCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
