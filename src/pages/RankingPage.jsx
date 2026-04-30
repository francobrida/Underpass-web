import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, ChevronLeft, Award, Users, Crown, Zap, Activity, Database, Search } from 'lucide-react';
import apiClient from '../services/apiClient';
import Navbar from '../components/Navbar';

const RankingPage = () => {
  const navigate = useNavigate();
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const { data } = await apiClient.get('/ranking');
        setRanking(data.data || data);
      } catch (err) {
        console.error("Error fetching ranking:", err);
        setRanking([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRanking();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-accent selection:text-black">
      <Navbar />

      {/* BACKGROUND GRID DECORATION */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>
      
      <main className="max-w-5xl mx-auto px-6 py-12 relative z-10">
        
        {/* TOP STATUS BAR */}
        <header className="grid grid-cols-1 md:grid-cols-12 gap-1 bg-[#0a0a0a] border border-[#1a1a1a] p-1 shadow-2xl mb-12">
          <div className="md:col-span-4 p-6 bg-black flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#1a1a1a]">
            <button 
              onClick={() => navigate('/stamps')}
              className="flex items-center gap-2 text-[#444] hover:text-accent transition-colors font-mono text-[9px] uppercase tracking-widest mb-4"
            >
              <ChevronLeft size={12} /> Return to Passport
            </button>
            <div className="flex items-center gap-4">
              <Trophy className="text-accent" size={32} />
              <div>
                <h2 className="text-2xl text-white font-display font-black uppercase italic tracking-tighter leading-none">Global Ranking</h2>
                <p className="text-[#444] font-mono text-[8px] uppercase tracking-[0.3em] mt-1">Personnel Leaderboard</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 p-6 bg-black border-b md:border-b-0 md:border-r border-[#1a1a1a] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-blue-500 mb-2">
                <Users size={14} />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Network Stats</span>
              </div>
              <p className="text-3xl font-display font-black italic tracking-tighter">1,248 <span className="text-xs text-[#333]">AGENTS</span></p>
            </div>
            <Activity size={24} className="text-[#1a1a1a]" />
          </div>

          <div className="md:col-span-4 p-6 bg-[#030303] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-accent mb-2">
                <Database size={14} />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Query Status</span>
              </div>
              <p className="text-sm font-mono text-[#999] uppercase tracking-widest animate-pulse">Syncing Records...</p>
            </div>
            <Search size={20} className="text-[#333]" />
          </div>
        </header>

        {/* DATABASE PANEL */}
        <section className="bg-[#0a0a0a] border border-[#1a1a1a] shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-[#1a1a1a] bg-black flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-[#555] uppercase tracking-[0.4em]">Active Sessions // Top Agents</h3>
            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-1 h-1 bg-accent/20 rounded-full"></div>
              ))}
            </div>
          </div>

          <div className="divide-y divide-[#161616]">
            {ranking.map((user, index) => {
              const isTop3 = index < 3;
              const rankColors = ['text-accent border-accent/20 bg-accent/5', 'text-blue-400 border-blue-400/20 bg-blue-400/5', 'text-orange-500 border-orange-500/20 bg-orange-500/5'];

              return (
                <div 
                  key={user.id} 
                  className={`flex items-center gap-4 md:gap-8 p-6 hover:bg-[#0d0d0d] transition-all group relative overflow-hidden`}
                >
                  {isTop3 && <div className={`absolute inset-y-0 left-0 w-1 ${rankColors[index].split(' ')[0]}`}></div>}
                  
                  {/* Position */}
                  <div className={`w-12 text-center font-display font-black italic text-3xl tracking-tighter ${isTop3 ? rankColors[index].split(' ')[0] : 'text-[#222]'}`}>
                    {index === 0 ? <Crown size={28} className="mx-auto" /> : (index + 1).toString().padStart(2, '0')}
                  </div>

                  {/* User Entry */}
                  <div className="flex items-center gap-4 flex-grow">
                    <div className={`w-12 h-12 rounded-full border-2 p-0.5 ${isTop3 ? rankColors[index].split(' ')[1] : 'border-[#1a1a1a]'}`}>
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}&backgroundColor=000000`} 
                        alt="" 
                        className="w-full h-full rounded-full bg-black object-cover"
                      />
                    </div>
                    <div>
                      <h4 className={`font-display font-black uppercase italic tracking-wider text-lg leading-none ${!isTop3 && 'text-[#ccc] group-hover:text-white'}`}>
                        {user.name}
                      </h4>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[9px] font-mono text-[#444] uppercase tracking-widest flex items-center gap-1 border border-[#1a1a1a] px-2 py-0.5">
                          <Award size={10} className="text-accent" /> {user.stamps_count || 0} RECORDS
                        </span>
                        <span className="text-[9px] font-mono text-accent/60 uppercase tracking-widest font-black">LVL {Math.floor((user.points || 0) / 500) + 1}</span>
                      </div>
                    </div>
                  </div>

                  {/* Points Readout */}
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center justify-end gap-2 text-white font-mono font-black text-xl md:text-2xl tracking-tighter">
                      <Zap size={16} className={isTop3 ? rankColors[index].split(' ')[0] : 'text-[#333]'} fill="currentColor" />
                      {user.points?.toLocaleString()}
                    </div>
                    <p className="text-[8px] text-[#444] font-mono uppercase tracking-[0.4em] mt-1">Data Points</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Table Footer */}
          <div className="p-4 bg-[#080808] border-t border-[#1a1a1a] flex justify-between items-center px-8">
            <p className="text-[8px] text-[#222] font-mono uppercase tracking-[0.6em]">System Protocol // Ranking Broadcast // Underpass Central</p>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-4 h-1 bg-[#111] rounded-full"></div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default RankingPage;
