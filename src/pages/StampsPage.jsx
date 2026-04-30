import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Award, Calendar, Activity, Cpu, ShieldCheck, Database, Layers } from 'lucide-react';
import apiClient from '../services/apiClient';
import Navbar from '../components/Navbar';

const StampsPage = () => {
  const navigate = useNavigate();
  const [stamps, setStamps] = useState([]);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stampsRes, userRes] = await Promise.all([
          apiClient.get('/stamps'),
          apiClient.get('/me')
        ]);
        setStamps(stampsRes.data || stampsRes);
        setPoints(userRes.data?.points || userRes.points || 0);
      } catch (err) {
        console.error("Error fetching stamps/points:", err);
        setStamps([]);
        setPoints(0);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-accent selection:text-black font-sans">
      <Navbar />
      
      {/* BACKGROUND GRID DECORATION */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute inset-0 bg-radial-gradient"></div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        
        {/* TOP STATUS BAR (INTEGRATED RACK) */}
        <header className="grid grid-cols-1 lg:grid-cols-12 gap-1 bg-[#0a0a0a] border border-[#1a1a1a] p-1 shadow-2xl mb-12">
          
          {/* RANKING ACCESS - DIRECT BUTTON */}
          <div className="lg:col-span-5 bg-black flex border-b lg:border-b-0 lg:border-r border-[#1a1a1a]">
            <button 
              onClick={() => navigate('/ranking')}
              className="group flex items-center justify-between w-full p-8 hover:bg-accent/5 transition-all"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-black transition-colors shadow-[0_0_15px_rgba(var(--color-accent),0.1)]">
                  <Trophy size={24} />
                </div>
                <div className="text-left">
                  <p className="text-xl font-display font-black uppercase italic tracking-tight group-hover:text-accent transition-colors">Community Ranking</p>
                  <p className="text-[9px] font-mono text-[#444] uppercase tracking-[0.3em] mt-1">View Global Leaderboard</p>
                </div>
              </div>
              <Activity size={18} className="text-[#1a1a1a] group-hover:text-accent transition-colors animate-pulse" />
            </button>
          </div>

          {/* VU-METER PANEL - DIRECT POINTS */}
          <div className="lg:col-span-7 p-8 bg-[#030303] flex flex-col justify-between">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-accent animate-ping"></div>
                <span className="text-3xl font-mono font-black text-white tracking-tighter">
                  {points} <span className="text-[10px] text-accent uppercase tracking-[0.4em] ml-2">Points Accumulated</span>
                </span>
              </div>
              <div className="hidden md:block">
                <ShieldCheck size={20} className="text-[#1a1a1a]" />
              </div>
            </div>

            {/* Segmented VU Meter */}
            <div className="flex gap-[3px] h-12 items-end">
              {[...Array(40)].map((_, i) => {
                const isActive = (i / 40) < (points / 2000);
                let colorClass = "bg-[#0d0d0d]";
                if (isActive) {
                  if (i < 24) colorClass = "bg-green-500/80 shadow-[0_0_10px_rgba(34,197,94,0.4)]";
                  else if (i < 34) colorClass = "bg-yellow-500/80 shadow-[0_0_10px_rgba(234,179,8,0.4)]";
                  else colorClass = "bg-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.4)]";
                }
                return (
                  <div 
                    key={i} 
                    className={`flex-1 h-full transition-all duration-700 delay-${i * 10} ${colorClass} rounded-[1px]`}
                    style={{ height: `${20 + (i * 2)}%` }}
                  ></div>
                );
              })}
            </div>
          </div>
        </header>

        {/* MAIN DECK: STAMPS PASSPORT */}
        <section className="bg-[#0a0a0a] border border-[#1a1a1a] shadow-2xl relative overflow-hidden">
          {/* Section Header */}
          <div className="p-8 border-b border-[#1a1a1a] bg-black flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent flex items-center justify-center text-black">
                <Layers size={24} />
              </div>
              <div>
                <h2 className="text-3xl text-white font-display font-black uppercase italic tracking-tighter leading-none">Stamp Collection</h2>
                <p className="text-[#555] font-mono text-[10px] uppercase tracking-[0.4em] mt-1">Personnel Authorization Log // Records: {stamps.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-6 font-mono text-[9px] text-[#444] uppercase tracking-widest bg-[#0d0d0d] px-4 py-2 border border-[#1a1a1a]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent"></div> COLLECTED
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#222]"></div> LOCKED
              </div>
            </div>
          </div>

          {/* Stamps Grid */}
          <div className="p-8 md:p-12 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {stamps.map((stamp, i) => (
              <div key={stamp.id} className="group relative">
                {/* Technical Slot Decor */}
                <div className="absolute -inset-2 border border-[#1a1a1a] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-accent/20"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-accent/20"></div>

                <div className="relative aspect-square flex flex-col items-center justify-center p-4 bg-black border border-[#1a1a1a] group-hover:border-accent/30 transition-all duration-500 overflow-hidden shadow-inner">
                  {/* Stamp Seal Design */}
                  <div 
                    className="relative w-full h-full flex flex-col items-center justify-center text-center p-4 rounded-full border-4 border-white/5 group-hover:border-accent/10 transition-all duration-700 transform group-hover:scale-105"
                    style={{ transform: `rotate(${(i % 2 === 0 ? 1 : -1) * (i * 3 % 8)}deg)` }}
                  >
                    <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"></div>
                    <div className="relative z-10 space-y-1">
                      <p className="text-[7px] font-mono text-accent/40 uppercase tracking-[0.3em] font-bold">Validated</p>
                      <h3 className="text-[10px] md:text-[11px] font-display font-black uppercase italic leading-none text-[#999] group-hover:text-white transition-colors">
                        {stamp.event?.title || 'SESSION'}
                      </h3>
                      <div className="flex items-center justify-center gap-1 text-[8px] font-mono text-[#333] pt-2">
                        <Calendar size={10} /> {stamp.event?.date || '2024'}
                      </div>
                    </div>
                  </div>

                  {/* Corner Label */}
                  <div className="absolute top-2 left-2 text-[8px] font-mono text-[#222] font-black italic">ID://{stamp.id}</div>
                </div>
              </div>
            ))}

            {/* Empty Slots */}
            {[...Array(Math.max(0, 10 - stamps.length))].map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square bg-[#050505] border border-[#111] opacity-30 flex items-center justify-center group relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0,transparent_100%)]"></div>
                <p className="text-[8px] font-mono text-[#333] uppercase tracking-[0.5em] -rotate-45">Access Denied</p>
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#1a1a1a]"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#1a1a1a]"></div>
              </div>
            ))}
          </div>

          {/* Footer Info Panel */}
          <div className="p-4 bg-[#080808] border-t border-[#1a1a1a] flex justify-between items-center px-8">
            <p className="text-[8px] text-[#333] font-mono uppercase tracking-[0.5em]">Central Archive // Data Integrity: 100% // Version 4.0.2</p>
            <div className="flex gap-4">
              <div className="w-16 h-1 bg-[#111] rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-accent/20"></div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default StampsPage;
