import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, ChevronLeft, Award, Users, Crown, Zap, Activity, Database, Search } from 'lucide-react';
import apiClient from '../services/apiClient';
import Navbar from '../components/Navbar';
import TechnicalLoader from '../components/TechnicalLoader';

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

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center">
        <TechnicalLoader />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-accent selection:text-black">
      <Navbar />

      {/* BACKGROUND GRID DECORATION */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>
      
      <main className="max-w-5xl mx-auto px-6 py-12 relative z-10">
        
        {/* TOP STATUS BAR - MINIMALIST MAIN HEADER */}
        <header className="panel-neon p-1 mb-12">
          <div className="p-8 bg-black flex flex-col md:flex-row md:items-center justify-between overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
            
            <div className="flex flex-col justify-center relative z-10">
              <button 
                onClick={() => navigate('/stamps')}
                className="flex items-center gap-2 text-[#666] hover:text-accent transition-colors font-mono text-[10px] uppercase tracking-widest mb-6"
              >
                <ChevronLeft size={14} /> Return to Passport
              </button>
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent shadow-[0_0_30px_rgba(139,92,246,0.2)] border border-accent/20">
                  <Trophy size={32} />
                </div>
                <div>
                  <h2 className="text-5xl text-white font-display font-black uppercase italic tracking-tighter leading-none">Global Ranking</h2>
                  <p className="text-accent font-mono text-[10px] uppercase tracking-[0.5em] mt-2 font-bold opacity-80">Puntos de toda la comunidad</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* DATABASE PANEL */}
        <section className="panel-neon overflow-hidden">
          <div className="p-6 border-b border-white/5 bg-black flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-[#666] uppercase tracking-[0.4em]">Active Sessions // Top Agents</h3>
            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-1 h-1 bg-accent/40 rounded-full shadow-neon"></div>
              ))}
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {ranking.map((user, index) => {
              const isTop3 = index < 3;
              const rankColors = ['text-accent border-accent/20 bg-accent/5', 'text-blue-400 border-blue-400/20 bg-blue-400/5', 'text-orange-500 border-orange-500/20 bg-orange-500/5'];

              return (
                <div 
                  key={user.id} 
                  className={`flex items-center gap-4 md:gap-8 p-6 hover:bg-white/[0.02] transition-all group relative overflow-hidden`}
                >
                  {isTop3 && <div className={`absolute inset-y-0 left-0 w-1 ${rankColors[index].split(' ')[0]}`}></div>}
                  
                  {/* Position */}
                  <div className={`w-16 text-center font-display font-black italic text-4xl tracking-tighter ${isTop3 ? rankColors[index].split(' ')[0] : 'text-[#333]'}`}>
                    {index === 0 ? <Crown size={32} className="mx-auto" /> : (index + 1).toString().padStart(2, '0')}
                  </div>

                  {/* User Entry */}
                  <div className="flex items-center gap-4 flex-grow">
                    <div>
                      <h4 className={`font-display font-black uppercase italic tracking-wider text-xl leading-none ${!isTop3 && 'text-[#ccc] group-hover:text-white'}`}>
                        {user.name}
                      </h4>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] font-mono text-[#666] uppercase tracking-widest flex items-center gap-1 border border-white/10 px-2 py-0.5">
                          <Award size={10} className="text-accent" /> {user.stamps_count || 0} RECORDS
                        </span>
                        <span className="text-[10px] font-mono text-accent/80 uppercase tracking-widest font-black">LVL {Math.floor((user.points || 0) / 500) + 1}</span>
                      </div>
                    </div>
                  </div>

                  {/* Points Readout */}
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center justify-end gap-3 text-white font-mono font-black text-2xl md:text-3xl tracking-tighter">
                      <Zap size={20} className={isTop3 ? rankColors[index].split(' ')[0] : 'text-[#444]'} fill="currentColor" />
                      {user.points !== undefined && user.points !== null ? user.points.toLocaleString() : "0"}
                    </div>
                    <p className="text-[9px] text-accent font-mono uppercase tracking-[0.4em] mt-1 font-bold">Points</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Table Footer */}
          <div className="p-4 bg-[#080808] border-t border-white/5 flex justify-between items-center px-8">
            <p className="text-[8px] text-[#333] font-mono uppercase tracking-[0.6em]">System Protocol // Ranking Broadcast // Underpass Central</p>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-4 h-1 bg-white/5 rounded-full"></div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default RankingPage;
