import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Award, Calendar, Activity, Cpu, ShieldCheck, Database, Layers, Sparkles, MessageSquare, AlertCircle } from 'lucide-react';
import apiClient from '../services/apiClient';
import Navbar from '../components/Navbar';
import TechnicalLoader from '../components/TechnicalLoader';

const StampsPage = () => {
  const navigate = useNavigate();
  const [stamps, setStamps] = useState([]);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Simulation scanner form states
  const [stampToken, setStampToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stampsRes, userRes] = await Promise.all([
        apiClient.get('/stamps'),
        apiClient.get('/me')
      ]);
      setStamps(stampsRes.data || stampsRes || []);
      setPoints(userRes.data?.points || userRes.points || 0);
    } catch (err) {
      console.error("Error fetching stamps/points:", err);
      setStamps([]);
      setPoints(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClaimStamp = async (e) => {
    e.preventDefault();
    if (!stampToken.trim()) return;
    setIsSubmitting(true);

    try {
      // Intentamos ambos campos por si acaso el back usa uno u otro
      await apiClient.post('/stamps', { 
        token: stampToken.trim(), 
        stamp_token: stampToken.trim() 
      });
      showNotification("¡Sello canjeado correctamente! Se te han adjudicado los puntos correspondientes.");
      setStampToken('');
      await fetchData();
    } catch (err) {
      console.error(err);
      let errMsg = "Error al canjear el sello. Verifica el token.";
      if (err.response?.data?.message) {
        errMsg = err.response.data.message;
      }
      showNotification(errMsg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isVibecheckAvailable = (event) => {
    if (!event || !event.date) return false;
    const endTime = event.end_time || '23:59';
    const eventEndDateTime = new Date(`${event.date}T${endTime}`);
    const now = new Date();
    return now > eventEndDateTime;
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center">
        <TechnicalLoader />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-accent selection:text-black font-sans relative pb-20">
      <Navbar />
      
      {/* BACKGROUND GRID DECORATION */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] overflow-hidden z-0 select-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute inset-0 bg-radial-gradient"></div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10 space-y-10">
        
        {/* TOP STATUS BAR (INTEGRATED RACK) */}
        <header className="grid grid-cols-1 lg:grid-cols-12 gap-1 panel-neon p-1 mb-8 bg-black/40 backdrop-blur-md">
          
          {/* RANKING ACCESS - DIRECT BUTTON */}
          <div className="lg:col-span-5 bg-black flex border-b lg:border-b-0 lg:border-r border-white/5">
            <button 
              onClick={() => navigate('/ranking')}
              className="group flex items-center justify-between w-full p-8 hover:bg-accent/5 transition-all"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-black transition-colors shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                  <Trophy size={24} />
                </div>
                <div className="text-left">
                  <p className="text-xl font-display font-black uppercase italic tracking-tight group-hover:text-accent transition-colors">Community Ranking</p>
                  <p className="text-[12px] font-mono text-[#666] uppercase tracking-[0.3em] mt-1">Ver el ranking de usuarios</p>
                </div>
              </div>
              <Activity size={18} className="text-[#222] group-hover:text-accent transition-colors animate-pulse" />
            </button>
          </div>

          {/* VU-METER PANEL - DIRECT POINTS */}
          <div className="lg:col-span-7 p-8 bg-[#030303] flex flex-col justify-between">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-accent animate-ping"></div>
                <span className="text-3xl font-mono font-black text-white tracking-tighter">
                  {points} <span className="text-[15px] text-accent/80 uppercase tracking-[0.4em] ml-2">Puntos Acumulados</span>
                </span>
              </div>
            </div>

            {/* Segmented VU Meter */}
            <div className="flex gap-[3px] h-12 items-end">
              {[...Array(40)].map((_, i) => {
                const isActive = (i / 40) < (points / 2000);
                let colorClass = "bg-[#111]";
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

        {/* Global Alert Notification */}
        {notification && (
          <div className={`p-4 font-mono text-xs border uppercase tracking-widest flex items-center justify-between animate-in fade-in duration-300 ${
            notification.type === 'error' 
              ? 'bg-red-500/10 border-red-500/30 text-red-400' 
              : 'bg-accent/10 border-accent/30 text-accent font-bold'
          }`}>
            <span className="flex items-center gap-2">
              <Sparkles size={14} /> {notification.msg}
            </span>
          </div>
        )}

        {/* SIMULATOR: MANUAL SCANNER/CODE ENTRY */}
        <section className="panel-neon p-8 bg-black/80 backdrop-blur-md border border-accent/20 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-50"></div>
          
          <div className="flex items-center gap-3 pb-4 mb-4 border-b border-[#1a1a1a]">
            <Cpu size={18} className="text-accent animate-pulse" />
            <div>
              <h3 className="text-base text-white font-display font-black uppercase italic tracking-wider">Simulador de Escaneo de QR</h3>
              <p className="text-[10px] font-mono text-[#555] uppercase tracking-widest mt-1">Canjea manualmente un token de evento para conseguir tu stamp</p>
            </div>
          </div>

          <form onSubmit={handleClaimStamp} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-grow space-y-2 w-full">
              <label className="block text-[9px] text-[#666] font-mono uppercase tracking-[0.3em] font-bold">Código Token del Evento / Stamp</label>
              <input 
                type="text" 
                value={stampToken}
                onChange={(e) => setStampToken(e.target.value)}
                placeholder="Ej. underpass_stamp_123"
                className="w-full bg-black border border-[#222] p-4 text-sm text-white font-mono focus:border-accent outline-none transition-all uppercase tracking-widest"
              />
            </div>
            <button 
              type="submit"
              disabled={isSubmitting || !stampToken.trim()}
              className="w-full md:w-auto px-8 py-4 bg-accent hover:bg-accent-hover text-white font-display font-black italic uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-neon transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              {isSubmitting ? 'Validando...' : 'CANJEAR STAMP'}
            </button>
          </form>
        </section>

        {/* MAIN DECK: STAMPS PASSPORT */}
        <section className="panel-neon relative overflow-hidden bg-black/60 backdrop-blur-md border border-white/5">
          {/* Section Header */}
          <div className="p-8 border-b border-white/5 bg-black flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent flex items-center justify-center text-black shadow-neon">
                <Layers size={24} />
              </div>
              <div>
                <h2 className="text-3xl text-white font-display font-black uppercase italic tracking-tighter leading-none">SELLOS COLECCIONADOS</h2>
                <p className="text-[#666] font-mono text-[11px] uppercase tracking-[0.4em] mt-1">Certificados de asistencia al under</p>
              </div>
            </div>
          </div>

          {/* Stamps Grid */}
          <div className="p-8 md:p-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {stamps.map((stamp, i) => {
              const vibeAvailable = isVibecheckAvailable(stamp.event);
              return (
                <div key={stamp.id} className="group relative flex flex-col justify-between bg-[#030303] border border-white/10 group-hover:border-accent/30 transition-all duration-500 overflow-hidden shadow-inner p-5">
                  {/* Technical Slot Decor */}
                  <div className="absolute -inset-2 border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-accent/40"></div>
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-accent/40"></div>

                  <div className="flex flex-col items-center justify-center flex-grow py-6 text-center">
                    {/* Stamp Seal Design */}
                    <div 
                      className="relative w-full h-full flex flex-col items-center justify-center text-center p-4 rounded-full border-4 border-white/5 group-hover:border-accent/10 transition-all duration-700 transform group-hover:scale-105"
                      style={{ transform: `rotate(${(i % 2 === 0 ? 1 : -1) * (i * 3 % 8)}deg)` }}
                    >
                      <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"></div>
                      <div className="relative z-10 space-y-1">
                        <p className="text-[7px] font-mono text-accent/40 uppercase tracking-[0.3em] font-bold">Validated</p>
                        <h3 className="text-[11px] md:text-[12px] font-display font-black uppercase italic leading-none text-[#ccc] group-hover:text-white transition-colors">
                          {stamp.event?.title || 'SESSION'}
                        </h3>
                        <div className="flex items-center justify-center gap-1 text-[8px] font-mono text-[#555] pt-2">
                          <Calendar size={10} /> {stamp.event?.date || '2024'}
                        </div>
                      </div>
                    </div>

                    {/* Corner Label */}
                    <div className="absolute top-3 left-3 text-[8px] font-mono text-[#333] font-black italic">STAMP_ID://{stamp.id}</div>
                  </div>

                  {/* VIBECHECK INTERACTION BUTTON */}
                  <div className="mt-4 pt-4 border-t border-white/5 relative z-20">
                    {vibeAvailable ? (
                      <button 
                        onClick={() => navigate(`/events/${stamp.event?.id}/vibecheck`)}
                        className="w-full py-3 bg-accent hover:bg-accent-hover text-white font-display font-black italic uppercase text-[9px] tracking-[0.2em] transition-all flex items-center justify-center gap-1 shadow-neon transform hover:-translate-y-0.5"
                      >
                        <MessageSquare size={12} /> DEJAR VIBECHECK
                      </button>
                    ) : (
                      <button 
                        disabled
                        className="w-full py-3 bg-[#111] border border-[#222] text-[#444] font-display font-bold uppercase text-[9px] tracking-[0.2em] flex items-center justify-center gap-1 cursor-not-allowed opacity-70"
                      >
                        <AlertCircle size={12} /> VIBECHECK NO DISPONIBLE
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Empty Slots */}
            {[...Array(Math.max(0, 8 - stamps.length))].map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square bg-[#050505] border border-white/5 opacity-30 flex items-center justify-center group relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0,transparent_100%)]"></div>
                <p className="text-[8px] font-mono text-[#444] uppercase tracking-[0.5em] -rotate-45">Access Denied</p>
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/10"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/10"></div>
              </div>
            ))}
          </div>

          {/* Footer Info Panel */}
          <div className="p-4 bg-[#080808] border-t border-white/5 flex justify-between items-center px-8">
            <p className="text-[8px] text-[#444] font-mono uppercase tracking-[0.5em]">Vibra alto, respeta siempre. Si estas leyendo esto, fuaa qué buen ojo</p>
            <div className="flex gap-4">
              <div className="w-16 h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-accent/40 shadow-neon"></div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default StampsPage;
